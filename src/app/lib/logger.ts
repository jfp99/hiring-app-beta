// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment: boolean
  private isTest: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isTest = process.env.NODE_ENV === 'test'
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    // Never log in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGS) {
      return false
    }

    // In production, only log warnings and errors
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return false
    }

    return true
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    const formattedLog = this.formatLog(entry)

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formattedLog)
        break
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formattedLog)
        break
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedLog)
        if (error) {
          // eslint-disable-next-line no-console
          console.warn(error)
        }
        break
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedLog)
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error.stack || error)
        }
        break
    }

    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && level === 'error') {
      // TODO: Integrate with error monitoring service
      // Example: Sentry.captureException(error, { extra: context })
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('warn', message, context, error)
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('error', message, context, error)
  }

  // Convenience method for API route logging
  apiRequest(method: string, path: string, status: number, duration?: number) {
    const context = {
      method,
      path,
      status,
      duration: duration ? `${duration}ms` : undefined,
    }

    if (status >= 500) {
      this.error('API request failed', context)
    } else if (status >= 400) {
      this.warn('API request error', context)
    } else {
      this.info('API request', context)
    }
  }

  // Convenience method for database operations
  dbOperation(operation: string, collection: string, success: boolean, error?: Error) {
    const context = { operation, collection }

    if (success) {
      this.debug('Database operation successful', context)
    } else {
      this.error('Database operation failed', context, error)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { LogLevel, LogEntry }
