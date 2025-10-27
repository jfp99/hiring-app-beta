'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Workflow as WorkflowIcon,
  Check,
  Zap,
  ClipboardList,
  TestTube,
  Pause,
  Play,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Grid,
  List as ListIcon,
  Edit,
  Eye,
  ChevronLeft,
  TrendingUp,
  Activity,
  Calendar,
  X as XIcon
} from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import {
  Workflow,
  WorkflowTemplate,
  DEFAULT_WORKFLOW_TEMPLATES,
  getWorkflowTriggerLabel,
  getWorkflowActionLabel,
  getWorkflowActionIcon
} from '@/app/types/workflows'

interface FilterState {
  search: string
  status: 'all' | 'active' | 'inactive'
  testMode: 'all' | 'test' | 'production'
  trigger: string
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates] = useState<WorkflowTemplate[]>(DEFAULT_WORKFLOW_TEMPLATES)
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    testMode: 'all',
    trigger: 'all'
  })

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      setIsRefreshing(true)
      const response = await fetch('/api/workflows')
      const data = await response.json()

      if (response.ok) {
        setWorkflows(data.workflows || [])
      }
    } catch (err) {
      console.error('Error fetching workflows:', err)
      toast.error('Erreur lors du chargement des workflows')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const toggleWorkflow = async (workflowId: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState })
      })

      if (response.ok) {
        toast.success(!currentState ? 'Workflow activé' : 'Workflow désactivé')
        fetchWorkflows()
      }
    } catch (err) {
      console.error('Error toggling workflow:', err)
      toast.error('Erreur lors de la modification du workflow')
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workflow?')) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Workflow supprimé avec succès')
        fetchWorkflows()
      }
    } catch (err) {
      console.error('Error deleting workflow:', err)
      toast.error('Erreur lors de la suppression')
    }
  }

  const createFromTemplate = async (template: WorkflowTemplate) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          trigger: template.trigger,
          actions: template.actions,
          isActive: false,
          priority: 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShowTemplateModal(false)
        toast.success('Workflow créé avec succès!', {
          description: 'Vous pouvez maintenant le modifier et l\'activer'
        })
        router.push(`/admin/workflows/${data.workflow.id}/edit`)
      }
    } catch (err) {
      console.error('Error creating workflow from template:', err)
      toast.error('Erreur lors de la création du workflow')
    }
  }

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (
        !workflow.name.toLowerCase().includes(searchLower) &&
        !workflow.description?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (filters.status !== 'all') {
      if (filters.status === 'active' && !workflow.isActive) return false
      if (filters.status === 'inactive' && workflow.isActive) return false
    }

    if (filters.testMode !== 'all') {
      if (filters.testMode === 'test' && !workflow.testMode) return false
      if (filters.testMode === 'production' && workflow.testMode) return false
    }

    if (filters.trigger !== 'all') {
      if (workflow.trigger.type !== filters.trigger) return false
    }

    return true
  })

  // Statistics
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.isActive).length,
    executions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
    successRate: workflows.reduce((sum, w) => sum + w.executionCount, 0) > 0
      ? Math.round((workflows.reduce((sum, w) => sum + w.successCount, 0) / workflows.reduce((sum, w) => sum + w.executionCount, 0)) * 100)
      : 0
  }

  const activeFiltersCount = [
    filters.search,
    filters.status !== 'all',
    filters.testMode !== 'all',
    filters.trigger !== 'all'
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      testMode: 'all',
      trigger: 'all'
    })
  }

  // Get unique trigger types
  const uniqueTriggers = Array.from(new Set(workflows.map(w => w.trigger.type)))

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement des workflows...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-12 overflow-hidden">
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-white/80 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-bold">Gestion des Workflows</h1>
                </div>
                <p className="text-lg text-gray-200">
                  {workflows.length} workflows • {stats.executions} exécutions au total
                </p>
              </div>

              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-accent-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-accent-600 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau Workflow
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <WorkflowIcon className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Actifs</p>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                  </div>
                  <Activity className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Exécutions</p>
                    <p className="text-2xl font-bold text-white">{stats.executions}</p>
                  </div>
                  <Zap className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Taux de succès</p>
                    <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un workflow..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-2">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* View Mode */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Vue grille"
                  >
                    <Grid className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Vue liste"
                  >
                    <ListIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Refresh */}
                <button
                  onClick={fetchWorkflows}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  title="Actualiser"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6">
              {/* Filters Sidebar */}
              {showFilters && (
                <aside className="w-64 flex-shrink-0">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-32">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtres</h3>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-accent-500 hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</h4>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">Tous</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                      </select>
                    </div>

                    {/* Test Mode Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</h4>
                      <select
                        value={filters.testMode}
                        onChange={(e) => setFilters(prev => ({ ...prev, testMode: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">Tous</option>
                        <option value="production">Production</option>
                        <option value="test">Test</option>
                      </select>
                    </div>

                    {/* Trigger Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Déclencheur</h4>
                      <select
                        value={filters.trigger}
                        onChange={(e) => setFilters(prev => ({ ...prev, trigger: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">Tous</option>
                        {uniqueTriggers.map(trigger => (
                          <option key={trigger} value={trigger}>
                            {getWorkflowTriggerLabel(trigger)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </aside>
              )}

              {/* Workflows List */}
              <div className="flex-1">
                {filteredWorkflows.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                    <div className="flex justify-center mb-4">
                      <WorkflowIcon className="w-24 h-24 text-primary-500 dark:text-accent-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-2">
                      {workflows.length === 0 ? 'Aucun workflow configuré' : 'Aucun résultat'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {workflows.length === 0
                        ? 'Créez votre premier workflow pour automatiser votre processus de recrutement'
                        : 'Aucun workflow ne correspond aux filtres sélectionnés'}
                    </p>
                    {workflows.length === 0 ? (
                      <button
                        onClick={() => setShowTemplateModal(true)}
                        className="bg-accent-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-accent-600 hover:shadow-lg transition-all"
                      >
                        Créer un workflow
                      </button>
                    ) : (
                      <button
                        onClick={clearFilters}
                        className="text-accent-500 hover:text-accent-600 font-medium"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                    {filteredWorkflows.map(workflow => (
                      <div
                        key={workflow.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link
                                href={`/admin/workflows/${workflow.id}`}
                                className="text-xl font-bold text-primary-600 dark:text-accent-500 hover:underline"
                              >
                                {workflow.name}
                              </Link>
                              {workflow.isActive ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Actif
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                                  Inactif
                                </span>
                              )}
                              {workflow.testMode && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold rounded-full flex items-center gap-1">
                                  <TestTube className="w-3 h-3" /> Test
                                </span>
                              )}
                            </div>

                            {workflow.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{workflow.description}</p>
                            )}

                            {/* Trigger */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Déclencheur:</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                  {getWorkflowTriggerLabel(workflow.trigger.type)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mb-3">
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Actions ({workflow.actions.length}):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {workflow.actions.slice(0, 3).map((action, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs flex items-center gap-1"
                                  >
                                    <span>{getWorkflowActionIcon(action.type)}</span>
                                    <span>{getWorkflowActionLabel(action.type)}</span>
                                  </span>
                                ))}
                                {workflow.actions.length > 3 && (
                                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                                    +{workflow.actions.length - 3} autres
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
                              <div>
                                <span className="font-medium">Exécutions:</span> {workflow.executionCount}
                              </div>
                              <div>
                                <span className="font-medium">Réussites:</span>{' '}
                                <span className="text-green-600 dark:text-green-400">{workflow.successCount}</span>
                              </div>
                              {workflow.failureCount > 0 && (
                                <div>
                                  <span className="font-medium">Échecs:</span>{' '}
                                  <span className="text-red-600 dark:text-red-400">{workflow.failureCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href={`/admin/workflows/${workflow.id}`}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-center flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> Voir
                          </Link>
                          <Link
                            href={`/admin/workflows/${workflow.id}/edit`}
                            className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all text-center flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Modifier
                          </Link>
                          <button
                            onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              workflow.isActive
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                            }`}
                            title={workflow.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500">Choisir un Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-accent-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => createFromTemplate(template)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-primary-600 dark:text-accent-500 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{template.description}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                          {template.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-1">
                        <span className="font-medium">Déclencheur:</span>{' '}
                        {getWorkflowTriggerLabel(template.trigger.type)}
                      </div>
                      <div>
                        <span className="font-medium">Actions:</span> {template.actions.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/admin/workflows/new"
                  onClick={() => setShowTemplateModal(false)}
                  className="w-full block text-center px-6 py-3 border-2 border-accent-500 text-accent-500 rounded-lg font-bold hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-all"
                >
                  Créer un workflow personnalisé
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}
