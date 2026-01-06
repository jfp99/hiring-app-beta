// src/app/types/offres.ts
// Types for the enhanced job offers management system

// Status workflow for job offers
export type OffreStatut = 'draft' | 'review' | 'scheduled' | 'active' | 'expired' | 'archived'

// Contract types
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'] as const
export type ContractType = typeof CONTRACT_TYPES[number]

// Categories
export const CATEGORIES = [
  'Technologie',
  'Management',
  'Data',
  'Design',
  'Marketing',
  'Finance',
  'RH',
  'Commercial',
  'Juridique',
  'Autre'
] as const
export type OffreCategorie = typeof CATEGORIES[number]

// Locations (French cities)
export const LOCATIONS = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Nantes',
  'Lille',
  'Strasbourg',
  'Nice',
  'Montpellier',
  'Remote',
  'Hybride'
] as const

// Comment on an offer (internal collaboration)
export interface OffreComment {
  id: string
  userId: string
  userName: string
  userEmail: string
  text: string
  createdAt: string
}

// Version history entry
export interface OffreHistoryEntry {
  version: number
  changes: Record<string, { old: unknown; new: unknown }>
  editedBy: string
  editedByName: string
  editedAt: string
  summary: string
}

// SEO data
export interface OffreSeoData {
  slug: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
}

// Analytics data
export interface OffreAnalytics {
  views: number
  uniqueViews: number
  applications: number
  clickThroughRate: number
  avgTimeOnPage: number
  lastViewedAt?: string
}

// Media attachments
export interface OffreMedia {
  logoUrl?: string
  bannerUrl?: string
  videoUrl?: string
  galleryUrls?: string[]
}

// Scheduling configuration
export interface OffreScheduling {
  scheduledPublishDate?: string
  expirationDate?: string
  autoArchiveAfterDays?: number
  reminderBeforeExpirationDays?: number
}

// Template metadata
export interface OffreTemplateData {
  isTemplate: boolean
  templateName?: string
  templateDescription?: string
  sourceTemplateId?: string
  useCount?: number
}

// Full enhanced offer interface
export interface OffreEnhanced {
  // MongoDB ID
  id: string
  _id?: string

  // Basic info (existing fields)
  titre: string
  entreprise: string
  lieu: string
  typeContrat: ContractType | string
  salaire: string
  description: string
  competences: string
  emailContact: string
  categorie: OffreCategorie | string
  statut: OffreStatut

  // Rich content
  descriptionHtml?: string
  responsabilites: string[]
  qualifications: string[]
  avantages: string[]

  // Media
  media?: OffreMedia

  // SEO
  seo?: OffreSeoData

  // Scheduling
  scheduling?: OffreScheduling

  // Template
  template?: OffreTemplateData

  // Analytics (read-only, computed)
  analytics?: OffreAnalytics

  // Collaboration
  comments?: OffreComment[]

  // Version control
  version: number
  history?: OffreHistoryEntry[]

  // Audit fields
  createdBy?: string
  createdByName?: string
  lastEditedBy?: string
  lastEditedByName?: string

  // Timestamps
  datePublication: string
  createdAt: string
  updatedAt: string
}

// Form data for creating/editing offers
export interface OffreFormData {
  // Basic info
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  descriptionHtml?: string
  competences: string
  emailContact: string
  categorie: string

  // Rich content
  responsabilites: string[]
  qualifications: string[]
  avantages: string[]

  // Media URLs
  logoUrl?: string
  bannerUrl?: string
  videoUrl?: string

  // SEO
  slug?: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]

  // Scheduling
  scheduledPublishDate?: string
  expirationDate?: string

  // Template
  isTemplate?: boolean
  templateName?: string
  sourceTemplateId?: string
}

