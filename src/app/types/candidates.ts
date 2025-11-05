// src/app/types/candidates.ts

import { LinkedInData } from './linkedin'

export enum CandidateStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  SCREENING = 'screening',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  HIRED = 'hired',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
  ARCHIVED = 'archived'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive'
}

export enum AvailabilityStatus {
  IMMEDIATE = 'immediate',
  TWO_WEEKS = 'two_weeks',
  ONE_MONTH = 'one_month',
  TWO_MONTHS = 'two_months',
  THREE_MONTHS = 'three_months',
  NEGOTIABLE = 'negotiable',
  NOT_AVAILABLE = 'not_available'
}

export enum ContractPreference {
  CDI = 'cdi',
  CDD = 'cdd',
  FREELANCE = 'freelance',
  STAGE = 'stage',
  ALTERNANCE = 'alternance',
  INTERIM = 'interim',
  ANY = 'any'
}

export interface CandidateSkill {
  name: string
  level: SkillLevel
  yearsOfExperience?: number
  lastUsed?: string
  certified?: boolean
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string // undefined means current
  isCurrent?: boolean
  description?: string
  achievements?: string[]
  technologies?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  location?: string
  startDate: string
  endDate?: string
  grade?: string
  description?: string
}

export interface Language {
  language: string
  level: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic'
  certifications?: string[]
}

export interface CandidateNote {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  isPrivate: boolean
  tags?: string[]
}

export interface CandidateActivity {
  id: string
  type: 'status_change' | 'note_added' | 'interview_scheduled' | 'document_uploaded' | 'email_sent' | 'call_made' | 'application_submitted' | 'profile_updated' | 'quick_score_added' | 'process_added' | 'process_removed' | 'process_stage_changed'
  description: string
  userId: string
  userName: string
  timestamp: string
  metadata?: Record<string, any>
  // Process-related fields
  processId?: string
  processName?: string
  fromStage?: string
  toStage?: string
}

// Quick Score - Lightweight alternative to full interview feedback
export interface QuickScore {
  id: string
  scoredBy: string // user ID
  scoredByName: string
  scoredAt: string

  // Simple 1-5 rating
  overallRating: 1 | 2 | 3 | 4 | 5

  // Optional category ratings
  technicalRating?: 1 | 2 | 3 | 4 | 5
  cultureFitRating?: 1 | 2 | 3 | 4 | 5
  communicationRating?: 1 | 2 | 3 | 4 | 5

  // Quick notes (max 200 chars)
  quickNotes?: string

  // Tags for quick categorization
  tags?: string[] // e.g., ["Strong technical", "Culture fit", "Needs work"]

  // Thumbs up/down for binary decision
  thumbs?: 'up' | 'down' | 'neutral'
}

export enum HiringRecommendation {
  STRONG_HIRE = 'strong_hire',
  HIRE = 'hire',
  MAYBE = 'maybe',
  NO_HIRE = 'no_hire',
  STRONG_NO_HIRE = 'strong_no_hire'
}

export interface InterviewFeedback {
  interviewerId: string
  interviewerName: string
  submittedAt: string

  // Overall assessment
  recommendation: HiringRecommendation
  summary: string

  // Ratings (1-5 scale)
  ratings: {
    technical: number
    communication: number
    problemSolving: number
    cultureFit: number
    motivation: number
    leadership?: number
    teamwork: number
  }

  // Structured feedback
  strengths: string[]
  weaknesses: string[]
  areasForImprovement: string[]

  // Specific assessments
  technicalSkillsAssessment?: {
    skill: string
    rating: number // 1-5
    notes?: string
  }[]

  // Questions asked and responses
  questionResponses?: {
    question: string
    response: string
    rating?: number
  }[]

  // Additional notes
  redFlags?: string[]
  standoutMoments?: string[]
  additionalComments?: string

  // Would hire again
  wouldHireAgain: boolean
  confidenceLevel: number // 1-5, how confident in the assessment
}

export interface InterviewSchedule {
  id: string
  jobId?: string
  jobTitle?: string
  scheduledDate: string
  duration: number // in minutes
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'hr'
  interviewers: string[] // user IDs
  interviewerNames?: string[] // for display
  location?: string
  meetingLink?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

  // Enhanced feedback system
  feedback: InterviewFeedback[] // Multiple feedbacks from different interviewers

  // Aggregated scores (calculated from all feedback)
  aggregatedRating?: number // 1-5
  aggregatedRecommendation?: HiringRecommendation

  // Legacy fields (for backwards compatibility)
  legacyFeedback?: string
  legacyRating?: number // 1-5

  // Reminder/notification tracking
  feedbackRequestSent?: boolean
  feedbackRequestSentAt?: string
  feedbackDeadline?: string
}

