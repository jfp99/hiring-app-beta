// app/lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './mongodb'
import { sanitizeEmail } from './security'
import { UserRole } from '../types/auth'
import { logger } from './logger'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.warn('Missing credentials in login attempt')
            return null
          }

          // Sanitize email input
          const email = sanitizeEmail(credentials.email as string)

          if (!email) {
            logger.warn('Invalid email format in login attempt')
            return null
          }

          // Email whitelist check for admin access
          const allowedAdminEmails = process.env.ADMIN_EMAIL_WHITELIST?.split(',').map(e => e.trim().toLowerCase()) || []
          const normalizedEmail = email.toLowerCase()

          if (allowedAdminEmails.length === 0) {
            logger.warn('ADMIN_EMAIL_WHITELIST not configured - authentication disabled')
            return null
          }

          if (!allowedAdminEmails.includes(normalizedEmail)) {
            logger.warn('Email not in whitelist', { email })
            return null
          }

          // Connect to database
          const { db } = await connectToDatabase()

          // Find user by email
          const user = await db.collection('users').findOne({
            email: email.toLowerCase()
          })

          if (!user) {
            logger.warn('User not found', { email })
            return null
          }

          // Check if user is active
          if (!user.isActive) {
            logger.warn('User account is disabled', { email })
            return null
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            logger.warn('Invalid password for user', { email })
            return null
          }

          // Log successful authentication
          await db.collection('activities').insertOne({
            type: 'user_login',
            userId: user._id.toString(),
            timestamp: new Date().toISOString(),
            metadata: {
              email: user.email,
              ip: 'N/A' // Can be enhanced with request IP
            }
          })

          logger.info('User authenticated successfully', { email })

          // Return user object for JWT
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || UserRole.RECRUITER,
            avatar: user.avatar
          }
        } catch (error) {
          logger.error('Authorization error', {}, error as Error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Update session every 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.avatar = (user as any).avatar
      }

      // Update token when session is updated
      if (trigger === 'update' && session) {
        return { ...token, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      // Add user data to session
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as UserRole;
        (session.user as any).firstName = token.firstName as string;
        (session.user as any).lastName = token.lastName as string;
        (session.user as any).avatar = token.avatar as string
      }

      return session
    }
  },
  events: {
    async signOut(message) {
      // Log sign out event
      try {
        const token = 'token' in message ? message.token : null
        if (!token) return

        const { db } = await connectToDatabase()
        await db.collection('activities').insertOne({
          type: 'user_logout',
          userId: token?.id as string,
          timestamp: new Date().toISOString(),
          metadata: {
            email: token?.email as string
          }
        })
        logger.info('User signed out successfully', { email: token?.email as string })
      } catch (error) {
        logger.error('Error logging sign out', {}, error as Error)
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
})