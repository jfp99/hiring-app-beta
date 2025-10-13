'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CustomFieldDefinition, CustomFieldType, CreateCustomFieldInput } from '@/app/types/customFields'
import CustomFieldInput from './CustomFieldInput'

interface CustomFieldManagerProps {
  onClose?: () => void
}

export default function CustomFieldManager({ onClose }: CustomFieldManagerProps) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateCustomFieldInput>>({
    name: '',
    label: '',
    type: CustomFieldType.TEXT,
    description: '',
    placeholder: '',
    required: false,
    options: [],
    showInList: true,
    showInProfile: true,
    category: '',
    order: 999
  })
  const [optionsInput, setOptionsInput] = useState('') // For comma-separated options
  const [validationMin, setValidationMin] = useState<number | ''>('')
  const [validationMax, setValidationMax] = useState<number | ''>('')
  const [validationPattern, setValidationPattern] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/custom-fields')
      const data = await response.json()

      if (data.success) {
        setFields(data.fields)
      } else {
        setError(data.error || 'Failed to fetch custom fields')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setError(null)

      // Build validation object
      const validation: any = {}
      if (validationMin !== '') validation.min = validationMin
      if (validationMax !== '') validation.max = validationMax
      if (validationPattern) validation.pattern = validationPattern
      if (validationError) validation.errorMessage = validationError

      // Parse options for dropdown/multi-select
      const options = optionsInput
        ? optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt)
        : undefined

      const payload: CreateCustomFieldInput = {
        name: formData.name!,
        label: formData.label!,
        type: formData.type!,
        description: formData.description,
        placeholder: formData.placeholder,
        required: formData.required || false,
        options,
        validation: Object.keys(validation).length > 0 ? validation : undefined,
        showInList: formData.showInList,
        showInProfile: formData.showInProfile,
        category: formData.category,
        order: formData.order
      }

      const response = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        await fetchFields()
        resetForm()
        setShowCreateForm(false)
      } else {
        setError(data.error || 'Failed to create field')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleUpdate = async () => {
    if (!editingField) return

    try {
      setError(null)

      // Build validation object
      const validation: any = {}
      if (validationMin !== '') validation.min = validationMin
      if (validationMax !== '') validation.max = validationMax
      if (validationPattern) validation.pattern = validationPattern
      if (validationError) validation.errorMessage = validationError

      // Parse options for dropdown/multi-select
      const options = optionsInput
        ? optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt)
        : undefined

      const payload = {
        name: formData.name,
        label: formData.label,
        description: formData.description,
        placeholder: formData.placeholder,
        required: formData.required,
        options,
        validation: Object.keys(validation).length > 0 ? validation : undefined,
        showInList: formData.showInList,
        showInProfile: formData.showInProfile,
        category: formData.category,
        order: formData.order
      }

      const response = await fetch(`/api/custom-fields/${editingField.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        await fetchFields()
        resetForm()
        setEditingField(null)
      } else {
        setError(data.error || 'Failed to update field')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field? If candidates are using it, it will be deactivated instead.')) {
      return
    }

    try {
      setError(null)

      const response = await fetch(`/api/custom-fields/${fieldId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await fetchFields()
        toast.success('Champ supprimé', {
          description: data.message || 'Le champ personnalisé a été supprimé avec succès'
        })
      } else {
        setError(data.error || 'Failed to delete field')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const startEdit = (field: CustomFieldDefinition) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      description: field.description,
      placeholder: field.placeholder,
      required: field.required,
      options: field.options,
      showInList: field.showInList,
      showInProfile: field.showInProfile,
      category: field.category,
      order: field.order
    })
    setOptionsInput(field.options?.join(', ') || '')
    setValidationMin(field.validation?.min ?? '')
    setValidationMax(field.validation?.max ?? '')
    setValidationPattern(field.validation?.pattern || '')
    setValidationError(field.validation?.errorMessage || '')
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: CustomFieldType.TEXT,
      description: '',
      placeholder: '',
      required: false,
      options: [],
      showInList: true,
      showInProfile: true,
      category: '',
      order: 999
    })
    setOptionsInput('')
    setValidationMin('')
    setValidationMax('')
    setValidationPattern('')
    setValidationError('')
    setEditingField(null)
  }

  const needsOptions = formData.type === CustomFieldType.DROPDOWN || formData.type === CustomFieldType.MULTI_SELECT

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestionnaire de Champs Personnalisés</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Create Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-6 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              + Créer un Nouveau Champ
            </button>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingField ? 'Modifier le Champ' : 'Créer un Nouveau Champ'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Champ (technique) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: linkedin_url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                    disabled={!!editingField}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minuscules, chiffres et underscores uniquement</p>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé (affiché) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="ex: Profil LinkedIn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Champ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomFieldType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                    disabled={!!editingField}
                  >
                    <option value={CustomFieldType.TEXT}>Texte</option>
                    <option value={CustomFieldType.TEXTAREA}>Zone de texte</option>
                    <option value={CustomFieldType.NUMBER}>Nombre</option>
                    <option value={CustomFieldType.DATE}>Date</option>
                    <option value={CustomFieldType.EMAIL}>Email</option>
                    <option value={CustomFieldType.PHONE}>Téléphone</option>
                    <option value={CustomFieldType.URL}>URL</option>
                    <option value={CustomFieldType.DROPDOWN}>Liste déroulante</option>
                    <option value={CustomFieldType.MULTI_SELECT}>Sélection multiple</option>
                    <option value={CustomFieldType.CHECKBOX}>Case à cocher</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: Contact, Compétences"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Texte d'aide pour l'utilisateur"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                  />
                </div>

                {/* Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    placeholder="Texte d'exemple"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 999 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                  />
                </div>

                {/* Options (for dropdown/multi-select) */}
                {needsOptions && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options (séparées par des virgules) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={optionsInput}
                      onChange={(e) => setOptionsInput(e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                    />
                  </div>
                )}

                {/* Validation Rules */}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-semibold text-gray-700 mb-3">Règles de Validation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === CustomFieldType.NUMBER ? 'Valeur minimale' : 'Longueur minimale'}
                      </label>
                      <input
                        type="number"
                        value={validationMin}
                        onChange={(e) => setValidationMin(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === CustomFieldType.NUMBER ? 'Valeur maximale' : 'Longueur maximale'}
                      </label>
                      <input
                        type="number"
                        value={validationMax}
                        onChange={(e) => setValidationMax(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pattern (regex)</label>
                      <input
                        type="text"
                        value={validationPattern}
                        onChange={(e) => setValidationPattern(e.target.value)}
                        placeholder="^[A-Z].*"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message d'erreur personnalisé</label>
                      <input
                        type="text"
                        value={validationError}
                        onChange={(e) => setValidationError(e.target.value)}
                        placeholder="Format invalide"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="w-5 h-5 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff]"
                    />
                    <span className="text-sm font-medium text-gray-700">Champ requis</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showInList}
                      onChange={(e) => setFormData({ ...formData, showInList: e.target.checked })}
                      className="w-5 h-5 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff]"
                    />
                    <span className="text-sm font-medium text-gray-700">Afficher dans les listes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showInProfile}
                      onChange={(e) => setFormData({ ...formData, showInProfile: e.target.checked })}
                      className="w-5 h-5 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff]"
                    />
                    <span className="text-sm font-medium text-gray-700">Afficher dans le profil</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingField ? handleUpdate : handleCreate}
                  className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {editingField ? 'Mettre à Jour' : 'Créer'}
                </button>
                <button
                  onClick={() => {
                    resetForm()
                    setShowCreateForm(false)
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Fields List */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Champs Existants</h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b5335ff]"></div>
                <p className="text-gray-600 mt-2">Chargement...</p>
              </div>
            ) : fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Aucun champ personnalisé défini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`border rounded-xl p-4 ${
                      field.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{field.label}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              Requis
                            </span>
                          )}
                          {!field.isActive && (
                            <span className="px-2 py-1 bg-gray-400 text-white rounded text-xs font-medium">
                              Inactif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Nom:</span> <code className="bg-gray-100 px-2 py-0.5 rounded">{field.name}</code>
                        </p>
                        {field.description && (
                          <p className="text-sm text-gray-600 mb-1">{field.description}</p>
                        )}
                        {field.category && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Catégorie:</span> {field.category}
                          </p>
                        )}
                        {field.options && field.options.length > 0 && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Options:</span> {field.options.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(field)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
