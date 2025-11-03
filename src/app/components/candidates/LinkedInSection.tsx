'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { LinkedInData, LinkedInVerification } from '@/app/types/linkedin'
import LinkedInPreviewCard from './LinkedInPreviewCard'
import LinkedInVerificationPanel from './LinkedInVerificationPanel'
import LinkedInNotes from './LinkedInNotes'
import { useSession } from 'next-auth/react'

interface LinkedInSectionProps {
  candidateId: string
  candidateName: string
  linkedinData?: LinkedInData
  onUpdate: (data: Partial<LinkedInData>) => void
}

export default function LinkedInSection({
  candidateId,
  candidateName,
  linkedinData,
  onUpdate
}: LinkedInSectionProps) {
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState(true)
  const [loading, setLoading] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState(linkedinData?.url || '')
  const [previewData, setPreviewData] = useState(linkedinData?.previewData || null)

  const fetchLinkedInPreview = useCallback(async () => {
    if (!linkedinUrl) {
      toast.error('Please enter a LinkedIn URL')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/linkedin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl,
          candidateId
        })
      })

      const result = await response.json()

      if (result.success) {
        setPreviewData(result.data)
        onUpdate({
          url: linkedinUrl,
          previewData: result.data
        })
        toast.success(result.cached ? 'LinkedIn profile loaded from cache' : 'LinkedIn profile fetched successfully')
      } else {
        toast.error(result.error || 'Failed to fetch LinkedIn profile')
      }
    } catch (error) {
      console.error('Error fetching LinkedIn preview:', error)
      toast.error('Failed to fetch LinkedIn profile')
    } finally {
      setLoading(false)
    }
  }, [linkedinUrl, candidateId, onUpdate])

  const handleVerificationUpdate = (verification: Partial<LinkedInVerification>) => {
    const updatedVerification = {
      ...linkedinData?.verification,
      ...verification,
      verifiedBy: session?.user?.id,
      verifiedByName: session?.user?.name || 'Unknown',
      verifiedAt: new Date().toISOString()
    }

    onUpdate({ verification: updatedVerification })

    // Add to verification history
    const history = linkedinData?.verificationHistory || []
    history.push({
      verifiedBy: session?.user?.id || '',
      verifiedByName: session?.user?.name || 'Unknown',
      verifiedAt: new Date().toISOString(),
      action: verification.isVerified ? 'verified' : 'unverified',
      notes: verification.quickChecks ? 'Updated verification checks' : undefined
    })

    onUpdate({ verificationHistory: history })
  }

  const handleNotesUpdate = (notes: string) => {
    onUpdate({ notes })
  }

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          <h3 className="text-lg font-semibold">LinkedIn Profile</h3>
          {linkedinData?.verification?.isVerified && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <>
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              LinkedIn Profile URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchLinkedInPreview}
                disabled={loading || !linkedinUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Fetch Profile'
                )}
              </button>
            </div>
          </div>

          {/* Preview Card */}
          {previewData && (
            <LinkedInPreviewCard
              previewData={previewData}
              linkedinUrl={linkedinUrl || ''}
            />
          )}

          {/* Verification Panel */}
          {previewData && (
            <LinkedInVerificationPanel
              candidateName={candidateName}
              verification={linkedinData?.verification}
              onUpdate={handleVerificationUpdate}
            />
          )}

          {/* Notes */}
          {previewData && (
            <LinkedInNotes
              notes={linkedinData?.notes || ''}
              onUpdate={handleNotesUpdate}
            />
          )}

          {/* Verification History */}
          {linkedinData?.verificationHistory && linkedinData.verificationHistory.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Verification History</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {linkedinData.verificationHistory.slice(-3).reverse().map((history, index) => (
                  <div key={index}>
                    {history.action === 'verified' ? '✓' : '✗'} {history.verifiedByName} - {new Date(history.verifiedAt).toLocaleDateString()}
                    {history.notes && <span className="text-gray-500"> ({history.notes})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}