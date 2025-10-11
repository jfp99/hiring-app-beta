// src/app/components/CandidateCard.tsx
'use client'

import Link from 'next/link'
import { Candidate, EXPERIENCE_LEVEL_LABELS } from '@/app/types/candidates'

interface CandidateCardProps {
  candidate: Candidate
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export default function CandidateCard({
  candidate,
  isDragging = false,
  onDragStart,
  onDragEnd
}: CandidateCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg shadow-md p-4 mb-3 cursor-move hover:shadow-lg transition-all border-2 border-transparent hover:border-[#ffaf50ff] ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link
            href={`/candidates/${candidate.id}`}
            className="font-bold text-[#3b5335ff] hover:text-[#ffaf50ff] text-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {candidate.firstName} {candidate.lastName}
          </Link>
          <p className="text-sm text-gray-600">
            {candidate.currentPosition || 'Position non spécifiée'}
          </p>
          {candidate.currentCompany && (
            <p className="text-xs text-gray-500">{candidate.currentCompany}</p>
          )}
        </div>
        {candidate.overallRating && (
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-bold">{candidate.overallRating.toFixed(1)}</span>
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
