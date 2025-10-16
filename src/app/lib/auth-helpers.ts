// src/app/lib/auth-helpers.ts
import { auth as nextAuthAuth } from './auth'

/**
 * Get the current session on the server
 * Compatible wrapper for NextAuth v5
 */
export async function auth() {
  return await nextAuthAuth()
}