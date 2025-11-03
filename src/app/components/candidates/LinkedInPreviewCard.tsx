'use client'

import { LinkedInPreviewData } from '@/app/types/linkedin'

interface LinkedInPreviewCardProps {
  previewData: LinkedInPreviewData
  linkedinUrl: string
}

export default function LinkedInPreviewCard({ previewData, linkedinUrl }: LinkedInPreviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {previewData.imageUrl ? (
              <img
                src={previewData.imageUrl}
                alt={previewData.name || 'Profile'}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/default-avatar.png'
                  target.onerror = null
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {previewData.name ? previewData.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {previewData.name || 'LinkedIn User'}
                </h3>
                {previewData.headline && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {previewData.headline}
                  </p>
                )}
                {(previewData.position || previewData.company) && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                    {previewData.position && (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{previewData.position}</span>
                      </>
                    )}
                    {previewData.position && previewData.company && (
                      <span className="text-gray-400">at</span>
                    )}
                    {previewData.company && (
                      <span className="font-medium">{previewData.company}</span>
                    )}
                  </div>
                )}
                {previewData.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{previewData.location}</span>
                  </div>
                )}
              </div>

              {/* Open in LinkedIn Button */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open profile in LinkedIn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Last Fetched Info */}
            {previewData.lastFetched && (
              <div className="mt-3 text-xs text-gray-500">
                Last updated: {new Date(previewData.lastFetched).toLocaleDateString()} at{' '}
                {new Date(previewData.lastFetched).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}