// src/app/lib/auth-helpers.ts
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-enhanced'

/**
 * Get the current session on the server
 * Compatible wrapper for NextAuth v4
 */
export async function auth() {
  return await getServerSession(authOptions)
}