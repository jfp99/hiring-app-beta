// src/app/lib/env.ts
import { z } from 'zod'

/**
 * Environment Variables Validation with Zod
 *
 * CRITICAL: All environment variables must be validated at application startup
 * This prevents runtime failures and ensures type safety
 */

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // MongoDB Configuration (REQUIRED)
  MONGODB_URI: z.string().url().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().min(1, 'MONGODB_DB is required'),

  // NextAuth Configuration (REQUIRED)
  NEXTAUTH_URL: z.string().url().min(1, 'NEXTAUTH_URL is required'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),

  // Email Configuration (OPTIONAL)
  EMAIL_PROVIDER: z
    .enum(['smtp', 'sendgrid', 'ses', 'mailgun'])
    .optional()
    .default('smtp'),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional().default('Hi-Ring Recrutement'),

  // SMTP Configuration (OPTIONAL - required if EMAIL_PROVIDER=smtp)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // SendGrid Configuration (OPTIONAL - required if EMAIL_PROVIDER=sendgrid)
  SENDGRID_API_KEY: z.string().optional(),

  // AWS SES Configuration (OPTIONAL - required if EMAIL_PROVIDER=ses)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Mailgun Configuration (OPTIONAL - required if EMAIL_PROVIDER=mailgun)
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),

  // Azure Storage (OPTIONAL)
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),

  // Application Configuration
  APP_NAME: z.string().optional().default('Hi-Ring'),
  APP_URL: z.string().url().optional(),

  // Rate Limiting (OPTIONAL)
  RATE_LIMIT_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .default('60')
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default('60000')
    .transform((val) => parseInt(val, 10)),

  // Security
  ENABLE_CORS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((o) => o.trim()) : [])),

  // Monitoring & Analytics (OPTIONAL)
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),

  // Feature Flags (OPTIONAL)
  FEATURE_WORKFLOWS: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  FEATURE_EMAIL_TEMPLATES: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  FEATURE_CUSTOM_FIELDS: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true')
})

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type Env = z.infer<typeof envSchema>

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validate environment variables
 * @throws {Error} If validation fails
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env)

    // Additional validation for email providers
    if (parsed.EMAIL_PROVIDER === 'smtp') {
      if (!parsed.SMTP_HOST || !parsed.SMTP_PORT || !parsed.SMTP_USER || !parsed.SMTP_PASS) {
        throw new Error(
          'SMTP configuration is incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS'
        )
      }
    }

    if (parsed.EMAIL_PROVIDER === 'sendgrid') {
      if (!parsed.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid')
      }
    }

    if (parsed.EMAIL_PROVIDER === 'ses') {
      if (!parsed.AWS_REGION || !parsed.AWS_ACCESS_KEY_ID || !parsed.AWS_SECRET_ACCESS_KEY) {
        throw new Error(
          'AWS configuration is incomplete. Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY'
        )
      }
    }

    if (parsed.EMAIL_PROVIDER === 'mailgun') {
      if (!parsed.MAILGUN_API_KEY || !parsed.MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration is incomplete. Required: MAILGUN_API_KEY, MAILGUN_DOMAIN')
      }
    }

    // Validate MongoDB URI format
    if (!parsed.MONGODB_URI.startsWith('mongodb://') && !parsed.MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://')
    }

    // Security validation: Ensure NEXTAUTH_SECRET is strong enough in production
    if (parsed.NODE_ENV === 'production') {
      if (parsed.NEXTAUTH_SECRET.length < 64) {
        console.warn(
          '⚠️ WARNING: NEXTAUTH_SECRET should be at least 64 characters in production for maximum security'
        )
      }

      if (!parsed.APP_URL) {
        console.warn('⚠️ WARNING: APP_URL is recommended in production for proper URL generation')
      }
    }

    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed - Missing or invalid environment variables:');

      (error as any).errors.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })

      throw new Error('Environment validation failed. Please check your .env.local file.')
    }

    throw error
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let envInstance: Env | null = null

/**
 * Get validated environment variables
 * Cached after first call for performance
 */
export function getEnv(): Env {
  if (!envInstance) {
    envInstance = validateEnv()
  }
  return envInstance
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test'
}

/**
 * Get MongoDB connection details
 */
export function getMongoConfig() {
  const env = getEnv()
  return {
    uri: env.MONGODB_URI,
    database: env.MONGODB_DB
  }
}

/**
 * Get email configuration
 */
export function getEmailConfig() {
  const env = getEnv()
  return {
    provider: env.EMAIL_PROVIDER,
    from: env.EMAIL_FROM || 'noreply@hi-ring.com',
    fromName: env.EMAIL_FROM_NAME,
    smtp: env.EMAIL_PROVIDER === 'smtp' ? {
      host: env.SMTP_HOST!,
      port: env.SMTP_PORT!,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER!,
        pass: env.SMTP_PASS!
      }
    } : undefined,
    sendgrid: env.EMAIL_PROVIDER === 'sendgrid' ? {
      apiKey: env.SENDGRID_API_KEY!
    } : undefined
  }
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig() {
  const env = getEnv()
  return {
    enabled: env.RATE_LIMIT_ENABLED,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    windowMs: env.RATE_LIMIT_WINDOW_MS
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Validate environment on module load (fail fast)
if (typeof window === 'undefined') {
  // Only validate on server-side
  try {
    validateEnv()
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error('❌ Failed to load application due to environment validation errors')
    process.exit(1) // Exit with error code
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
  getMongoConfig,
  getEmailConfig,
  getRateLimitConfig
}