export interface SalaryExpectation {
  min?: number
  max?: number
  currency: string
  frequency: 'hourly' | 'daily' | 'monthly' | 'yearly'
  negotiable: boolean
  benefits?: string[]
}

export interface Candidate {
  id: string

  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone?: string
  alternatePhone?: string
  dateOfBirth?: string
  nationality?: string

  // Address
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }

  // Professional Information
  currentPosition?: string
  currentCompany?: string
  experienceLevel: ExperienceLevel
  totalExperience?: number // years

  // Status & Pipeline
  status: CandidateStatus
  source: string // 'website' | 'linkedin' | 'referral' | 'agency' | etc.
  referredBy?: string

  // Skills & Expertise
  skills: CandidateSkill[]
  primarySkills: string[] // top 3-5 skills
  languages: Language[]

  // Experience & Education
  workExperience: WorkExperience[]
  education: Education[]
  certifications?: {
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialId?: string
    url?: string
  }[]

  // Job Preferences
  desiredPosition?: string[]
  contractPreference: ContractPreference[]
  availability: AvailabilityStatus
  willingToRelocate: boolean
  remoteWorkPreference: 'remote' | 'hybrid' | 'onsite' | 'flexible'

  // Salary
  salaryExpectation?: SalaryExpectation

  // Documents & Media
  resumeId?: string
  coverLetterId?: string
  profilePictureUrl?: string // URL to profile picture
  portfolioUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string

  // LinkedIn Integration
  linkedinData?: LinkedInData

  // Interviews & Applications
  interviews: InterviewSchedule[]
  applicationIds: string[] // Reference to applications

  // Process Management
  processIds?: string[] // Array of process IDs this candidate is part of
  currentProcesses?: {
    processId: string
    processName: string
    stageId: string
    stageName: string
    enteredStageAt: string
    daysInStage?: number
  }[] // Current active processes with stage info
  processHistory?: {
    processId: string
    processName: string
    action: 'added' | 'removed' | 'stage_changed' | 'completed'
    stageId?: string
    stageName?: string
    timestamp: string
    userId: string
    userName: string
    notes?: string
  }[] // Historical record of all process assignments

  // Notes & Activity
  notes: CandidateNote[]
  activities: CandidateActivity[]
  tags: string[]

  // Ratings & Assessments
  overallRating?: number // 1-5 (calculated from quickScores + interview feedback)
  technicalRating?: number
  culturalFitRating?: number
  communicationRating?: number

  // Quick Scores - lightweight evaluations
  quickScores?: QuickScore[]

  // Metadata
  assignedTo?: string // recruiter/user ID
  assignedToName?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastContactedAt?: string

  // Privacy & Compliance
  gdprConsent: boolean
  marketingConsent: boolean
  isActive: boolean
  isArchived: boolean

  // Custom fields for flexibility
  customFields?: Record<string, any>
}

export interface CreateCandidateDTO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  currentPosition?: string
  experienceLevel: ExperienceLevel
  skills?: CandidateSkill[]
  source: string
  availability?: AvailabilityStatus
  contractPreference?: ContractPreference[]
  status?: CandidateStatus
  assignedTo?: string
}

export interface UpdateCandidateDTO {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  alternatePhone?: string
  address?: Candidate['address']
  currentPosition?: string
  currentCompany?: string
  experienceLevel?: ExperienceLevel
  totalExperience?: number
  status?: CandidateStatus
  skills?: CandidateSkill[]
  primarySkills?: string[]
  languages?: Language[]
  workExperience?: WorkExperience[]
  education?: Education[]
  certifications?: Candidate['certifications']
  desiredPosition?: string[]
  contractPreference?: ContractPreference[]
  availability?: AvailabilityStatus
  willingToRelocate?: boolean
  remoteWorkPreference?: Candidate['remoteWorkPreference']
  salaryExpectation?: SalaryExpectation
  portfolioUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  websiteUrl?: string
  linkedinData?: LinkedInData
  tags?: string[]
  overallRating?: number
  technicalRating?: number
  culturalFitRating?: number
  communicationRating?: number
  assignedTo?: string
  gdprConsent?: boolean
  marketingConsent?: boolean
  isActive?: boolean
  customFields?: Record<string, any>
  // Process-related updates
  processIds?: string[]
  currentProcesses?: Candidate['currentProcesses']
}

