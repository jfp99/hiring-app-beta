'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Comment, formatCommentDate } from '@/app/types/comments'

interface CommentThreadProps {
  comments: Comment[]
  onCommentUpdated: () => void
  onCommentDeleted: () => void
}

export default function CommentThread({
  comments,
  onCommentUpdated,
  onCommentDeleted
}: CommentThreadProps) {
  const { data: session } = useSession()
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.warning('Le commentaire ne peut pas être vide', {
        description: 'Veuillez saisir un commentaire avant de sauvegarder'
      })
      return
    }

    try {
      setUpdating(true)

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update comment')
      }

      setEditingCommentId(null)
      setEditContent('')
      onCommentUpdated()
      toast.success('Commentaire mis à jour', {
        description: 'Vos modifications ont été enregistrées'
      })
    } catch (err: any) {
      console.error('Error updating comment:', err)
      toast.error('Erreur lors de la mise à jour du commentaire', {
        description: err.message
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire?')) {
      return
    }

    try {
      setDeleting(commentId)

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete comment')
      }

      onCommentDeleted()
      toast.success('Commentaire supprimé', {
        description: 'Le commentaire a été supprimé définitivement'
      })
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      toast.error('Erreur lors de la suppression du commentaire', {
        description: err.message
      })
    } finally {
      setDeleting(null)
    }
  }

  const canEditComment = (comment: Comment) => {
    if (!session?.user?.email) return false
    const userId = (session.user as any).id || session.user.email
    return comment.authorId === userId || comment.authorEmail === session.user.email
  }

  const canDeleteComment = (comment: Comment) => {
    if (!session?.user?.email) return false
    const userId = (session.user as any).id || session.user.email
    const isAuthor = comment.authorId === userId || comment.authorEmail === session.user.email
    const isAdmin = (session.user as any).role === 'admin'
    return isAuthor || isAdmin
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">💬</div>
        <p className="text-lg font-medium mb-2">Aucun commentaire pour l'instant</p>
        <p className="text-sm">Soyez le premier à ajouter un commentaire!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b5335ff] to-[#ffaf50ff] flex items-center justify-center text-white font-bold text-sm">
                {comment.authorName.charAt(0).toUpperCase()}
              </div>

              {/* Author Info */}
              <div>
                <div className="font-semibold text-gray-900">{comment.authorName}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatCommentDate(comment.createdAt)}</span>
                  {comment.isEdited && (
                    <span className="text-gray-400">(modifié)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEditComment(comment) && !editingCommentId && (
                <button
                  onClick={() => handleEditClick(comment)}
                  className="p-2 text-gray-400 hover:text-[#3b5335ff] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}

              {canDeleteComment(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deleting === comment.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === comment.id ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {editingCommentId === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent resize-none"
                rows={4}
                placeholder="Modifier votre commentaire..."
                disabled={updating}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={updating || !editContent.trim()}
                  className="px-4 py-2 bg-[#3b5335ff] text-white rounded-lg font-medium hover:bg-[#2a3d26ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* Mentions */}
          {comment.mentions && comment.mentions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <span>Mentions: {comment.mentions.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
