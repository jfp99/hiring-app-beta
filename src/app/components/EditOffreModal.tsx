// components/EditOffreModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Briefcase, Building2, MapPin, Mail, DollarSign } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

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
  datePublication: string
  categorie: string
  statut: 'active' | 'inactive'
}

interface EditOffreModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (offre: Offre) => Promise<void>
  offre: Offre | null
  categories: string[]
  typesContrat: string[]
}

export default function EditOffreModal({
  isOpen,
  onClose,
  onSave,
  offre,
  categories,
  typesContrat
}: EditOffreModalProps) {
  const [formData, setFormData] = useState<Offre | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (offre) {
      setFormData(offre)
    }
  }, [offre])

  if (!isOpen || !formData) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving offer:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Modifier l'offre
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <Input
                type="text"
                name="titre"
                label="Titre du poste"
                required
                value={formData.titre}
                onChange={handleInputChange}
                leftIcon={<Briefcase className="w-5 h-5" />}
              />

              {/* Entreprise */}
              <Input
                type="text"
                name="entreprise"
                label="Entreprise"
                required
                value={formData.entreprise}
                onChange={handleInputChange}
                leftIcon={<Building2 className="w-5 h-5" />}
              />

              {/* Lieu */}
              <Input
                type="text"
                name="lieu"
                label="Lieu"
                required
                value={formData.lieu}
                onChange={handleInputChange}
                leftIcon={<MapPin className="w-5 h-5" />}
              />

              {/* Type de contrat */}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                  Type de contrat *
                </label>
                <select
                  name="typeContrat"
                  required
                  value={formData.typeContrat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {typesContrat.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  required
                  value={formData.categorie}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                  Statut *
                </label>
                <select
                  name="statut"
                  required
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Salaire */}
              <div className="md:col-span-2">
                <Input
                  type="text"
                  name="salaire"
                  label="Salaire"
                  value={formData.salaire}
                  onChange={handleInputChange}
                  leftIcon={<DollarSign className="w-5 h-5" />}
                  placeholder="Ex: 45-55K€, Selon profil"
                />
              </div>

              {/* Email de contact */}
              <div className="md:col-span-2">
                <Input
                  type="email"
                  name="emailContact"
                  label="Email de contact"
                  required
                  value={formData.emailContact}
                  onChange={handleInputChange}
                  leftIcon={<Mail className="w-5 h-5" />}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                  Description du poste *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Compétences */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                  Compétences requises
                </label>
                <textarea
                  name="competences"
                  value={formData.competences}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="tertiary"
                size="lg"
                className="flex-1"
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="flex-1"
                isLoading={isSaving}
                disabled={isSaving}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
