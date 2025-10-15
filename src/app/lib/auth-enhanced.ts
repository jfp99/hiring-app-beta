// src/app/lib/auth-enhanced.ts
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './mongodb'
import { UserRole, ROLE_PERMISSIONS } from '../types/auth'
import { z } from 'zod'

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = loginSchema.safeParse(credentials)

          if (!validatedFields.success) {
            console.error('❌ [AUTH] Validation failed:', validatedFields.error)
            return null
          }

          const { email, password } = validatedFields.data

          // Connect to database
          const { db } = await connectToDatabase()

          // Find user by email
          const user = await db.collection('users').findOne({
            email: email.toLowerCase(),
            isActive: true
          })

          if (!user) {
            console.log('❌ [AUTH] User not found or inactive:', email)
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            console.log('❌ [AUTH] Invalid password for:', email)
            return null
          }

          // Update last login
          await db.collection('users').updateOne(
            { _id: user._id },
            {
              $set: {
                lastLoginAt: new Date().toISOString()
              }
            }
          )

          console.log('✅ [AUTH] User authenticated:', email, 'Role:', user.role)

          // Return user data for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            companyId: user.companyId,
            permissions: user.permissions || ROLE_PERMISSIONS[user.role as UserRole] || []
          }
        } catch (error) {
          console.error('❌ [AUTH] Authentication error:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.permissions = (user as any).permissions
      }

      // Update session
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as UserRole
        (session.user as any).companyId = token.companyId as string | undefined
        (session.user as any).permissions = token.permissions as string[]
      }

      return session
    },

    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      console.log('✅ [AUTH] Sign in successful for:', user.email)
      return true
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in based on role
      if (url === baseUrl || url === '/') {
        return `${baseUrl}/dashboard`
      }

      // Allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
    }
  },

  events: {
    async signIn({ user }) {
      console.log('📝 [AUTH] User signed in:', user.email)
    },

    async signOut({ token }) {
      console.log('👋 [AUTH] User signed out:', token?.email)
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Utility functions for authentication

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}

/**
 * Generate an invite token with expiry
 */
export function generateInviteToken(): { token: string; expiresAt: Date } {
  const token = generateToken(48)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

  return { token, expiresAt }
}

/**
 * Check if a user has a specific permission
 */
export function checkPermission(
  userRole: UserRole,
  permission: string,
  customPermissions?: string[]
): boolean {
  // Super admin has all permissions
  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  if (rolePermissions.includes(permission)) {
    return true
  }

  // Check custom permissions
  if (customPermissions && customPermissions.includes(permission)) {
    return true
  }

  return false
}

/**
 * Create the default super admin user if it doesn't exist
 */
export async function createDefaultSuperAdmin() {
  try {
    const { db } = await connectToDatabase()

    // Check if any super admin exists
    const existingSuperAdmin = await db.collection('users').findOne({
      role: UserRole.SUPER_ADMIN
    })

    if (!existingSuperAdmin) {
      const hashedPassword = await hashPassword('Admin123!@#')

      const superAdmin = {
        email: 'admin@hi-ring.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        emailVerified: true,
        permissions: Object.values(ROLE_PERMISSIONS[UserRole.SUPER_ADMIN]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.collection('users').insertOne(superAdmin)

      console.log('✅ [AUTH] Default super admin created')
      console.log('📧 Email: admin@hi-ring.com')
      console.log('🔑 Password: Admin123!@#')
      console.log('⚠️  Please change this password immediately!')
    }
  } catch (error) {
    console.error('❌ [AUTH] Error creating default super admin:', error)
  }
}