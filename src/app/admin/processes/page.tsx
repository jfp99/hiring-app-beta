// app/admin/processes/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/app/components/AdminHeader'
import AdminGuard from '@/app/components/AdminGuard'
import ProcessCard from '@/app/components/ProcessCard'
import { useApi } from '@/app/hooks/useApi'
import { ProcessSummary, ProcessStatus, ProcessType } from '@/app/types/process'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Grid,
  List,
  Archive,
  Users,
  Briefcase,
  ChevronLeft,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface FilterState {
  search: string
  type: ProcessType | 'all'
  status: ProcessStatus | 'all'
  company: string
  location: string
  priority: string
  showArchived: boolean
}

export default function ProcessesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading, error, callApi } = useApi()

  // State
  const [processes, setProcesses] = useState<ProcessSummary[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    status: 'all',
    company: '',
    location: '',
    priority: 'all',
    showArchived: false
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 12

  // Check if we need to add candidates to a new process
  const addCandidateId = searchParams.get('addCandidate')
  const addCandidateIds = searchParams.get('addCandidates')

  // Fetch processes
  const fetchProcesses = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.company) params.append('company', filters.company)
      if (filters.location) params.append('location', filters.location)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      if (filters.showArchived) params.append('includeArchived', 'true')
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      const response = await callApi(`/processes?${params}`)

      if (response) {
        setProcesses(response.processes || [])
        setTotalPages(response.totalPages || 1)
        setTotalCount(response.total || 0)
      }
    } catch (err) {
      console.error('Error fetching processes:', err)
      toast.error('Erreur lors du chargement des processus')
    } finally {
      setIsRefreshing(false)
    }
  }, [filters, page, pageSize, callApi])

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  // Handle adding candidates
  useEffect(() => {
    if (addCandidateId || addCandidateIds) {
      toast.info('Sélectionnez un processus existant ou créez-en un nouveau')
    }
  }, [addCandidateId, addCandidateIds])

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      company: '',
      location: '',
      priority: 'all',
      showArchived: false
    })
    setPage(1)
  }

  // Action handlers
  const handleEditProcess = (process: ProcessSummary) => {
    router.push(`/admin/processes/${process.id}/edit`)
  }

  const handleArchiveProcess = async (process: ProcessSummary) => {
    try {
      await callApi(`/processes?id=${process.id}`, {
        method: 'DELETE'
      })
      toast.success('Processus archivé avec succès')
      fetchProcesses()
    } catch (err) {
      toast.error('Erreur lors de l\'archivage du processus')
    }
  }

  const handleAddCandidatesToProcess = (process: ProcessSummary) => {
    const candidateIds = addCandidateId || addCandidateIds
    if (candidateIds) {
      router.push(`/admin/processes/${process.id}?addCandidates=${candidateIds}`)
    } else {
      router.push(`/admin/processes/${process.id}?selectCandidates=true`)
    }
  }

  // Statistics
  const stats = {
    total: totalCount,
    active: processes.filter(p => p.status === ProcessStatus.ACTIVE).length,
    completed: processes.filter(p => p.status === ProcessStatus.COMPLETED).length,
    totalCandidates: processes.reduce((acc, p) => acc + p.candidateCount, 0),
    avgProgress: processes.length > 0
      ? Math.round(processes.reduce((acc, p) => acc + p.progress, 0) / processes.length)
      : 0
  }

  const activeFiltersCount = [
    filters.search,
    filters.type !== 'all',
    filters.status !== 'all',
    filters.company,
    filters.location,
    filters.priority !== 'all',
    filters.showArchived
  ].filter(Boolean).length

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200">
        <AdminHeader />

        {/* Hero Section */}
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
                    Processus de Recrutement
                  </h1>
                </div>
                <p className="text-lg text-gray-200">
                  {totalCount} processus • {stats.totalCandidates} candidats au total
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/admin">
                  <Button variant="tertiary" size="lg" leftIcon={<Users className="w-5 h-5" />}>
                    Candidats
                  </Button>
                </Link>
                <Link href="/admin/processes/new">
                  <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                    Nouveau Processus
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Processus actifs</p>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                  </div>
                  <Target className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Terminés</p>
                    <p className="text-2xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Candidats</p>
                    <p className="text-2xl font-bold text-white">{stats.totalCandidates}</p>
                  </div>
                  <Users className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Progression moy.</p>
                    <p className="text-2xl font-bold text-white">{stats.avgProgress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Rechercher un processus..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Refresh */}
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={fetchProcesses}
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
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-32">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filtres</h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-accent-500 hover:text-accent-600"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as ProcessType | 'all' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="all">Tous</option>
                      <option value={ProcessType.JOB_SPECIFIC}>Poste spécifique</option>
                      <option value={ProcessType.CUSTOM_WORKFLOW}>Workflow personnalisé</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Statut</h4>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ProcessStatus | 'all' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="all">Tous</option>
                      <option value={ProcessStatus.DRAFT}>Brouillon</option>
                      <option value={ProcessStatus.ACTIVE}>Actif</option>
                      <option value={ProcessStatus.PAUSED}>En pause</option>
                      <option value={ProcessStatus.COMPLETED}>Terminé</option>
                      <option value={ProcessStatus.CANCELLED}>Annulé</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Priorité</h4>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    >
                      <option value="all">Toutes</option>
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  {/* Company Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Entreprise</h4>
                    <Input
                      type="text"
                      placeholder="Filtrer par entreprise"
                      value={filters.company}
                      onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>

                  {/* Location Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Localisation</h4>
                    <Input
                      type="text"
                      placeholder="Filtrer par lieu"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Archive Toggle */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.showArchived}
                        onChange={(e) => setFilters(prev => ({ ...prev, showArchived: e.target.checked }))}
                        className="mr-2 rounded text-accent-500"
                      />
                      <Archive className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-gray-700">Afficher les archivés</span>
                    </label>
                  </div>
                </div>
              </aside>
            )}

            {/* Processes Grid */}
            <div className="flex-1">
              {(addCandidateId || addCandidateIds) && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Mode sélection : Choisissez un processus pour y ajouter les candidats sélectionnés
                  </p>
                </div>
              )}

              {loading && !isRefreshing ? (
                <div className="flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Chargement des processus...</p>
                  </div>
                </div>
              ) : processes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun processus trouvé
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Créez votre premier processus de recrutement pour commencer
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="tertiary" size="md" onClick={clearFilters}>
                      Réinitialiser les filtres
                    </Button>
                    <Link href="/admin/processes/new">
                      <Button variant="secondary" size="md" leftIcon={<Plus className="w-5 h-5" />}>
                        Créer un processus
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ?
                  'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' :
                  'space-y-4'
                }>
                  {processes.map(process => (
                    <ProcessCard
                      key={process.id}
                      process={process}
                      onEdit={handleEditProcess}
                      onArchive={handleArchiveProcess}
                      onAddCandidates={handleAddCandidatesToProcess}
                    />
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
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-3 py-1 rounded ${
                            page === totalPages
                              ? 'bg-accent-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
      </div>
    </AdminGuard>
  )
}