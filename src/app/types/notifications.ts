// src/app/types/notifications.ts

export enum NotificationType {
  MENTION = 'mention',
  COMMENT_REPLY = 'comment_reply',
  STATUS_CHANGE = 'status_change',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  TASK_ASSIGNED = 'task_assigned',
  WORKFLOW_FAILED = 'workflow_failed',
  CANDIDATE_ASSIGNED = 'candidate_assigned'
}

export interface Notification {
  id: string
  userId: string // Who receives the notification
  type: NotificationType

  // Notification content
  title: string
  message: string

  // Related entities
  candidateId?: string
  candidateName?: string
  commentId?: string
  taskId?: string
  workflowId?: string

  // Mention-specific data
  mentionedBy?: string // User ID who mentioned
  mentionedByName?: string // User name who mentioned

  // Context
  link?: string // Where to go when clicked
  metadata?: Record<string, any>

  // Status
  isRead: boolean
  isArchived: boolean

  // Timestamps
  createdAt: string
  readAt?: string
}

export interface CreateNotificationDTO {
  userId: string
  type: NotificationType
  title: string
  message: string
  candidateId?: string
  candidateName?: string
  commentId?: string
  taskId?: string
  workflowId?: string
  mentionedBy?: string
  mentionedByName?: string
  link?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  userId: string

  // Email notifications
  emailOnMention: boolean
  emailOnCommentReply: boolean
  emailOnTaskAssigned: boolean
  emailOnCandidateAssigned: boolean

  // In-app notifications
  inAppOnMention: boolean
  inAppOnCommentReply: boolean
  inAppOnTaskAssigned: boolean
  inAppOnCandidateAssigned: boolean

  // Digest settings
  dailyDigest: boolean
  weeklyDigest: boolean

  updatedAt: string
}

// Helper functions
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    [NotificationType.MENTION]: '🔔',
    [NotificationType.COMMENT_REPLY]: '💬',
    [NotificationType.STATUS_CHANGE]: '🔄',
    [NotificationType.INTERVIEW_SCHEDULED]: '📅',
    [NotificationType.TASK_ASSIGNED]: '✅',
    [NotificationType.WORKFLOW_FAILED]: '⚠️',
    [NotificationType.CANDIDATE_ASSIGNED]: '👤'
  }
  return icons[type]
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    [NotificationType.MENTION]: 'bg-blue-100 text-blue-800',
    [NotificationType.COMMENT_REPLY]: 'bg-green-100 text-green-800',
    [NotificationType.STATUS_CHANGE]: 'bg-purple-100 text-purple-800',
    [NotificationType.INTERVIEW_SCHEDULED]: 'bg-yellow-100 text-yellow-800',
    [NotificationType.TASK_ASSIGNED]: 'bg-orange-100 text-orange-800',
    [NotificationType.WORKFLOW_FAILED]: 'bg-red-100 text-red-800',
    [NotificationType.CANDIDATE_ASSIGNED]: 'bg-indigo-100 text-indigo-800'
  }
  return colors[type]
}
