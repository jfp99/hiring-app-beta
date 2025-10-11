// src/app/components/InterviewScheduler.tsx
'use client'

import { useState } from 'react'
import { InterviewSchedule } from '@/app/types/candidates'

interface InterviewSchedulerProps {
  candidateId: string
  candidateName: string
  onClose: () => void
  onScheduled: () => void
  existingInterview?: InterviewSchedule
}

export default function InterviewScheduler({
  candidateId,
  candidateName,
  onClose,
  onScheduled,
  existingInterview
}: InterviewSchedulerProps) {
  const isEdit = !!existingInterview

  const [formData, setFormData] = useState({
    jobTitle: existingInterview?.jobTitle || '',
    scheduledDate: existingInterview?.scheduledDate
      ? new Date(existingInterview.scheduledDate).toISOString().slice(0, 16)
      : '',
    duration: existingInterview?.duration || 60,
    type: existingInterview?.type || 'video' as const,
    location: existingInterview?.location || '',
    meetingLink: existingInterview?.meetingLink || '',
    notes: existingInterview?.notes || '',
    sendCalendarInvite: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value) : value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isEdit
        ? `/api/candidates/${candidateId}/interviews/${existingInterview.id}`
        : `/api/candidates/${candidateId}/interviews`

      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledDate: new Date(formData.scheduledDate).toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la planification')
      }

      onScheduled()
      onClose()
    } catch (err: any) {
      console.error('Error scheduling interview:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const interviewTypeLabels = {
    phone: '📞 Téléphonique',
    video: '🎥 Visioconférence',
    in_person: '🏢 En présentiel',
    technical: '💻 Technique',
    hr: '👔 RH'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {isEdit ? 'Modifier l\'Entretien' : 'Planifier un Entretien'}
            </h2>
            <p className="text-sm opacity-90">
              Avec: {candidateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'Entretien *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
              >
                {Object.entries(interviewTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Ex: Développeur Full Stack"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et Heure *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (minutes) *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="90">1h 30</option>
                  <option value="120">2 heures</option>
                  <option value="180">3 heures</option>
                </select>
              </div>
            </div>

            {/* Location / Meeting Link */}
            {formData.type === 'in_person' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Adresse du lieu de l'entretien"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien de Visioconférence
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Services recommandés: Google Meet, Zoom, Microsoft Teams
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Instructions
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Informations complémentaires pour l'entretien..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
              />
            </div>

            {/* Send Calendar Invite - Only show for new interviews */}
            {!isEdit && (
              <div className="bg-gradient-to-r from-[#3b5335ff]/10 to-[#ffaf50ff]/10 border border-[#3b5335ff]/20 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="sendCalendarInvite"
                    checked={formData.sendCalendarInvite}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#ffaf50ff] border-gray-300 rounded focus:ring-2 focus:ring-[#ffaf50ff] cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-semibold text-[#3b5335ff]">
                      📅 Envoyer une invitation calendrier
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Le candidat recevra un email avec un fichier .ics à ajouter à son calendrier (Google Calendar, Outlook, etc.)
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Rappel</p>
                  <p>
                    Un email de confirmation peut être envoyé au candidat après la planification.
                    Pensez à ajouter les détails de l'entretien dans vos calendriers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#ffaf50ff] text-[#3b5335ff] rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3b5335ff]"></div>
                  {isEdit ? 'Mise à jour...' : 'Planification...'}
                </span>
              ) : (
                isEdit ? 'Mettre à Jour' : 'Planifier l\'Entretien'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
