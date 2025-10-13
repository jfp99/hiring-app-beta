'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface CommentFormProps {
  candidateId: string
  onCommentAdded: () => void
}

export default function CommentForm({ candidateId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.warning('Le commentaire ne peut pas être vide', {
        description: 'Veuillez saisir un commentaire avant de publier'
      })
      return
    }

    if (!session?.user?.email) {
      toast.error('Vous devez être connecté pour ajouter un commentaire', {
        description: 'Veuillez vous connecter pour continuer'
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          content
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add comment')
      }

      setContent('')
      setShowForm(false)
      onCommentAdded()
      toast.success('Commentaire publié avec succès', {
        description: 'Votre commentaire a été ajouté au profil du candidat'
      })
    } catch (err: any) {
      console.error('Error adding comment:', err)
      toast.error('Erreur lors de l\'ajout du commentaire', {
        description: err.message
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setShowForm(false)
  }

  if (!session?.user?.email) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:text-[#3b5335ff] hover:bg-gray-50 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-[#3b5335ff]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Ajouter un commentaire</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b5335ff] to-[#ffaf50ff] flex items-center justify-center text-white font-bold text-sm">
              {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{session.user.name || session.user.email}</div>
              <div className="text-sm text-gray-500">Nouveau commentaire</div>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre commentaire ici... Utilisez @[email] pour mentionner quelqu'un"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent resize-none"
              rows={4}
              disabled={submitting}
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{content.length} caractères</span>
                {content.length > 0 && content.length < 10 && (
                  <span className="text-orange-500">Minimum 10 caractères recommandé</span>
                )}
              </div>
            </div>
          </div>

          {/* Hints */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium mb-1">Astuces:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Utilisez @[email] pour mentionner un collègue</li>
                  <li>• Les commentaires sont horodatés automatiquement</li>
                  <li>• Vous pourrez modifier ou supprimer votre commentaire après publication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[#3b5335ff] text-white rounded-lg font-semibold hover:bg-[#2a3d26ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publication...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Publier le commentaire</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
