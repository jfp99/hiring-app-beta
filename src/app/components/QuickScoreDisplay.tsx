'use client'

import { QuickScore } from '@/app/types/candidates'

interface QuickScoreDisplayProps {
  quickScores: QuickScore[]
}

export default function QuickScoreDisplay({ quickScores }: QuickScoreDisplayProps) {
  if (!quickScores || quickScores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">⭐</div>
        <p>Aucune évaluation rapide pour le moment</p>
      </div>
    )
  }

  // Calculate average ratings
  const avgOverall = quickScores.reduce((sum, s) => sum + s.overallRating, 0) / quickScores.length

  const technicalScores = quickScores.filter(s => s.technicalRating)
  const avgTechnical = technicalScores.length > 0
    ? technicalScores.reduce((sum, s) => sum + (s.technicalRating || 0), 0) / technicalScores.length
    : null

  const cultureFitScores = quickScores.filter(s => s.cultureFitRating)
  const avgCultureFit = cultureFitScores.length > 0
    ? cultureFitScores.reduce((sum, s) => sum + (s.cultureFitRating || 0), 0) / cultureFitScores.length
    : null

  const communicationScores = quickScores.filter(s => s.communicationRating)
  const avgCommunication = communicationScores.length > 0
    ? communicationScores.reduce((sum, s) => sum + (s.communicationRating || 0), 0) / communicationScores.length
    : null

  // Count thumbs
  const thumbsUp = quickScores.filter(s => s.thumbs === 'up').length
  const thumbsDown = quickScores.filter(s => s.thumbs === 'down').length
  const thumbsNeutral = quickScores.filter(s => s.thumbs === 'neutral').length

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-[#3b5335ff]/10 to-[#ffaf50ff]/10 rounded-lg p-6 border-l-4 border-[#ffaf50ff]">
        <h3 className="text-lg font-bold text-[#3b5335ff] mb-4">
          📊 Résumé des Évaluations ({quickScores.length})
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average Overall */}
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Moyenne Globale</p>
            <StarDisplay rating={avgOverall} />
          </div>

          {/* Average Technical */}
          {avgTechnical && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">💻 Technique</p>
              <StarDisplay rating={avgTechnical} />
            </div>
          )}

          {/* Average Culture Fit */}
          {avgCultureFit && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">🎯 Culture Fit</p>
              <StarDisplay rating={avgCultureFit} />
            </div>
          )}

          {/* Average Communication */}
          {avgCommunication && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">💬 Communication</p>
              <StarDisplay rating={avgCommunication} />
            </div>
          )}
        </div>

        {/* Recommendations Count */}
        {(thumbsUp + thumbsDown + thumbsNeutral) > 0 && (
          <div className="mt-4 flex gap-4 items-center justify-center">
            {thumbsUp > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">👍</span>
                <span className="font-semibold text-green-700">{thumbsUp}</span>
              </div>
            )}
            {thumbsNeutral > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤔</span>
                <span className="font-semibold text-yellow-700">{thumbsNeutral}</span>
              </div>
            )}
            {thumbsDown > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">👎</span>
                <span className="font-semibold text-red-700">{thumbsDown}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Scores */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">Évaluations Individuelles</h4>
        {quickScores.map((score) => (
          <div
            key={score.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">{score.scoredByName}</p>
                <p className="text-xs text-gray-500">{formatDateTime(score.scoredAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarDisplay rating={score.overallRating} />
                {score.thumbs && (
                  <span className="text-2xl">
                    {score.thumbs === 'up' && '👍'}
                    {score.thumbs === 'down' && '👎'}
                    {score.thumbs === 'neutral' && '🤔'}
                  </span>
                )}
              </div>
            </div>

            {/* Category Ratings */}
            {(score.technicalRating || score.cultureFitRating || score.communicationRating) && (
              <div className="flex gap-4 mb-3 text-sm">
                {score.technicalRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">💻</span>
                    <StarDisplay rating={score.technicalRating} />
                  </div>
                )}
                {score.cultureFitRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">🎯</span>
                    <StarDisplay rating={score.cultureFitRating} />
                  </div>
                )}
                {score.communicationRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">💬</span>
                    <StarDisplay rating={score.communicationRating} />
                  </div>
                )}
              </div>
            )}

            {/* Quick Notes */}
            {score.quickNotes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 italic">"{score.quickNotes}"</p>
              </div>
            )}

            {/* Tags */}
            {score.tags && score.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {score.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 bg-[#3b5335ff] text-white text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
