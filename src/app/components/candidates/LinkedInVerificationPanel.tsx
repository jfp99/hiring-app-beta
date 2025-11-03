'use client'

import { useState } from 'react'
import { LinkedInVerification, LinkedInQuickChecks } from '@/app/types/linkedin'

interface LinkedInVerificationPanelProps {
  candidateName: string
  verification?: LinkedInVerification
  onUpdate: (verification: Partial<LinkedInVerification>) => void
}

export default function LinkedInVerificationPanel({
  candidateName,
  verification,
  onUpdate
}: LinkedInVerificationPanelProps) {
  const [quickChecks, setQuickChecks] = useState<LinkedInQuickChecks>(
    verification?.quickChecks || {
      nameMatches: false,
      roleAccurate: false,
      experienceVerified: false,
      educationVerified: false
    }
  )

  const handleCheckChange = (field: keyof LinkedInQuickChecks) => {
    const updated = { ...quickChecks, [field]: !quickChecks[field] }
    setQuickChecks(updated)

    // Auto-update verification status based on checks
    const allChecked = Object.values(updated).every(v => v === true)
    const someChecked = Object.values(updated).some(v => v === true)

    onUpdate({
      quickChecks: updated,
      isVerified: allChecked
    })
  }

  const handleVerifyToggle = () => {
    onUpdate({
      isVerified: !verification?.isVerified,
      quickChecks
    })
  }

  return (
    <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Verification Status</h4>
        <button
          onClick={handleVerifyToggle}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            verification?.isVerified
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {verification?.isVerified ? '✓ Profile Verified' : 'Mark as Verified'}
        </button>
      </div>

      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-700">Quick Verification Checks</h5>

        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={quickChecks.nameMatches || false}
            onChange={() => handleCheckChange('nameMatches')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Name matches application ({candidateName})
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={quickChecks.roleAccurate || false}
            onChange={() => handleCheckChange('roleAccurate')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Current role/position is accurate
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={quickChecks.experienceVerified || false}
            onChange={() => handleCheckChange('experienceVerified')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Work experience verified
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <input
            type="checkbox"
            checked={quickChecks.educationVerified || false}
            onChange={() => handleCheckChange('educationVerified')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Education credentials verified
          </span>
        </label>
      </div>

      {verification?.verifiedBy && (
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          Verified by {verification.verifiedByName} on{' '}
          {verification.verifiedAt && new Date(verification.verifiedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}