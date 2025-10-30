// src/app/types/workflows.ts

import { CandidateStatus } from './candidates'

export enum WorkflowTriggerType {
  STATUS_CHANGED = 'status_changed',
  TAG_ADDED = 'tag_added',
  TAG_REMOVED = 'tag_removed',
  DAYS_IN_STAGE = 'days_in_stage',
  NO_ACTIVITY = 'no_activity',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  SCORE_THRESHOLD = 'score_threshold',
  MANUAL = 'manual'
}

export enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
  CHANGE_STATUS = 'change_status',
  ASSIGN_USER = 'assign_user',
  CREATE_TASK = 'create_task',
  SEND_NOTIFICATION = 'send_notification',
  ADD_NOTE = 'add_note',
  SCHEDULE_INTERVIEW = 'schedule_interview',
  WEBHOOK = 'webhook'
}

export interface WorkflowTriggerCondition {
  type: WorkflowTriggerType

  // Status change conditions
  fromStatus?: CandidateStatus | CandidateStatus[]
  toStatus?: CandidateStatus | CandidateStatus[]

  // Tag conditions
  tag?: string
  tags?: string[]

  // Time-based conditions
  daysElapsed?: number
  daysInStage?: number

  // Score conditions
  minScore?: number
  maxScore?: number
  scoreType?: 'overall' | 'technical' | 'cultural' | 'communication'

  // Interview conditions
  interviewType?: string

  // Additional filters
  source?: string[]
  experienceLevel?: string[]
  customFields?: Record<string, any>
}

export interface WorkflowAction {
  type: WorkflowActionType

  // Email action
  emailTemplateId?: string
  emailSubject?: string
  emailBody?: string
  emailTo?: 'candidate' | 'assigned_user' | 'custom'
  emailCustomRecipient?: string

  // Tag action
  tagName?: string
  tagNames?: string[]

  // Status action
  newStatus?: CandidateStatus

  // Assignment action
  assignToUserId?: string
  assignmentRule?: 'round_robin' | 'least_loaded' | 'specific_user'

  // Task action
  taskTitle?: string
  taskDescription?: string
  taskDueInDays?: number
  taskAssignTo?: string
  taskPriority?: 'low' | 'medium' | 'high' | 'urgent'

  // Note action
  noteContent?: string
  noteIsPrivate?: boolean

  // Notification action
  notificationMessage?: string
  notifyUsers?: string[]

  // Webhook action
  webhookUrl?: string
  webhookMethod?: 'GET' | 'POST' | 'PUT'
  webhookPayload?: Record<string, any>
  webhookHeaders?: Record<string, string>

  // Delay before executing (in minutes)
  delayMinutes?: number

  // Conditional execution
  condition?: string // JavaScript expression or simple condition
}

export interface Workflow {
  id: string
  name: string
  description?: string

  // Trigger configuration
  trigger: WorkflowTriggerCondition

  // Actions to execute
  actions: WorkflowAction[]

  // Workflow metadata
  isActive: boolean
  priority: number // Higher priority executes first

  // Execution tracking
  executionCount: number
  lastExecutedAt?: string
  successCount: number
  failureCount: number

  // Schedule (for recurring workflows)
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    time?: string // HH:MM format
    dayOfWeek?: number // 0-6 (Sunday-Saturday)
    dayOfMonth?: number // 1-31
  }

  // Limits
  maxExecutionsPerDay?: number
  maxExecutionsPerCandidate?: number

  // Audit
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string

  // Testing
  testMode?: boolean // If true, log but don't execute
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string

  candidateId: string
  candidateName: string

  trigger: WorkflowTriggerCondition
  actions: WorkflowAction[]

  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

  startedAt: string
  completedAt?: string

  results: {
    actionIndex: number
    actionType: WorkflowActionType
    status: 'success' | 'failed' | 'skipped'
    message?: string
    error?: string
    metadata?: Record<string, any>
  }[]

  error?: string

  // Metadata
  executedBy?: string // 'system' or user ID
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'onboarding' | 'follow_up' | 'interview' | 'offer' | 'rejection' | 'engagement' | 'custom'
  icon: string

  // Pre-configured workflow
  trigger: WorkflowTriggerCondition
  actions: WorkflowAction[]

  // Customization hints
  requiredFields: string[]
  recommendedSettings?: Record<string, any>
}

// SLA (Service Level Agreement) Tracking
export interface SLARule {
  id: string
  name: string
  description?: string

