'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Zap,
  TestTube,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import {
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowAction,
  getWorkflowTriggerLabel,
  getWorkflowActionLabel
} from '@/app/types/workflows'

export default function NewWorkflowPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [priority, setPriority] = useState(0)
  const [testMode, setTestMode] = useState(true) // Default to test mode for safety

  // Trigger state
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>(WorkflowTriggerType.STATUS_CHANGED)
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({})

  // Actions state
  const [actions, setActions] = useState<WorkflowAction[]>([])

  // Schedule state
  const [hasSchedule, setHasSchedule] = useState(false)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDaysOfWeek, setScheduleDaysOfWeek] = useState<number[]>([])
  const [scheduleHours, setScheduleHours] = useState<number[]>([])

  // Limits state
  const [maxExecutionsPerDay, setMaxExecutionsPerDay] = useState<number | undefined>(undefined)
  const [maxExecutionsPerCandidate, setMaxExecutionsPerCandidate] = useState<number | undefined>(undefined)

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Le nom du workflow est requis')
      return
    }

    if (actions.length === 0) {
      toast.error('Ajoutez au moins une action')
      return
    }

    try {
      setSaving(true)

      const newWorkflow = {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
        priority,
        testMode,
        trigger: {
          type: triggerType,
          config: triggerConfig
        },
        actions,
        schedule: hasSchedule ? {
          enabled: scheduleEnabled,
          daysOfWeek: scheduleDaysOfWeek,
          hours: scheduleHours
        } : undefined,
        maxExecutionsPerDay: maxExecutionsPerDay || undefined,
        maxExecutionsPerCandidate: maxExecutionsPerCandidate || undefined
      }

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Workflow créé avec succès!', {
          description: testMode ? 'Le workflow est en mode test' : 'Le workflow est prêt'
        })
        router.push(`/admin/workflows/${data.workflow.id}`)
      } else {
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Erreur lors de la création du workflow')
    } finally {
      setSaving(false)
    }
  }

  const addAction = () => {
    setActions([...actions, {
      type: WorkflowActionType.SEND_EMAIL,
      config: {}
    }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, field: keyof WorkflowAction, value: any) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setActions(newActions)
  }

  const moveAction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === actions.length - 1)
    ) {
      return
    }

    const newActions = [...actions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newActions[index]
    newActions[index] = newActions[newIndex]
    newActions[newIndex] = temp
    setActions(newActions)
  }

  const toggleDayOfWeek = (day: number) => {
    if (scheduleDaysOfWeek.includes(day)) {
      setScheduleDaysOfWeek(scheduleDaysOfWeek.filter(d => d !== day))
    } else {
      setScheduleDaysOfWeek([...scheduleDaysOfWeek, day].sort())
    }
  }

  const toggleHour = (hour: number) => {
    if (scheduleHours.includes(hour)) {
      setScheduleHours(scheduleHours.filter(h => h !== hour))
    } else {
      setScheduleHours([...scheduleHours, hour].sort())
    }
  }

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-12">
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-20 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl opacity-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Link
              href="/admin/workflows"
              className="text-white/80 hover:text-white mb-4 inline-block transition-colors"
            >
              ← Retour aux workflows
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
              <Sparkles className="w-10 h-10" />
              Nouveau Workflow
            </h1>
            <p className="text-xl opacity-90">
              Créez un workflow pour automatiser votre processus de recrutement
            </p>
          </div>
        </section>

        {/* Form Content */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Conseil:</strong> Le workflow sera créé en mode test par défaut. Vous pourrez le tester avant de l'activer en production.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6">
                  Informations de base
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du workflow *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                      placeholder="Ex: Relance candidats après 7 jours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                      placeholder="Décrivez l'objectif et le fonctionnement du workflow..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priorité (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Plus la priorité est élevée, plus le workflow sera exécuté en premier
                      </p>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-5 h-5 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Activer immédiatement
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testMode}
                          onChange={(e) => setTestMode(e.target.checked)}
                          className="w-5 h-5 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <TestTube className="w-4 h-4" />
                          Mode test
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trigger Configuration Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Déclencheur
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de déclencheur
                    </label>
                    <select
                      value={triggerType}
                      onChange={(e) => {
                        setTriggerType(e.target.value as WorkflowTriggerType)
                        setTriggerConfig({})
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {Object.values(WorkflowTriggerType).map((type) => (
                        <option key={type} value={type}>
                          {getWorkflowTriggerLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trigger-specific configuration */}
                  {triggerType === WorkflowTriggerType.STATUS_CHANGED && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nouveau statut
                      </label>
                      <input
                        type="text"
                        value={triggerConfig.toStatus || ''}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, toStatus: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: entretien"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Le workflow se déclenchera quand un candidat passe à ce statut
                      </p>
                    </div>
                  )}

                  {triggerType === WorkflowTriggerType.TAG_ADDED && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tag à surveiller
                      </label>
                      <input
                        type="text"
                        value={triggerConfig.tag || ''}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, tag: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: urgent"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Le workflow se déclenchera quand ce tag est ajouté à un candidat
                      </p>
                    </div>
                  )}

                  {triggerType === WorkflowTriggerType.TAG_REMOVED && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tag à surveiller
                      </label>
                      <input
                        type="text"
                        value={triggerConfig.tag || ''}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, tag: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: urgent"
                      />
                    </div>
                  )}

                  {triggerType === WorkflowTriggerType.DAYS_IN_STAGE && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de jours
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={triggerConfig.days || 1}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, days: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Le workflow se déclenchera si un candidat reste dans le même statut pendant ce nombre de jours
                      </p>
                    </div>
                  )}

                  {triggerType === WorkflowTriggerType.NO_ACTIVITY && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Jours sans activité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={triggerConfig.days || 7}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, days: parseInt(e.target.value) || 7 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  {triggerType === WorkflowTriggerType.SCORE_THRESHOLD && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Score minimum
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={triggerConfig.minScore || 0}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, minScore: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Le workflow se déclenchera quand le score du candidat atteint ou dépasse ce seuil
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500">
                    Actions ({actions.length})
                  </h2>
                  <button
                    onClick={addAction}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une action
                  </button>
                </div>

                {actions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Aucune action configurée
                    </p>
                    <button
                      onClick={addAction}
                      className="px-6 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
                    >
                      Ajouter la première action
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actions.map((action, index) => (
                      <div
                        key={index}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-accent-500 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-2 mt-2">
                            <button
                              onClick={() => moveAction(index, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Déplacer vers le haut"
                            >
                              <GripVertical className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-accent-500 font-bold">
                                {index + 1}
                              </span>
                              <select
                                value={action.type}
                                onChange={(e) => updateAction(index, 'type', e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                {Object.values(WorkflowActionType).map((type) => (
                                  <option key={type} value={type}>
                                    {getWorkflowActionLabel(type)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Action-specific configuration */}
                            {action.type === WorkflowActionType.SEND_EMAIL && (
                              <div className="pl-11 space-y-2">
                                <input
                                  type="text"
                                  placeholder="Template ID ou sujet de l'email"
                                  value={action.config.templateId || action.config.subject || ''}
                                  onChange={(e) => updateAction(index, 'config', {
                                    ...action.config,
                                    templateId: e.target.value,
                                    subject: e.target.value
                                  })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.ADD_TAG && (
                              <div className="pl-11">
                                <input
                                  type="text"
                                  placeholder="Nom du tag à ajouter"
                                  value={action.config.tag || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, tag: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.REMOVE_TAG && (
                              <div className="pl-11">
                                <input
                                  type="text"
                                  placeholder="Nom du tag à retirer"
                                  value={action.config.tag || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, tag: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.CHANGE_STATUS && (
                              <div className="pl-11">
                                <input
                                  type="text"
                                  placeholder="Nouveau statut"
                                  value={action.config.status || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, status: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.ADD_NOTE && (
                              <div className="pl-11">
                                <textarea
                                  placeholder="Contenu de la note"
                                  value={action.config.note || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, note: e.target.value })}
                                  rows={2}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.ASSIGN_USER && (
                              <div className="pl-11">
                                <input
                                  type="text"
                                  placeholder="Email de l'utilisateur"
                                  value={action.config.userId || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, userId: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.CREATE_TASK && (
                              <div className="pl-11 space-y-2">
                                <input
                                  type="text"
                                  placeholder="Titre de la tâche"
                                  value={action.config.title || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, title: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                <textarea
                                  placeholder="Description de la tâche"
                                  value={action.config.description || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, description: e.target.value })}
                                  rows={2}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}

                            {action.type === WorkflowActionType.WEBHOOK && (
                              <div className="pl-11">
                                <input
                                  type="url"
                                  placeholder="URL du webhook"
                                  value={action.config.url || ''}
                                  onChange={(e) => updateAction(index, 'config', { ...action.config, url: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeAction(index)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2"
                            title="Supprimer l'action"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Planification (Optionnel)
                  </h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSchedule}
                      onChange={(e) => setHasSchedule(e.target.checked)}
                      className="w-5 h-5 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Activer la planification
                    </span>
                  </label>
                </div>

                {hasSchedule && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={scheduleEnabled}
                        onChange={(e) => setScheduleEnabled(e.target.checked)}
                        className="w-5 h-5 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Planning activé
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Jours de la semaine
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day, index) => (
                          <button
                            key={index}
                            onClick={() => toggleDayOfWeek(index)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              scheduleDaysOfWeek.includes(index)
                                ? 'bg-accent-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Heures (0-23)
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <button
                            key={hour}
                            onClick={() => toggleHour(hour)}
                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                              scheduleHours.includes(hour)
                                ? 'bg-accent-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {hour}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Limits Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6">
                  Limites d'exécution (Optionnel)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum par jour
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxExecutionsPerDay || ''}
                      onChange={(e) => setMaxExecutionsPerDay(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Illimité"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Nombre maximum d'exécutions par jour
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum par candidat
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxExecutionsPerCandidate || ''}
                      onChange={(e) => setMaxExecutionsPerCandidate(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Illimité"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Nombre maximum d'exécutions par candidat
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <Link
                  href="/admin/workflows"
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Annuler
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Créer le workflow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
