'use client'

import { useState } from 'react'
import { QuickScore } from '@/app/types/candidates'

interface QuickScoreFormProps {
  candidateId: string
  candidateName: string
  currentUserId: string
  currentUserName: string
  onSubmit: (score: Omit<QuickScore, 'id' | 'scoredAt'>) => Promise<void>
  onClose: () => void
}

const QUICK_TAGS = [
  'Strong technical',
  'Culture fit',
  'Great communication',
  'Motivated',
  'Team player',
  'Leadership potential',
  'Needs improvement',
  'Overqualified',
  'Underqualified',
  'Good fit'
]

export default function QuickScoreForm({
  candidateId,
  candidateName,
  currentUserId,
  currentUserName,
  onSubmit,
  onClose
}: QuickScoreFormProps) {
  const [overallRating, setOverallRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [technicalRating, setTechnicalRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [cultureFitRating, setCultureFitRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [communicationRating, setCommunicationRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [quickNotes, setQuickNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [thumbs, setThumbs] = useState<'up' | 'down' | 'neutral' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!overallRating) {
      setError('Veuillez sélectionner une note globale')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      await onSubmit({
        scoredBy: currentUserId,
        scoredByName: currentUserName,
        overallRating,
        technicalRating: technicalRating || undefined,
        cultureFitRating: cultureFitRating || undefined,
        communicationRating: communicationRating || undefined,
        quickNotes: quickNotes.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        thumbs: thumbs || undefined
      })

      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'évaluation')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const StarRating = ({
    value,
    onChange,
    label
  }: {
    value: number | null,
    onChange: (rating: 1 | 2 | 3 | 4 | 5) => void,
    label: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star as 1 | 2 | 3 | 4 | 5)}
            className={`text-3xl transition-all hover:scale-110 ${
              value && value >= star ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
        {value && (
          <span className="ml-2 text-sm text-gray-600 self-center">
            {value}/5
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">⚡ Évaluation Rapide</h2>
              <p className="text-white/90">
                {candidateName}
              </p>
              <p className="text-sm text-white/70 mt-1">
                Évaluation rapide en 30 secondes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Overall Rating - Required */}
          <div className="pb-6 border-b border-gray-200">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              label="Note Globale *"
            />
            <p className="text-xs text-gray-500 mt-2">* Obligatoire</p>
          </div>

          {/* Thumbs Up/Down */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommandation Rapide
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setThumbs(thumbs === 'up' ? null : 'up')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  thumbs === 'up'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👍 Recommandé
              </button>
              <button
                type="button"
                onClick={() => setThumbs(thumbs === 'neutral' ? null : 'neutral')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  thumbs === 'neutral'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🤔 Peut-être
              </button>
              <button
                type="button"
                onClick={() => setThumbs(thumbs === 'down' ? null : 'down')}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  thumbs === 'down'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👎 Non recommandé
              </button>
            </div>
          </div>

          {/* Optional Category Ratings */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
              ➕ Notes par Catégorie (Optionnel)
            </summary>
            <div className="p-4 space-y-4 bg-gray-50">
              <StarRating
                value={technicalRating}
                onChange={setTechnicalRating}
                label="💻 Technique"
              />
              <StarRating
                value={cultureFitRating}
                onChange={setCultureFitRating}
                label="🎯 Culture Fit"
              />
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
                label="💬 Communication"
              />
            </div>
          </details>

          {/* Quick Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes Rapides (Optionnel)
            </label>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value.slice(0, 200))}
              placeholder="Ex: Très bon profil technique, motivé..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {quickNotes.length}/200 caractères
            </p>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags Rapides (Optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-[#3b5335ff] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !overallRating}
              className="flex-1 px-6 py-3 bg-[#3b5335ff] text-white rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50"
            >
              {submitting ? 'Envoi...' : '✓ Enregistrer l\'Évaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
