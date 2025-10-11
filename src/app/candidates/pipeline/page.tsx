// src/app/candidates/pipeline/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Candidate, CandidateStatus } from '@/app/types/candidates'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import KanbanColumn from '@/app/components/KanbanColumn'

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Statuses to show in Kanban board (main pipeline)
  const pipelineStatuses: CandidateStatus[] = [
    CandidateStatus.NEW,
    CandidateStatus.CONTACTED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW_SCHEDULED,
    CandidateStatus.INTERVIEW_COMPLETED,
    CandidateStatus.OFFER_SENT,
    CandidateStatus.OFFER_ACCEPTED,
    CandidateStatus.HIRED
  ]

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/candidates?isActive=true&isArchived=false&limit=1000')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidates')
      }

      setCandidates(data.candidates)
    } catch (err: any) {
      console.error('Error fetching candidates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const groupCandidatesByStatus = () => {
    const grouped: Record<CandidateStatus, Candidate[]> = {} as any

    // Initialize all statuses with empty arrays
    pipelineStatuses.forEach(status => {
      grouped[status] = []
    })

    // Group candidates by status
    candidates.forEach(candidate => {
      if (pipelineStatuses.includes(candidate.status)) {
        grouped[candidate.status].push(candidate)
      }
    })

    return grouped
  }

  const handleDragStart = (candidateId: string) => {
    setDraggedCandidateId(candidateId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: CandidateStatus) => {
    e.preventDefault()

    const candidateId = e.dataTransfer.getData('candidateId')
    if (!candidateId) return

    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return

    // Don't update if status hasn't changed
    if (candidate.status === newStatus) {
      setDraggedCandidateId(null)
      return
    }

    // Optimistic update
    setCandidates(prevCandidates =>
      prevCandidates.map(c =>
        c.id === candidateId ? { ...c, status: newStatus } : c
      )
    )

    setDraggedCandidateId(null)

    // Update on server
    try {
      setUpdating(true)

      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update candidate status')
      }

      // Refresh to get updated data with activities
      await fetchCandidates()
    } catch (err: any) {
      console.error('Error updating status:', err)
      alert('Erreur lors de la mise à jour du statut: ' + err.message)
      // Revert optimistic update
      await fetchCandidates()
    } finally {
      setUpdating(false)
    }
  }

  const groupedCandidates = groupCandidatesByStatus()

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du pipeline...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Pipeline de Recrutement</h1>
                <p className="text-xl opacity-90">
                  {candidates.length} candidat{candidates.length !== 1 ? 's' : ''} actif{candidates.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/candidates"
                  className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  📋 Vue Liste
                </Link>
                <Link
                  href="/candidates/new"
                  className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  + Nouveau Candidat
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-white/80 border-b border-gray-200 py-4">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-[#3b5335ff]">💡 Astuce:</span>
              <span className="text-gray-600">
                Glissez et déposez les cartes des candidats pour changer leur statut dans le pipeline
              </span>
              {updating && (
                <span className="ml-auto text-[#ffaf50ff] flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ffaf50ff]"></div>
                  Mise à jour...
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <section className="py-4">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            </div>
          </section>
        )}

        {/* Kanban Board */}
        <section className="py-8">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {pipelineStatuses.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    candidates={groupedCandidates[status]}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    draggedCandidateId={draggedCandidateId}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-8">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Statistiques du Pipeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {pipelineStatuses.map(status => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-[#3b5335ff] mb-2">
                      {groupedCandidates[status].length}
                    </div>
                    <div className="text-xs text-gray-600">
                      {status.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Rates */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-[#3b5335ff] mb-4">Taux de Conversion</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Nouveau → Contacté</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {groupedCandidates[CandidateStatus.NEW].length > 0
                        ? Math.round((groupedCandidates[CandidateStatus.CONTACTED].length / groupedCandidates[CandidateStatus.NEW].length) * 100)
                        : 0}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Offre → Accepté</div>
                    <div className="text-2xl font-bold text-green-700">
                      {groupedCandidates[CandidateStatus.OFFER_SENT].length > 0
                        ? Math.round((groupedCandidates[CandidateStatus.OFFER_ACCEPTED].length / groupedCandidates[CandidateStatus.OFFER_SENT].length) * 100)
                        : 0}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total → Embauché</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {candidates.length > 0
                        ? Math.round((groupedCandidates[CandidateStatus.HIRED].length / candidates.length) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
