'use client'

import { InterviewSchedule, InterviewFeedback, HIRING_RECOMMENDATION_LABELS, HIRING_RECOMMENDATION_COLORS } from '@/app/types/candidates'

interface InterviewFeedbackDisplayProps {
  interview: InterviewSchedule
}

export default function InterviewFeedbackDisplay({ interview }: InterviewFeedbackDisplayProps) {
  const feedbacks = interview.feedback || []

  if (feedbacks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Aucun feedback soumis pour cet entretien</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Aggregated Summary */}
      {interview.aggregatedRating && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Évaluation Globale</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Note Moyenne</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-3xl font-bold text-gray-900">{interview.aggregatedRating.toFixed(1)}</div>
                <div className="text-gray-500">/  5.0</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-xl ${star <= Math.round(interview.aggregatedRating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {interview.aggregatedRecommendation && (
              <div>
                <div className="text-sm text-gray-600">Recommandation</div>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${HIRING_RECOMMENDATION_COLORS[interview.aggregatedRecommendation]}`}>
                    {HIRING_RECOMMENDATION_LABELS[interview.aggregatedRecommendation]}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Basé sur {feedbacks.length} feedback{feedbacks.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Individual Feedbacks */}
      {feedbacks.map((feedback, index) => (
        <FeedbackCard key={index} feedback={feedback} index={index} />
      ))}
    </div>
  )
}

function FeedbackCard({ feedback, index }: { feedback: InterviewFeedback; index: number }) {
  const avgRating = calculateAverageRating(feedback.ratings)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-gray-900">{feedback.interviewerName}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Soumis le {new Date(feedback.submittedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${HIRING_RECOMMENDATION_COLORS[feedback.recommendation]}`}>
            {HIRING_RECOMMENDATION_LABELS[feedback.recommendation]}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Résumé</h5>
          <p className="text-sm text-gray-700 leading-relaxed">{feedback.summary}</p>
        </div>

        {/* Ratings Grid */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Évaluations Détaillées</h5>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
            <RatingItem label="Technique" value={feedback.ratings.technical} />
            <RatingItem label="Communication" value={feedback.ratings.communication} />
            <RatingItem label="Résolution de Problèmes" value={feedback.ratings.problemSolving} />
            <RatingItem label="Culture Fit" value={feedback.ratings.cultureFit} />
            <RatingItem label="Motivation" value={feedback.ratings.motivation} />
            <RatingItem label="Travail d'Équipe" value={feedback.ratings.teamwork} />
            {feedback.ratings.leadership && (
              <RatingItem label="Leadership" value={feedback.ratings.leadership} />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Note Moyenne</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}/5.0</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`text-base ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">💪 Points Forts</h5>
            <ul className="space-y-1">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {feedback.weaknesses && feedback.weaknesses.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">⚠️ Points Faibles</h5>
            <ul className="space-y-1">
              {feedback.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">−</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">📈 Axes d'Amélioration</h5>
            <ul className="space-y-1">
              {feedback.areasForImprovement.map((area, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Standout Moments */}
        {feedback.standoutMoments && feedback.standoutMoments.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-green-900 mb-2">✨ Moments Marquants</h5>
            <ul className="space-y-2">
              {feedback.standoutMoments.map((moment, i) => (
                <li key={i} className="text-sm text-green-800">{moment}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flags */}
        {feedback.redFlags && feedback.redFlags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="text-sm font-semibold text-red-900 mb-2">🚩 Signaux d'Alerte</h5>
            <ul className="space-y-2">
              {feedback.redFlags.map((flag, i) => (
                <li key={i} className="text-sm text-red-800">{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Skills Assessment */}
        {feedback.technicalSkillsAssessment && feedback.technicalSkillsAssessment.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">💻 Évaluation Technique</h5>
            <div className="space-y-2">
              {feedback.technicalSkillsAssessment.map((skill, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded p-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{skill.skill}</div>
                    {skill.notes && (
                      <div className="text-xs text-gray-600 mt-0.5">{skill.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-sm ${star <= skill.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{skill.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Responses */}
        {feedback.questionResponses && feedback.questionResponses.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">❓ Questions & Réponses</h5>
            <div className="space-y-3">
              {feedback.questionResponses.map((qr, i) => (
                <div key={i} className="border-l-2 border-blue-300 pl-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Q: {qr.question}</div>
                  <div className="text-sm text-gray-600">{qr.response}</div>
                  {qr.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`text-xs ${star <= qr.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Comments */}
        {feedback.additionalComments && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">💬 Commentaires Additionnels</h5>
            <p className="text-sm text-gray-600 italic">{feedback.additionalComments}</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div>
              Embaucherait à nouveau:{' '}
              <span className={`font-semibold ${feedback.wouldHireAgain ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.wouldHireAgain ? '👍 Oui' : '👎 Non'}
              </span>
            </div>
            <div>
              Confiance:{' '}
              <span className="font-semibold text-gray-900">{feedback.confidenceLevel}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RatingItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-700">{label}</span>
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-sm ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-600 min-w-[2rem] text-right">{value}/5</span>
      </div>
    </div>
  )
}

function calculateAverageRating(ratings: InterviewFeedback['ratings']): number {
  const ratingValues = [
    ratings.technical,
    ratings.communication,
    ratings.problemSolving,
    ratings.cultureFit,
    ratings.motivation,
    ratings.teamwork
  ]
  if (ratings.leadership) ratingValues.push(ratings.leadership)

  const sum = ratingValues.reduce((a, b) => a + b, 0)
  return sum / ratingValues.length
}
