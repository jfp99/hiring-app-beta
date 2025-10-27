// src/app/candidates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, UserPlus, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Candidate,
  CandidateStatus,
  ExperienceLevel,
  CANDIDATE_STATUS_LABELS,
  EXPERIENCE_LEVEL_LABELS
} from '@/app/types/candidates'
import { SavedFilter } from '@/app/types/savedFilters'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import SaveFilterModal from '@/app/components/SaveFilterModal'
import BulkActionsToolbar from '@/app/components/BulkActionsToolbar'
import KanbanColumn from '@/app/components/KanbanColumn'
import { SkeletonTable, EmptySearch } from '@/app/components/ui'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

type ViewMode = 'kanban' | 'list'

export default function CandidatesPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // View mode state - Kanban is default
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]) // For Kanban view
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Kanban specific states
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus[]>([])
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel[]>([])
  const [skillsFilter, setSkillsFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Saved Filters
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false)

  // Bulk Actions
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [performingBulkAction, setPerformingBulkAction] = useState(false)

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchCandidates()
    // Clear selection when filters change
    setSelectedCandidates([])
  }, [searchTerm, statusFilter, experienceFilter, skillsFilter, currentPage, viewMode, showArchived])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError('')

      // Build query params
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter.length > 0) params.append('status', statusFilter.join(','))
      if (experienceFilter.length > 0) params.append('experienceLevel', experienceFilter.join(','))
      if (skillsFilter) params.append('skills', skillsFilter)

      // For Kanban view, fetch all active candidates
      if (viewMode === 'kanban') {
        params.append('limit', '1000')
      } else {
        params.append('page', currentPage.toString())
        params.append('limit', '20')
      }

      params.append('isActive', 'true')
      params.append('isArchived', showArchived ? 'true' : 'false')

      const response = await fetch(`/api/candidates?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidates')
      }

      if (viewMode === 'kanban') {
        setAllCandidates(data.candidates)
        setCandidates(data.candidates)
      } else {
        setCandidates(data.candidates)
      }

      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      console.error('Error fetching candidates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Kanban functions
  const pipelineStatuses: CandidateStatus[] = [
    CandidateStatus.NEW,
    CandidateStatus.CONTACTED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW_SCHEDULED,
    CandidateStatus.INTERVIEW_COMPLETED,
    CandidateStatus.OFFER_SENT,
    CandidateStatus.OFFER_ACCEPTED,
    CandidateStatus.HIRED
  ]

  const groupCandidatesByStatus = () => {
    const grouped: Record<CandidateStatus, Candidate[]> = {} as any
    pipelineStatuses.forEach(status => {
      grouped[status] = []
    })
    allCandidates.forEach(candidate => {
      if (pipelineStatuses.includes(candidate.status)) {
        grouped[candidate.status].push(candidate)
      }
    })
    return grouped
  }

  const handleDragStart = (candidateId: string) => {
    setDraggedCandidateId(candidateId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: CandidateStatus) => {
    e.preventDefault()

    const candidateId = e.dataTransfer.getData('candidateId')
    if (!candidateId) return

    const candidate = allCandidates.find(c => c.id === candidateId)
    if (!candidate || candidate.status === newStatus) {
      setDraggedCandidateId(null)
      return
    }

    // Optimistic update
    setAllCandidates(prevCandidates =>
      prevCandidates.map(c =>
        c.id === candidateId ? { ...c, status: newStatus } : c
      )
    )
    setDraggedCandidateId(null)

    // Update on server
    try {
      setUpdating(true)
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update candidate status')
      }

      await fetchCandidates()
    } catch (err: any) {
      console.error('Error updating status:', err)
      toast.error('Erreur lors de la mise à jour du statut', {
        description: err.message
      })
      await fetchCandidates()
    } finally {
      setUpdating(false)
    }
  }

  const toggleStatusFilter = (status: CandidateStatus) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
    setCurrentPage(1)
  }

  const toggleExperienceFilter = (level: ExperienceLevel) => {
    setExperienceFilter(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
    setCurrentPage(1)
  }

  const getStatusColor = (status: CandidateStatus): string => {
    const colors: Record<CandidateStatus, string> = {
      [CandidateStatus.NEW]: 'bg-blue-100 text-blue-800',
      [CandidateStatus.CONTACTED]: 'bg-purple-100 text-purple-800',
      [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
      [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 text-orange-800',
      [CandidateStatus.INTERVIEW_COMPLETED]: 'bg-cyan-100 text-cyan-800',
      [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 text-indigo-800',
      [CandidateStatus.OFFER_ACCEPTED]: 'bg-green-100 text-green-800',
      [CandidateStatus.OFFER_REJECTED]: 'bg-red-100 text-red-800',
      [CandidateStatus.HIRED]: 'bg-green-200 text-green-900',
      [CandidateStatus.REJECTED]: 'bg-red-100 text-red-800',
      [CandidateStatus.ON_HOLD]: 'bg-gray-100 text-gray-800',
      [CandidateStatus.ARCHIVED]: 'bg-gray-200 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getExperienceBadge = (level: ExperienceLevel): string => {
    const colors: Record<ExperienceLevel, string> = {
      [ExperienceLevel.ENTRY]: 'bg-green-50 text-green-700 border border-green-200',
      [ExperienceLevel.JUNIOR]: 'bg-blue-50 text-blue-700 border border-blue-200',
      [ExperienceLevel.MID]: 'bg-purple-50 text-purple-700 border border-purple-200',
      [ExperienceLevel.SENIOR]: 'bg-orange-50 text-orange-700 border border-orange-200',
      [ExperienceLevel.LEAD]: 'bg-red-50 text-red-700 border border-red-200',
      [ExperienceLevel.EXECUTIVE]: 'bg-gray-800 text-white border border-gray-900'
    }
    return colors[level] || 'bg-gray-50 text-gray-700'
  }

  const getStatusHoverColor = (status: CandidateStatus): string => {
    const hoverColors: Record<CandidateStatus, string> = {
      [CandidateStatus.NEW]: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      [CandidateStatus.CONTACTED]: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      [CandidateStatus.SCREENING]: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      [CandidateStatus.INTERVIEW_SCHEDULED]: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      [CandidateStatus.INTERVIEW_COMPLETED]: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      [CandidateStatus.OFFER_SENT]: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      [CandidateStatus.OFFER_ACCEPTED]: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      [CandidateStatus.OFFER_REJECTED]: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      [CandidateStatus.HIRED]: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      [CandidateStatus.REJECTED]: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      [CandidateStatus.ON_HOLD]: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      [CandidateStatus.ARCHIVED]: 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }
    return hoverColors[status] || 'hover:bg-gray-50 dark:hover:bg-gray-700'
  }

  const getExperienceHoverColor = (level: ExperienceLevel): string => {
    const hoverColors: Record<ExperienceLevel, string> = {
      [ExperienceLevel.ENTRY]: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      [ExperienceLevel.JUNIOR]: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      [ExperienceLevel.MID]: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      [ExperienceLevel.SENIOR]: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      [ExperienceLevel.LEAD]: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      [ExperienceLevel.EXECUTIVE]: 'hover:bg-gray-700 dark:hover:bg-gray-800'
    }
    return hoverColors[level] || 'hover:bg-gray-50 dark:hover:bg-gray-700'
  }

  // Saved Filters Handlers
  const handleLoadFilter = (filter: SavedFilter) => {
    setSearchTerm(filter.searchTerm || '')
    setStatusFilter(filter.statusFilter || [])
    setExperienceFilter(filter.experienceFilter || [])
    setSkillsFilter(filter.skillsFilter || '')
    setCurrentPage(1)
  }

  const handleSaveFilter = (filter: SavedFilter) => {
    // Filter saved successfully, modal will close automatically
    console.log('Filter saved:', filter)
  }

  // Bulk Actions Handlers
  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(candidates.map(c => c.id))
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedCandidates.length === 0) {
      toast.warning('Veuillez sélectionner au moins un candidat')
      return
    }

    try {
      setPerformingBulkAction(true)

      const response = await fetch('/api/candidates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          candidateIds: selectedCandidates,
          data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Bulk action failed')
      }

      toast.success('Action effectuée avec succès', {
        description: result.message
      })
      setSelectedCandidates([])
      await fetchCandidates()
    } catch (err: any) {
      console.error('Bulk action error:', err)
      toast.error('Erreur lors de l\'action groupée', {
        description: err.message
      })
    } finally {
      setPerformingBulkAction(false)
    }
  }

  const handleBulkStatusChange = (status: CandidateStatus) => {
    if (confirm(`Changer le statut de ${selectedCandidates.length} candidat(s) vers "${CANDIDATE_STATUS_LABELS[status]}"?`)) {
      handleBulkAction('change_status', { status })
    }
  }

  const handleBulkAddTags = (tags: string[]) => {
    if (confirm(`Ajouter ${tags.length} tag(s) à ${selectedCandidates.length} candidat(s)?`)) {
      handleBulkAction('add_tags', { tags })
    }
  }

  const handleBulkArchive = () => {
    if (confirm(`Archiver ${selectedCandidates.length} candidat(s)? Ils n'apparaîtront plus dans la liste active.`)) {
      handleBulkAction('archive')
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`⚠️ ATTENTION: Supprimer définitivement ${selectedCandidates.length} candidat(s)? Cette action est irréversible!`)) {
      if (confirm('Êtes-vous vraiment sûr? Cette action ne peut pas être annulée.')) {
        handleBulkAction('delete')
      }
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl opacity-10 animate-bounce"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Gestion des Candidats
                </h1>
                <p className="text-xl opacity-90">
                  {total} candidat{total !== 1 ? 's' : ''} au total
                </p>
              </div>
              <div className="flex gap-3 items-center">
                {/* View Toggle Button */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex gap-1">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === 'kanban'
                        ? 'bg-white text-[#3b5335ff] shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>📊</span>
                      <span className="hidden sm:inline">Kanban</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-[#3b5335ff] shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>📋</span>
                      <span className="hidden sm:inline">Liste</span>
                    </span>
                  </button>
                </div>

                <Link href="/candidates/new">
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<UserPlus className="w-5 h-5" />}
                  >
                    Nouveau Candidat
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{total}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Nouveaux</p>
                    <p className="text-2xl font-bold text-white">
                      {candidates.filter(c => c.status === CandidateStatus.NEW).length}
                    </p>
                  </div>
                  <span className="text-2xl">🆕</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">En cours</p>
                    <p className="text-2xl font-bold text-white">
                      {candidates.filter(c =>
                        [CandidateStatus.CONTACTED, CandidateStatus.SCREENING, CandidateStatus.INTERVIEW_SCHEDULED, CandidateStatus.INTERVIEW_COMPLETED].includes(c.status)
                      ).length}
                    </p>
                  </div>
                  <span className="text-2xl">⏳</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Embauchés</p>
                    <p className="text-2xl font-bold text-white">
                      {candidates.filter(c => c.status === CandidateStatus.HIRED).length}
                    </p>
                  </div>
                  <span className="text-2xl">✅</span>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-2">
                {/* Filter Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="relative px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtres</span>
                  {(statusFilter.length + experienceFilter.length + (searchTerm ? 1 : 0) + (showArchived ? 1 : 0)) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {statusFilter.length + experienceFilter.length + (searchTerm ? 1 : 0) + (showArchived ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Refresh */}
                <button
                  onClick={fetchCandidates}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  title="Actualiser"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Actualiser</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <div className="flex">
          {/* Sidebar - Filters */}
          <aside className={`fixed lg:sticky top-32 left-0 h-[calc(100vh-8rem)] w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-30 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="p-3 space-y-4">
              {/* Sidebar Header */}
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-bold text-primary-700 dark:text-accent-500 flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  Filtres
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden self-end -mt-6 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  aria-label="Fermer les filtres"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Filters */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Statut</h3>
                <div className="space-y-1.5">
                  {Object.values(CandidateStatus).filter(s => s !== CandidateStatus.ARCHIVED).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                        statusFilter.includes(status)
                          ? getStatusColor(status) + ' ring-2 ring-primary-500 dark:ring-accent-500 shadow-sm'
                          : `bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 ${getStatusHoverColor(status)} border border-gray-200 dark:border-gray-600`
                      }`}
                    >
                      <span className="truncate">{CANDIDATE_STATUS_LABELS[status]}</span>
                      {statusFilter.includes(status) && (
                        <span className="text-xs ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Filters */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Expérience</h3>
                <div className="space-y-1.5">
                  {Object.values(ExperienceLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleExperienceFilter(level)}
                      className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                        experienceFilter.includes(level)
                          ? getExperienceBadge(level) + ' ring-2 ring-primary-500 dark:ring-accent-500 shadow-sm'
                          : `bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 ${getExperienceHoverColor(level)} border border-gray-200 dark:border-gray-600`
                      }`}
                    >
                      <span className="truncate">{EXPERIENCE_LEVEL_LABELS[level]}</span>
                      {experienceFilter.includes(level) && (
                        <span className="text-xs ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Archive Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => {
                      setShowArchived(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="w-4 h-4 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Afficher archivés
                  </span>
                </label>
              </div>

              {/* Clear Filters */}
              {(statusFilter.length > 0 || experienceFilter.length > 0 || searchTerm || showArchived) && (
                <button
                  onClick={() => {
                    setStatusFilter([])
                    setExperienceFilter([])
                    setSearchTerm('')
                    setShowArchived(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-2.5 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800 cursor-pointer"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden sticky top-32 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-accent-500 text-white dark:text-primary-900 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors cursor-pointer"
              >
                <Filter className="w-5 h-5" />
                Filtres
                {(statusFilter.length + experienceFilter.length + (searchTerm ? 1 : 0) + (showArchived ? 1 : 0)) > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white dark:bg-primary-900 text-primary-700 dark:text-accent-500 rounded-full text-xs font-bold">
                    {statusFilter.length + experienceFilter.length + (searchTerm ? 1 : 0) + (showArchived ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* View Content */}
            <section className="py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className={viewMode === 'kanban' ? 'max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Updating indicator for Kanban */}
            {viewMode === 'kanban' && updating && (
              <div className="mb-4 flex items-center gap-2 text-[#ffaf50ff] bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ffaf50ff]"></div>
                <span className="font-medium">Mise à jour...</span>
              </div>
            )}

            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <SkeletonTable rows={8} />
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <EmptySearch
                  searchTerm={searchTerm}
                  onClearFilters={() => {
                    setSearchTerm('')
                    setStatusFilter([])
                    setExperienceFilter([])
                    setSkillsFilter('')
                  }}
                />
              </div>
            ) : viewMode === 'kanban' ? (
              /* Kanban View */
              <>
                <div className="pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
                    {pipelineStatuses.map(status => (
                      <KanbanColumn
                        key={status}
                        status={status}
                        candidates={groupCandidatesByStatus()[status]}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        draggedCandidateId={draggedCandidateId}
                      />
                    ))}
                  </div>
                </div>

                {/* Kanban Statistics */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">Statistiques du Pipeline</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {pipelineStatuses.map(status => (
                      <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50 transition-all duration-200 hover:shadow-md">
                        <div className="text-3xl font-bold text-primary-700 dark:text-accent-500 mb-2">
                          {groupCandidatesByStatus()[status].length}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {CANDIDATE_STATUS_LABELS[status]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* List View */
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-6 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={candidates.length > 0 && selectedCandidates.length === candidates.length}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500 dark:focus:ring-accent-400 cursor-pointer"
                              title="Sélectionner/Désélectionner tout"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Candidat</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Poste Actuel</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Expérience</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Compétences</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Statut</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Note</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-accent-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className={`transition-colors ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(candidate.id)}
                                onChange={() => toggleSelectCandidate(candidate.id)}
                                className="w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500 dark:focus:ring-accent-400 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {candidate.firstName} {candidate.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">{candidate.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-gray-100">{candidate.currentPosition || '-'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{candidate.currentCompany || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getExperienceBadge(candidate.experienceLevel)}`}>
                                {EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {candidate.primarySkills?.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-0.5 bg-primary-600 dark:bg-accent-500 text-white dark:text-primary-900 text-xs rounded font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {(candidate.primarySkills?.length || 0) > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{(candidate.primarySkills?.length || 0) - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                {CANDIDATE_STATUS_LABELS[candidate.status]}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {candidate.overallRating ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500 dark:text-yellow-400">★</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{candidate.overallRating.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">Non noté</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/candidates/${candidate.id}`}
                                className="text-primary-700 dark:text-accent-500 hover:text-accent-600 dark:hover:text-accent-400 font-medium text-sm transition-colors"
                              >
                                Voir →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination - Only for List view */}
                {viewMode === 'list' && totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-3">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="tertiary"
                      size="md"
                    >
                      ← Précédent
                    </Button>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="tertiary"
                      size="md"
                    >
                      Suivant →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
          </main>
        </div>

        <Footer />
      </div>

      {/* Bulk Actions Toolbar - Only for List view */}
      {viewMode === 'list' && (
        <BulkActionsToolbar
          selectedCount={selectedCandidates.length}
          onClearSelection={() => setSelectedCandidates([])}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkAddTags={handleBulkAddTags}
          onBulkArchive={handleBulkArchive}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <SaveFilterModal
          filterData={{
            view: 'list',
            searchTerm,
            statusFilter,
            experienceFilter,
            skillsFilter
          }}
          onClose={() => setShowSaveFilterModal(false)}
          onSave={handleSaveFilter}
        />
      )}

      {/* Loading Overlay for Bulk Actions */}
      {performingBulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-primary-700 dark:text-accent-500">Action en cours...</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Veuillez patienter</p>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}
