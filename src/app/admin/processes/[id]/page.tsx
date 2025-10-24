// src/app/admin/processes/[id]/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Search,
  Filter,
  UserPlus,
  Settings,
  Eye,
  Archive,
  Download,
  Calendar,
  MapPin,
  Building2,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ChevronRight,
  RefreshCw,
  Target
} from 'lucide-react'
import { Process, ProcessStage, ProcessStatus } from '@/app/types/process'
import { Candidate, CandidateStatus } from '@/app/types/candidates'
import CandidateCard from '@/app/components/CandidateCard'
import AddCandidatesToProcessModal from '@/app/components/AddCandidatesToProcessModal'

interface StageWithCandidates extends ProcessStage {
  candidates: Candidate[]
}

export default function ProcessKanbanPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string

  const [process, setProcess] = useState<Process | null>(null)
  const [stagesWithCandidates, setStagesWithCandidates] = useState<StageWithCandidates[]>([])
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null)
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null)
  const [showStatsPanel, setShowStatsPanel] = useState(true)

  // Load process and candidates
  const loadProcessData = useCallback(async () => {
    try {
      setLoading(true)

      // Load process details
      const processResponse = await fetch(`/api/processes/${processId}`)
      if (!processResponse.ok) throw new Error('Failed to load process')
      const processData = await processResponse.json()
      setProcess(processData)

      // Load all candidates in the process
      const candidatesResponse = await fetch(`/api/processes/${processId}/candidates`)
      if (!candidatesResponse.ok) throw new Error('Failed to load candidates')
      const candidatesData = await candidatesResponse.json()

      // Organize candidates by stage
      const stagesMap: { [key: string]: StageWithCandidates } = {}
      processData.stages.forEach((stage: ProcessStage) => {
        stagesMap[stage.id] = {
          ...stage,
          candidates: []
        }
      })

      // Assign candidates to their respective stages
      candidatesData.forEach((candidate: Candidate) => {
        const processInfo = candidate.currentProcesses?.find(p => p.processId === processId)
        if (processInfo && stagesMap[processInfo.stageId]) {
          stagesMap[processInfo.stageId].candidates.push(candidate)
        }
      })

      // Convert to array and maintain stage order
      const orderedStages = processData.stages.map((stage: ProcessStage) => stagesMap[stage.id])
      setStagesWithCandidates(orderedStages)
      setAllCandidates(candidatesData)

    } catch (err: any) {
      setError(err.message)
      console.error('Error loading process data:', err)
    } finally {
      setLoading(false)
    }
  }, [processId])

  useEffect(() => {
    loadProcessData()
  }, [loadProcessData])

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (stageId: string) => {
    setDragOverStageId(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStageId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    setDragOverStageId(null)

    if (!draggedCandidate || !process) return

    // Find current stage
    const currentProcessInfo = draggedCandidate.currentProcesses?.find(p => p.processId === processId)
    if (!currentProcessInfo || currentProcessInfo.stageId === targetStageId) return

    try {
      // Update candidate stage
      const response = await fetch(`/api/processes/${processId}/candidates/${draggedCandidate.id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: targetStageId })
      })

      if (!response.ok) throw new Error('Failed to move candidate')

      // Reload data to reflect changes
      await loadProcessData()

    } catch (err: any) {
      console.error('Error moving candidate:', err)
      alert('Failed to move candidate: ' + err.message)
    } finally {
      setDraggedCandidate(null)
    }
  }

  // Calculate stage metrics
  const calculateStageMetrics = (stage: StageWithCandidates) => {
    const total = stage.candidates.length
    const avgTimeInStage = stage.candidates.reduce((acc, candidate) => {
      const processInfo = candidate.currentProcesses?.find(p => p.processId === processId)
      if (processInfo?.enteredStageAt) {
        const daysInStage = Math.floor((Date.now() - new Date(processInfo.enteredStageAt).getTime()) / (1000 * 60 * 60 * 24))
        return acc + daysInStage
      }
      return acc
    }, 0) / (total || 1)

    return {
      total,
      avgTimeInStage: Math.round(avgTimeInStage),
      conversionRate: 0 // Will be calculated based on historical data
    }
  }

  // Filter candidates based on search
  const filterCandidates = (candidates: Candidate[]) => {
    if (!searchQuery) return candidates

    const query = searchQuery.toLowerCase()
    return candidates.filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.currentPosition?.toLowerCase().includes(query) ||
      c.primarySkills?.some(s => s.toLowerCase().includes(query))
    )
  }

  // Get stage color
  const getStageColor = (index: number, total: number) => {
    const colors = [
      'border-gray-300 bg-gray-50',
      'border-blue-300 bg-blue-50',
      'border-purple-300 bg-purple-50',
      'border-indigo-300 bg-indigo-50',
      'border-green-300 bg-green-50'
    ]

    // Use specific colors for first and last stages
    if (index === 0) return colors[0]
    if (index === total - 1) return colors[4]

    // Cycle through middle colors
    return colors[(index % 3) + 1]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  if (error || !process) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load process</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link
          href="/admin/processes"
          className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
        >
          Back to Processes
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/admin" className="hover:text-accent-600 transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/admin/processes" className="hover:text-accent-600 transition-colors">
              Processes
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{process.name}</span>
          </div>

          {/* Process Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{process.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {process.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {process.company}
                  </span>
                )}
                {process.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {process.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {allCandidates.length} candidates
                </span>
                {process.deadline && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(process.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatsPanel(!showStatsPanel)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Stats"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
              <button
                onClick={loadProcessData}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddCandidateModal(true)}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Candidates
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name, email, position, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStatsPanel && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{allCandidates.length}</div>
              <div className="text-sm text-gray-600">Total Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stagesWithCandidates[0]?.candidates.length || 0}
              </div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stagesWithCandidates.slice(1, -1).reduce((acc, stage) => acc + stage.candidates.length, 0)}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stagesWithCandidates[stagesWithCandidates.length - 1]?.candidates.filter(c =>
                  c.status === CandidateStatus.HIRED || c.status === CandidateStatus.OFFER_ACCEPTED
                ).length || 0}
              </div>
              <div className="text-sm text-gray-600">Hired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {allCandidates.filter(c => c.status === CandidateStatus.REJECTED).length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {stagesWithCandidates.map((stage, index) => {
            const metrics = calculateStageMetrics(stage)
            const filteredCandidates = filterCandidates(stage.candidates)
            const stageColor = getStageColor(index, stagesWithCandidates.length)

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 ${dragOverStageId === stage.id ? 'ring-2 ring-accent-500 ring-offset-2' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`p-4 border rounded-t-lg ${stageColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <span className="px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                      {filteredCandidates.length}
                    </span>
                  </div>
                  {stage.description && (
                    <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Avg: {metrics.avgTimeInStage}d
                    </span>
                    {stage.targetDuration && (
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target: {stage.targetDuration}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage Content */}
                <div className="bg-gray-50 border-l border-r border-b rounded-b-lg p-2 min-h-[400px] max-h-[calc(100vh-400px)] overflow-y-auto">
                  {filteredCandidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Users className="w-8 h-8 mb-2" />
                      <p className="text-sm">No candidates in this stage</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCandidates.map(candidate => (
                        <div
                          key={candidate.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, candidate)}
                        >
                          <CandidateCard
                            candidate={candidate}
                            showActions={true}
                            showProcessInfo={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AddCandidatesToProcessModal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        process={process}
        onCandidatesAdded={(candidateIds) => {
          // Reload the process data to show newly added candidates
          loadProcessData()
        }}
      />
    </div>
  )
}