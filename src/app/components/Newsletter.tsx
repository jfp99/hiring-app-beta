// components/Newsletter.tsx
'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '../hooks/useApi'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

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
      toast.success('Inscription réussie!', {
        description: result.message || 'Vous recevrez nos prochaines newsletters'
      })

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
      
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) reset()
            }}
            placeholder="votre@email.com"
            leftIcon={<Mail className="w-5 h-5" />}
            required
            disabled={loading}
            className="bg-white/10 border-white/20 text-white placeholder-white/60"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          variant="secondary"
          size="md"
          isLoading={loading}
        >
          S'inscrire
        </Button>
      </form>
    </div>
  )
}