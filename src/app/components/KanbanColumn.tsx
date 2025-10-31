// src/app/components/KanbanColumn.tsx
'use client'

import React from 'react'
import { ClipboardList } from 'lucide-react'
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
  const [isDraggedOver, setIsDraggedOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggedOver(true)
    onDragOver(e)
  }

  const handleDragLeave = () => {
    setIsDraggedOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggedOver(false)
    onDrop(e, status)
  }

  return (
    <div className="flex-shrink-0 w-full min-w-[180px] transition-all duration-200">
      {/* Column Header */}
      <div className={`rounded-t-xl p-2.5 border-2 ${getStatusColor(status)} shadow-sm`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-xs ${getHeaderColor(status)} leading-tight truncate pr-2`}>
            {CANDIDATE_STATUS_LABELS[status]}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getHeaderColor(status)} bg-white/60 shadow-sm flex-shrink-0`}>
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Column Content - Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-gradient-to-b from-gray-50 to-gray-100 rounded-b-xl p-2 min-h-[500px] max-h-[calc(100vh-250px)] overflow-y-auto border-2 border-t-0 border-gray-200 transition-all duration-200 ${
          isDraggedOver
            ? 'bg-[#ffaf50ff]/10 border-[#ffaf50ff] border-dashed shadow-inner ring-2 ring-[#ffaf50ff]/30'
            : ''
        }`}
      >
        {/* Drop Zone Visual Indicator */}
        {isDraggedOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#ffaf50ff]/20 border-2 border-dashed border-[#ffaf50ff] rounded-xl p-6 text-center animate-pulse">
              <div className="text-4xl mb-2">📥</div>
              <p className="text-[#ffaf50ff] font-bold">Déposer ici</p>
            </div>
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
            <ClipboardList className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Aucun candidat</p>
            <p className="text-xs mt-1">Glissez-déposez un candidat ici</p>
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
