// src/app/lib/rateLimiter.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRedisClient, isRedisConnected } from './redis'
import { logger } from './logger'

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  keyPrefix?: string // Optional key prefix for namespacing
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// =============================================================================
// IN-MEMORY FALLBACK STORE
// =============================================================================

const memoryStore = new Map<string, RateLimitStore>()

/**
 * Clean up expired entries from memory store
 */
function cleanupMemoryStore() {
  const now = Date.now()
  const expiredKeys: string[] = []

  memoryStore.forEach((value, key) => {
    if (now > value.resetTime + 60000) { // 1 minute grace period
      expiredKeys.push(key)
    }
  })

  expiredKeys.forEach(key => memoryStore.delete(key))

  if (expiredKeys.length > 0) {
    logger.debug('Cleaned up expired rate limit entries', { count: expiredKeys.length })
  }
}

// Periodic cleanup every 5 minutes
setInterval(cleanupMemoryStore, 5 * 60 * 1000)

// =============================================================================
// REDIS-BASED RATE LIMITING
// =============================================================================

/**
 * Redis-based rate limiter with in-memory fallback
 */
async function rateLimitRedis(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const redis = await getRedisClient()

    if (!redis || !isRedisConnected()) {
      throw new Error('Redis not available')
    }

    const now = Date.now()
    const windowKey = `${config.keyPrefix || 'rate-limit'}:${key}`

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()
    pipeline.incr(windowKey)
    pipeline.pttl(windowKey)

    const results = await pipeline.exec()

    if (!results) {
      throw new Error('Redis pipeline execution failed')
    }

    const [[incrErr, count], [ttlErr, ttl]] = results as [[Error | null, number], [Error | null, number]]

    if (incrErr || ttlErr) {
      throw new Error('Redis operation error')
    }

    // Set expiration if this is first request in window
    if (ttl === -1) {
      await redis.pexpire(windowKey, config.windowMs)
    }

    const resetTime = ttl > 0 ? now + ttl : now + config.windowMs
    const remaining = Math.max(0, config.maxRequests - count)
    const allowed = count <= config.maxRequests

    return { allowed, remaining, resetTime }
  } catch (error) {
    logger.warn('Redis rate limit failed, falling back to memory', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Fallback to memory store
    return rateLimitMemory(key, config)
  }
}

/**
 * In-memory rate limiter (fallback)
 */
function rateLimitMemory(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const fullKey = `${config.keyPrefix || 'rate-limit'}:${key}`
  const now = Date.now()

  let entry = memoryStore.get(fullKey)

  // Reset if window has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    }
    memoryStore.set(fullKey, entry)
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const allowed = entry.count <= config.maxRequests

  return { allowed, remaining, resetTime: entry.resetTime }
}

// =============================================================================
// RATE LIMIT MIDDLEWARE
// =============================================================================

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Create rate limit middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier = getClientIdentifier(request)
    const path = request.nextUrl.pathname
    const key = `${identifier}:${path}`

    // Check rate limit (tries Redis first, falls back to memory)
    const { allowed, remaining, resetTime } = await rateLimitRedis(key, config)

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

      logger.warn('Rate limit exceeded', {
        identifier,
        path,
        limit: config.maxRequests,
        window: `${config.windowMs}ms`
      })

      return NextResponse.json(
        {
          success: false,
          error: config.message || 'Too many requests, please try again later',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(resetTime).toISOString()
          }
        }
      )
    }

    // Request allowed - return null to continue
    return null
  }
}

// =============================================================================
// PRESET RATE LIMITERS
// =============================================================================

export const RateLimiters = {
  // Authentication endpoints (very strict)
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again in 15 minutes',
    keyPrefix: 'rl:auth'
  }),

  // General API endpoints
  api: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests, please slow down',
    keyPrefix: 'rl:api'
  }),

  // File upload endpoints (strict)
  upload: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many uploads, please wait before uploading again',
    keyPrefix: 'rl:upload'
  }),

  // Search endpoints (moderate)
  search: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many search requests',
    keyPrefix: 'rl:search'
  }),

  // Public endpoints like newsletter/contact forms (lenient)
  public: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many requests, please wait a moment',
    keyPrefix: 'rl:public'
  })
}
