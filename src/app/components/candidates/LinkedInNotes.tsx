'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface LinkedInNotesProps {
  notes: string
  onUpdate: (notes: string) => void
}

export default function LinkedInNotes({ notes, onUpdate }: LinkedInNotesProps) {
  const [localNotes, setLocalNotes] = useState(notes)
  const [isSaving, setIsSaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Create debounced save function
  const debouncedSave = useCallback((value: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      onUpdate(value)
      setTimeout(() => setIsSaving(false), 500) // Show saving indicator briefly
    }, 1000) // Save after 1 second of no typing
  }, [onUpdate])

  useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  const handleChange = (value: string) => {
    setLocalNotes(value)
    debouncedSave(value)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Notes from LinkedIn Review
        </label>
        {isSaving && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </span>
        )}
      </div>
      <textarea
        value={localNotes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes about the LinkedIn profile verification, discrepancies found, or other observations..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={4}
        maxLength={500}
      />
      <div className="text-xs text-gray-500 text-right">
        {localNotes.length}/500 characters
      </div>
    </div>
  )
}