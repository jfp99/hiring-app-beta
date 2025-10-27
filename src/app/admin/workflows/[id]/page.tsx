'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Workflow as WorkflowIcon,
  ChevronLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Tag,
  UserPlus,
  Bell,
  Calendar,
  FileText,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import { Button } from '@/app/components/ui/Button'
import {
  Workflow,
  WorkflowActionType,
  getWorkflowTriggerLabel,
  getWorkflowActionLabel
} from '@/app/types/workflows'

// Map action types to icons
const getActionIcon = (type: WorkflowActionType) => {
  switch (type) {
    case WorkflowActionType.SEND_EMAIL:
      return <Mail className="w-5 h-5" />
    case WorkflowActionType.ADD_TAG:
    case WorkflowActionType.REMOVE_TAG:
      return <Tag className="w-5 h-5" />
    case WorkflowActionType.CHANGE_STATUS:
      return <Activity className="w-5 h-5" />
    case WorkflowActionType.ASSIGN_USER:
      return <UserPlus className="w-5 h-5" />
    case WorkflowActionType.CREATE_TASK:
      return <CheckCircle className="w-5 h-5" />
    case WorkflowActionType.SEND_NOTIFICATION:
      return <Bell className="w-5 h-5" />
    case WorkflowActionType.ADD_NOTE:
      return <FileText className="w-5 h-5" />
    case WorkflowActionType.SCHEDULE_INTERVIEW:
      return <Calendar className="w-5 h-5" />
    case WorkflowActionType.WEBHOOK:
      return <Zap className="w-5 h-5" />
    default:
      return <Activity className="w-5 h-5" />
  }
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.id as string

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkflow()
  }, [workflowId])

  const fetchWorkflow = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workflows/${workflowId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workflow')
      }

      setWorkflow(data.workflow)
    } catch (err: any) {
      console.error('Error fetching workflow:', err)
      setError(err.message)
      toast.error('Erreur lors du chargement du workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!workflow) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !workflow.isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update workflow')
      }

      await fetchWorkflow()
      toast.success(`Workflow ${!workflow.isActive ? 'activé' : 'désactivé'}`)
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDuplicate = async () => {
    if (!workflow) return

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflow.name} (Copie)`,
          description: workflow.description,
          trigger: workflow.trigger,
          actions: workflow.actions,
          isActive: false,
          priority: workflow.priority
        })
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate workflow')
      }

      const data = await response.json()
      toast.success('Workflow dupliqué avec succès')
      router.push(`/admin/workflows/${data.workflow.id}`)
    } catch (err: any) {
      toast.error('Erreur lors de la duplication')
    }
  }

  const handleDelete = async () => {
    if (!workflow) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workflow ?')) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }

      toast.success('Workflow supprimé avec succès')
      router.push('/admin/workflows')
    } catch (err: any) {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement du workflow...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (error || !workflow) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800">
          <AdminHeader />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                Erreur
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Workflow introuvable'}</p>
              <Link href="/admin/workflows">
                <Button variant="secondary">Retour aux workflows</Button>
              </Link>
            </div>
          </div>
        </div>
      </AdminGuard>
    )
  }

  const successRate = workflow.executionCount > 0
    ? Math.round((workflow.successCount / workflow.executionCount) * 100)
    : 0

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/admin/workflows" className="text-gray-200 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <WorkflowIcon className="w-8 h-8" />
                <h1 className="text-3xl md:text-4xl font-bold">{workflow.name}</h1>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                workflow.isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {workflow.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {workflow.description && (
              <p className="text-lg text-gray-200 mb-6">{workflow.description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={workflow.isActive ? 'secondary' : 'primary'}
                size="md"
                onClick={handleToggleActive}
                leftIcon={workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {workflow.isActive ? 'Désactiver' : 'Activer'}
              </Button>

              <Link href={`/admin/workflows/${workflowId}/edit`}>
                <Button variant="tertiary" size="md" leftIcon={<Edit className="w-4 h-4" />}>
                  Modifier
                </Button>
              </Link>

              <Button
                variant="tertiary"
                size="md"
                onClick={handleDuplicate}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Dupliquer
              </Button>

              <Button
                variant="tertiary"
                size="md"
                onClick={handleDelete}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Supprimer
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Exécutions</p>
                    <p className="text-2xl font-bold text-white">{workflow.executionCount}</p>
                  </div>
                  <Activity className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Succès</p>
                    <p className="text-2xl font-bold text-white">{workflow.successCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Échecs</p>
                    <p className="text-2xl font-bold text-white">{workflow.failureCount}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-white/50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Taux de succès</p>
                    <p className="text-2xl font-bold text-white">{successRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trigger Configuration */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-500" />
                  Déclencheur
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {getWorkflowTriggerLabel(workflow.trigger.type)}
                  </p>

                  {/* Display trigger conditions */}
                  {workflow.trigger.toStatus && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vers le statut</p>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-sm">
                        {workflow.trigger.toStatus}
                      </span>
                    </div>
                  )}

                  {workflow.trigger.daysElapsed && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jours écoulés</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {workflow.trigger.daysElapsed} jours
                      </p>
                    </div>
                  )}

                  {workflow.trigger.daysInStage && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jours dans l'étape</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {workflow.trigger.daysInStage} jours
                      </p>
                    </div>
                  )}

                  {workflow.trigger.minScore && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Score minimum</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {workflow.trigger.minScore}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-500" />
                  Actions ({workflow.actions.length})
                </h2>
                <div className="space-y-3">
                  {workflow.actions.map((action, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center text-accent-600 dark:text-accent-400">
                          {getActionIcon(action.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {getWorkflowActionLabel(action.type)}
                          </h3>

                          {/* Action-specific details */}
                          {action.emailSubject && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Sujet: {action.emailSubject}
                            </p>
                          )}
                          {action.tagName && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Tag: {action.tagName}
                            </p>
                          )}
                          {action.newStatus && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Nouveau statut: {action.newStatus}
                            </p>
                          )}
                          {action.taskTitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Tâche: {action.taskTitle}
                            </p>
                          )}
                          {action.notificationMessage && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {action.notificationMessage}
                            </p>
                          )}
                          {action.delayMinutes && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                              Délai: {action.delayMinutes} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations</h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Priorité</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{workflow.priority}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Créé par</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{workflow.createdByName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Créé le</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Modifié le</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(workflow.updatedAt).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                  {workflow.lastExecutedAt && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Dernière exécution</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(workflow.lastExecutedAt).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  )}
                  {workflow.testMode && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Mode</dt>
                      <dd>
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs font-semibold">
                          Test
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Limits */}
              {(workflow.maxExecutionsPerDay || workflow.maxExecutionsPerCandidate) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Limites</h2>
                  <dl className="space-y-3">
                    {workflow.maxExecutionsPerDay && (
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Par jour</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {workflow.maxExecutionsPerDay} exécutions max
                        </dd>
                      </div>
                    )}
                    {workflow.maxExecutionsPerCandidate && (
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Par candidat</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {workflow.maxExecutionsPerCandidate} exécutions max
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Schedule */}
              {workflow.schedule && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-500" />
                    Planification
                  </h2>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Fréquence</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {workflow.schedule.frequency}
                      </dd>
                    </div>
                    {workflow.schedule.time && (
                      <div>
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Heure</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {workflow.schedule.time}
                        </dd>
                      </div>
                    )}
                  </dl>
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
