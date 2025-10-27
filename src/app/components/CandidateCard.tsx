// src/app/components/CandidateCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Candidate, CandidateStatus, EXPERIENCE_LEVEL_LABELS } from '@/app/types/candidates'
import { TagList } from '@/app/components/Tag'
import {
  MoreVertical,
  Eye,
  UserPlus,
  Edit2,
  Archive,
  Mail,
  User
} from 'lucide-react'

interface CandidateCardProps {
  candidate: Candidate
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onAddToProcess?: (candidate: Candidate) => void
  onEdit?: (candidate: Candidate) => void
  onArchive?: (candidate: Candidate) => void
  showActions?: boolean
  showProcessInfo?: boolean
}

// Generate initials avatar
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Generate color from name for consistent avatar colors
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// Get status color and label
function getStatusColor(status: CandidateStatus): string {
  const colors: Record<CandidateStatus, string> = {
    [CandidateStatus.NEW]: 'bg-blue-100 text-blue-800 border-blue-200',
    [CandidateStatus.CONTACTED]: 'bg-purple-100 text-purple-800 border-purple-200',
    [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 text-orange-800 border-orange-200',
    [CandidateStatus.INTERVIEW_COMPLETED]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [CandidateStatus.OFFER_ACCEPTED]: 'bg-green-100 text-green-800 border-green-200',
    [CandidateStatus.OFFER_REJECTED]: 'bg-red-100 text-red-800 border-red-200',
    [CandidateStatus.HIRED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [CandidateStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
    [CandidateStatus.ON_HOLD]: 'bg-gray-100 text-gray-800 border-gray-200',
    [CandidateStatus.ARCHIVED]: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function formatStatus(status: CandidateStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function CandidateCard({
  candidate,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onAddToProcess,
  onEdit,
  onArchive,
  showActions = true,
  showProcessInfo = true
}: CandidateCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const initials = getInitials(candidate.firstName, candidate.lastName)
  const avatarColor = getAvatarColor(candidate.firstName + candidate.lastName)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`${candidate.firstName} ${candidate.lastName}, ${candidate.currentPosition || 'No position'}`}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md p-3 mb-2 cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-400 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 relative ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      } ${candidate.isArchived ? 'opacity-60' : ''}`}
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
          {formatStatus(candidate.status)}
        </span>
      </div>

      {/* Header with Avatar */}
      <div className="flex items-start gap-2 mb-2">
        {/* Profile Picture / Avatar - Smaller */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full shadow-sm ring-1 ring-white overflow-hidden ${!candidate.profilePictureUrl && avatarColor}`}>
          {candidate.profilePictureUrl ? (
            <img
              src={candidate.profilePictureUrl}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg">${initials}</div>`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </div>

        {/* Name and Position */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/candidates/${candidate.id}`}
            className="font-bold text-primary-500 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300 text-sm block truncate leading-tight transition-colors duration-300 ease-in-out focus:outline-none focus:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {candidate.firstName} {candidate.lastName}
          </Link>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate leading-tight">
            {candidate.currentPosition || 'N/A'}
          </p>
          {candidate.currentCompany && (
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{candidate.currentCompany}</p>
          )}
        </div>

        {/* Rating Badge */}
        {candidate.overallRating && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded shadow-sm border border-yellow-200 dark:border-yellow-800/30">
              <span className="text-yellow-500 dark:text-yellow-400 text-xs">★</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{candidate.overallRating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Experience Level - More Compact */}
      <div className="mb-2">
        <span className="inline-block px-2 py-1.5 min-h-[28px] bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
          {EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}
        </span>
      </div>

      {/* Skills - Show Only 2 */}
      {candidate.primarySkills && candidate.primarySkills.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-1">
            {candidate.primarySkills.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1.5 min-h-[28px] bg-primary-500 text-white text-xs rounded truncate max-w-[80px] shadow-sm"
                title={skill}
              >
                {skill}
              </span>
            ))}
            {candidate.primarySkills.length > 2 && (
              <span className="inline-block px-2 py-1.5 min-h-[28px] bg-gray-100 text-gray-600 text-xs rounded shadow-sm">
                +{candidate.primarySkills.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags - Show Only 2 */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="mb-2">
          <TagList tags={candidate.tags} maxDisplay={2} size="sm" />
        </div>
      )}

      {/* Process Info */}
      {showProcessInfo && candidate.currentProcesses && candidate.currentProcesses.length > 0 && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-700 mb-1">
            Processus actifs ({candidate.currentProcesses.length})
          </p>
          {candidate.currentProcesses.slice(0, 2).map((process, index) => (
            <div key={index} className="text-xs text-blue-600 truncate">
              • {process.processName} - {process.stageName}
            </div>
          ))}
          {candidate.currentProcesses.length > 2 && (
            <div className="text-xs text-blue-500 mt-1">
              +{candidate.currentProcesses.length - 2} autres...
            </div>
          )}
        </div>
      )}

      {/* Footer with Contact Info and Actions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 truncate" title={candidate.email}>
            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.assignedToName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{candidate.assignedToName}</span>
            </div>
          )}
        </div>

        {/* Action Menu */}
        {showActions && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-4 h-4" />
                  Voir le profil
                </Link>

                {onAddToProcess && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToProcess(candidate)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 w-full text-left"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter au processus
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(candidate)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 w-full text-left"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}

                {onArchive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive(candidate)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full text-left border-t border-gray-100 dark:border-gray-700"
                  >
                    <Archive className="w-4 h-4" />
                    Archiver
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
