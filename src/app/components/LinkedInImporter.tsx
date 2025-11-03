'use client'

import { useState } from 'react'
import { Linkedin, AlertCircle, CheckCircle, Loader2, Info, X } from 'lucide-react'
import { isValidLinkedInUrl } from '@/app/lib/linkedin-helpers'
import { FormDataFromLinkedIn } from '@/app/lib/linkedin-helpers'
import { LinkedInPreviewData } from '@/app/types/linkedin'

interface LinkedInImporterProps {
  onImported: (data: FormDataFromLinkedIn, warnings: string[]) => void
}

export default function LinkedInImporter({ onImported }: LinkedInImporterProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<LinkedInPreviewData | null>(null)
  const [showInfoBanner, setShowInfoBanner] = useState(true)

  const handleImport = async () => {
    // Validation
    if (!linkedinUrl.trim()) {
      setError('Veuillez entrer une URL LinkedIn.')
      return
    }

    if (!isValidLinkedInUrl(linkedinUrl)) {
      setError('Format d\'URL LinkedIn invalide. Exemple: https://www.linkedin.com/in/username/')
      return
    }

    setIsLoading(true)
    setError(null)
    setPreviewData(null)

    try {
      const response = await fetch('/api/linkedin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setError('Non autorisé. Veuillez vous connecter.')
          return
        }
        throw new Error(result.error || 'Échec de la récupération du profil LinkedIn')
      }

      if (!result.success) {
        setError(result.error || 'Impossible de récupérer les données du profil')
        return
      }

      // Store preview data for display
      setPreviewData(result.data)

      // Transform and pass data to parent
      const { transformLinkedInToFormData, generateLinkedInWarnings } = await import('@/app/lib/linkedin-helpers')
      const formData = transformLinkedInToFormData(result.data, linkedinUrl)
      const warnings = generateLinkedInWarnings(result.data)

      onImported(formData, warnings)

    } catch (err) {
      console.error('LinkedIn import error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur inattendue s\'est produite')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setLinkedinUrl('')
    setError(null)
    setPreviewData(null)
  }

  const isUrlValid = linkedinUrl.trim() !== '' && isValidLinkedInUrl(linkedinUrl)

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Importer depuis LinkedIn
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remplissage automatique depuis un profil LinkedIn
          </p>
        </div>
      </div>

      {/* Info Banner */}
      {showInfoBanner && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-blue-900 dark:text-blue-200">
                <strong>Données limitées:</strong> L&apos;import LinkedIn récupère uniquement les informations publiques
                (nom, poste, entreprise). L&apos;email et d&apos;autres détails doivent être saisis manuellement.
              </p>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-2 mb-4">
        <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL du profil LinkedIn
        </label>
        <div className="relative">
          <input
            id="linkedin-url"
            type="url"
            value={linkedinUrl}
            onChange={(e) => {
              setLinkedinUrl(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isUrlValid && !isLoading) {
                handleImport()
              }
            }}
            placeholder="https://www.linkedin.com/in/username/"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {linkedinUrl && !isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isUrlValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Success Preview */}
      {previewData && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
                Profil importé avec succès!
              </p>
              <div className="flex items-center gap-3">
                {previewData.imageUrl && (
                  <img
                    src={previewData.imageUrl}
                    alt={previewData.name || 'Profile'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-300 dark:border-green-700"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {previewData.name || 'Nom non disponible'}
                  </p>
                  {previewData.headline && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {previewData.headline}
                    </p>
                  )}
                  {(previewData.position || previewData.company) && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {[previewData.position, previewData.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleImport}
          disabled={!isUrlValid || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Importation...</span>
            </>
          ) : (
            <>
              <Linkedin className="w-4 h-4" />
              <span>Importer le profil</span>
            </>
          )}
        </button>

        {(linkedinUrl || previewData) && !isLoading && (
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  )
}
