// src/app/components/ProcessCard.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  MapPin,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit2,
  Archive,
  UserPlus,
  ChevronRight,
  TrendingUp,
  Target,
  CheckCircle
} from 'lucide-react'
import { ProcessSummary, ProcessType, ProcessStatus } from '../types/process'

interface ProcessCardProps {
  process: ProcessSummary
  onEdit?: (process: ProcessSummary) => void
  onArchive?: (process: ProcessSummary) => void
  onAddCandidates?: (process: ProcessSummary) => void
}

export default function ProcessCard({
  process,
  onEdit,
  onArchive,
  onAddCandidates
}: ProcessCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Get process type badge color
  const getTypeColor = (type: ProcessType) => {
    return type === ProcessType.JOB_SPECIFIC
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200'
  }

  // Get status color
  const getStatusColor = (status: ProcessStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    }
    return priority ? colors[priority as keyof typeof colors] || 'text-gray-500' : 'text-gray-500'
  }

  // Format deadline
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: `En retard de ${Math.abs(diffDays)} jours`, isOverdue: true }
    } else if (diffDays === 0) {
      return { text: "Aujourd'hui", isOverdue: false, isUrgent: true }
    } else if (diffDays === 1) {
      return { text: "Demain", isOverdue: false, isUrgent: true }
    } else if (diffDays <= 7) {
      return { text: `Dans ${diffDays} jours`, isOverdue: false, isUrgent: true }
    } else {
      return { text: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), isOverdue: false }
    }
  }

  const deadlineInfo = formatDeadline(process.deadline)

  // Calculate progress bar segments
  const getProgressSegments = () => {
    const total = process.candidateCount || 0
    if (total === 0) return []

    const segments = [
      { label: 'Présélection', value: process.metrics.inScreening, color: 'bg-yellow-500' },
      { label: 'Entretien', value: process.metrics.inInterview, color: 'bg-blue-500' },
      { label: 'Offre', value: process.metrics.offersSent, color: 'bg-purple-500' },
      { label: 'Embauché', value: process.metrics.hired, color: 'bg-green-500' }
    ]

    return segments.map(segment => ({
      ...segment,
      percentage: (segment.value / total) * 100
    }))
  }

  const progressSegments = getProgressSegments()

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
      {/* Priority Indicator */}
      {process.priority && process.priority !== 'medium' && (
        <div className={`absolute top-0 left-0 w-1 h-full ${
          process.priority === 'urgent' ? 'bg-red-500' :
          process.priority === 'high' ? 'bg-orange-500' :
          'bg-gray-300'
        }`} />
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/processes/${process.id}`}
              className="block hover:text-primary-600 transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {process.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {process.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {process.company}
                </span>
              )}
              {process.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {process.location}
                </span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <Link
                  href={`/admin/processes/${process.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Voir le processus
                </Link>

                {onAddCandidates && (
                  <button
                    onClick={() => {
                      onAddCandidates(process)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter des candidats
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(process)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}

                {onArchive && (
                  <button
                    onClick={() => {
                      onArchive(process)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Type and Status Badges */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(process.type)}`}>
            {process.type === ProcessType.JOB_SPECIFIC ? 'Poste spécifique' : 'Workflow personnalisé'}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
            {process.status.replace(/_/g, ' ')}
          </span>
          {process.priority && process.priority !== 'medium' && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${getPriorityColor(process.priority)}`}>
              <AlertCircle className="w-3 h-3" />
              {process.priority === 'urgent' ? 'Urgent' : process.priority === 'high' ? 'Priorité haute' : 'Priorité basse'}
            </span>
          )}
        </div>
      </div>

      {/* Candidate Avatars */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {process.candidateAvatars.slice(0, 5).map((avatar, index) => (
                avatar ? (
                  <Image
                    key={index}
                    src={avatar}
                    alt={`Candidat ${index + 1}`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  >
                    ?
                  </div>
                )
              ))}
              {process.candidateCount > 5 && (
                <div className="w-8 h-8 rounded-full bg-accent-100 border-2 border-white flex items-center justify-center text-xs font-medium text-accent-700">
                  +{process.candidateCount - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {process.candidateCount} candidat{process.candidateCount > 1 ? 's' : ''}
            </span>
          </div>

          {/* Deadline */}
          {deadlineInfo && (
            <div className={`flex items-center gap-1 text-sm ${
              deadlineInfo.isOverdue ? 'text-red-600' :
              deadlineInfo.isUrgent ? 'text-orange-600' :
              'text-gray-500'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{deadlineInfo.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="px-4 py-3">
        <div className="space-y-3">
          {/* Progress Bar */}
          {process.candidateCount > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span>{process.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full flex">
                  {progressSegments.map((segment, index) => (
                    segment.percentage > 0 && (
                      <div
                        key={index}
                        className={`${segment.color} transition-all duration-300`}
                        style={{ width: `${segment.percentage}%` }}
                        title={`${segment.label}: ${segment.value}`}
                      />
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Présélection:</span>
              <span className="font-medium text-gray-900">{process.metrics.inScreening}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Entretien:</span>
              <span className="font-medium text-gray-900">{process.metrics.inInterview}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Offre:</span>
              <span className="font-medium text-gray-900">{process.metrics.offersSent}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Embauché:</span>
              <span className="font-medium text-gray-900">{process.metrics.hired}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Par {process.ownerName}</span>
            {process.lastActivityAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(process.lastActivityAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          <Link
            href={`/admin/processes/${process.id}`}
            className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors"
          >
            Voir le kanban
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}