// src/app/api/csrf/route.ts
import { getCsrfTokenResponse } from '@/app/lib/csrf'

/**
 * GET /api/csrf
 * Generate and return a CSRF token
 */
export async function GET() {
  return getCsrfTokenResponse()
}
