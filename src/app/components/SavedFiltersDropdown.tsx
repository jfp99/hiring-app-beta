'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Save, Inbox, Search, BarChart3, Briefcase, Wrench, Tag } from 'lucide-react'
import { SavedFilter, SavedFiltersManager } from '@/app/types/savedFilters'

interface SavedFiltersDropdownProps {
  view: 'list' | 'pipeline'
  onLoadFilter: (filter: SavedFilter) => void
  onSaveClick: () => void
}

export default function SavedFiltersDropdown({
  view,
  onLoadFilter,
  onSaveClick
}: SavedFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSavedFilters()
  }, [view])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSavedFilters = () => {
    const filters = SavedFiltersManager.getByView(view)
    setSavedFilters(filters)
  }

  const handleLoadFilter = (filter: SavedFilter) => {
    onLoadFilter(filter)
    setIsOpen(false)
  }

  const handleDeleteFilter = async (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent loading the filter when clicking delete

    if (!confirm('Voulez-vous vraiment supprimer ce filtre sauvegardé?')) {
      return
    }

    try {
      setDeletingId(filterId)
      SavedFiltersManager.delete(filterId)
      loadSavedFilters()
      toast.success('Filtre supprimé avec succès')
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast.error('Erreur lors de la suppression du filtre')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#3b5335ff] text-[#3b5335ff] rounded-lg font-semibold hover:bg-[#3b5335ff] hover:text-white transition-all"
      >
        <span>🔖</span>
        <span>Filtres Sauvegardés</span>
        {savedFilters.length > 0 && (
          <span className="px-2 py-0.5 bg-[#ffaf50ff] text-[#3b5335ff] rounded-full text-xs font-bold">
            {savedFilters.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white p-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>🔖</span>
              Mes Filtres Sauvegardés
            </h3>
            <p className="text-sm text-white/80 mt-1">
              Cliquez pour appliquer un filtre
            </p>
          </div>

          {/* Save Current Filter Button */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                onSaveClick()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 bg-[#ffaf50ff] text-[#3b5335ff] rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>Sauvegarder les Filtres Actuels</span>
            </button>
          </div>

          {/* Filters List */}
          <div className="max-h-96 overflow-y-auto">
            {savedFilters.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Inbox className="w-16 h-16 mx-auto mb-2" />
                <p className="font-medium mb-1">Aucun filtre sauvegardé</p>
                <p className="text-sm">
                  Appliquez des filtres puis cliquez sur "Sauvegarder" pour les retrouver rapidement
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {savedFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleLoadFilter(filter)}
                    disabled={deletingId === filter.id}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Filter Name */}
                        <div className="font-semibold text-[#3b5335ff] mb-1 group-hover:text-[#ffaf50ff] transition-colors truncate">
                          {filter.name}
                        </div>

                        {/* Filter Details */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          {filter.searchTerm && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              <Search className="w-3 h-3" />
                              Recherche
                            </span>
                          )}
                          {filter.statusFilter && filter.statusFilter.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              <BarChart3 className="w-3 h-3" />
                              {filter.statusFilter.length} statut(s)
                            </span>
                          )}
                          {filter.experienceFilter && filter.experienceFilter.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              <Briefcase className="w-3 h-3" />
                              {filter.experienceFilter.length} niveau(x)
                            </span>
                          )}
                          {filter.skillsFilter && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                              <Wrench className="w-3 h-3" />
                              Compétences
                            </span>
                          )}
                          {filter.selectedTags && filter.selectedTags.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded">
                              <Tag className="w-3 h-3" />
                              {filter.selectedTags.length} tag(s)
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-400">
                          Créé le {formatDate(filter.createdAt)}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteFilter(filter.id, e)}
                        disabled={deletingId === filter.id}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Supprimer ce filtre"
                      >
                        {deletingId === filter.id ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {savedFilters.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
              {savedFilters.length} filtre{savedFilters.length > 1 ? 's' : ''} sauvegardé{savedFilters.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
