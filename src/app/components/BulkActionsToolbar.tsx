'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CandidateStatus, CANDIDATE_STATUS_LABELS } from '@/app/types/candidates'
import { PREDEFINED_TAGS } from '@/app/types/tags'

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkStatusChange: (status: CandidateStatus) => void
  onBulkAddTags: (tags: string[]) => void
  onBulkArchive: () => void
  onBulkDelete: () => void
}

export default function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
  onBulkAddTags,
  onBulkArchive,
  onBulkDelete
}: BulkActionsToolbarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showTagsMenu, setShowTagsMenu] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  if (selectedCount === 0) {
    return null
  }

  const handleAddTags = () => {
    if (selectedTags.length === 0) {
      toast.warning('Veuillez sélectionner au moins un tag')
      return
    }
    onBulkAddTags(selectedTags)
    setSelectedTags([])
    setShowTagsMenu(false)
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white shadow-2xl border-t-4 border-[#ffaf50ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold text-lg">
                  {selectedCount} candidat{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-white/80">Choisissez une action à appliquer</p>
              </div>
            </div>
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
            >
              ✕ Désélectionner tout
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Change Status */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu)
                  setShowTagsMenu(false)
                }}
                className="px-4 py-2.5 bg-[#ffaf50ff] text-[#3b5335ff] rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>📊</span>
                <span>Changer le Statut</span>
                <svg className={`w-4 h-4 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-lg shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {Object.values(CandidateStatus).filter(s => s !== CandidateStatus.ARCHIVED).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          onBulkStatusChange(status)
                          setShowStatusMenu(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        {CANDIDATE_STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Tags */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTagsMenu(!showTagsMenu)
                  setShowStatusMenu(false)
                }}
                className="px-4 py-2.5 bg-[#ffaf50ff] text-[#3b5335ff] rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>🏷️</span>
                <span>Ajouter des Tags</span>
                <svg className={`w-4 h-4 transition-transform ${showTagsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTagsMenu && (
                <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-lg shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Sélectionner les tags à ajouter</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PREDEFINED_TAGS.map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => toggleTag(tag.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedTags.includes(tag.name)
                              ? 'bg-[#3b5335ff] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedTags([])
                          setShowTagsMenu(false)
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAddTags}
                        disabled={selectedTags.length === 0}
                        className="flex-1 px-3 py-2 bg-[#3b5335ff] text-white rounded-lg text-sm font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Ajouter ({selectedTags.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Archive */}
            <button
              onClick={onBulkArchive}
              className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
              title="Archiver les candidats sélectionnés"
            >
              <span>📦</span>
              <span>Archiver</span>
            </button>

            {/* Delete */}
            <button
              onClick={onBulkDelete}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
              title="Supprimer définitivement les candidats sélectionnés"
            >
              <span>🗑️</span>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
