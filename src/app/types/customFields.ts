// src/app/types/customFields.ts

// Field Types
export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi_select',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url'
}

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  [CustomFieldType.TEXT]: 'Texte court',
  [CustomFieldType.NUMBER]: 'Nombre',
  [CustomFieldType.DATE]: 'Date',
  [CustomFieldType.DROPDOWN]: 'Liste déroulante',
  [CustomFieldType.MULTI_SELECT]: 'Sélection multiple',
  [CustomFieldType.CHECKBOX]: 'Case à cocher',
  [CustomFieldType.TEXTAREA]: 'Texte long',
  [CustomFieldType.EMAIL]: 'Email',
  [CustomFieldType.PHONE]: 'Téléphone',
  [CustomFieldType.URL]: 'URL'
}

// Field Definition (what admins configure)
export interface CustomFieldDefinition {
  id: string
  name: string // Internal name (e.g., "preferred_start_date")
  label: string // Display label (e.g., "Date de début préférée")
  type: CustomFieldType
  description?: string
  placeholder?: string
  required: boolean
  isActive: boolean

  // For dropdown and multi-select
  options?: string[]

  // Validation rules
  validation?: {
    min?: number // For number and text length
    max?: number // For number and text length
    pattern?: string // Regex pattern for text
    errorMessage?: string
  }

  // Display settings
  showInList?: boolean // Show in candidates list view
  showInProfile?: boolean // Show in candidate profile
  category?: string // Group fields by category
  order?: number // Display order

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
}

// Field Value (what's stored on candidate)
export interface CustomFieldValue {
  fieldId: string
  fieldName: string
  value: any // Can be string, number, boolean, array, etc.
  updatedAt: string
  updatedBy: string
}

// Input types for API
export interface CreateCustomFieldInput {
  name: string
  label: string
  type: CustomFieldType
  description?: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    errorMessage?: string
  }
  showInList?: boolean
  showInProfile?: boolean
  category?: string
  order?: number
}

export interface UpdateCustomFieldInput extends Partial<CreateCustomFieldInput> {
  isActive?: boolean
}

// Response types
export interface CustomFieldResponse {
  success: boolean
  field?: CustomFieldDefinition
  error?: string
}

export interface CustomFieldsListResponse {
  success: boolean
  fields?: CustomFieldDefinition[]
  total?: number
  error?: string
}

// Helper functions
export function getDefaultValue(type: CustomFieldType): any {
  switch (type) {
    case CustomFieldType.TEXT:
    case CustomFieldType.TEXTAREA:
    case CustomFieldType.EMAIL:
    case CustomFieldType.PHONE:
    case CustomFieldType.URL:
      return ''
    case CustomFieldType.NUMBER:
      return null
    case CustomFieldType.DATE:
      return null
    case CustomFieldType.CHECKBOX:
      return false
    case CustomFieldType.DROPDOWN:
      return null
    case CustomFieldType.MULTI_SELECT:
      return []
    default:
      return null
  }
}

export function validateFieldValue(
  field: CustomFieldDefinition,
  value: any
): { valid: boolean; error?: string } {
  // Required check
  if (field.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.label} est requis` }
  }

  // Skip validation if empty and not required
  if (!value && !field.required) {
    return { valid: true }
  }

  // Type-specific validation
  switch (field.type) {
    case CustomFieldType.TEXT:
    case CustomFieldType.TEXTAREA:
      if (typeof value !== 'string') {
        return { valid: false, error: 'Valeur invalide' }
      }
      if (field.validation?.min && value.length < field.validation.min) {
        return {
          valid: false,
          error: `Minimum ${field.validation.min} caractères requis`
        }
      }
      if (field.validation?.max && value.length > field.validation.max) {
        return {
          valid: false,
          error: `Maximum ${field.validation.max} caractères autorisés`
        }
      }
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          return {
            valid: false,
            error: field.validation.errorMessage || 'Format invalide'
          }
        }
      }
      break

    case CustomFieldType.NUMBER:
      const num = Number(value)
      if (isNaN(num)) {
        return { valid: false, error: 'Nombre invalide' }
      }
      if (field.validation?.min !== undefined && num < field.validation.min) {
        return {
          valid: false,
          error: `Valeur minimale: ${field.validation.min}`
        }
      }
      if (field.validation?.max !== undefined && num > field.validation.max) {
        return {
          valid: false,
          error: `Valeur maximale: ${field.validation.max}`
        }
      }
      break

    case CustomFieldType.EMAIL:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Email invalide' }
      }
      break

    case CustomFieldType.URL:
      try {
        new URL(value)
      } catch {
        return { valid: false, error: 'URL invalide' }
      }
      break

    case CustomFieldType.PHONE:
      // Basic phone validation (can be customized)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(value)) {
        return { valid: false, error: 'Numéro de téléphone invalide' }
      }
      break

    case CustomFieldType.DROPDOWN:
      if (field.options && !field.options.includes(value)) {
        return { valid: false, error: 'Option invalide' }
      }
      break

    case CustomFieldType.MULTI_SELECT:
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Valeur invalide' }
      }
      if (field.options) {
        for (const v of value) {
          if (!field.options.includes(v)) {
            return { valid: false, error: 'Option invalide' }
          }
        }
      }
      break

    case CustomFieldType.CHECKBOX:
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Valeur invalide' }
      }
      break
  }

  return { valid: true }
}

export function formatFieldValue(field: CustomFieldDefinition, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Non renseigné'
  }

  switch (field.type) {
    case CustomFieldType.DATE:
      return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

    case CustomFieldType.CHECKBOX:
      return value ? 'Oui' : 'Non'

    case CustomFieldType.MULTI_SELECT:
      return Array.isArray(value) ? value.join(', ') : String(value)

    case CustomFieldType.URL:
      return `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`

    case CustomFieldType.EMAIL:
      return `<a href="mailto:${value}">${value}</a>`

    case CustomFieldType.PHONE:
      return `<a href="tel:${value}">${value}</a>`

    default:
      return String(value)
  }
}
