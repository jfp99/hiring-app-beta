'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Mail,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Grid,
  List,
  Archive,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  ChevronLeft
} from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface EmailTemplate {
  id: string
  name: string
  type: string
  subject: string
  body: string
  isActive: boolean
  isDefault: boolean
  variables: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

const templateTypes = [
  { value: 'interview_invitation', label: 'Invitation à un entretien' },
  { value: 'offer_letter', label: 'Lettre d\'offre' },
  { value: 'rejection_soft', label: 'Refus poli' },
  { value: 'rejection_hard', label: 'Refus direct' },
  { value: 'initial_contact', label: 'Premier contact' },
  { value: 'follow_up', label: 'Suivi' },
  { value: 'interview_reminder', label: 'Rappel d\'entretien' },
  { value: 'thank_you', label: 'Remerciement' },
  { value: 'custom', label: 'Personnalisé' }
]

interface FilterState {
  search: string
  type: string
  status: string
  showArchived: boolean
  createdBy: string
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    showArchived: false,
    createdBy: ''
  })

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/email-templates')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates')
      }

      setTemplates(data.templates || [])
      setError('')
    } catch (err: any) {
      console.error('Error fetching templates:', err)
      setError(err.message)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template?')) return

    try {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      await fetchTemplates()
      toast.success('Template supprimé avec succès', {
        description: 'Le template a été supprimé de la liste'
      })
    } catch (err: any) {
      toast.error('Erreur lors de la suppression du template', {
        description: err.message
      })
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update template')
      }

      await fetchTemplates()
      toast.success(`Template ${!currentStatus ? 'activé' : 'désactivé'}`, {
        description: `Le template est maintenant ${!currentStatus ? 'actif' : 'inactif'}`
      })
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour du template', {
        description: err.message
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      showArchived: false,
      createdBy: ''
    })
    setPage(1)
  }

  // Apply filters
  const filteredTemplates = templates.filter(template => {
    const matchesType = filters.type === 'all' || template.type === filters.type
    const matchesStatus = filters.status === 'all' ||
                         (filters.status === 'active' && template.isActive) ||
                         (filters.status === 'inactive' && !template.isActive)
    const matchesSearch = !filters.search ||
                         template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         template.subject.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCreatedBy = !filters.createdBy ||
                            template.createdByName.toLowerCase().includes(filters.createdBy.toLowerCase())

    return matchesType && matchesStatus && matchesSearch && matchesCreatedBy
  })

  // Calculate stats
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    byType: templateTypes.reduce((acc, type) => {
      acc[type.value] = templates.filter(t => t.type === type.value).length
      return acc
    }, {} as Record<string, number>),
    mostUsedType: templateTypes
      .map(type => ({
        type: type.label,
        count: templates.filter(t => t.type === type.value).length
      }))
      .sort((a, b) => b.count - a.count)[0]
  }

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / pageSize)
  const paginatedTemplates = filteredTemplates.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const activeFiltersCount = [
    filters.search,
    filters.type !== 'all',
    filters.status !== 'all',
    filters.showArchived,
    filters.createdBy
  ].filter(Boolean).length

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement des templates...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section with Stats */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-200 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Templates d'Email
                  </h1>
                </div>
                <p className="text-lg text-gray-200">
                  {stats.total} template{stats.total > 1 ? 's' : ''} • {stats.active} actif{stats.active > 1 ? 's' : ''}
                </p>
              </div>

              <Link href="/admin/email-templates/new">
                <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                  Nouveau Template
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Templates actifs</p>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Total templates</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Types de templates</p>
                    <p className="text-2xl font-bold text-white">{Object.keys(stats.byType).filter(k => stats.byType[k] > 0).length}</p>
                  </div>
                  <Mail className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Type le plus utilisé</p>
                    <p className="text-lg font-bold text-white truncate">{stats.mostUsedType?.type || 'N/A'}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Toolbar */}
        <section className="sticky top-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Rechercher un template..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                    setPage(1)
                  }}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-2">
                {/* Filter Toggle */}
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<Filter className="w-4 h-4" />}
                  className="relative"
                >
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {/* View Mode */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Refresh */}
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={fetchTemplates}
                  disabled={isRefreshing}
                  leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                >
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-32">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Filtres</h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-accent-500 hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-300"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</h4>
                    <select
                      value={filters.type}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, type: e.target.value }))
                        setPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Tous</option>
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</h4>
                    <select
                      value={filters.status}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, status: e.target.value }))
                        setPage(1)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Tous</option>
                      <option value="active">Actifs</option>
                      <option value="inactive">Inactifs</option>
                    </select>
                  </div>

                  {/* Created By Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Créé par</h4>
                    <Input
                      type="text"
                      placeholder="Nom du créateur"
                      value={filters.createdBy}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, createdBy: e.target.value }))
                        setPage(1)
                      }}
                    />
                  </div>

                  {/* Archive Toggle */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.showArchived}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, showArchived: e.target.checked }))
                          setPage(1)
                        }}
                        className="mr-2 rounded text-accent-500"
                      />
                      <Archive className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Afficher les archivés</span>
                    </label>
                  </div>
                </div>
              </aside>
            )}

            {/* Templates Grid/List */}
            <div className="flex-1">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {paginatedTemplates.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun template trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeFiltersCount > 0
                      ? 'Aucun template ne correspond à vos critères de recherche'
                      : 'Créez votre premier template d\'email pour commencer'}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {activeFiltersCount > 0 && (
                      <Button variant="tertiary" size="md" onClick={clearFilters}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                    <Link href="/admin/email-templates/new">
                      <Button variant="secondary" size="md" leftIcon={<Plus className="w-5 h-5" />}>
                        Créer un template
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ?
                  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' :
                  'space-y-4'
                }>
                  {paginatedTemplates.map(template => (
                    <div
                      key={template.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold">{template.name}</h3>
                          <div className="flex gap-2">
                            {template.isDefault && (
                              <span className="px-2 py-1 bg-yellow-500 text-xs rounded-full font-semibold">
                                Par défaut
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleActive(template.id, template.isActive)}
                              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                template.isActive
                                  ? 'bg-green-500'
                                  : 'bg-gray-500'
                              }`}
                            >
                              {template.isActive ? 'Actif' : 'Inactif'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm opacity-90">
                          {templateTypes.find(t => t.value === template.type)?.label || template.type}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sujet</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{template.subject}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Corps du message</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{template.body.substring(0, 150)}...</p>
                        </div>

                        {template.variables && template.variables.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Variables ({template.variables.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.slice(0, 5).map((variable, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                  {`{{${variable}}}`}
                                </span>
                              ))}
                              {template.variables.length > 5 && (
                                <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                                  +{template.variables.length - 5} plus
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Créé par {template.createdByName} •{' '}
                          {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/email-templates/${template.id}`}
                            className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </Link>
                          {!template.isDefault && (
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all text-sm flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            page === pageNum
                              ? 'bg-accent-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-3 py-1 rounded ${
                            page === totalPages
                              ? 'bg-accent-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AdminGuard>
  )
}
