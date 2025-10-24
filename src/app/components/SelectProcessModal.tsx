// src/app/components/SelectProcessModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, Search, Building2, MapPin, Users, Calendar, ChevronRight } from 'lucide-react'
import { ProcessSummary, ProcessStatus } from '@/app/types/process'
import { Candidate } from '@/app/types/candidates'

interface SelectProcessModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: Candidate | null
  onProcessSelected?: (process: ProcessSummary) => void
}

export default function SelectProcessModal({
  isOpen,
  onClose,
  candidate,
  onProcessSelected
}: SelectProcessModalProps) {
  const [processes, setProcesses] = useState<ProcessSummary[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<ProcessSummary | null>(null)

  // Load processes
  useEffect(() => {
    if (isOpen) {
      loadProcesses()
    }
  }, [isOpen])

  const loadProcesses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/processes?status=active')
      if (!response.ok) throw new Error('Failed to load processes')

      const data = await response.json()

      // Filter out processes the candidate is already in
      const availableProcesses = candidate
        ? data.filter((p: ProcessSummary) => !candidate.processIds?.includes(p.id))
        : data

      setProcesses(availableProcesses)
      setFilteredProcesses(availableProcesses)
    } catch (error) {
      console.error('Error loading processes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter processes based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProcesses(processes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = processes.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query) ||
      p.location?.toLowerCase().includes(query)
    )
    setFilteredProcesses(filtered)
  }, [searchQuery, processes])

  // Add candidate to selected process
  const handleAddToProcess = async () => {
    if (!selectedProcess || !candidate) return

    try {
      setLoading(true)

      const response = await fetch(`/api/processes/${selectedProcess.id}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: [candidate.id]
        })
      })

      if (!response.ok) throw new Error('Failed to add candidate to process')

      // Notify parent component
      if (onProcessSelected) {
        onProcessSelected(selectedProcess)
      }

      // Close modal and reset
      onClose()
      setSelectedProcess(null)
      setSearchQuery('')

    } catch (error) {
      console.error('Error adding candidate to process:', error)
      alert('Failed to add candidate to process')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !candidate) return null

  // Get process card color
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Process</h2>
            <p className="text-sm text-gray-600 mt-1">
              Adding <span className="font-medium">{candidate.firstName} {candidate.lastName}</span> to a process
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by process name, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>

        {/* Processes List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <p className="text-lg font-medium">No available processes</p>
              <p className="text-sm">All active processes already include this candidate</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProcesses.map(process => (
                <div
                  key={process.id}
                  onClick={() => setSelectedProcess(process)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedProcess?.id === process.id
                      ? 'border-accent-500 bg-accent-50 ring-2 ring-accent-500 ring-offset-2'
                      : 'border-gray-200 hover:border-accent-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{process.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {process.candidateCount} candidates
                        </span>
                        {process.deadline && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(process.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                          {process.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          Progress: {process.progress}%
                        </div>
                      </div>
                    </div>
                    {selectedProcess?.id === process.id && (
                      <div className="text-accent-600">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedProcess && (
              <span>Selected: <strong>{selectedProcess.name}</strong></span>
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
              onClick={handleAddToProcess}
              disabled={!selectedProcess || loading}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Process
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}