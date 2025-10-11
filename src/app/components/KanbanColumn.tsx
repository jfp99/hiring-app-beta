// src/app/components/KanbanColumn.tsx
'use client'

import { Candidate, CandidateStatus, CANDIDATE_STATUS_LABELS } from '@/app/types/candidates'
import CandidateCard from './CandidateCard'

interface KanbanColumnProps {
  status: CandidateStatus
  candidates: Candidate[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: CandidateStatus) => void
  onDragStart: (candidateId: string) => void
  draggedCandidateId: string | null
}

const getStatusColor = (status: CandidateStatus): string => {
  const colors: Record<CandidateStatus, string> = {
    [CandidateStatus.NEW]: 'bg-blue-100 border-blue-300',
    [CandidateStatus.CONTACTED]: 'bg-purple-100 border-purple-300',
    [CandidateStatus.SCREENING]: 'bg-yellow-100 border-yellow-300',
    [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 border-orange-300',
    [CandidateStatus.INTERVIEW_COMPLETED]: 'bg-cyan-100 border-cyan-300',
    [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 border-indigo-300',
    [CandidateStatus.OFFER_ACCEPTED]: 'bg-green-100 border-green-300',
    [CandidateStatus.OFFER_REJECTED]: 'bg-red-100 border-red-300',
    [CandidateStatus.HIRED]: 'bg-green-200 border-green-400',
    [CandidateStatus.REJECTED]: 'bg-red-100 border-red-300',
    [CandidateStatus.ON_HOLD]: 'bg-gray-100 border-gray-300',
    [CandidateStatus.ARCHIVED]: 'bg-gray-200 border-gray-400'
  }
  return colors[status] || 'bg-gray-100 border-gray-300'
}

const getHeaderColor = (status: CandidateStatus): string => {
  const colors: Record<CandidateStatus, string> = {
    [CandidateStatus.NEW]: 'text-blue-800',
    [CandidateStatus.CONTACTED]: 'text-purple-800',
    [CandidateStatus.SCREENING]: 'text-yellow-800',
    [CandidateStatus.INTERVIEW_SCHEDULED]: 'text-orange-800',
    [CandidateStatus.INTERVIEW_COMPLETED]: 'text-cyan-800',
    [CandidateStatus.OFFER_SENT]: 'text-indigo-800',
    [CandidateStatus.OFFER_ACCEPTED]: 'text-green-800',
    [CandidateStatus.OFFER_REJECTED]: 'text-red-800',
    [CandidateStatus.HIRED]: 'text-green-900',
    [CandidateStatus.REJECTED]: 'text-red-800',
    [CandidateStatus.ON_HOLD]: 'text-gray-800',
    [CandidateStatus.ARCHIVED]: 'text-gray-600'
  }
  return colors[status] || 'text-gray-800'
}

export default function KanbanColumn({
  status,
  candidates,
  onDragOver,
  onDrop,
  onDragStart,
  draggedCandidateId
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(e, status)
  }

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`rounded-t-lg p-4 border-2 ${getStatusColor(status)}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-lg ${getHeaderColor(status)}`}>
            {CANDIDATE_STATUS_LABELS[status]}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getHeaderColor(status)} bg-white/50`}>
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="bg-gray-50 rounded-b-lg p-3 min-h-[600px] max-h-[calc(100vh-250px)] overflow-y-auto border-2 border-t-0 border-gray-200"
      >
        {candidates.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Aucun candidat</p>
            <p className="text-xs mt-1">Glissez un candidat ici</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isDragging={draggedCandidateId === candidate.id}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('candidateId', candidate.id)
                onDragStart(candidate.id)
              }}
              onDragEnd={() => onDragStart('')}
            />
          ))
        )}
      </div>
    </div>
  )
}
