// LinkedIn helper utilities for parsing and transforming LinkedIn data

import { LinkedInPreviewData } from '@/app/types/linkedin'

export interface ParsedName {
  firstName: string
  lastName: string
  warning?: string
}

/**
 * Parse full name into firstName and lastName
 * Handles edge cases like single names, multiple middle names, etc.
 *
 * Examples:
 * - "John Doe" → { firstName: "John", lastName: "Doe" }
 * - "Madonna" → { firstName: "Madonna", lastName: "", warning: "..." }
 * - "Mary Jane Watson" → { firstName: "Mary Jane", lastName: "Watson" }
 * - "" → { firstName: "", lastName: "", warning: "..." }
 */
export function parseFullName(fullName: string | undefined): ParsedName {
  if (!fullName || !fullName.trim()) {
    return {
      firstName: '',
      lastName: '',
      warning: 'Nom complet non disponible. Veuillez saisir le nom et prénom manuellement.'
    }
  }

  let cleanedName = fullName.trim()

  // Step 1: Remove " | Professional", " | LinkedIn", etc.
  // LinkedIn often adds suffixes like "| Professional Profile"
  cleanedName = cleanedName.replace(/\s*\|\s*.*$/i, '')

  // Step 2: LinkedIn names typically follow pattern: "NAME - Location" or "NAME - Title at Company"
  // Take everything BEFORE the first " - " (space-dash-space) pattern
  const dashIndex = cleanedName.indexOf(' - ')
  if (dashIndex !== -1) {
    cleanedName = cleanedName.substring(0, dashIndex)
  }

  // Step 3: Trim any whitespace
  cleanedName = cleanedName.trim()

  // Handle empty result
  if (!cleanedName) {
    return {
      firstName: '',
      lastName: '',
      warning: 'Nom complet non disponible. Veuillez saisir le nom et prénom manuellement.'
    }
  }

  // Split the cleaned name into parts
  const parts = cleanedName.split(/\s+/)

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
      warning: 'Nom de famille non détecté. Veuillez vérifier le nom complet.'
    }
  }

  // Last part is lastName, everything else is firstName
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')

  return { firstName, lastName }
}

/**
 * Generate user-friendly warning messages for missing or incomplete data
 * These warnings help users understand what data needs to be filled manually
 */
export function generateLinkedInWarnings(data: LinkedInPreviewData): string[] {
  const warnings: string[] = []

  // Check name parsing
  const nameResult = parseFullName(data.name)
  if (nameResult.warning) {
    warnings.push(nameResult.warning)
  }

  // Check position
  if (!data.position || data.position.trim() === '') {
    warnings.push('Poste actuel non disponible.')
  }

  // Check company
  if (!data.company || data.company.trim() === '') {
    warnings.push('Entreprise actuelle non disponible.')
  }

  // Check profile image
  if (!data.imageUrl) {
    warnings.push('Photo de profil non disponible.')
  }

  // Email is ALWAYS missing from LinkedIn preview (OpenGraph doesn't include it)
  warnings.push('Email non disponible - champ obligatoire à remplir manuellement.')

  return warnings
}

/**
 * Form data structure after LinkedIn import
 */
export interface FormDataFromLinkedIn {
  firstName: string
  lastName: string
  currentPosition: string
  currentCompany: string
  linkedinUrl: string
  profilePictureUrl: string
  summary: string
  source: string
}

/**
 * Transform LinkedIn preview data to form data structure
 * This maps LinkedIn OpenGraph data to candidate form fields
 */
export function transformLinkedInToFormData(
  data: LinkedInPreviewData,
  linkedinUrl: string
): FormDataFromLinkedIn {
  const { firstName, lastName } = parseFullName(data.name)

  return {
    firstName,
    lastName,
    currentPosition: data.position || '',
    currentCompany: data.company || '',
    linkedinUrl,
    profilePictureUrl: data.imageUrl || '',
    summary: data.headline || '',
    source: 'LinkedIn Import'
  }
}

/**
 * Validate if a string is a valid LinkedIn profile URL
 * Uses the regex from linkedin.ts types
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url || !url.trim()) return false

  const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
  return LINKEDIN_URL_REGEX.test(url.trim())
}

/**
 * Extract username from LinkedIn URL
 * Example: "https://www.linkedin.com/in/billgates/" → "billgates"
 */
export function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([\w-]+)/)
  return match ? match[1] : null
}