// src/app/components/offres-public/AlertsModal.tsx
'use client'

import { useState } from 'react'
import {
  Bell,
  X,
  Mail,
  Check,
  AlertCircle,
  ChevronDown,
  Briefcase,
  MapPin,
  Building2
} from 'lucide-react'
import { CATEGORIES, CONTRACT_TYPES, LOCATIONS } from '@/app/types/offres'

interface AlertFormData {
  email: string
  categories: string[]
  locations: string[]
  contractTypes: string[]
  frequency: 'daily' | 'weekly' | 'instant'
}

interface AlertsModalProps {
  isOpen: boolean
  onClose: () => void
  defaultFilters?: {
    categories?: string[]
    locations?: string[]
    contractTypes?: string[]
  }
}

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instantané', description: 'Dès qu\'une offre correspond' },
  { value: 'daily', label: 'Quotidien', description: 'Un résumé chaque jour' },
  { value: 'weekly', label: 'Hebdomadaire', description: 'Un résumé chaque semaine' }
] as const

export default function AlertsModal({ isOpen, onClose, defaultFilters }: AlertsModalProps) {
  const [formData, setFormData] = useState<AlertFormData>({
    email: '',
    categories: defaultFilters?.categories || [],
    locations: defaultFilters?.locations || [],
    contractTypes: defaultFilters?.contractTypes || [],
    frequency: 'daily'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    locations: false,
    contractTypes: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleOption = (field: 'categories' | 'locations' | 'contractTypes', option: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(o => o !== option)
        : [...prev[field], option]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de l\'alerte')
      }

      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
        setFormData({
          email: '',
          categories: [],
          locations: [],
          contractTypes: [],
          frequency: 'daily'
        })
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Créer une alerte emploi</h2>
                <p className="text-sm text-white/80">Recevez les nouvelles offres par email</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success state */}
        {submitStatus === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Alerte créée avec succès !
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vous recevrez les nouvelles offres correspondant à vos critères.
            </p>
          </div>
        )}

        {/* Form */}
        {submitStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formData.categories.length === 0
                      ? 'Toutes les catégories'
                      : `${formData.categories.length} catégorie(s)`}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.categories && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleOption('categories', cat)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          formData.categories.includes(cat)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Locations */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('locations')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formData.locations.length === 0
                      ? 'Toutes les localisations'
                      : `${formData.locations.length} lieu(x)`}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.locations ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.locations && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleOption('locations', loc)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          formData.locations.includes(loc)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contract types */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('contractTypes')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formData.contractTypes.length === 0
                      ? 'Tous les types de contrat'
                      : `${formData.contractTypes.length} type(s)`}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.contractTypes ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.contractTypes && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {CONTRACT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleOption('contractTypes', type)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          formData.contractTypes.includes(type)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fréquence des notifications
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, frequency: option.value }))}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      formData.frequency === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`font-medium text-sm ${
                      formData.frequency === option.value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Bell className="w-5 h-5" />
                  Créer l&apos;alerte
                </span>
              )}
            </button>

            {/* Privacy note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              En créant une alerte, vous acceptez de recevoir des emails de Hi-Ring.
              Vous pouvez vous désinscrire à tout moment.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
