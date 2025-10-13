// src/app/types/comments.ts

export interface Comment {
  id: string
  candidateId: string
  content: string
  authorId: string
  authorName: string
  authorEmail: string
  createdAt: string
  updatedAt?: string
  isEdited: boolean

  // Threading support (for future enhancement)
  parentCommentId?: string | null

  // Mentions support
  mentions?: string[] // Array of user IDs or emails mentioned in the comment

  // Metadata
  metadata?: {
    editHistory?: {
      editedAt: string
      editedBy: string
    }[]
    attachments?: {
      id: string
      name: string
      type: string
      url: string
      size: number
    }[]
  }
}

export interface CreateCommentInput {
  candidateId: string
  content: string
  parentCommentId?: string | null
  mentions?: string[]
}

export interface UpdateCommentInput {
  content: string
  mentions?: string[]
}

// Response types
export interface CommentResponse {
  success: boolean
  comment?: Comment
  error?: string
}

export interface CommentsListResponse {
  success: boolean
  comments?: Comment[]
  total?: number
  error?: string
}

// Helper functions
export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'À l\'instant'
  } else if (minutes < 60) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (days < 7) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function extractMentions(content: string): string[] {
  // Extract @mentions from content
  // Format: @[email] or @[name]
  const mentionRegex = /@\[([^\]]+)\]/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}

export function formatCommentContent(content: string): string {
  // Format mentions in content for display
  // Convert @[email] to highlighted mentions
  return content.replace(/@\[([^\]]+)\]/g, '<span class="mention">@$1</span>')
}
