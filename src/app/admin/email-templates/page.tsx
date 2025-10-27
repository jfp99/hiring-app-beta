'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Edit, Trash2 } from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

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

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/email-templates')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates')
      }

      setTemplates(data.templates || [])
    } catch (err: any) {
      console.error('Error fetching templates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
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

  const filteredTemplates = templates.filter(template => {
    const matchesType = filterType === 'all' || template.type === filterType
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && template.isActive) ||
                         (filterStatus === 'inactive' && !template.isActive)
    const matchesSearch = !searchQuery ||
                         template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement des templates...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour au tableau de bord
            </Link>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Templates d'Email</h1>
                <p className="text-xl opacity-90">
                  Gérez vos templates d&apos;email pour la communication avec les candidats
                </p>
              </div>

              <Link
                href="/admin/email-templates/new"
                className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                + Nouveau Template
              </Link>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou sujet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Tous les types</option>
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {filteredTemplates.length} template{filteredTemplates.length > 1 ? 's' : ''} trouvé{filteredTemplates.length > 1 ? 's' : ''}
            </div>
          </div>
        </section>

        {/* Templates List */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {filteredTemplates.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="w-24 h-24 text-primary-500 dark:text-accent-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucun template trouvé</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Aucun template ne correspond à vos critères de recherche'
                    : 'Commencez par créer votre premier template d\'email'}
                </p>
                <Link
                  href="/admin/email-templates/new"
                  className="inline-block bg-[#3b5335ff] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all"
                >
                  + Créer un Template
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white p-4">
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
                          className="flex-1 text-center px-4 py-2 bg-[#3b5335ff] text-white rounded-lg font-medium hover:bg-[#2a3d26ff] transition-all text-sm flex items-center justify-center gap-2"
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
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
