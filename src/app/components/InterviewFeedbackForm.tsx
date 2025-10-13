'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  HiringRecommendation,
  InterviewFeedback,
  InterviewSchedule,
  HIRING_RECOMMENDATION_LABELS
} from '@/app/types/candidates'

interface InterviewFeedbackFormProps {
  candidateId: string
  candidateName: string
  interview: InterviewSchedule
  currentUserId: string
  currentUserName: string
  onSubmit: (feedback: Partial<InterviewFeedback>) => Promise<void>
  onClose: () => void
}

interface RatingField {
  technical: number
  communication: number
  problemSolving: number
  cultureFit: number
  motivation: number
  leadership: number
  teamwork: number
}

export default function InterviewFeedbackForm({
  candidateId,
  candidateName,
  interview,
  currentUserId,
  currentUserName,
  onSubmit,
  onClose
}: InterviewFeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [recommendation, setRecommendation] = useState<HiringRecommendation>(HiringRecommendation.MAYBE)
  const [summary, setSummary] = useState('')
  const [ratings, setRatings] = useState<RatingField>({
    technical: 3,
    communication: 3,
    problemSolving: 3,
    cultureFit: 3,
    motivation: 3,
    leadership: 3,
    teamwork: 3
  })
  const [strengths, setStrengths] = useState<string[]>([''])
  const [weaknesses, setWeaknesses] = useState<string[]>([''])
  const [areasForImprovement, setAreasForImprovement] = useState<string[]>([''])
  const [redFlags, setRedFlags] = useState<string[]>([''])
  const [standoutMoments, setStandoutMoments] = useState<string[]>([''])
  const [additionalComments, setAdditionalComments] = useState('')
  const [wouldHireAgain, setWouldHireAgain] = useState(true)
  const [confidenceLevel, setConfidenceLevel] = useState(3)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const feedbackData: Partial<InterviewFeedback> = {
        interviewerId: currentUserId,
        interviewerName: currentUserName,
        submittedAt: new Date().toISOString(),
        recommendation,
        summary,
        ratings,
        strengths: strengths.filter(s => s.trim()),
        weaknesses: weaknesses.filter(w => w.trim()),
        areasForImprovement: areasForImprovement.filter(a => a.trim()),
        redFlags: redFlags.filter(r => r.trim()),
        standoutMoments: standoutMoments.filter(s => s.trim()),
        additionalComments,
        wouldHireAgain,
        confidenceLevel
      }

      await onSubmit(feedbackData)
      toast.success('Feedback soumis avec succès', {
        description: 'Votre évaluation a été enregistrée'
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Erreur lors de la soumission du feedback', {
        description: 'Veuillez réessayer ultérieurement'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ''])
  }

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const newArray = [...prev]
      newArray[index] = value
      return newArray
    })
  }

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const RatingStars = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium text-gray-700 w-40">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-300`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600 w-8 text-right">{value}/5</span>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Feedback d'Entretien</h2>
              <p className="text-sm text-gray-600 mt-1">
                Candidat: <span className="font-semibold">{candidateName}</span> •
                Entretien: <span className="font-semibold">{interview.jobTitle || 'Position'}</span> •
                Date: {new Date(interview.scheduledDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step === currentStep
                    ? 'bg-blue-500'
                    : step < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Évaluation</span>
            <span className="text-xs text-gray-600">Feedback</span>
            <span className="text-xs text-gray-600">Points Clés</span>
            <span className="text-xs text-gray-600">Résumé</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Ratings and Recommendation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandation Globale</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(HIRING_RECOMMENDATION_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRecommendation(key as HiringRecommendation)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        recommendation === key
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évaluations Détaillées</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <RatingStars
                    label="Compétences Techniques"
                    value={ratings.technical}
                    onChange={(val) => setRatings({ ...ratings, technical: val })}
                  />
                  <RatingStars
                    label="Communication"
                    value={ratings.communication}
                    onChange={(val) => setRatings({ ...ratings, communication: val })}
                  />
                  <RatingStars
                    label="Résolution de Problèmes"
                    value={ratings.problemSolving}
                    onChange={(val) => setRatings({ ...ratings, problemSolving: val })}
                  />
                  <RatingStars
                    label="Culture Fit"
                    value={ratings.cultureFit}
                    onChange={(val) => setRatings({ ...ratings, cultureFit: val })}
                  />
                  <RatingStars
                    label="Motivation"
                    value={ratings.motivation}
                    onChange={(val) => setRatings({ ...ratings, motivation: val })}
                  />
                  <RatingStars
                    label="Leadership"
                    value={ratings.leadership}
                    onChange={(val) => setRatings({ ...ratings, leadership: val })}
                  />
                  <RatingStars
                    label="Travail d'Équipe"
                    value={ratings.teamwork}
                    onChange={(val) => setRatings({ ...ratings, teamwork: val })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Niveau de Confiance</h3>
                <p className="text-sm text-gray-600 mb-3">À quel point êtes-vous confiant dans votre évaluation?</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-gray-700 w-16">{confidenceLevel}/5</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Peu confiant</span>
                  <span>Très confiant</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Structured Feedback */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Points Forts</h3>
                <p className="text-sm text-gray-600 mb-3">Quelles sont les principales forces du candidat?</p>
                {strengths.map((strength, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => updateItem(setStrengths, index, e.target.value)}
                      placeholder="Ex: Excellente maîtrise de React et TypeScript"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {strengths.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setStrengths, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setStrengths)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un point fort
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Points Faibles</h3>
                <p className="text-sm text-gray-600 mb-3">Quels aspects nécessitent amélioration?</p>
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={weakness}
                      onChange={(e) => updateItem(setWeaknesses, index, e.target.value)}
                      placeholder="Ex: Manque d'expérience en tests unitaires"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {weaknesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setWeaknesses, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setWeaknesses)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un point faible
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Axes d'Amélioration</h3>
                <p className="text-sm text-gray-600 mb-3">Que devrait développer le candidat?</p>
                {areasForImprovement.map((area, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => updateItem(setAreasForImprovement, index, e.target.value)}
                      placeholder="Ex: Approfondir les connaissances en architecture cloud"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {areasForImprovement.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setAreasForImprovement, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setAreasForImprovement)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un axe d'amélioration
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Key Moments */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Moments Marquants</h3>
                <p className="text-sm text-gray-600 mb-3">Qu'est-ce qui vous a particulièrement impressionné?</p>
                {standoutMoments.map((moment, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={moment}
                      onChange={(e) => updateItem(setStandoutMoments, index, e.target.value)}
                      placeholder="Ex: A résolu un problème algorithmique complexe en moins de 10 minutes"
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {standoutMoments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setStandoutMoments, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setStandoutMoments)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un moment marquant
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Signaux d'Alerte</h3>
                <p className="text-sm text-gray-600 mb-3">Y a-t-il des préoccupations majeures?</p>
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={flag}
                      onChange={(e) => updateItem(setRedFlags, index, e.target.value)}
                      placeholder="Ex: A montré peu d'intérêt pour le travail en équipe"
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {redFlags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(setRedFlags, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(setRedFlags)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un signal d'alerte
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Embaucherai à Nouveau?</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setWouldHireAgain(true)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      wouldHireAgain
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">👍</div>
                    <div className="font-semibold">Oui</div>
                    <div className="text-xs text-gray-600">Je recruterais ce candidat à nouveau</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldHireAgain(false)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      !wouldHireAgain
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">👎</div>
                    <div className="font-semibold">Non</div>
                    <div className="text-xs text-gray-600">Je ne recommande pas ce candidat</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé de l'Entretien</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Rédigez un résumé global de votre évaluation du candidat
                </p>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ex: Candidat solide avec de bonnes compétences techniques. Montre un fort potentiel pour évoluer dans un rôle senior. Communication claire et bonne compréhension des enjeux business..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Commentaires Additionnels</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Toute autre information pertinente (optionnel)
                </p>
                <textarea
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="Ex: Le candidat a mentionné qu'il est disponible immédiatement..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Summary Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Aperçu de votre feedback:</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Recommandation:</span>{' '}
                    {HIRING_RECOMMENDATION_LABELS[recommendation]}
                  </div>
                  <div>
                    <span className="font-medium">Note moyenne:</span>{' '}
                    {(
                      Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
                    ).toFixed(1)}/5
                  </div>
                  <div>
                    <span className="font-medium">Points forts:</span> {strengths.filter(s => s.trim()).length}
                  </div>
                  <div>
                    <span className="font-medium">Points faibles:</span> {weaknesses.filter(w => w.trim()).length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <button
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1)
              else onClose()
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={isSubmitting}
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                disabled={isSubmitting}
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !summary.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi...' : 'Soumettre le Feedback'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
