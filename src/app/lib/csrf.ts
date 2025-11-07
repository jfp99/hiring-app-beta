// src/app/lib/csrf.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'
import { logger } from './logger'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${token}.${timestamp}`)
    .digest('hex')

  return `${token}.${timestamp}.${signature}`
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenValue, timestamp, signature] = token.split('.')

    if (!tokenValue || !timestamp || !signature) {
      logger.warn('Invalid CSRF token format')
      return false
    }

    // Check token age (valid for 1 hour)
    const tokenAge = Date.now() - parseInt(timestamp, 10)
    const maxAge = 60 * 60 * 1000 // 1 hour

    if (tokenAge > maxAge) {
      logger.warn('CSRF token expired', { age: tokenAge, maxAge })
      return false
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(`${tokenValue}.${timestamp}`)
      .digest('hex')

    if (signature !== expectedSignature) {
      logger.warn('CSRF token signature mismatch')
      return false
    }

    return true
  } catch (error) {
    logger.error('Error verifying CSRF token', {}, error as Error)
    return false
  }
}

/**
 * Extract CSRF token from request (header or cookie)
 */
export function extractCsrfToken(request: NextRequest): string | null {
  // First try to get from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)
  if (headerToken) {
    return headerToken
  }

  // Fallback to cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Middleware to validate CSRF token for state-changing methods
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase()

  // Only validate state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null // Allow safe methods (GET, HEAD, OPTIONS)
  }

  // Skip CSRF for specific endpoints that have their own protection mechanisms
  // or are intentionally public POST endpoints (like newsletter subscription forms)
  const csrfExemptPaths = [
    '/api/auth', // NextAuth has its own CSRF protection
    '/api/csrf', // CSRF token generation endpoint
    '/api/newsletters', // Public newsletter subscription (rate-limited separately)
    '/api/contact', // Public contact form (rate-limited separately)
  ]

  if (csrfExemptPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return null
  }

  const token = extractCsrfToken(request)

  if (!token) {
    logger.warn('Missing CSRF token', {
      method,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token missing. Please refresh the page and try again.'
      },
      { status: 403 }
    )
  }

  if (!verifyCsrfToken(token)) {
    logger.warn('Invalid CSRF token', {
      method,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token. Please refresh the page and try again.'
      },
      { status: 403 }
    )
  }

  // Token is valid, allow request to proceed
  return null
}

/**
 * API route helper to get CSRF token
 */
export function getCsrfTokenResponse(): NextResponse {
  const token = generateCsrfToken()

  const response = NextResponse.json(
    {
      success: true,
      token
    },
    { status: 200 }
  )

  // Set token in cookie as well (as backup)
  response.cookies.set({
    name: CSRF_TOKEN_COOKIE,
    value: token,
    httpOnly: false, // Needs to be accessible by JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 // 1 hour
  })

  return response
}