// Template for quick creation
export interface OffreTemplate {
  id: string
  name: string
  description: string
  categorie: string
  typeContrat: string
  defaultData: Partial<OffreFormData>
  useCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Bulk action request
export interface BulkActionRequest {
  offreIds: string[]
  action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'duplicate' | 'changeStatus'
  targetStatus?: OffreStatut
}

// Kanban column
export interface KanbanColumn {
  id: OffreStatut
  title: string
  color: string
  icon: string
  offers: OffreEnhanced[]
  count: number
}

// SEO Score breakdown
export interface SeoScore {
  total: number // 0-100
  titleScore: number
  descriptionScore: number
  keywordsScore: number
  slugScore: number
  suggestions: SeoSuggestion[]
}

export interface SeoSuggestion {
  type: 'error' | 'warning' | 'success'
  field: string
  message: string
  action?: string
}

// Text suggestion for manual AI alternative
export interface TextSuggestion {
  id: string
  category: 'description' | 'responsabilites' | 'qualifications' | 'avantages'
  typeContrat?: string
  categorie?: string
  title: string
  text: string
  tags: string[]
}

// Filter state for offers list
export interface OffreFilterState {
  search: string
  statut: OffreStatut[]
  categorie: string[]
  typeContrat: string[]
  lieu: string[]
  dateRange?: {
    start: string
    end: string
  }
  hasScheduled: boolean | null
  isTemplate: boolean | null
}

// Pagination
export interface OffrePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API Response types
export interface OffresListResponse {
  success: boolean
  offres: OffreEnhanced[]
  pagination: OffrePagination
  filters?: OffreFilterState
}

export interface OffreDetailResponse {
  success: boolean
  offre: OffreEnhanced
}

export interface OffreCreateResponse {
  success: boolean
  offre: OffreEnhanced
  message: string
}

export interface OffreUpdateResponse {
  success: boolean
  offre: OffreEnhanced
  message: string
  versionCreated?: boolean
}

export interface BulkActionResponse {
  success: boolean
  affected: number
  failed: string[]
  message: string
}

// Default values for new offers
export const DEFAULT_OFFRE_VALUES: Partial<OffreFormData> = {
  entreprise: 'Hi-ring',
  emailContact: 'contact@hi-ring.fr',
  responsabilites: [],
  qualifications: [],
  avantages: [],
  keywords: []
}

// Status configuration for UI
export const STATUT_CONFIG: Record<OffreStatut, { label: string; color: string; bgColor: string; icon: string }> = {
  draft: {
    label: 'Brouillon',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'FileText'
  },
  review: {
    label: 'En r\u00e9vision',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'Eye'
  },
  scheduled: {
    label: 'Programm\u00e9e',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'Clock'
  },
  active: {
    label: 'Publi\u00e9e',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'CheckCircle'
  },
  expired: {
    label: 'Expir\u00e9e',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'AlertCircle'
  },
  archived: {
    label: 'Archiv\u00e9e',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'Archive'
  }
}

// Predefined text suggestions for manual "AI" alternative
export const TEXT_SUGGESTIONS: TextSuggestion[] = [
  // Description intros
  {
    id: 'desc-intro-1',
    category: 'description',
    title: 'Introduction entreprise innovante',
    text: 'Rejoignez une entreprise innovante en pleine croissance, reconnue pour son expertise et son environnement de travail stimulant.',
    tags: ['intro', 'startup', 'innovation']
  },
  {
    id: 'desc-intro-2',
    category: 'description',
    title: 'Introduction groupe international',
    text: 'Int\u00e9grez un groupe international leader dans son secteur, offrant des opportunit\u00e9s de carri\u00e8re exceptionnelles et un cadre de travail moderne.',
    tags: ['intro', 'corporate', 'international']
  },
  // Responsabilit\u00e9s
  {
    id: 'resp-dev-1',
    category: 'responsabilites',
    typeContrat: 'CDI',
    categorie: 'Technologie',
    title: 'D\u00e9veloppement logiciel',
    text: 'Concevoir, d\u00e9velopper et maintenir des applications web performantes',
    tags: ['tech', 'dev']
  },
  {
    id: 'resp-dev-2',
    category: 'responsabilites',
    categorie: 'Technologie',
    title: 'Collaboration \u00e9quipe',
    text: 'Collaborer avec les \u00e9quipes produit et design pour d\u00e9finir les sp\u00e9cifications techniques',
    tags: ['tech', 'teamwork']
  },
  {
    id: 'resp-mgmt-1',
    category: 'responsabilites',
    categorie: 'Management',
    title: 'Gestion d\'\u00e9quipe',
    text: 'Manager et d\u00e9velopper une \u00e9quipe de professionnels talentueux',
    tags: ['management', 'leadership']
  },
  // Qualifications
  {
    id: 'qual-exp-1',
    category: 'qualifications',
    title: 'Exp\u00e9rience requise',
    text: 'Minimum 3 ans d\'exp\u00e9rience dans un poste similaire',
    tags: ['experience']
  },
  {
    id: 'qual-diploma-1',
    category: 'qualifications',
    title: 'Formation Bac+5',
    text: 'Dipl\u00f4me Bac+5 (Grande \u00c9cole ou Universit\u00e9) en informatique ou domaine connexe',
    tags: ['education', 'tech']
  },
  {
    id: 'qual-lang-1',
    category: 'qualifications',
    title: 'Langues',
    text: 'Ma\u00eetrise du fran\u00e7ais et de l\'anglais (oral et \u00e9crit)',
    tags: ['languages']
  },
  // Avantages
  {
    id: 'avt-remote-1',
    category: 'avantages',
    title: 'T\u00e9l\u00e9travail',
    text: 'Possibilit\u00e9 de t\u00e9l\u00e9travail 2-3 jours par semaine',
    tags: ['remote', 'flexibility']
  },
  {
    id: 'avt-formation-1',
    category: 'avantages',
    title: 'Formation continue',
    text: 'Budget formation annuel pour d\u00e9velopper vos comp\u00e9tences',
    tags: ['training', 'growth']
  },
  {
    id: 'avt-mutuelle-1',
    category: 'avantages',
    title: 'Mutuelle',
    text: 'Mutuelle d\'entreprise prise en charge \u00e0 100%',
    tags: ['health', 'benefits']
  },
  {
    id: 'avt-tickets-1',
    category: 'avantages',
    title: 'Tickets restaurant',
    text: 'Tickets restaurant d\'une valeur de 10\u20ac/jour',
    tags: ['food', 'benefits']
  },
  {
    id: 'avt-transport-1',
    category: 'avantages',
    title: 'Transport',
    text: 'Remboursement \u00e0 50% du titre de transport',
    tags: ['transport', 'benefits']
  }
]
