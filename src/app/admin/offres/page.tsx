// src/app/admin/offres/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Plus, Edit, Trash2, Eye, EyeOff,
  MapPin, Building, Calendar, Search, Filter,
  ArrowLeft, Save, X, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/app/hooks/useApi'

interface Offre {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  competences: string
  emailContact: string
  categorie: string
  statut: 'active' | 'inactive' | 'archived'
  datePublication: string
}

const CATEGORIES = ['Technologie', 'Management', 'Data', 'Design', 'Marketing', 'Finance', 'RH', 'Autre']
const CONTRACT_TYPES = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance']

export default function AdminOffresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { loading, callApi } = useApi()

  const [offres, setOffres] = useState<Offre[]>([])
  const [filteredOffres, setFilteredOffres] = useState<Offre[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null)
  const [formData, setFormData] = useState({
    titre: '',
    entreprise: 'Hi-ring',
    lieu: '',
    typeContrat: 'CDI',
    salaire: '',
    description: '',
    competences: '',
    emailContact: 'contact@hi-ring.fr',
    categorie: 'Technologie'
  })

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
    let filtered = offres

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

    setFilteredOffres(filtered)
  }, [offres, searchTerm, statusFilter])

  const loadOffres = async () => {
    try {
      const result = await callApi('/offres')
      if (result.success) {
        setOffres(result.offres || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des offres')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingOffre) {
        // Update
        const result = await callApi(`/offres?id=${editingOffre.id}`, {
          method: 'PUT',
          body: formData
        })
        if (result.success) {
          toast.success('Offre mise à jour avec succès')
          loadOffres()
          closeModal()
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour')
        }
      } else {
        // Create
        const result = await callApi('/offres', {
          method: 'POST',
          body: formData
        })
        if (result.success) {
          toast.success('Offre créée avec succès')
          loadOffres()
          closeModal()
        } else {
          toast.error(result.error || 'Erreur lors de la création')
        }
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return

    try {
      const result = await callApi(`/offres?id=${id}`, {
        method: 'DELETE'
      })
      if (result.success) {
        toast.success('Offre supprimée avec succès')
        loadOffres()
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    }
  }

  const toggleStatus = async (offre: Offre) => {
    const newStatus = offre.statut === 'active' ? 'inactive' : 'active'

    try {
      const result = await callApi(`/offres?id=${offre.id}`, {
        method: 'PUT',
        body: { statut: newStatus }
      })
      if (result.success) {
        toast.success(`Offre ${newStatus === 'active' ? 'activée' : 'désactivée'}`)
        loadOffres()
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const openCreateModal = () => {
    setEditingOffre(null)
    setFormData({
      titre: '',
      entreprise: 'Hi-ring',
      lieu: '',
      typeContrat: 'CDI',
      salaire: '',
      description: '',
      competences: '',
      emailContact: 'contact@hi-ring.fr',
      categorie: 'Technologie'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (offre: Offre) => {
    setEditingOffre(offre)
    setFormData({
      titre: offre.titre,
      entreprise: offre.entreprise,
      lieu: offre.lieu,
      typeContrat: offre.typeContrat,
      salaire: offre.salaire,
      description: offre.description,
      competences: offre.competences,
      emailContact: offre.emailContact,
      categorie: offre.categorie
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOffre(null)
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                  Gestion des Offres d'Emploi
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {offres.length} offre{offres.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Offre
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
              <option value="archived">Archivées</option>
            </select>
          </div>
        </div>

        {/* Offres List */}
        <div className="grid gap-4">
          {filteredOffres.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune offre trouvée</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Créer une nouvelle offre
              </button>
            </div>
          ) : (
            filteredOffres.map((offre) => (
              <div
                key={offre.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {offre.titre}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        offre.statut === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : offre.statut === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {offre.statut === 'active' ? 'Active' : offre.statut === 'inactive' ? 'Inactive' : 'Archivée'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                        {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {offre.typeContrat}
                      </span>
                      <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded text-xs">
                        {offre.categorie}
                      </span>
                    </div>
                    {offre.salaire && (
                      <p className="mt-2 text-sm text-accent-600 dark:text-accent-400 font-medium">
                        {offre.salaire}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleStatus(offre)}
                      className={`p-2 rounded-lg transition-colors ${
                        offre.statut === 'active'
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={offre.statut === 'active' ? 'Désactiver' : 'Activer'}
                    >
                      {offre.statut === 'active' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(offre)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(offre.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingOffre ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre du poste *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de contrat *
                  </label>
                  <select
                    value={formData.typeContrat}
                    onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    {CONTRACT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salaire
                </label>
                <input
                  type="text"
                  value={formData.salaire}
                  onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                  placeholder="Ex: 45-55K€ / an"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compétences requises
                </label>
                <textarea
                  value={formData.competences}
                  onChange={(e) => setFormData({ ...formData, competences: e.target.value })}
                  rows={3}
                  placeholder="Ex: JavaScript, React, Node.js..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email de contact *
                </label>
                <input
                  type="email"
                  value={formData.emailContact}
                  onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Enregistrement...' : (editingOffre ? 'Mettre à jour' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
