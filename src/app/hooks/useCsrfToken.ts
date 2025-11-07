// src/app/hooks/useCsrfToken.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to fetch and manage CSRF token
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const response = await fetch('/api/csrf')

        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token')
        }

        const data = await response.json()
        setToken(data.token)
        setError(null)
      } catch (err) {
        setError(err as Error)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  /**
   * Refresh the CSRF token
   */
  const refreshToken = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/csrf')

      if (!response.ok) {
        throw new Error('Failed to refresh CSRF token')
      }

      const data = await response.json()
      setToken(data.token)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  return { token, loading, error, refreshToken }
}

/**
 * Helper function to add CSRF token to fetch headers
 */
export function addCsrfHeader(
  headers: HeadersInit = {},
  csrfToken: string | null
): HeadersInit {
  if (!csrfToken) {
    return headers
  }

  const headersObj = headers instanceof Headers
    ? Object.fromEntries(headers.entries())
    : headers as Record<string, string>

  return {
    ...headersObj,
    'x-csrf-token': csrfToken
  }
}