  // Which stage this applies to
  stage: CandidateStatus

  // Time limits
  targetDays: number // Target time to complete this stage
  warningDays: number // When to send warning

  // Actions on SLA breach
  onWarning?: WorkflowAction[]
  onBreach?: WorkflowAction[]

  // Exclusions
  excludeWeekends?: boolean
  excludeHolidays?: boolean

  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SLAStatus {
  candidateId: string
  stage: CandidateStatus
  enteredStageAt: string

  slaRule: SLARule

  daysInStage: number
  remainingDays: number

  status: 'on_track' | 'at_risk' | 'breached'
  breachedAt?: string

  warningsSent: number
  breachNotificationSent: boolean
}

// Auto-assignment rules
export interface AssignmentRule {
  id: string
  name: string
  description?: string

  // Conditions to match candidates
  conditions: {
    source?: string[]
    experienceLevel?: string[]
    skills?: string[]
    location?: string[]
    tags?: string[]
    customFields?: Record<string, any>
  }

  // Assignment strategy
  strategy: 'round_robin' | 'least_loaded' | 'skill_match' | 'specific_user'

  // User pool for assignment
  assignToUsers?: string[] // User IDs
  specificUserId?: string

  // Load balancing
  maxCandidatesPerUser?: number

  // Priority
  priority: number

  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Task management
export interface Task {
  id: string

  // Related entities
  candidateId?: string
  candidateName?: string
  workflowId?: string

  // Task details
  title: string
  description?: string
  type: 'follow_up' | 'review' | 'interview' | 'call' | 'email' | 'document' | 'custom'

  // Assignment
  assignedTo: string
  assignedToName: string

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // Dates
  dueDate: string
  completedAt?: string

  // Reminders
  reminderSent?: boolean
  reminderSentAt?: string

  // Notes
  notes?: string

  createdBy: string
  createdAt: string
  updatedAt: string
}

// Workflow statistics
export interface WorkflowStatistics {
  workflowId: string
  workflowName: string

  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number

  averageExecutionTime: number // seconds

  lastExecutedAt?: string

  // Action-specific stats
  actionStats: {
    actionType: WorkflowActionType
    executions: number
    successes: number
    failures: number
  }[]

  // Time-based stats
  executionsByDay: {
    date: string
    count: number
  }[]

  // Impact metrics
  candidatesAffected: number
  emailsSent: number
  tasksCreated: number
  statusChanges: number
}

// Default workflow templates
export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Email de Bienvenue',
    description: 'Envoyer automatiquement un email de bienvenue quand un candidat est contacté',
    category: 'onboarding',
    icon: 'HandWaving',
    trigger: {
      type: WorkflowTriggerType.STATUS_CHANGED,
      toStatus: CandidateStatus.CONTACTED
    },
    actions: [
      {
        type: WorkflowActionType.SEND_EMAIL,
        emailTo: 'candidate',
        emailSubject: 'Bienvenue chez {{companyName}}',
        emailBody: 'Bonjour {{firstName}},\n\nNous avons bien reçu votre candidature...'
      }
    ],
    requiredFields: ['emailTemplateId']
  },
  {
    id: 'interview-reminder',
    name: 'Rappel d\'Entretien',
    description: 'Envoyer un rappel 24h avant un entretien',
    category: 'interview',
    icon: 'Bell',
    trigger: {
      type: WorkflowTriggerType.INTERVIEW_SCHEDULED
    },
    actions: [
      {
        type: WorkflowActionType.SEND_EMAIL,
        emailTo: 'candidate',
        delayMinutes: -1440, // 24 hours before
        emailSubject: 'Rappel: Entretien demain'
      }
    ],
    requiredFields: ['emailTemplateId']
  },
  {
    id: 'stale-candidate-alert',
    name: 'Alerte Candidat Inactif',
    description: 'Notifier le recruteur si aucune activité depuis 7 jours',
    category: 'follow_up',
    icon: 'Clock',
    trigger: {
      type: WorkflowTriggerType.NO_ACTIVITY,
      daysElapsed: 7
    },
    actions: [
      {
        type: WorkflowActionType.SEND_NOTIFICATION,
        notificationMessage: 'Le candidat {{fullName}} n\'a eu aucune activité depuis 7 jours'
      },
      {
        type: WorkflowActionType.ADD_TAG,
        tagName: 'Follow-up Required'
      }
    ],
    requiredFields: []
  },
  {
    id: 'high-score-priority',
    name: 'Candidat Haute Priorité',
    description: 'Marquer comme prioritaire les candidats avec score > 4.5',
    category: 'engagement',
    icon: 'Star',
    trigger: {
      type: WorkflowTriggerType.SCORE_THRESHOLD,
      minScore: 4.5
    },
    actions: [
      {
        type: WorkflowActionType.ADD_TAG,
        tagName: 'High Priority'
      },
      {
        type: WorkflowActionType.SEND_NOTIFICATION,
        notificationMessage: 'Candidat exceptionnel: {{fullName}} (Score: {{score}})'
      }
    ],
    requiredFields: []
  },
  {
    id: 'sla-warning',
    name: 'Alerte SLA',
    description: 'Notifier si un candidat reste trop longtemps dans une étape',
    category: 'follow_up',
    icon: 'AlertTriangle',
    trigger: {
      type: WorkflowTriggerType.DAYS_IN_STAGE,
      daysInStage: 7
    },
    actions: [
      {
        type: WorkflowActionType.SEND_NOTIFICATION,
        notificationMessage: 'ALERTE SLA: {{fullName}} est en {{stage}} depuis {{daysInStage}} jours'
      },
      {
        type: WorkflowActionType.CREATE_TASK,
        taskTitle: 'Revue urgente du candidat {{fullName}}',
        taskPriority: 'high',
        taskDueInDays: 1
      }
    ],
    requiredFields: []
  }
]

