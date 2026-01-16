// src/app/components/offres/OffrePreviewEditModal.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  X, Save, FileText, Calendar, Shield, Plus, Trash2,
  Upload, Image as ImageIcon, Pencil, Check, AlertCircle
} from 'lucide-react'
import type { OffreFormData, OffreEnhanced, OffreStatut } from '@/app/types/offres'
import { CATEGORIES, CONTRACT_TYPES, DEFAULT_OFFRE_VALUES, STATUT_CONFIG } from '@/app/types/offres'

interface OffrePreviewEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: OffreFormData, status: OffreStatut) => Promise<void>
  initialData?: Partial<OffreEnhanced>
  mode: 'create' | 'edit'
}

// Editable text component
function EditableText({
  value,
  onChange,
  placeholder,
  className = '',
  multiline = false,
  as: Component = 'span'
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  multiline?: boolean
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3'
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    onChange(editValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1 border border-primary-500 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1 border border-primary-500 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      />
    )
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded px-1 -mx-1 transition-colors group relative ${className} ${!value ? 'text-gray-400 italic' : ''}`}
    >
      {value || placeholder}
      <Pencil className="w-3 h-3 absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
    </Component>
  )
}

// Editable list item component
function EditableListItem({
  value,
  onChange,
  onDelete,
  placeholder
}: {
  value: string
  onChange: (value: string) => void
  onDelete: () => void
  placeholder: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim()) {
      onChange(editValue.trim())
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:bg-primary-500 before:rounded-full">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="w-full px-2 py-1 border border-primary-500 rounded bg-white dark:bg-gray-800 focus:outline-none text-sm"
          placeholder={placeholder}
        />
      </li>
    )
  }

  return (
    <li
      className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:bg-primary-500 before:rounded-full group cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded py-1 pr-8"
      onClick={() => setIsEditing(true)}
    >
      {value}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </li>
  )
}

// Helper to ensure array format
const ensureArray = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

// Tag colors
const getTagColor = (index: number) => {
  const colors = [
    'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  ]
  return colors[index % colors.length]
}

export default function OffrePreviewEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}: OffrePreviewEditModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedStatus, setSelectedStatus] = useState<OffreStatut>('draft')
  const [showSettings, setShowSettings] = useState(false)

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
        responsabilites: ensureArray(initialData.responsabilites),
        qualifications: ensureArray(initialData.qualifications),
        avantages: ensureArray(initialData.avantages),
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

  // Update field
  const updateField = useCallback(<K extends keyof OffreFormData>(
    field: K,
    value: OffreFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  // Array field handlers
  const addArrayItem = useCallback((field: 'responsabilites' | 'qualifications' | 'avantages', value: string) => {
    if (!value.trim()) return
    setFormData((prev) => {
      const currentArray = ensureArray(prev[field])
      return {
        ...prev,
        [field]: [...currentArray, value.trim()]
      }
    })
  }, [])

  const updateArrayItem = useCallback((field: 'responsabilites' | 'qualifications' | 'avantages', index: number, value: string) => {
    setFormData((prev) => {
      const currentArray = ensureArray(prev[field])
      return {
        ...prev,
        [field]: currentArray.map((item, i) => i === index ? value : item)
      }
    })
  }, [])

  const removeArrayItem = useCallback((field: 'responsabilites' | 'qualifications' | 'avantages', index: number) => {
    setFormData((prev) => {
      const currentArray = ensureArray(prev[field])
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      }
    })
  }, [])

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis'
    if (!formData.lieu.trim()) newErrors.lieu = 'Le lieu est requis'
    if (!formData.description.trim() && !formData.descriptionHtml?.trim()) {
      newErrors.description = 'La description est requise'
    }
    if (!formData.emailContact.trim()) {
      newErrors.emailContact = "L'email de contact est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContact)) {
      newErrors.emailContact = 'Email invalide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle save
  const handleSave = useCallback(async (status: OffreStatut) => {
    if (!validate()) return

    setIsSaving(true)
    try {
      await onSave(formData, status)
      onClose()
    } catch (error) {
      console.error('Error saving offre:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, validate, onSave, onClose])

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Parse competences
  const competencesList = formData.competences ? formData.competences.split(',').map(c => c.trim()).filter(Boolean) : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto my-4 bg-cream-100 dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Nouvelle offre' : 'Modifier l\'offre'}
            </h2>
            <p className="text-sm text-gray-500">
              Cliquez sur n&apos;importe quel element pour le modifier
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Status selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OffreStatut)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              {(['draft', 'review', 'active'] as OffreStatut[]).map((status) => (
                <option key={status} value={status}>
                  {STATUT_CONFIG[status].label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Parametres"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Preview Style */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

              {/* Left Column - Main Content */}
              <div className="lg:col-span-2">
                {/* Job Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <EditableText
                        value={formData.titre}
                        onChange={(v) => updateField('titre', v)}
                        placeholder="Titre du poste..."
                        className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight block ${errors.titre ? 'ring-2 ring-red-500 rounded' : ''}`}
                        as="h1"
                      />
                      <p className="text-primary-600 dark:text-accent-500 font-medium">
                        <EditableText
                          value={formData.entreprise}
                          onChange={(v) => updateField('entreprise', v)}
                          placeholder="Entreprise"
                          className="inline"
                        />
                        {' - '}
                        <EditableText
                          value={formData.lieu}
                          onChange={(v) => updateField('lieu', v)}
                          placeholder="Lieu"
                          className={`inline ${errors.lieu ? 'ring-2 ring-red-500 rounded' : ''}`}
                        />
                      </p>
                    </div>
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <LogoUploader
                        logoUrl={formData.logoUrl}
                        onLogoChange={(url) => updateField('logoUrl', url)}
                      />
                    </div>
                  </div>
                </div>

                {/* L'ENTREPRISE & LE CONTEXTE */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
                  <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                    L&apos;ENTREPRISE & LE CONTEXTE
                  </h2>
                  <EditableText
                    value={formData.description}
                    onChange={(v) => {
                      updateField('description', v)
                      updateField('descriptionHtml', `<p>${v}</p>`)
                    }}
                    placeholder="Decrivez l'entreprise et le contexte du poste..."
                    className={`text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] block ${errors.description ? 'ring-2 ring-red-500 rounded' : ''}`}
                    multiline
                    as="p"
                  />
                </div>

                {/* LE POSTE */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
                  <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                    LE POSTE
                  </h2>

                  {/* Vos missions */}
                  <div className="mt-4">
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Vos missions :</h3>
                    <ul className="space-y-2">
                      {ensureArray(formData.responsabilites).map((item, index) => (
                        <EditableListItem
                          key={index}
                          value={item}
                          onChange={(v) => updateArrayItem('responsabilites', index, v)}
                          onDelete={() => removeArrayItem('responsabilites', index)}
                          placeholder="Mission..."
                        />
                      ))}
                    </ul>
                    <AddItemButton
                      onAdd={(value) => addArrayItem('responsabilites', value)}
                      placeholder="Ajouter une mission..."
                    />
                  </div>
                </div>

                {/* ENVIRONNEMENT TECHNIQUE */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
                  <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                    ENVIRONNEMENT TECHNIQUE
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300 text-[15px]">
                      <span className="font-semibold text-gray-900 dark:text-white">Competences requises : </span>
                      <EditableText
                        value={formData.competences}
                        onChange={(v) => updateField('competences', v)}
                        placeholder="React, Node.js, TypeScript..."
                        className="inline"
                      />
                    </p>
                  </div>
                </div>

                {/* LE PROFIL */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
                  <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                    LE PROFIL
                  </h2>
                  <ul className="space-y-2">
                    {ensureArray(formData.qualifications).map((item, index) => (
                      <EditableListItem
                        key={index}
                        value={item}
                        onChange={(v) => updateArrayItem('qualifications', index, v)}
                        onDelete={() => removeArrayItem('qualifications', index)}
                        placeholder="Qualification..."
                      />
                    ))}
                  </ul>
                  <AddItemButton
                    onAdd={(value) => addArrayItem('qualifications', value)}
                    placeholder="Ajouter une qualification..."
                  />
                </div>

                {/* CE QUE L'ON AIME */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
                  <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    CE QUE L&apos;ON <span className="text-accent-500">&#10084;</span>
                  </h2>
                  <ul className="space-y-2">
                    {ensureArray(formData.avantages).map((item, index) => (
                      <EditableListItem
                        key={index}
                        value={item}
                        onChange={(v) => updateArrayItem('avantages', index, v)}
                        onDelete={() => removeArrayItem('avantages', index)}
                        placeholder="Avantage..."
                      />
                    ))}
                  </ul>
                  <AddItemButton
                    onAdd={(value) => addArrayItem('avantages', value)}
                    placeholder="Ajouter un avantage..."
                  />
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Job Info Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8">
                    {/* Updated date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                      <Calendar className="w-4 h-4" />
                      <span>Publiee le {formatDate(initialData?.datePublication)}</span>
                    </div>

                    {/* Job Info */}
                    <div className="space-y-5 mb-8">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Type</span>
                        <select
                          value={formData.typeContrat}
                          onChange={(e) => updateField('typeContrat', e.target.value)}
                          className="text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary-600"
                        >
                          {CONTRACT_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Salaire</span>
                        <EditableText
                          value={formData.salaire}
                          onChange={(v) => updateField('salaire', v)}
                          placeholder="A definir"
                          className="text-sm text-gray-600 dark:text-gray-300"
                        />
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Localisation</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{formData.lieu || 'A definir'}</span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Categorie</span>
                        <select
                          value={formData.categorie}
                          onChange={(e) => updateField('categorie', e.target.value)}
                          className="text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary-600"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Teletravail</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Hybride</span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="mb-8">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block mb-3">Categories</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium">
                          {formData.categorie}
                        </span>
                      </div>
                    </div>

                    {/* Email contact */}
                    <div className="mb-8">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block mb-2">Email de contact</span>
                      <EditableText
                        value={formData.emailContact}
                        onChange={(v) => updateField('emailContact', v)}
                        placeholder="contact@example.com"
                        className={`text-sm text-gray-600 dark:text-gray-300 ${errors.emailContact ? 'ring-2 ring-red-500 rounded' : ''}`}
                      />
                    </div>

                    {/* CTA Button (preview) */}
                    <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 text-white rounded-lg text-sm font-semibold">
                      Ca m&apos;interesse
                    </div>
                  </div>

                  {/* Tags Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8">
                    <h3 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                      Tags
                    </h3>
                    {competencesList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {competencesList.map((comp, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${getTagColor(index)}`}
                          >
                            #{comp.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                        Ajoutez des competences pour voir les tags
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel (slide-in) */}
        {showSettings && (
          <div className="absolute right-0 top-16 bottom-16 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto">
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Parametres SEO</h3>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL (slug)
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="mon-offre-emploi"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
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
                  placeholder="Titre SEO..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <p className="mt-1 text-xs text-gray-500">{(formData.metaTitle || '').length}/60</p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta description
                </label>
                <textarea
                  value={formData.metaDescription || ''}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder="Description SEO..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <p className="mt-1 text-xs text-gray-500">{(formData.metaDescription || '').length}/160</p>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Banniere
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl || ''}
                  onChange={(e) => updateField('bannerUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Video
                </label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Errors display */}
        {Object.keys(errors).length > 0 && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Veuillez corriger les erreurs: {Object.values(errors).join(', ')}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              Brouillon
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
    </div>
  )
}

// Add item button component
function AddItemButton({
  onAdd,
  placeholder
}: {
  onAdd: (value: string) => void
  placeholder: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
    setIsAdding(false)
  }

  if (isAdding) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') setIsAdding(false)
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-primary-500 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={handleAdd}
          className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-2 mt-3 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Ajouter
    </button>
  )
}

// Logo uploader component
function LogoUploader({
  logoUrl,
  onLogoChange
}: {
  logoUrl?: string
  onLogoChange: (url: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputUrl, setInputUrl] = useState(logoUrl || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputUrl(logoUrl || '')
  }, [logoUrl])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onLogoChange(inputUrl)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24">
        <input
          ref={inputRef}
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          placeholder="URL du logo..."
          className="w-full h-full px-2 py-1 text-xs border border-primary-500 rounded-xl bg-white dark:bg-gray-800 focus:outline-none"
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors group relative"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-accent-500" />
          <span className="text-[10px] text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
            + Logo
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-5 h-5 text-white" />
      </div>
    </div>
  )
}
