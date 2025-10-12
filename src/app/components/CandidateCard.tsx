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
      className={`group bg-white rounded-xl shadow-md p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-2xl transition-all duration-200 border-2 border-transparent hover:border-[#ffaf50ff] hover:scale-[1.02] ${
        isDragging ? 'opacity-40 scale-95 rotate-3' : 'opacity-100'
      }`}
    >
      {/* Drag Indicator */}
      <div className="flex items-center gap-1 mb-3 text-gray-300 group-hover:text-[#ffaf50ff] transition-colors">
        <div className="w-1 h-1 rounded-full bg-current"></div>
        <div className="w-1 h-1 rounded-full bg-current"></div>
        <div className="w-1 h-1 rounded-full bg-current"></div>
        <div className="flex-1 h-px bg-gray-200 group-hover:bg-[#ffaf50ff]/30"></div>
        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Glisser
        </span>
      </div>

      {/* Header with Avatar */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture / Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full shadow-md ring-2 ring-white overflow-hidden ${!candidate.profilePictureUrl && avatarColor}`}>
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
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Name and Position */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/candidates/${candidate.id}`}
            className="font-bold text-[#3b5335ff] hover:text-[#ffaf50ff] text-base block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {candidate.firstName} {candidate.lastName}
          </Link>
          <p className="text-sm text-gray-600 truncate">
            {candidate.currentPosition || 'Position non spécifiée'}
          </p>
          {candidate.currentCompany && (
            <p className="text-xs text-gray-500 truncate">{candidate.currentCompany}</p>
          )}
        </div>

        {/* Rating Badge */}
        {candidate.overallRating && (
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg shadow-sm">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-bold">{candidate.overallRating.toFixed(1)}</span>
            </div>
            {candidate.quickScores && candidate.quickScores.length > 0 && (
              <span className="text-xs text-gray-500">
                {candidate.quickScores.length} éval{candidate.quickScores.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
          {EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}
        </span>
      </div>

      {/* Skills */}
      {candidate.primarySkills && candidate.primarySkills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {candidate.primarySkills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-0.5 bg-[#3b5335ff] text-white text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {candidate.primarySkills.length > 3 && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{candidate.primarySkills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="mb-3">
          <TagList tags={candidate.tags} maxDisplay={4} size="sm" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span>📧 {candidate.email}</span>
        </div>
        {candidate.assignedToName && (
          <span className="text-xs text-gray-400">👤 {candidate.assignedToName}</span>
        )}
      </div>

      {/* Availability Indicator */}
      {candidate.availability && (
        <div className="mt-2 text-xs">
          <span className="text-gray-500">Disponibilité: </span>
          <span className="font-medium text-green-600">{candidate.availability}</span>
        </div>
      )}
    </div>
  )
}
