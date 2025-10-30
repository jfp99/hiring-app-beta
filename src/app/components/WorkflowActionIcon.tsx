import {
  Mail,
  Tag,
  Trash2,
  RefreshCw,
  UserPlus,
  CheckSquare,
  Bell,
  FileText,
  Calendar,
  Link2,
  LucideIcon
} from 'lucide-react'
import { WorkflowActionType } from '@/app/types/workflows'

interface WorkflowActionIconProps {
  type: WorkflowActionType
  className?: string
}

const iconMap: Record<WorkflowActionType, LucideIcon> = {
  [WorkflowActionType.SEND_EMAIL]: Mail,
  [WorkflowActionType.ADD_TAG]: Tag,
  [WorkflowActionType.REMOVE_TAG]: Trash2,
  [WorkflowActionType.CHANGE_STATUS]: RefreshCw,
  [WorkflowActionType.ASSIGN_USER]: UserPlus,
  [WorkflowActionType.CREATE_TASK]: CheckSquare,
  [WorkflowActionType.SEND_NOTIFICATION]: Bell,
  [WorkflowActionType.ADD_NOTE]: FileText,
  [WorkflowActionType.SCHEDULE_INTERVIEW]: Calendar,
  [WorkflowActionType.WEBHOOK]: Link2
}

export function WorkflowActionIcon({ type, className = 'w-4 h-4' }: WorkflowActionIconProps) {
  const Icon = iconMap[type]
  return <Icon className={className} />
}

// Export the icon map for other uses
export function getWorkflowActionIconComponent(type: WorkflowActionType): LucideIcon {
  return iconMap[type]
}
