// src/app/lib/auth-helpers.ts
import { auth as nextAuthAuth } from './auth'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from './mongodb'

/**
 * Get the current session on the server
 * Compatible wrapper for NextAuth v5
 */
export async function auth() {
  return await nextAuthAuth()
}

/**
 * Authenticate either via NextAuth session OR JWT Bearer token (for browser extension)
 * Returns a user object compatible with NextAuth session structure
 */
export async function authWithToken(request: NextRequest) {
  // First try NextAuth session
  const session = await nextAuthAuth()
  if (session?.user) {
    return session
  }

  // Try JWT Bearer token (for browser extension)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'default-secret-key'
      ) as any

      // Get user from database to ensure they're still active
      const { db } = await connectToDatabase()
      const { ObjectId } = await import('mongodb')

      const user = await db.collection('users').findOne({
        _id: new ObjectId(decoded.id)
      })

      if (user && user.status === 'active') {
        // Return session-like object
        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar
          }
        }
      }
    } catch (error) {
      // Token invalid or expired, fall through
      console.error('JWT verification failed:', error)
    }
  }

  // No valid authentication found
  return null
}