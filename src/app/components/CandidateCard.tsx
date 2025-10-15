// src/app/components/CandidateCard.tsx
'use client'

import Link from 'next/link'
import { Candidate, EXPERIENCE_LEVEL_LABELS } from '@/app/types/candidates'
import { TagList } from '@/app/components/Tag'

interface CandidateCardProps {
  candidate: Candidate
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
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

export default function CandidateCard({
  candidate,
  isDragging = false,
  onDragStart,
  onDragEnd
}: CandidateCardProps) {
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
      className={`group bg-white rounded-lg shadow-sm p-2.5 mb-2 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-200 border border-transparent hover:border-accent-500 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      }`}
    >
      {/* Drag Indicator - More Compact */}
      <div className="flex items-center gap-1 mb-2 text-gray-300 group-hover:text-accent-500 transition-colors" aria-hidden="true">
        <div className="w-0.5 h-0.5 rounded-full bg-current"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-current"></div>
        <div className="w-0.5 h-0.5 rounded-full bg-current"></div>
        <div className="flex-1 h-px bg-gray-200 group-hover:bg-accent-500/30"></div>
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
            className="font-bold text-primary-500 hover:text-accent-500 text-sm block truncate leading-tight transition-colors duration-200 focus:outline-none focus:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {candidate.firstName} {candidate.lastName}
          </Link>
          <p className="text-xs text-gray-600 truncate leading-tight">
            {candidate.currentPosition || 'N/A'}
          </p>
          {candidate.currentCompany && (
            <p className="text-xs text-gray-500 truncate">{candidate.currentCompany}</p>
          )}
        </div>

        {/* Rating Badge */}
        {candidate.overallRating && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded shadow-sm">
              <span className="text-yellow-500 text-xs">★</span>
              <span className="text-xs font-bold">{candidate.overallRating.toFixed(1)}</span>
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

      {/* Footer - More Compact */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 space-y-1">
        <div className="truncate" title={candidate.email}>
          📧 {candidate.email.split('@')[0]}
        </div>
        {candidate.assignedToName && (
          <div className="text-xs text-gray-400 truncate">👤 {candidate.assignedToName}</div>
        )}
      </div>
    </div>
  )
}
