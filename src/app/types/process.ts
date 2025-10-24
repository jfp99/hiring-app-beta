// src/app/types/process.ts

import { CandidateStatus } from './candidates'

export enum ProcessType {
  JOB_SPECIFIC = 'job_specific',
  CUSTOM_WORKFLOW = 'custom_workflow'
}

export enum ProcessStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export interface ProcessStage {
  id: string
  name: string
  order: number
  color: string
  description?: string
  candidateIds: string[]
  candidateCount: number
  // Stage-specific SLA in hours
  slaHours?: number
  // Custom actions available at this stage
  actions?: string[]
}

export interface ProcessMetrics {
  totalCandidates: number
  activeStages: number
  avgTimeInProcess: number // in days
  completionRate: number // percentage
  currentByStage: Record<string, number>
  // Conversion metrics between stages
  stageConversion?: Record<string, number>
  overdueCount: number
  onTrackCount: number
}

export interface ProcessActivity {
  id: string
  type: 'candidate_added' | 'candidate_removed' | 'stage_changed' | 'status_changed' | 'note_added' | 'deadline_updated'
  timestamp: string
  userId: string
  userName: string
  details: Record<string, any>
  candidateId?: string
  candidateName?: string
  fromStage?: string
  toStage?: string
}

export interface Process {
  // Core fields
  _id?: string
  id: string
  name: string
  type: ProcessType
  status: ProcessStatus

  // Process details
  description?: string
  location?: string
  company?: string
  client?: string
  department?: string
  jobId?: string // Reference to job offer if job-specific
  jobTitle?: string

  // Timeline
  startDate: string
  deadline?: string
  completedDate?: string
  estimatedDuration?: number // in days

  // Stages configuration
  stages: ProcessStage[]
  defaultStageId?: string // Where new candidates start

  // Candidates
  candidateIds: string[]
  candidateCount: number
  maxCandidates?: number

  // Team
  ownerId: string
  ownerName: string
  teamMemberIds?: string[]
  teamMemberNames?: string[]

  // Requirements (for job-specific processes)
  requiredSkills?: string[]
  experienceLevel?: string
  contractType?: string
  salaryRange?: {
    min: number
    max: number
    currency: string
  }

  // Metrics
  metrics?: ProcessMetrics

  // Activity tracking
  activities: ProcessActivity[]
  lastActivityAt?: string

  // Custom fields
  customFields?: Record<string, any>
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'

  // Metadata
  createdAt: string
  createdBy: string
  createdByName: string
  updatedAt: string
  updatedBy?: string
  updatedByName?: string

  // Settings
  notifications?: {
    onCandidateAdded: boolean
    onStageChange: boolean
    onDeadlineApproaching: boolean
    onSlaBreached: boolean
  }

  // Integration
  workflowIds?: string[] // Associated automated workflows
  emailTemplateIds?: string[] // Email templates for this process

  // Archive
  isArchived: boolean
  archivedAt?: string
  archivedBy?: string
}

// Default pipeline stages (can be customized per process)
export const DEFAULT_PROCESS_STAGES: Omit<ProcessStage, 'candidateIds' | 'candidateCount'>[] = [
  {
    id: 'new',
    name: 'Nouveaux',
    order: 1,
    color: '#3366cc',
    description: 'Candidats nouvellement ajoutés au processus'
  },
  {
    id: 'screening',
    name: 'Présélection',
    order: 2,
    color: '#dc3912',
    description: 'Évaluation initiale des candidatures'
  },
  {
    id: 'interview_1',
    name: 'Entretien RH',
    order: 3,
    color: '#ff9900',
    description: 'Premier entretien avec les RH'
  },
  {
    id: 'interview_2',
    name: 'Entretien Technique',
    order: 4,
    color: '#109618',
    description: 'Évaluation des compétences techniques'
  },
  {
    id: 'interview_final',
    name: 'Entretien Final',
    order: 5,
    color: '#990099',
    description: 'Entretien avec les décideurs'
  },
  {
    id: 'offer',
    name: 'Offre',
    order: 6,
    color: '#0099c6',
    description: 'Offre envoyée au candidat'
  },
  {
    id: 'hired',
    name: 'Embauché',
    order: 7,
    color: '#22aa00',
    description: 'Candidat embauché'
  },
  {
    id: 'rejected',
    name: 'Refusé',
    order: 8,
    color: '#dc3912',
    description: 'Candidature non retenue'
  }
]

// Custom workflow stage templates
export const CUSTOM_WORKFLOW_TEMPLATES = {
  talent_pool: [
    { id: 'available', name: 'Disponible', order: 1, color: '#3366cc' },
    { id: 'contacted', name: 'Contacté', order: 2, color: '#ff9900' },
    { id: 'interested', name: 'Intéressé', order: 3, color: '#109618' },
    { id: 'not_interested', name: 'Non intéressé', order: 4, color: '#dc3912' }
  ],
  internship: [
    { id: 'application', name: 'Candidature', order: 1, color: '#3366cc' },
    { id: 'school_validation', name: 'Validation École', order: 2, color: '#ff9900' },
    { id: 'interview', name: 'Entretien', order: 3, color: '#109618' },
    { id: 'accepted', name: 'Accepté', order: 4, color: '#22aa00' },
    { id: 'rejected', name: 'Refusé', order: 5, color: '#dc3912' }
  ],
  executive_search: [
    { id: 'identified', name: 'Identifié', order: 1, color: '#3366cc' },
    { id: 'approached', name: 'Approché', order: 2, color: '#ff9900' },
    { id: 'evaluating', name: 'En évaluation', order: 3, color: '#990099' },
    { id: 'client_interview', name: 'Entretien Client', order: 4, color: '#109618' },
    { id: 'negotiation', name: 'Négociation', order: 5, color: '#0099c6' },
    { id: 'closed', name: 'Finalisé', order: 6, color: '#22aa00' }
  ]
}

// Helper type for creating new processes
export interface CreateProcessDto {
  name: string
  type: ProcessType
  description?: string
  location?: string
  company?: string
  client?: string
  department?: string
  jobId?: string
  startDate?: string
  deadline?: string
  stages?: Omit<ProcessStage, 'candidateIds' | 'candidateCount'>[]
  candidateIds?: string[]
  teamMemberIds?: string[]
  requiredSkills?: string[]
  experienceLevel?: string
  contractType?: string
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Helper type for updating processes
export interface UpdateProcessDto extends Partial<CreateProcessDto> {
  status?: ProcessStatus
  completedDate?: string
  metrics?: ProcessMetrics
}

// Type for process list/card display
export interface ProcessSummary {
  id: string
  name: string
  type: ProcessType
  status: ProcessStatus
  location?: string
  company?: string
  client?: string
  deadline?: string
  candidateCount: number
  candidateAvatars: string[] // First 5 candidate profile pictures
  metrics: {
    inScreening: number
    inInterview: number
    offersSent: number
    hired: number
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  progress: number // Percentage of completion
  ownerName: string
  lastActivityAt?: string
  daysRemaining?: number
  isOverdue: boolean
}

// Type for candidate assignment to process
export interface ProcessAssignment {
  processId: string
  processName: string
  candidateId: string
  candidateName: string
  stageId: string
  stageName: string
  assignedAt: string
  assignedBy: string
  assignedByName: string
  notes?: string
}

// Type for bulk operations
export interface BulkProcessOperation {
  type: 'add_candidates' | 'remove_candidates' | 'move_stage' | 'archive' | 'activate'
  processIds?: string[]
  candidateIds: string[]
  targetStageId?: string
  notes?: string
}