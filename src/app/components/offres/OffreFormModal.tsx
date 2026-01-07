// src/app/components/offres/OffreFormModal.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  X,
  Save,
  Eye,
  FileText,
  Briefcase,
  Image,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Wand2
} from 'lucide-react'
import RichTextEditor from '@/app/components/ui/RichTextEditor'
import SeoScoreCard from './SeoScoreCard'
import TextSuggestions from './TextSuggestions'
import { OffrePreviewCompact } from './OffrePreview'
import type { OffreFormData, OffreEnhanced, OffreStatut } from '@/app/types/offres'
import { CATEGORIES, CONTRACT_TYPES, DEFAULT_OFFRE_VALUES, STATUT_CONFIG } from '@/app/types/offres'
import { applyTemplateDefaults, hasTemplateChanges } from '@/app/lib/categoryTemplates'

interface OffreFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: OffreFormData, status: OffreStatut) => Promise<void>
  initialData?: Partial<OffreEnhanced>
  mode: 'create' | 'edit'
}

type TabId = 'info' | 'content' | 'media' | 'seo' | 'publication'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Informations', icon: FileText },
  { id: 'content', label: 'Contenu', icon: Briefcase },
  { id: 'media', label: 'M\u00e9dias', icon: Image },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'publication', label: 'Publication', icon: Calendar }
]

