// app/admin/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '../components/AdminHeader'
import AdminGuard from '@/app/components/AdminGuard'
import CandidateCard from '@/app/components/CandidateCard'
import SelectProcessModal from '@/app/components/SelectProcessModal'
import { useApi } from '../hooks/useApi'
import { Candidate, CandidateStatus, ExperienceLevel } from '../types/candidates'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  Grid,
  List,
  Archive,
  Download,
  Upload,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import Link from 'next/link'

interface FilterState {
  search: string
  status: CandidateStatus[]
  experienceLevel: ExperienceLevel[]
  tags: string[]
  skills: string[]
  assignedTo: string
  hasProcesses: boolean | null
  showArchived: boolean
}

export default function AdminCandidatesHub() {
  const router = useRouter()
  const { loading, error, callApi } = useApi()

  // State
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedCandidateForProcess, setSelectedCandidateForProcess] = useState<Candidate | null>(null)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    experienceLevel: [],
    tags: [],
    skills: [],
    assignedTo: '',
    hasProcesses: null,
    showArchived: false
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 24 // 6 cols x 4 rows on large screens

  // Available filter options (derived from candidates)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status.length > 0) params.append('status', filters.status.join(','))
      if (filters.experienceLevel.length > 0) params.append('experienceLevel', filters.experienceLevel.join(','))
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','))
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
      if (filters.hasProcesses !== null) params.append('hasProcesses', filters.hasProcesses.toString())
      params.append('isArchived', filters.showArchived.toString())
      params.append('isActive', 'true')  // Only show active candidates by default
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      const response = await callApi(`/candidates?${params}`)

      if (response) {
        setCandidates(response.candidates || [])
        setTotalPages(response.totalPages || 1)
        setTotalCount(response.total || 0)

        // Extract available tags and skills
        const allTags = new Set<string>()
        const allSkills = new Set<string>()

        response.candidates?.forEach((candidate: Candidate) => {
          candidate.tags?.forEach(tag => allTags.add(tag))
          candidate.primarySkills?.forEach(skill => allSkills.add(skill))
        })

        setAvailableTags(Array.from(allTags).sort())
        setAvailableSkills(Array.from(allSkills).sort())
      }
    } catch (err) {
      console.error('Error fetching candidates:', err)
      toast.error('Erreur lors du chargement des candidats')
    } finally {
      setIsRefreshing(false)
    }
  }, [filters, page, pageSize, callApi])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPage(1)
  }

  const handleStatusToggle = (status: CandidateStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
    setPage(1)
  }

  const handleExperienceToggle = (level: ExperienceLevel) => {
    setFilters(prev => ({
      ...prev,
      experienceLevel: prev.experienceLevel.includes(level)
        ? prev.experienceLevel.filter(l => l !== level)
        : [...prev.experienceLevel, level]
    }))
    setPage(1)
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
    setPage(1)
  }

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      experienceLevel: [],
      tags: [],
      skills: [],
      assignedTo: '',
      hasProcesses: null,
      showArchived: false
    })
    setPage(1)
  }

  // Action handlers
  const handleAddToProcess = async (candidate: Candidate) => {
    setSelectedCandidateForProcess(candidate)
    setShowProcessModal(true)
  }

  const handleEditCandidate = (candidate: Candidate) => {
    router.push(`/candidates/${candidate.id}/edit`)
  }

  const handleArchiveCandidate = async (candidate: Candidate) => {
    try {
      await callApi(`/candidates/${candidate.id}`, {
        method: 'PUT',
        body: { isArchived: true, status: CandidateStatus.ARCHIVED }
      })
      toast.success('Candidat archivé')
      fetchCandidates()
    } catch (err) {
      toast.error('Erreur lors de l\'archivage')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCandidates.length === 0) {
      toast.warning('Sélectionnez au moins un candidat')
      return
    }

    try {
      switch (action) {
        case 'add-to-process':
          router.push(`/admin/processes?addCandidates=${selectedCandidates.join(',')}`)
          break
        case 'archive':
          await callApi('/candidates/bulk', {
            method: 'PUT',
            body: {
              candidateIds: selectedCandidates,
              updates: { isArchived: true, status: CandidateStatus.ARCHIVED }
            }
          })
          toast.success(`${selectedCandidates.length} candidat(s) archivé(s)`)
          setSelectedCandidates([])
          fetchCandidates()
          break
        case 'export':
          // TODO: Implement export functionality
          toast.info('Export en cours de développement')
          break
      }
    } catch (err) {
      toast.error('Erreur lors de l\'action groupée')
    }
  }

  // Computed values
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.search ? 1 : 0) +
      filters.status.length +
      filters.experienceLevel.length +
      filters.tags.length +
      filters.skills.length +
      (filters.assignedTo ? 1 : 0) +
      (filters.hasProcesses !== null ? 1 : 0) +
      (filters.showArchived ? 1 : 0)
    )
  }, [filters])

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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Hub des Candidats
                </h1>
                <p className="text-lg text-gray-200">
                  {totalCount} candidat{totalCount > 1 ? 's' : ''} •
                  {selectedCandidates.length > 0 && ` ${selectedCandidates.length} sélectionné(s)`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <Link href="/admin/processes">
                  <Button variant="secondary" size="lg" leftIcon={<Briefcase className="w-5 h-5" />}>
                    Processus
                  </Button>
                </Link>
                <Link href="/candidates/new">
                  <Button variant="primary" size="lg" leftIcon={<UserPlus className="w-5 h-5" />}>
                    Nouveau Candidat
                  </Button>
                </Link>
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
                  placeholder="Rechercher par nom, email, compétence..."
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
                  onClick={fetchCandidates}
                  disabled={isRefreshing}
                  leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                >
                  Actualiser
                </Button>

                {/* Bulk Actions */}
                {selectedCandidates.length > 0 && (
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleBulkAction('add-to-process')}
                    >
                      Ajouter au processus
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleBulkAction('archive')}
                    >
                      Archiver
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleBulkAction('export')}
                    >
                      Exporter
                    </Button>
                    <button
                      onClick={() => setSelectedCandidates([])}
                      className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                    >
                      Annuler
                    </button>
                  </div>
                )}
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

                  {/* Status Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Statut</h4>
                    <div className="space-y-2">
                      {Object.values(CandidateStatus).map(status => (
                        <label key={status} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => handleStatusToggle(status)}
                            className="mr-2 rounded text-accent-500"
                          />
                          <span className="text-gray-700">
                            {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Expérience</h4>
                    <div className="space-y-2">
                      {Object.values(ExperienceLevel).map(level => (
                        <label key={level} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={filters.experienceLevel.includes(level)}
                            onChange={() => handleExperienceToggle(level)}
                            className="mr-2 rounded text-accent-500"
                          />
                          <span className="text-gray-700">
                            {level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills Filter */}
                  {availableSkills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableSkills.map(skill => (
                          <label key={skill} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={filters.skills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="mr-2 rounded text-accent-500"
                            />
                            <span className="text-gray-700">{skill}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Filter */}
                  {availableTags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableTags.map(tag => (
                          <label key={tag} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={filters.tags.includes(tag)}
                              onChange={() => handleTagToggle(tag)}
                              className="mr-2 rounded text-accent-500"
                            />
                            <span className="text-gray-700">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Processus</h4>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="hasProcesses"
                          checked={filters.hasProcesses === null}
                          onChange={() => setFilters(prev => ({ ...prev, hasProcesses: null }))}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Tous</span>
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="hasProcesses"
                          checked={filters.hasProcesses === true}
                          onChange={() => setFilters(prev => ({ ...prev, hasProcesses: true }))}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Avec processus</span>
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="hasProcesses"
                          checked={filters.hasProcesses === false}
                          onChange={() => setFilters(prev => ({ ...prev, hasProcesses: false }))}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Sans processus</span>
                      </label>
                    </div>
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

            {/* Candidates Grid */}
            <div className="flex-1">
              {loading && !isRefreshing ? (
                <div className="flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Chargement des candidats...</p>
                  </div>
                </div>
              ) : candidates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun candidat trouvé
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Essayez de modifier vos filtres ou d'ajouter de nouveaux candidats
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="tertiary" size="md" onClick={clearFilters}>
                      Réinitialiser les filtres
                    </Button>
                    <Link href="/candidates/new">
                      <Button variant="secondary" size="md" leftIcon={<UserPlus className="w-5 h-5" />}>
                        Ajouter un candidat
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ?
                  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' :
                  'space-y-4'
                }>
                  {candidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onAddToProcess={handleAddToProcess}
                      onEdit={handleEditCandidate}
                      onArchive={handleArchiveCandidate}
                      showActions={true}
                      showProcessInfo={true}
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

      {/* Process Selection Modal */}
      <SelectProcessModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false)
          setSelectedCandidateForProcess(null)
        }}
        candidate={selectedCandidateForProcess}
        onProcessSelected={(process) => {
          toast.success(`${selectedCandidateForProcess?.firstName} ${selectedCandidateForProcess?.lastName} added to ${process.name}`)
          loadCandidates() // Refresh candidates to update their process info
        }}
      />
    </AdminGuard>
  )
}