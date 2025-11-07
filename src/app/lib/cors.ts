// lib/cors.ts
import { NextRequest } from 'next/server'

/**
 * Get CORS headers based on environment configuration
 * In development: Allow all origins for browser extension testing
 * In production: Only allow explicitly configured origins
 */
export function getCorsHeaders(request?: NextRequest): Record<string, string> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

  // Default headers
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  // Determine origin
  let origin = '*'

  if (request) {
    const requestOrigin = request.headers.get('origin')

    if (requestOrigin) {
      // In production, only allow explicitly configured origins
      if (!isDevelopment) {
        if (allowedOrigins.includes(requestOrigin)) {
          origin = requestOrigin
        } else {
          // Don't set Access-Control-Allow-Origin if origin not allowed
          // This will cause CORS to fail in the browser
          return {
            ...headers,
            'Access-Control-Allow-Origin': '', // Explicitly deny
          }
        }
      } else {
        // In development, allow the requesting origin
        origin = requestOrigin
      }
    }
  } else {
    // No request provided - use environment-based logic
    if (!isDevelopment && allowedOrigins.length > 0) {
      // In production with configured origins, use the first one as default
      origin = allowedOrigins[0]
    } else if (!isDevelopment) {
      // In production without configured origins, deny all
      return {
        ...headers,
        'Access-Control-Allow-Origin': '',
      }
    }
  }

  return {
    ...headers,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  }
}

/**
 * Check if origin is allowed based on environment configuration
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false

  const isDevelopment = process.env.NODE_ENV === 'development'

  // In development, allow all origins
  if (isDevelopment) return true

  // In production, check against allowed list
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []
  return allowedOrigins.includes(origin)
}

/**
 * Get allowed origins for logging/debugging
 */
export function getAllowedOrigins(): string[] {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    return ['*'] // All origins allowed in development
  }

  return process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []
}
