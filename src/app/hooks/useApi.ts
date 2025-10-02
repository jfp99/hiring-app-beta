// hooks/useApi.ts
import { useState, useCallback } from 'react'

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callApi = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`🌐 [API] Calling ${endpoint}`, options);
      
      // Préparer le body - NE PAS stringifier si c'est déjà une string
      let bodyToSend = options.body;
      if (options.body && typeof options.body !== 'string') {
        bodyToSend = JSON.stringify(options.body);
      }
      
      const response = await fetch(`/api${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: bodyToSend,
      })

      // Vérifier si la réponse est du HTML (erreur)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('❌ [API] HTML response instead of JSON:', text.substring(0, 200));
        throw new Error(`API returned HTML (likely 404) for ${endpoint}`);
      }

      const data = await response.json();
      
      console.log(`🌐 [API] Response from ${endpoint}:`, { status: response.status, success: data.success });

      if (!response.ok) {
        throw new Error(data.error || data.details || `Erreur ${response.status}: ${data.message || 'Unknown error'}`)
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error(`❌ [API] Error calling ${endpoint}:`, message);
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { loading, error, callApi, clearError }
}