export interface CandidateSearchFilters {
  search?: string
  status?: CandidateStatus[]
  experienceLevel?: ExperienceLevel[]
  skills?: string[]
  availability?: AvailabilityStatus[]
  contractPreference?: ContractPreference[]
  minExperience?: number
  maxExperience?: number
  location?: string
  remoteWorkPreference?: string[]
  assignedTo?: string
  source?: string[]
  tags?: string[]
  minRating?: number
  isActive?: boolean
  isArchived?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'rating' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Status flow helpers
export const CANDIDATE_STATUS_FLOW: Record<CandidateStatus, CandidateStatus[]> = {
  [CandidateStatus.NEW]: [CandidateStatus.CONTACTED, CandidateStatus.REJECTED, CandidateStatus.ARCHIVED],
  [CandidateStatus.CONTACTED]: [CandidateStatus.SCREENING, CandidateStatus.REJECTED, CandidateStatus.ON_HOLD],
  [CandidateStatus.SCREENING]: [CandidateStatus.INTERVIEW_SCHEDULED, CandidateStatus.REJECTED, CandidateStatus.ON_HOLD],
  [CandidateStatus.INTERVIEW_SCHEDULED]: [CandidateStatus.INTERVIEW_COMPLETED, CandidateStatus.REJECTED, CandidateStatus.ON_HOLD],
  [CandidateStatus.INTERVIEW_COMPLETED]: [CandidateStatus.OFFER_SENT, CandidateStatus.REJECTED, CandidateStatus.ON_HOLD],
  [CandidateStatus.OFFER_SENT]: [CandidateStatus.OFFER_ACCEPTED, CandidateStatus.OFFER_REJECTED, CandidateStatus.ON_HOLD],
  [CandidateStatus.OFFER_ACCEPTED]: [CandidateStatus.HIRED],
  [CandidateStatus.OFFER_REJECTED]: [CandidateStatus.ARCHIVED],
  [CandidateStatus.HIRED]: [CandidateStatus.ARCHIVED],
  [CandidateStatus.REJECTED]: [CandidateStatus.ARCHIVED],
  [CandidateStatus.ON_HOLD]: [CandidateStatus.CONTACTED, CandidateStatus.SCREENING, CandidateStatus.REJECTED],
  [CandidateStatus.ARCHIVED]: []
}

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  [CandidateStatus.NEW]: 'Nouveau',
  [CandidateStatus.CONTACTED]: 'Contacté',
  [CandidateStatus.SCREENING]: 'Présélection',
  [CandidateStatus.INTERVIEW_SCHEDULED]: 'Entretien Planifié',
  [CandidateStatus.INTERVIEW_COMPLETED]: 'Entretien Terminé',
  [CandidateStatus.OFFER_SENT]: 'Offre Envoyée',
  [CandidateStatus.OFFER_ACCEPTED]: 'Offre Acceptée',
  [CandidateStatus.OFFER_REJECTED]: 'Offre Refusée',
  [CandidateStatus.HIRED]: 'Embauché',
  [CandidateStatus.REJECTED]: 'Rejeté',
  [CandidateStatus.ON_HOLD]: 'En Attente',
  [CandidateStatus.ARCHIVED]: 'Archivé'
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  [ExperienceLevel.ENTRY]: 'Débutant',
  [ExperienceLevel.JUNIOR]: 'Junior (1-3 ans)',
  [ExperienceLevel.MID]: 'Confirmé (3-5 ans)',
  [ExperienceLevel.SENIOR]: 'Senior (5-10 ans)',
  [ExperienceLevel.LEAD]: 'Lead (10+ ans)',
  [ExperienceLevel.EXECUTIVE]: 'Executive'
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.BEGINNER]: 'Débutant',
  [SkillLevel.INTERMEDIATE]: 'Intermédiaire',
  [SkillLevel.ADVANCED]: 'Avancé',
  [SkillLevel.EXPERT]: 'Expert'
}

export const HIRING_RECOMMENDATION_LABELS: Record<HiringRecommendation, string> = {
  [HiringRecommendation.STRONG_HIRE]: 'Forte Recommandation',
  [HiringRecommendation.HIRE]: 'Recommandé',
  [HiringRecommendation.MAYBE]: 'Peut-être',
  [HiringRecommendation.NO_HIRE]: 'Non Recommandé',
  [HiringRecommendation.STRONG_NO_HIRE]: 'Fortement Déconseillé'
}

export const HIRING_RECOMMENDATION_COLORS: Record<HiringRecommendation, string> = {
  [HiringRecommendation.STRONG_HIRE]: 'bg-green-100 text-green-800 border-green-300',
  [HiringRecommendation.HIRE]: 'bg-green-50 text-green-700 border-green-200',
  [HiringRecommendation.MAYBE]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [HiringRecommendation.NO_HIRE]: 'bg-red-50 text-red-700 border-red-200',
  [HiringRecommendation.STRONG_NO_HIRE]: 'bg-red-100 text-red-800 border-red-300'
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewSchedule['type'], string> = {
  phone: '📞 Téléphonique',
  video: '🎥 Visioconférence',
  in_person: '🏢 En Présentiel',
  technical: '💻 Technique',
  hr: '👔 RH'
}
