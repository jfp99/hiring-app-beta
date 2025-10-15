// tests/setup.ts
/**
 * Global test setup file
 * Runs before all test files
 */

import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017'
process.env.MONGODB_DB = 'hiring-app-test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-minimum-32-characters-long'
;(process.env as any).NODE_ENV = 'test'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/'
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  }
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { createElement } = require('react')
    return createElement('img', props)
  }
}))

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn()
}