// Helper functions
export function getWorkflowTriggerLabel(type: WorkflowTriggerType): string {
  const labels: Record<WorkflowTriggerType, string> = {
    [WorkflowTriggerType.STATUS_CHANGED]: 'Changement de statut',
    [WorkflowTriggerType.TAG_ADDED]: 'Tag ajouté',
    [WorkflowTriggerType.TAG_REMOVED]: 'Tag retiré',
    [WorkflowTriggerType.DAYS_IN_STAGE]: 'Jours dans l\'étape',
    [WorkflowTriggerType.NO_ACTIVITY]: 'Aucune activité',
    [WorkflowTriggerType.INTERVIEW_SCHEDULED]: 'Entretien planifié',
    [WorkflowTriggerType.INTERVIEW_COMPLETED]: 'Entretien terminé',
    [WorkflowTriggerType.SCORE_THRESHOLD]: 'Seuil de score atteint',
    [WorkflowTriggerType.MANUAL]: 'Déclenchement manuel'
  }
  return labels[type]
}

export function getWorkflowActionLabel(type: WorkflowActionType): string {
  const labels: Record<WorkflowActionType, string> = {
    [WorkflowActionType.SEND_EMAIL]: 'Envoyer un email',
    [WorkflowActionType.ADD_TAG]: 'Ajouter un tag',
    [WorkflowActionType.REMOVE_TAG]: 'Retirer un tag',
    [WorkflowActionType.CHANGE_STATUS]: 'Changer le statut',
    [WorkflowActionType.ASSIGN_USER]: 'Assigner un utilisateur',
    [WorkflowActionType.CREATE_TASK]: 'Créer une tâche',
    [WorkflowActionType.SEND_NOTIFICATION]: 'Envoyer une notification',
    [WorkflowActionType.ADD_NOTE]: 'Ajouter une note',
    [WorkflowActionType.SCHEDULE_INTERVIEW]: 'Planifier un entretien',
    [WorkflowActionType.WEBHOOK]: 'Appeler un webhook'
  }
  return labels[type]
}

export function getWorkflowActionIcon(type: WorkflowActionType): string {
  const icons: Record<WorkflowActionType, string> = {
    [WorkflowActionType.SEND_EMAIL]: '📧',
    [WorkflowActionType.ADD_TAG]: '🏷️',
    [WorkflowActionType.REMOVE_TAG]: '🗑️',
    [WorkflowActionType.CHANGE_STATUS]: '🔄',
    [WorkflowActionType.ASSIGN_USER]: '👤',
    [WorkflowActionType.CREATE_TASK]: '✅',
    [WorkflowActionType.SEND_NOTIFICATION]: '🔔',
    [WorkflowActionType.ADD_NOTE]: '📝',
    [WorkflowActionType.SCHEDULE_INTERVIEW]: '📅',
    [WorkflowActionType.WEBHOOK]: '🔗'
  }
  return icons[type]
}
