// src/app/components/AddCandidatesToProcessModal.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Search, Check, ChevronRight, UserPlus, Filter, Users } from 'lucide-react'
import { Process, ProcessSummary } from '@/app/types/process'
import { Candidate, CandidateStatus, EXPERIENCE_LEVEL_LABELS } from '@/app/types/candidates'

interface AddCandidatesToProcessModalProps {
  isOpen: boolean
  onClose: () => void
  process?: ProcessSummary | Process
  onCandidatesAdded?: (candidateIds: string[]) => void
}

export default function AddCandidatesToProcessModal({
  isOpen,
  onClose,
  process,
  onCandidatesAdded
}: AddCandidatesToProcessModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | 'all'>('all')
  const [filterExperience, setFilterExperience] = useState<string>('all')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)

  // Load available candidates
  useEffect(() => {
    if (isOpen) {
      loadCandidates()
    }
  }, [isOpen])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      // Fetch active, non-archived candidates
      const response = await fetch('/api/candidates?isActive=true&isArchived=false&limit=100')
      if (!response.ok) throw new Error('Failed to load candidates')

      const data = await response.json()
      console.log('[AddCandidatesToProcessModal] Fetched data:', data)

      // Get candidates array from response
      let availableCandidates = data.candidates || []

      if (showOnlyAvailable && process) {
        availableCandidates = availableCandidates.filter((c: Candidate) =>
          !c.processIds?.includes(process.id!)
        )
      }

      setCandidates(availableCandidates)
      setFilteredCandidates(availableCandidates)
    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...candidates]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => {
        const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()
        return (
          name.toLowerCase().includes(query) ||
          c.firstName?.toLowerCase().includes(query) ||
          c.lastName?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.currentPosition?.toLowerCase().includes(query) ||
          c.primarySkills?.some(s => s.toLowerCase().includes(query)) ||
          c.tags?.some(t => t.label.toLowerCase().includes(query))
        )
      })
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    // Experience filter
    if (filterExperience !== 'all') {
      filtered = filtered.filter(c => c.experienceLevel === filterExperience)
    }

    setFilteredCandidates(filtered)
  }, [searchQuery, filterStatus, filterExperience, candidates])

  // Toggle candidate selection
  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates)
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId)
    } else {
      newSelection.add(candidateId)
    }
    setSelectedCandidates(newSelection)
  }

  // Select all visible
  const selectAll = () => {
    const newSelection = new Set(selectedCandidates)
    filteredCandidates.forEach(c => newSelection.add(c.id))
    setSelectedCandidates(newSelection)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedCandidates(new Set())
  }

  // Add selected candidates to process
  const handleAddCandidates = async () => {
    if (!process || selectedCandidates.size === 0) return

    try {
      setLoading(true)

      const response = await fetch(`/api/processes/${process._id || process.id}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: Array.from(selectedCandidates),
          stage: process.stages?.[0]?.name || 'Screening' // Add to first stage by default
        })
      })

      if (!response.ok) throw new Error('Failed to add candidates to process')

      // Notify parent component
      if (onCandidatesAdded) {
        onCandidatesAdded(Array.from(selectedCandidates))
      }

      // Close modal and reset
      onClose()
      setSelectedCandidates(new Set())
      setSearchQuery('')

    } catch (error) {
      console.error('Error adding candidates:', error)
      alert('Failed to add candidates to process')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Candidates to {process?.title || process?.name || 'Process'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, position, skills or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CandidateStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Status</option>
              {Object.values(CandidateStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            {/* Experience Filter */}
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Experience</option>
              {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Toggle Available Only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => {
                  setShowOnlyAvailable(e.target.checked)
                  loadCandidates()
                }}
                className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
              />
              <span className="text-sm text-gray-700">Available only</span>
            </label>
          </div>

          {/* Selection Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={selectAll}
                className="text-accent-600 hover:text-accent-700 font-medium"
              >
                Select All ({filteredCandidates.length})
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={clearSelection}
                className="text-gray-600 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {selectedCandidates.size} selected
            </span>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Users className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">No candidates found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCandidates.has(candidate.id)
                      ? 'border-accent-500 bg-accent-50 ring-2 ring-accent-500 ring-offset-2'
                      : 'border-gray-200 hover:border-accent-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedCandidates.has(candidate.id)
                          ? 'border-accent-500 bg-accent-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedCandidates.has(candidate.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {candidate.profilePictureUrl ? (
                        <Image
                          src={candidate.profilePictureUrl}
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold">
                          {(candidate.firstName?.[0] || candidate.name?.[0] || 'U').toUpperCase()}
                          {(candidate.lastName?.[0] || '').toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {candidate.currentPosition || 'No position'}
                      </p>
                      {candidate.currentCompany && (
                        <p className="text-xs text-gray-500">at {candidate.currentCompany}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          {EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}
                        </span>
                        {candidate.overallRating && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                            <span>★</span>
                            {candidate.overallRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {candidate.primarySkills && candidate.primarySkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.primarySkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.primarySkills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{candidate.primarySkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedCandidates.size > 0 && (
              <span>{selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCandidates}
              disabled={selectedCandidates.size === 0 || loading}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add {selectedCandidates.size > 0 ? selectedCandidates.size : ''} Candidate{selectedCandidates.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}