export default function OffreFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}: OffreFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info')
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState<OffreFormData>({
    titre: '',
    entreprise: DEFAULT_OFFRE_VALUES.entreprise || 'Hi-ring',
    lieu: '',
    typeContrat: 'CDI',
    salaire: '',
    description: '',
    descriptionHtml: '',
    competences: '',
    emailContact: DEFAULT_OFFRE_VALUES.emailContact || 'contact@hi-ring.fr',
    categorie: 'Technologie',
    responsabilites: [],
    qualifications: [],
    avantages: [],
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    scheduledPublishDate: '',
    expirationDate: ''
  })

  const [selectedStatus, setSelectedStatus] = useState<OffreStatut>('draft')

  // Initialize with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        titre: initialData.titre || '',
        entreprise: initialData.entreprise || DEFAULT_OFFRE_VALUES.entreprise || '',
        lieu: initialData.lieu || '',
        typeContrat: initialData.typeContrat || 'CDI',
        salaire: initialData.salaire || '',
        description: initialData.description || '',
        descriptionHtml: initialData.descriptionHtml || '',
        competences: initialData.competences || '',
        emailContact: initialData.emailContact || DEFAULT_OFFRE_VALUES.emailContact || '',
        categorie: initialData.categorie || 'Technologie',
        responsabilites: initialData.responsabilites || [],
        qualifications: initialData.qualifications || [],
        avantages: initialData.avantages || [],
        slug: initialData.seo?.slug || '',
        metaTitle: initialData.seo?.metaTitle || '',
        metaDescription: initialData.seo?.metaDescription || '',
        keywords: initialData.seo?.keywords || [],
        logoUrl: initialData.media?.logoUrl || '',
        bannerUrl: initialData.media?.bannerUrl || '',
        videoUrl: initialData.media?.videoUrl || '',
        scheduledPublishDate: initialData.scheduling?.scheduledPublishDate || '',
        expirationDate: initialData.scheduling?.expirationDate || ''
      })
      setSelectedStatus(initialData.statut || 'draft')
    }
  }, [initialData])

  // Update form field
  const updateField = useCallback(<K extends keyof OffreFormData>(
    field: K,
    value: OffreFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  // Add item to array field
  const addArrayItem = useCallback((field: 'responsabilites' | 'qualifications' | 'avantages', value: string) => {
    if (!value.trim()) return
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }))
  }, [])

  // Remove item from array field
  const removeArrayItem = useCallback((field: 'responsabilites' | 'qualifications' | 'avantages', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }, [])

  // Handle category change with template suggestion
  const handleCategoryChange = useCallback((newCategory: string) => {
    // Check if template has defaults that could be applied
    if (hasTemplateChanges(formData, newCategory)) {
      setPendingCategory(newCategory)
      setShowTemplatePrompt(true)
    } else {
      updateField('categorie', newCategory)
    }
  }, [formData, updateField])

  // Apply template defaults for the selected category
  const applyTemplate = useCallback((overwriteExisting: boolean = false) => {
    const category = pendingCategory || formData.categorie
    const updatedData = applyTemplateDefaults(formData, category, overwriteExisting)
    setFormData(prev => ({ ...prev, ...updatedData }))
    if (pendingCategory) {
      setFormData(prev => ({ ...prev, categorie: pendingCategory }))
    }
    setShowTemplatePrompt(false)
    setPendingCategory(null)
  }, [formData, pendingCategory])

  // Cancel template application
  const cancelTemplatePrompt = useCallback(() => {
    if (pendingCategory) {
      setFormData(prev => ({ ...prev, categorie: pendingCategory }))
    }
    setShowTemplatePrompt(false)
    setPendingCategory(null)
  }, [pendingCategory])

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis'
    }
    if (!formData.lieu.trim()) {
      newErrors.lieu = 'Le lieu est requis'
    }
    if (!formData.description.trim() && !formData.descriptionHtml?.trim()) {
      newErrors.description = 'La description est requise'
    }
    if (!formData.emailContact.trim()) {
      newErrors.emailContact = 'L\'email de contact est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContact)) {
      newErrors.emailContact = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle save
  const handleSave = useCallback(async (status: OffreStatut) => {
    if (!validate()) {
      // Go to tab with first error
      const errorFields = Object.keys(errors)
      if (errorFields.some(f => ['titre', 'entreprise', 'lieu', 'typeContrat', 'emailContact'].includes(f))) {
        setActiveTab('info')
      } else if (errorFields.some(f => ['description'].includes(f))) {
        setActiveTab('content')
      }
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData, status)
      onClose()
    } catch (error) {
      console.error('Error saving offre:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, validate, onSave, onClose, errors])

  // Generate slug from title
  const generateSlug = useCallback(() => {
    const slug = formData.titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    updateField('slug', slug)
  }, [formData.titre, updateField])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto my-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Nouvelle offre' : 'Modifier l\'offre'}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === 'create'
                ? 'Cr\u00e9ez une nouvelle offre d\'emploi'
                : `Modification de "${initialData?.titre}"`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showPreview
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              Aper\u00e7u
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const tabIndex = TABS.findIndex(t => t.id === tab.id)
            const activeIndex = TABS.findIndex(t => t.id === activeTab)

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {/* Step indicator */}
                <span className={`ml-1 w-5 h-5 flex items-center justify-center text-xs rounded-full ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : tabIndex < activeIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {index + 1}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form area */}
          <div className={`flex-1 overflow-y-auto p-6 ${showPreview ? 'w-1/2' : 'w-full'}`}>
            {/* Tab: Info */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre du poste <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => updateField('titre', e.target.value)}
                    placeholder="Ex: D\u00e9veloppeur Full Stack React/Node.js"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 ${
                      errors.titre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.titre && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.titre}
                    </p>
                  )}
                </div>

                {/* Entreprise + Lieu */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.entreprise}
                      onChange={(e) => updateField('entreprise', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lieu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lieu}
                      onChange={(e) => updateField('lieu', e.target.value)}
                      placeholder="Ex: Paris, Lyon, Remote..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 ${
                        errors.lieu ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.lieu && (
                      <p className="mt-1 text-sm text-red-500">{errors.lieu}</p>
                    )}
                  </div>
                </div>

                {/* Type contrat + Cat\u00e9gorie */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type de contrat
                    </label>
                    <select
                      value={formData.typeContrat}
                      onChange={(e) => updateField('typeContrat', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    >
                      {CONTRACT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cat\u00e9gorie
                    </label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salaire + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Salaire
                    </label>
                    <input
                      type="text"
                      value={formData.salaire}
                      onChange={(e) => updateField('salaire', e.target.value)}
                      placeholder="Ex: 45-55K\u20ac ou \u00c0 n\u00e9gocier"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email de contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.emailContact}
                      onChange={(e) => updateField('emailContact', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 ${
                        errors.emailContact ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.emailContact && (
                      <p className="mt-1 text-sm text-red-500">{errors.emailContact}</p>
                    )}
                  </div>
                </div>

                {/* Comp\u00e9tences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comp\u00e9tences requises
                  </label>
                  <textarea
                    value={formData.competences}
                    onChange={(e) => updateField('competences', e.target.value)}
                    placeholder="Ex: React, Node.js, TypeScript, MongoDB..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">S\u00e9parez les comp\u00e9tences par des virgules</p>
                </div>
              </div>
            )}

            {/* Tab: Content */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <RichTextEditor
                    label="Description du poste"
                    required
                    content={formData.descriptionHtml || formData.description}
                    onChange={(html, text) => {
                      updateField('descriptionHtml', html)
                      updateField('description', text)
                    }}
                    placeholder="D\u00e9crivez le poste, l'environnement de travail, les missions..."
                    error={errors.description}
                    minHeight="200px"
                  />
                  <TextSuggestions
                    category="description"
                    onInsert={(text) => {
                      updateField('descriptionHtml', formData.descriptionHtml + `<p>${text}</p>`)
                      updateField('description', formData.description + '\n' + text)
                    }}
                    typeContrat={formData.typeContrat}
                    categorie={formData.categorie}
                  />
                </div>

                {/* Responsabilit\u00e9s */}
                <ArrayFieldEditor
                  label="Responsabilit\u00e9s"
                  items={formData.responsabilites}
                  onAdd={(value) => addArrayItem('responsabilites', value)}
                  onRemove={(index) => removeArrayItem('responsabilites', index)}
                  placeholder="Ajouter une responsabilit\u00e9..."
                  suggestions={
                    <TextSuggestions
                      category="responsabilites"
                      onInsert={(text) => addArrayItem('responsabilites', text)}
                      typeContrat={formData.typeContrat}
                      categorie={formData.categorie}
                    />
                  }
                />

                {/* Qualifications */}
                <ArrayFieldEditor
                  label="Qualifications requises"
                  items={formData.qualifications}
                  onAdd={(value) => addArrayItem('qualifications', value)}
                  onRemove={(index) => removeArrayItem('qualifications', index)}
                  placeholder="Ajouter une qualification..."
                  suggestions={
                    <TextSuggestions
                      category="qualifications"
                      onInsert={(text) => addArrayItem('qualifications', text)}
                      typeContrat={formData.typeContrat}
                      categorie={formData.categorie}
                    />
                  }
                />

                {/* Avantages */}
                <ArrayFieldEditor
                  label="Avantages"
                  items={formData.avantages}
                  onAdd={(value) => addArrayItem('avantages', value)}
                  onRemove={(index) => removeArrayItem('avantages', index)}
                  placeholder="Ajouter un avantage..."
                  suggestions={
                    <TextSuggestions
                      category="avantages"
                      onInsert={(text) => addArrayItem('avantages', text)}
                      typeContrat={formData.typeContrat}
                      categorie={formData.categorie}
                    />
                  }
                />

                {/* Quick auto-fill section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Wand2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Remplissage automatique
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Remplir les champs vides avec des suggestions adaptees a la categorie &quot;{formData.categorie}&quot;.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => applyTemplate(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          Remplir les champs vides
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate(true)}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Tout remplacer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Media */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Ajoutez des m\u00e9dias pour rendre votre offre plus attractive.
                </p>

                {/* Logo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL du logo
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => updateField('logoUrl', e.target.value)}
                    placeholder="https://exemple.com/logo.png"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Banner URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de la banni\u00e8re
                  </label>
                  <input
                    type="url"
                    value={formData.bannerUrl || ''}
                    onChange={(e) => updateField('bannerUrl', e.target.value)}
                    placeholder="https://exemple.com/banner.jpg"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de la vid\u00e9o (YouTube, Vimeo)
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl || ''}
                    onChange={(e) => updateField('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            )}

            {/* Tab: SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL personnalis\u00e9e (slug)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center">
                      <span className="px-3 py-3 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-sm text-gray-500">
                        /offres-emploi/
                      </span>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="mon-offre-emploi"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      G\u00e9n\u00e9rer
                    </button>
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta titre
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                    placeholder="Titre pour les moteurs de recherche (50-60 caract\u00e8res)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(formData.metaTitle || '').length}/60 caract\u00e8res
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta description
                  </label>
                  <textarea
                    value={formData.metaDescription || ''}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    placeholder="Description pour les moteurs de recherche (150-160 caract\u00e8res)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(formData.metaDescription || '').length}/160 caract\u00e8res
                  </p>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mots-cl\u00e9s
                  </label>
                  <input
                    type="text"
                    value={(formData.keywords || []).join(', ')}
                    onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                    placeholder="emploi, recrutement, d\u00e9veloppeur..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">S\u00e9parez les mots-cl\u00e9s par des virgules</p>
                </div>

                {/* SEO Score */}
                <SeoScoreCard formData={formData} />
              </div>
            )}

            {/* Tab: Publication */}
            {activeTab === 'publication' && (
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Statut de publication
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(['draft', 'review', 'scheduled', 'active'] as OffreStatut[]).map((status) => {
                      const config = STATUT_CONFIG[status]
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setSelectedStatus(status)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedStatus === status
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {status === 'draft' && 'Non visible publiquement'}
                            {status === 'review' && 'En attente de validation'}
                            {status === 'scheduled' && 'Sera publi\u00e9e \u00e0 la date pr\u00e9vue'}
                            {status === 'active' && 'Visible sur le site'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Scheduled date */}
                {selectedStatus === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de publication programm\u00e9e
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledPublishDate || ''}
                      onChange={(e) => updateField('scheduledPublishDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                    />
                  </div>
                )}

                {/* Expiration date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d&apos;expiration (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate || ''}
                    onChange={(e) => updateField('expirationDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    L&apos;offre passera automatiquement en statut &quot;Expir\u00e9e&quot; \u00e0 cette date
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview sidebar */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 p-4">
              <OffrePreviewCompact data={formData} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentIndex = TABS.findIndex(t => t.id === activeTab)
                if (currentIndex > 0) {
                  setActiveTab(TABS[currentIndex - 1].id)
                }
              }}
              disabled={activeTab === TABS[0].id}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Pr\u00e9c\u00e9dent
            </button>
            <button
              onClick={() => {
                const currentIndex = TABS.findIndex(t => t.id === activeTab)
                if (currentIndex < TABS.length - 1) {
                  setActiveTab(TABS[currentIndex + 1].id)
                }
              }}
              disabled={activeTab === TABS[TABS.length - 1].id}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Enregistrer brouillon
            </button>
            <button
              onClick={() => handleSave(selectedStatus)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      {/* Template suggestion modal */}
      {showTemplatePrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Suggestions disponibles
                </h3>
                <p className="text-sm text-gray-500">
                  Categorie: {pendingCategory || formData.categorie}
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Des suggestions predefinies sont disponibles pour cette categorie. Voulez-vous remplir automatiquement les champs vides ?
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Champs qui seront remplis :
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {(!formData.responsabilites || formData.responsabilites.length === 0) && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Responsabilites
                  </li>
                )}
                {(!formData.qualifications || formData.qualifications.length === 0) && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Qualifications
                  </li>
                )}
                {(!formData.avantages || formData.avantages.length === 0) && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Avantages
                  </li>
                )}
                {(!formData.competences || formData.competences.trim() === '') && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Competences
                  </li>
                )}
                {(!formData.description || formData.description.trim() === '') && (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    Description
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelTemplatePrompt}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Non merci
              </button>
              <button
                onClick={() => applyTemplate(false)}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Remplir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Array field editor component
function ArrayFieldEditor({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
  suggestions
}: {
  label: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder: string
  suggestions?: React.ReactNode
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group"
            >
              <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {item}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions */}
      {suggestions}
    </div>
  )
}
