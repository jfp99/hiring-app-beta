// components/Error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erreur:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
          Oups ! Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] py-3 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            🔄 Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border-2 border-[#3b5335ff] text-[#3b5335ff] py-3 rounded-xl font-bold hover:bg-[#3b5335ff] hover:text-white transition-all duration-300"
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}