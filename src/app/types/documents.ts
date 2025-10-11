// src/app/types/documents.ts

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  CERTIFICATE = 'certificate',
  REFERENCE = 'reference',
  CONTRACT = 'contract',
  ID_PROOF = 'id_proof',
  OTHER = 'other'
}

export enum DocumentStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface Document {
  id: string

  // File information
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  extension: string

  // Document metadata
  type: DocumentType
  status: DocumentStatus
  description?: string

  // Associations
  uploadedBy: string // User ID
  entityType: 'candidate' | 'company' | 'job' | 'application'
  entityId: string // ID of associated entity

  // Permissions
  isPublic: boolean
  allowedUsers?: string[] // User IDs who can access

  // Timestamps
  uploadedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  expiresAt?: Date

  // Additional metadata
  metadata?: {
    parsedText?: string // For resume parsing
    keywords?: string[]
    language?: string
    pageCount?: number
  }
}

export interface DocumentUploadRequest {
  file: File | Buffer
  type: DocumentType
  entityType: 'candidate' | 'company' | 'job' | 'application'
  entityId: string
  description?: string
  isPublic?: boolean
}

export interface DocumentFilter {
  entityType?: string
  entityId?: string
  type?: DocumentType
  status?: DocumentStatus
  uploadedBy?: string
  fromDate?: Date
  toDate?: Date
}

// Resume specific types
export interface ParsedResume {
  // Personal Information
  personalInfo: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    linkedin?: string
    github?: string
    portfolio?: string
  }

  // Professional Summary
  summary?: string

  // Work Experience
  experience: Array<{
    company: string
    position: string
    startDate?: string
    endDate?: string
    description?: string
    achievements?: string[]
  }>

  // Education
  education: Array<{
    institution: string
    degree: string
    field?: string
    graduationYear?: string
    gpa?: string
  }>

  // Skills
  skills: {
    technical?: string[]
    soft?: string[]
    languages?: Array<{
      language: string
      proficiency: string
    }>
  }

  // Certifications
  certifications?: Array<{
    name: string
    issuer: string
    date?: string
    expiryDate?: string
  }>

  // Projects
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
    link?: string
  }>

  // Raw text
  rawText: string

  // Parsing metadata
  parsingScore: number // 0-100 confidence score
  parsingErrors?: string[]
}

// Document access log
export interface DocumentAccessLog {
  id: string
  documentId: string
  accessedBy: string
  accessType: 'view' | 'download' | 'share' | 'delete'
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// Document sharing
export interface DocumentShare {
  id: string
  documentId: string
  sharedBy: string
  sharedWith: string[] // User IDs or email addresses
  shareLink?: string
  expiresAt?: Date
  accessCount: number
  maxAccessCount?: number
  createdAt: Date
}