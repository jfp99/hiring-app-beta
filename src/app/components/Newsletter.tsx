// components/Newsletter.tsx
'use client'

import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const { loading, error, callApi, reset } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await callApi('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      
      setEmail('')
      alert(result.message || '✅ Inscription réussie !')
      
    } catch {
      // Erreur gérée par useApi
    }
  }

  return (
    <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white p-8 rounded-2xl">
      <h3 className="text-2xl font-bold mb-4">📧 Restez informé</h3>
      <p className="mb-4 opacity-90">
        Recevez les dernières offres et actualités du recrutement.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) reset()
          }}
          placeholder="Votre email"
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors disabled:bg-gray-400"
        >
          {loading ? '...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  )
}