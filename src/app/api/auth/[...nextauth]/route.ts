// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Configuration NextAuth directement dans la route
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Vérification des identifiants
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Identifiants admin (à changer en production)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Administrateur',
            role: 'admin'
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      (session.user as any).role = token.role
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

// Création du handler
const handler = NextAuth(authOptions)

// Export des méthodes HTTP
export { handler as GET, handler as POST }