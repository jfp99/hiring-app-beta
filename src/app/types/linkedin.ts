// LinkedIn Integration Types

export interface LinkedInPreviewData {
  name?: string
  headline?: string
  position?: string
  company?: string
  location?: string
  imageUrl?: string
  lastFetched?: string
}

export interface LinkedInQuickChecks {
  nameMatches?: boolean
  roleAccurate?: boolean
  experienceVerified?: boolean
  educationVerified?: boolean
}

export interface LinkedInVerification {
  isVerified?: boolean
  verifiedBy?: string
  verifiedByName?: string
  verifiedAt?: string
  quickChecks?: LinkedInQuickChecks
}

export interface LinkedInVerificationHistory {
  verifiedBy: string
  verifiedByName: string
  verifiedAt: string
  action: 'verified' | 'unverified' | 'updated'
  notes?: string
}

export interface LinkedInData {
  url?: string
  previewData?: LinkedInPreviewData
  verification?: LinkedInVerification
  notes?: string
  verificationHistory?: LinkedInVerificationHistory[]
}

// API Types for LinkedIn preview endpoint
export interface LinkedInPreviewRequest {
  linkedinUrl: string
  candidateId?: string
}

export interface LinkedInPreviewResponse {
  success: boolean
  data?: LinkedInPreviewData
  error?: string
  cached?: boolean
}

// LinkedIn URL validation
export const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/

export function isValidLinkedInUrl(url: string): boolean {
  return LINKEDIN_URL_REGEX.test(url)
}

// Helper function to extract username from LinkedIn URL
export function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([\w-]+)/);
  return match ? match[1] : null;
}