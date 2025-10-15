// src/app/lib/security.ts
import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// RATE LIMITING
// =============================================================================

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitMap = new Map<string, RateLimitStore>()

/**
 * Rate limiting middleware
 * @param config Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address or user ID)
    const identifier =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    const key = `rate-limit:${identifier}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Get or create rate limit entry
    let entry = rateLimitMap.get(key)

    // Reset if window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitMap.set(key, entry)
    }

    // Increment request count
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      return NextResponse.json(
        {
          error: config.message || 'Too many requests, please try again later',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      )
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      const expiredKeys: string[] = []
      rateLimitMap.forEach((value, key) => {
        if (now > value.resetTime + 60000) { // 1 minute grace period
          expiredKeys.push(key)
        }
      })
      expiredKeys.forEach(key => rateLimitMap.delete(key))
    }

    return null // Allow request
  }
}

/**
 * Preset rate limiters for common use cases
 */
export const RateLimiters = {
  // Authentication endpoints (strict)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again in 15 minutes'
  }),

  // General API endpoints
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests, please slow down'
  }),

  // File upload endpoints
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many uploads, please wait before uploading again'
  }),

  // Search endpoints
  search: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests'
  })
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags, script tags, and event handlers
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Limit length
    .slice(0, 10000)
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as any
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as any
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) :
        item
      ) as any
    } else {
      sanitized[key as keyof T] = value
    }
  }

  return sanitized
}

/**
 * Escape special characters for use in regular expressions
 * Prevents ReDoS and NoSQL injection via regex
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sanitize filename for safe file system operations
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_') // Remove special characters
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255) // Limit length
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, '')
    .slice(0, 320) // Max email length per RFC 5321
}

// =============================================================================
// NOSQL INJECTION PREVENTION
// =============================================================================

/**
 * Validate and sanitize MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 * Removes MongoDB operators from user input
 */
export function sanitizeMongoQuery(query: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(query)) {
    // Skip MongoDB operators starting with $
    if (key.startsWith('$')) {
      continue
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      const nestedSanitized: Record<string, any> = {}
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (!nestedKey.startsWith('$')) {
          nestedSanitized[nestedKey] = nestedValue
        }
      }
      sanitized[key] = nestedSanitized
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Create safe regex for MongoDB text search
 * Escapes special characters and prevents ReDoS
 */
export function createSafeRegex(pattern: string, options: string = 'i'): { $regex: string; $options: string } {
  const escaped = escapeRegExp(pattern.slice(0, 100)) // Limit length to prevent ReDoS
  return {
    $regex: escaped,
    $options: options
  }
}

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const buffer = new Uint8Array(32)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false

  // Constant-time comparison to prevent timing attacks
  if (token.length !== sessionToken.length) return false

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i)
  }

  return result === 0
}

// =============================================================================
// PASSWORD VALIDATION
// =============================================================================

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// PII ANONYMIZATION (GDPR)
// =============================================================================

export interface PIIFields {
  email?: string
  phone?: string
  name?: string
  address?: string
  [key: string]: string | undefined
}

/**
 * Mask email address for logging
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'

  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1)
  return `${maskedLocal}@${domain}`
}

/**
 * Mask phone number for logging
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '***'

  return '***-***-' + digits.slice(-4)
}

/**
 * Anonymize PII fields for logging
 */
export function anonymizePII(data: PIIFields): PIIFields {
  const anonymized: PIIFields = { ...data }

  if (anonymized.email) {
    anonymized.email = maskEmail(anonymized.email)
  }

  if (anonymized.phone) {
    anonymized.phone = maskPhone(anonymized.phone)
  }

  if (anonymized.name) {
    const names = anonymized.name.split(' ')
    anonymized.name = names.map(n => n.charAt(0) + '***').join(' ')
  }

  if (anonymized.address) {
    anonymized.address = '*** (address hidden)'
  }

  return anonymized
}

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  rateLimit,
  RateLimiters,
  sanitizeString,
  sanitizeObject,
  sanitizeFilename,
  sanitizeEmail,
  escapeRegExp,
  isValidObjectId,
  sanitizeMongoQuery,
  createSafeRegex,
  generateCSRFToken,
  validateCSRFToken,
  validatePasswordStrength,
  maskEmail,
  maskPhone,
  anonymizePII,
  addSecurityHeaders
}
