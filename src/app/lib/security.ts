// src/app/lib/security.ts
import { NextRequest, NextResponse } from 'next/server'
// Import new Redis-based rate limiter
import { RateLimiters as RedisRateLimiters, createRateLimit } from './rateLimiter'

// =============================================================================
// RATE LIMITING (Re-exported from rateLimiter.ts)
// =============================================================================
// Note: Rate limiting now uses Redis when available, with automatic fallback
// to in-memory storage for development or when Redis is unavailable.

// Re-export rate limit creator for backward compatibility
export const rateLimit = createRateLimit

/**
 * Preset rate limiters for common use cases
 * Now using Redis with automatic fallback to in-memory storage
 */
export const RateLimiters = RedisRateLimiters

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
