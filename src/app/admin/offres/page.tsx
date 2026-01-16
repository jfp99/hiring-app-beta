// src/app/admin/offres/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Plus, Edit, Trash2, Eye, Copy,
  MapPin, Building, Calendar, Search, Filter,
  ArrowLeft, LayoutGrid, Kanban, List, RefreshCw,
  FileText, CheckCircle, Clock, AlertCircle, Archive,
  MoreHorizontal, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/app/hooks/useApi'
import type { OffreEnhanced, OffreStatut, OffreFormData, OffreTemplate, BulkActionRequest } from '@/app/types/offres'
import { STATUT_CONFIG, CATEGORIES } from '@/app/types/offres'
import {
  OffreKanbanBoard,
  KanbanStats,
  BulkActions,
  SelectionCheckbox,
  OffreFormModal,
  OffrePreviewEditModal,
  TemplateSelectorModal
} from '@/app/components/offres'

type ViewMode = 'list' | 'kanban' | 'grid'

const STATUT_ICONS: Record<OffreStatut, React.ElementType> = {
  draft: FileText,
  review: Eye,
  scheduled: Clock,
  active: CheckCircle,
  expired: AlertCircle,
  archived: Archive
}

export default function AdminOffresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { loading, callApi } = useApi()

  // State
  const [offres, setOffres] = useState<OffreEnhanced[]>([])
  const [filteredOffres, setFilteredOffres] = useState<OffreEnhanced[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [editingOffre, setEditingOffre] = useState<OffreEnhanced | null>(null)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  // Load offres
  useEffect(() => {
    loadOffres()
  }, [])

  // Filter offres
  useEffect(() => {
    let filtered = offres.filter(o => !o.isTemplate) // Exclude templates

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.lieu.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.statut === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(o => o.categorie === categoryFilter)
    }

    setFilteredOffres(filtered)
  }, [offres, searchTerm, statusFilter, categoryFilter])

  const loadOffres = async () => {
    setIsRefreshing(true)
    try {
      const result = await callApi('/offres?isTemplate=false')
      if (result.success) {
        setOffres(result.offres || [])
      }
    } catch {
      toast.error('Erreur lors du chargement des offres')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Form modal handlers
  const openCreateModal = () => {
    setEditingOffre(null)
    setIsFormModalOpen(true)
  }

  const openEditModal = (offre: OffreEnhanced) => {
    setEditingOffre(offre)
    setIsFormModalOpen(true)
  }

  const handleSave = async (data: OffreFormData, statut: OffreStatut) => {
    try {
      const payload = {
        ...data,
        statut,
        seo: data.seo
      }

      if (editingOffre) {
        const result = await callApi(`/offres?id=${editingOffre.id}`, {
          method: 'PUT',
          body: payload
        })
        if (result.success) {
          toast.success('Offre mise a jour avec succes')
          loadOffres()
          setIsFormModalOpen(false)
        } else {
          toast.error(result.error || 'Erreur lors de la mise a jour')
        }
      } else {
        const result = await callApi('/offres', {
          method: 'POST',
          body: payload
        })
        if (result.success) {
          toast.success('Offre creee avec succes')
          loadOffres()
          setIsFormModalOpen(false)
        } else {
          toast.error(result.error || 'Erreur lors de la creation')
        }
      }
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  // Delete handler
  const handleDelete = async (offre: OffreEnhanced) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette offre ?')) return

    try {
      const result = await callApi(`/offres?id=${offre.id}`, {
        method: 'DELETE'
      })
      if (result.success) {
        toast.success('Offre supprimee avec succes')
        loadOffres()
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  // Duplicate handler
  const handleDuplicate = async (offre: OffreEnhanced) => {
    try {
      const result = await callApi(`/offres/${offre.id}/duplicate`, {
        method: 'POST'
      })
      if (result.success) {
        toast.success('Offre dupliquee avec succes')
        loadOffres()
      } else {
        toast.error(result.error || 'Erreur lors de la duplication')
      }
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  // View handler (external link)
  const handleView = (offre: OffreEnhanced) => {
    const slug = offre.seo?.slug || offre.id
    window.open(`/offres-emploi/${slug}`, '_blank')
  }

  // Status change handler (for Kanban drag-drop)
  const handleStatusChange = async (offreId: string, newStatus: OffreStatut) => {
    try {
      const result = await callApi(`/offres?id=${offreId}`, {
        method: 'PUT',
        body: { statut: newStatus }
      })
      if (result.success) {
        setOffres(prev => prev.map(o =>
          o.id === offreId ? { ...o, statut: newStatus } : o
        ))
        toast.success(`Statut mis a jour: ${STATUT_CONFIG[newStatus].label}`)
      }
    } catch {
      toast.error('Erreur lors de la mise a jour du statut')
      loadOffres() // Reload to reset
    }
  }

  // Bulk action handler
  const handleBulkAction = async (action: BulkActionRequest) => {
    try {
      const result = await callApi('/offres/bulk', {
        method: 'POST',
        body: action
      })
      if (result.success) {
        toast.success('Action effectuee avec succes')
        setSelectedIds([])
        loadOffres()
      } else {
        toast.error(result.error || 'Erreur lors de l\'action')
      }
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(filteredOffres.map(o => o.id))
  }, [filteredOffres])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  // Template selection handler
  const handleTemplateSelect = (template: OffreTemplate | Partial<OffreFormData>) => {
    // Extract form data - if it's an OffreTemplate, use defaultData; otherwise use as-is
    const formData = 'defaultData' in template ? template.defaultData : template
    setEditingOffre({
      ...formData,
      id: '',
      isTemplate: false,
      statut: 'draft'
    } as OffreEnhanced)
    setIsTemplateSelectorOpen(false)
    setIsFormModalOpen(true)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-primary-600" />
                  Gestion des Offres
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''}
                  {statusFilter !== 'all' && ` (${STATUT_CONFIG[statusFilter as OffreStatut]?.label})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={loadOffres}
                disabled={isRefreshing}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Rafraichir"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* From template button */}
              <button
                onClick={() => setIsTemplateSelectorOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Template</span>
              </button>

              {/* New offer button */}
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nouvelle Offre</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats (only in Kanban view) */}
        {viewMode === 'kanban' && <KanbanStats offres={filteredOffres} />}

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <BulkActions
            selectedIds={selectedIds}
            offres={filteredOffres}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
            totalCount={filteredOffres.length}
            isLoading={loading}
          />
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              {(Object.keys(STATUT_CONFIG) as OffreStatut[]).map(status => (
                <option key={status} value={status}>
                  {STATUT_CONFIG[status].label}
                </option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Toutes categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* View mode toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                title="Vue grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                title="Vue Kanban"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'kanban' ? (
          <OffreKanbanBoard
            offres={filteredOffres}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onView={handleView}
            isLoading={loading && offres.length === 0}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffres.length === 0 ? (
              <EmptyState onCreateClick={openCreateModal} />
            ) : (
              filteredOffres.map((offre) => (
                <OffreGridCard
                  key={offre.id}
                  offre={offre}
                  isSelected={selectedIds.includes(offre.id)}
                  onToggleSelect={toggleSelection}
                  onEdit={openEditModal}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOffres.length === 0 ? (
              <EmptyState onCreateClick={openCreateModal} />
            ) : (
              filteredOffres.map((offre) => (
                <OffreListItem
                  key={offre.id}
                  offre={offre}
                  isSelected={selectedIds.includes(offre.id)}
                  onToggleSelect={toggleSelection}
                  onEdit={openEditModal}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onView={handleView}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Preview Edit Modal */}
      <OffrePreviewEditModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingOffre(null)
        }}
        onSave={handleSave}
        initialData={editingOffre || undefined}
        mode={editingOffre ? 'edit' : 'create'}
      />

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  )
}

// Empty state component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
      <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune offre trouvee</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Creer une nouvelle offre
      </button>
    </div>
  )
}

// List item component
function OffreListItem({
  offre,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onStatusChange
}: {
  offre: OffreEnhanced
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (offre: OffreEnhanced) => void
  onDuplicate: (offre: OffreEnhanced) => void
  onDelete: (offre: OffreEnhanced) => void
  onView: (offre: OffreEnhanced) => void
  onStatusChange: (id: string, status: OffreStatut) => Promise<void>
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const config = STATUT_CONFIG[offre.statut]
  const Icon = STATUT_ICONS[offre.statut]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
      isSelected
        ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
    }`}>
      <div className="p-4 flex items-center gap-4">
        {/* Checkbox */}
        <SelectionCheckbox
          id={offre.id}
          isSelected={isSelected}
          onToggle={onToggleSelect}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {offre.titre}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              {offre.entreprise}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {offre.lieu}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(offre.datePublication || offre.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {offre.typeContrat}
            </span>
            {offre.categorie && (
              <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded text-xs">
                {offre.categorie}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(offre)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Voir"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(offre)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(offre)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Changer le statut"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {(Object.keys(STATUT_CONFIG) as OffreStatut[]).map(status => {
                    const cfg = STATUT_CONFIG[status]
                    const StatusIcon = STATUT_ICONS[status]
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange(offre.id, status)
                          setShowStatusMenu(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          offre.statut === status ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                        }`}
                      >
                        <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                        <span className="text-gray-700 dark:text-gray-300">{cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onDelete(offre)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Grid card component
function OffreGridCard({
  offre,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onView
}: {
  offre: OffreEnhanced
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (offre: OffreEnhanced) => void
  onDuplicate: (offre: OffreEnhanced) => void
  onDelete: (offre: OffreEnhanced) => void
  onView: (offre: OffreEnhanced) => void
}) {
  const config = STATUT_CONFIG[offre.statut]
  const Icon = STATUT_ICONS[offre.statut]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
      isSelected
        ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <SelectionCheckbox
          id={offre.id}
          isSelected={isSelected}
          onToggle={onToggleSelect}
        />
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer" onClick={() => onEdit(offre)}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {offre.titre}
        </h3>
        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            <span className="truncate">{offre.entreprise}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{offre.lieu}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            {offre.typeContrat}
          </span>
          {offre.categorie && (
            <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded text-xs">
              {offre.categorie}
            </span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(offre.datePublication || offre.createdAt).toLocaleDateString('fr-FR')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(offre)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Voir"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(offre)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(offre)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
