// hooks/useApi.ts
'use client'

import { useState, useCallback } from 'react'

interface ApiState {
  loading: boolean
  error: string | null
  data: any
}

export function useApi() {
  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
    data: null
  })

  const callApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Erreur ${response.status}`)
      }

      setState(prev => ({ ...prev, data: result, loading: false }))
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null })
  }, [])

  return {
    ...state,
    callApi,
    reset
  }
}