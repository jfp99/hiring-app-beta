'use client'

import { useState } from 'react'
import { AlertTriangle, Save, Search, BarChart3, Briefcase, Wrench, Tag } from 'lucide-react'
import { SavedFilter, SavedFiltersManager } from '@/app/types/savedFilters'

interface SaveFilterModalProps {
  filterData: Omit<SavedFilter, 'id' | 'createdAt' | 'name'>
  onClose: () => void
  onSave: (filter: SavedFilter) => void
}

export default function SaveFilterModal({
  filterData,
  onClose,
  onSave
}: SaveFilterModalProps) {
  const [filterName, setFilterName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!filterName.trim()) {
      setError('Veuillez entrer un nom pour ce filtre')
      return
    }

    try {
      setSaving(true)
      setError('')

      const savedFilter = SavedFiltersManager.save({
        ...filterData,
        name: filterName.trim()
      })

      onSave(savedFilter)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du filtre')
    } finally {
      setSaving(false)
    }
  }

  // Check if there are any filters to save
  const hasFilters =
    filterData.searchTerm ||
    (filterData.statusFilter && filterData.statusFilter.length > 0) ||
    (filterData.experienceFilter && filterData.experienceFilter.length > 0) ||
    filterData.skillsFilter ||
    (filterData.selectedTags && filterData.selectedTags.length > 0)

  if (!hasFilters) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-orange-500" />
            <h2 className="text-xl font-bold text-[#3b5335ff] mt-4 mb-2">
              Aucun Filtre Actif
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez d'abord appliquer des filtres avant de pouvoir les sauvegarder.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Save className="w-6 h-6" />
                Sauvegarder le Filtre
              </h2>
              <p className="text-white/90 text-sm">
                Donnez un nom à cette combinaison de filtres pour y accéder rapidement plus tard
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

          {/* Filter Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Filtre *
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Ex: Développeurs Senior avec React"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {filterName.length}/50 caractères
            </p>
          </div>

          {/* Filter Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#3b5335ff] mb-3">
              Résumé des Filtres:
            </h3>
            <div className="space-y-2 text-sm">
              {filterData.searchTerm && (
                <div className="flex items-start gap-2">
                  <Search className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Recherche:</span>{' '}
                    <span className="text-gray-600">{filterData.searchTerm}</span>
                  </div>
                </div>
              )}

              {filterData.statusFilter && filterData.statusFilter.length > 0 && (
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Statuts:</span>{' '}
                    <span className="text-gray-600">{filterData.statusFilter.length} sélectionné(s)</span>
                  </div>
                </div>
              )}

              {filterData.experienceFilter && filterData.experienceFilter.length > 0 && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Niveaux d'expérience:</span>{' '}
                    <span className="text-gray-600">{filterData.experienceFilter.length} sélectionné(s)</span>
                  </div>
                </div>
              )}

              {filterData.skillsFilter && (
                <div className="flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Compétences:</span>{' '}
                    <span className="text-gray-600">{filterData.skillsFilter}</span>
                  </div>
                </div>
              )}

              {filterData.selectedTags && filterData.selectedTags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Tags:</span>{' '}
                    <span className="text-gray-600">{filterData.selectedTags.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !filterName.trim()}
              className="flex-1 px-6 py-3 bg-[#3b5335ff] text-white rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                'Sauvegarde...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
