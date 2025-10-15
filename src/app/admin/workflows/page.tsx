'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import { Workflow, WorkflowTemplate, DEFAULT_WORKFLOW_TEMPLATES, getWorkflowTriggerLabel, getWorkflowActionLabel, getWorkflowActionIcon } from '@/app/types/workflows'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(DEFAULT_WORKFLOW_TEMPLATES)
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workflows')
      const data = await response.json()

      if (response.ok) {
        setWorkflows(data.workflows || [])
      }
    } catch (err) {
      console.error('Error fetching workflows:', err)
    } finally {
      setLoading(false)
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
        fetchWorkflows()
      }
    } catch (err) {
      console.error('Error toggling workflow:', err)
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workflow?')) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchWorkflows()
      }
    } catch (err) {
      console.error('Error deleting workflow:', err)
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
          isActive: false, // Create as inactive so user can review first
          priority: 0
        })
      })

      if (response.ok) {
        setShowTemplateModal(false)
        fetchWorkflows()
        toast.success('Workflow créé avec succès!', {
          description: 'Vous pouvez maintenant le modifier et l\'activer'
        })
      }
    } catch (err) {
      console.error('Error creating workflow from template:', err)
      toast.error('Erreur lors de la création du workflow', {
        description: 'Veuillez réessayer ultérieurement'
      })
    }
  }

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

        {/* Header */}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour au tableau de bord
            </Link>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Gestion des Workflows</h1>
                <p className="text-xl opacity-90">
                  Automatisez votre processus de recrutement avec des workflows intelligents
                </p>
              </div>

              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                + Nouveau Workflow
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Total Workflows */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-700 dark:text-accent-500 mb-1">{workflows.length}</div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Workflows</div>
                </div>
              </div>

              {/* Active Workflows */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-lg cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                      <span className="text-2xl">✓</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {workflows.filter(w => w.isActive).length}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actifs</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Workflows Actifs</div>
                </div>
              </div>

              {/* Total Executions */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Exécutions</div>
                </div>
              </div>

              {/* Available Templates */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{templates.length}</div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Disponibles</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Templates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflows List */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {workflows.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-2">
                  Aucun workflow configuré
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Créez votre premier workflow pour automatiser votre processus de recrutement
                </p>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer"
                >
                  Créer un workflow
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">
                            {workflow.name}
                          </h3>
                          {workflow.isActive ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 dark:text-green-300 text-xs font-bold rounded-full">
                              ✓ Actif
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                              Inactif
                            </span>
                          )}
                          {workflow.testMode && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                              🧪 Test
                            </span>
                          )}
                        </div>

                        {workflow.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{workflow.description}</p>
                        )}

                        {/* Trigger */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Déclencheur:</span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {getWorkflowTriggerLabel(workflow.trigger.type)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mb-4">
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Actions ({workflow.actions.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {workflow.actions.map((action, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs flex items-center gap-1"
                              >
                                <span>{getWorkflowActionIcon(action.type)}</span>
                                <span>{getWorkflowActionLabel(action.type)}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
                          <div>
                            <span className="font-medium">Exécutions:</span> {workflow.executionCount}
                          </div>
                          <div>
                            <span className="font-medium">Réussites:</span>{' '}
                            <span className="text-green-600">{workflow.successCount}</span>
                          </div>
                          {workflow.failureCount > 0 && (
                            <div>
                              <span className="font-medium">Échecs:</span>{' '}
                              <span className="text-red-600">{workflow.failureCount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                            workflow.isActive
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={workflow.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {workflow.isActive ? '⏸️ Pause' : '▶️ Activer'}
                        </button>
                        <button
                          onClick={() => deleteWorkflow(workflow.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">Choisir un Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#ffaf50ff] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => createFromTemplate(template)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#3b5335ff] dark:text-accent-500 mb-1">
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
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}
