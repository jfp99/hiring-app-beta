// src/app/lib/redis.ts
import Redis, { RedisOptions } from 'ioredis'
import { logger } from './logger'

let redis: Redis | null = null
let isRedisAvailable = false

/**
 * Get Redis connection configuration from environment
 */
function getRedisConfig(): RedisOptions {
  const url = process.env.REDIS_URL

  if (url) {
    // Parse Redis URL (e.g., redis://localhost:6379 or rediss://user:pass@host:port)
    return {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, falling back to in-memory')
          return null // Stop retrying
        }
        return Math.min(times * 100, 3000) // Exponential backoff
      }
    }
  }

  // Individual config parameters
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries, falling back to in-memory')
        return null
      }
      return Math.min(times * 100, 3000)
    }
  }
}

/**
 * Initialize Redis connection
 */
async function initRedis(): Promise<Redis | null> {
  // Skip Redis in development if not explicitly configured
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
    logger.info('Redis not configured in development - using in-memory rate limiting')
    return null
  }

  try {
    const config = getRedisConfig()
    const url = process.env.REDIS_URL

    const client = url ? new Redis(url, config) : new Redis(config)

    // Test connection
    await client.connect()
    await client.ping()

    logger.info('Redis connection established successfully', {
      host: config.host || 'url-configured',
      db: config.db
    })

    isRedisAvailable = true
    return client
  } catch (error) {
    logger.warn('Failed to connect to Redis, falling back to in-memory rate limiting', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    isRedisAvailable = false
    return null
  }
}

/**
 * Get Redis client (creates connection if needed)
 */
export async function getRedisClient(): Promise<Redis | null> {
  if (redis) {
    return redis
  }

  redis = await initRedis()
  return redis
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable && redis !== null
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit()
      logger.info('Redis connection closed successfully')
    } catch (error) {
      logger.error('Error closing Redis connection', {}, error as Error)
    } finally {
      redis = null
      isRedisAvailable = false
    }
  }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', closeRedis)
  process.on('SIGINT', closeRedis)
}
