// src/app/candidates/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Candidate,
  CandidateStatus,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_FLOW,
  EXPERIENCE_LEVEL_LABELS,
  SKILL_LEVEL_LABELS,
  CandidateNote,
  CandidateActivity
} from '@/app/types/candidates'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import EmailComposer from '@/app/components/EmailComposer'
import InterviewScheduler from '@/app/components/InterviewScheduler'

export default function CandidateProfilePage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'documents' | 'activity'>('overview')

  // Status change
  const [changingStatus, setChangingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<CandidateStatus | null>(null)

  // Notes
  const [noteContent, setNoteContent] = useState('')
  const [isPrivateNote, setIsPrivateNote] = useState(false)
  const [addingNote, setAddingNote] = useState(false)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  // Email composer
  const [showEmailComposer, setShowEmailComposer] = useState(false)

  // Interview scheduler
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false)

  useEffect(() => {
    fetchCandidate()
  }, [candidateId])

  const fetchCandidate = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/candidates/${candidateId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidate')
      }

      setCandidate(data.candidate)
    } catch (err: any) {
      console.error('Error fetching candidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: CandidateStatus) => {
    if (!candidate) return

    try {
      setChangingStatus(true)
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      await fetchCandidate()
      setNewStatus(null)
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    } finally {
      setChangingStatus(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    try {
      setAddingNote(true)
      const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: noteContent,
          isPrivate: isPrivateNote
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      setNoteContent('')
      setIsPrivateNote(false)
      await fetchCandidate()
    } catch (err: any) {
      alert('Error adding note: ' + err.message)
    } finally {
      setAddingNote(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        throw new Error('Failed to update candidate')
      }

      setIsEditing(false)
      setEditData({})
      await fetchCandidate()
    } catch (err: any) {
      alert('Error updating candidate: ' + err.message)
    }
  }

  const getStatusColor = (status: CandidateStatus): string => {
    const colors: Record<CandidateStatus, string> = {
      [CandidateStatus.NEW]: 'bg-blue-100 text-blue-800 border-blue-300',
      [CandidateStatus.CONTACTED]: 'bg-purple-100 text-purple-800 border-purple-300',
      [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 text-orange-800 border-orange-300',
      [CandidateStatus.INTERVIEW_COMPLETED]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      [CandidateStatus.OFFER_ACCEPTED]: 'bg-green-100 text-green-800 border-green-300',
      [CandidateStatus.OFFER_REJECTED]: 'bg-red-100 text-red-800 border-red-300',
      [CandidateStatus.HIRED]: 'bg-green-200 text-green-900 border-green-400',
      [CandidateStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
      [CandidateStatus.ON_HOLD]: 'bg-gray-100 text-gray-800 border-gray-300',
      [CandidateStatus.ARCHIVED]: 'bg-gray-200 text-gray-600 border-gray-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (error || !candidate) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
          <Header />
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-red-800 font-bold mb-2">Erreur</h2>
              <p className="text-red-600">{error || 'Candidat non trouvé'}</p>
              <Link href="/candidates" className="text-red-800 underline mt-4 inline-block">
                ← Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </AdminGuard>
    )
  }

  const allowedNextStatuses = CANDIDATE_STATUS_FLOW[candidate.status] || []

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <Header />

        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/candidates" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour à la liste
            </Link>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <p className="text-xl opacity-90 mb-4">
                  {candidate.currentPosition || 'Position non spécifiée'}
                  {candidate.currentCompany && ` @ ${candidate.currentCompany}`}
                </p>
                <div className="flex gap-4 items-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(candidate.status)}`}>
                    {CANDIDATE_STATUS_LABELS[candidate.status]}
                  </span>
                  <span className="text-white/70">
                    📧 {candidate.email}
                  </span>
                  {candidate.phone && (
                    <span className="text-white/70">
                      📞 {candidate.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowInterviewScheduler(true)}
                  className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  📅 Planifier Entretien
                </button>
                <button
                  onClick={() => setShowEmailComposer(true)}
                  className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  📧 Envoyer Email
                </button>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setEditData({
                        firstName: candidate.firstName,
                        lastName: candidate.lastName,
                        email: candidate.email,
                        phone: candidate.phone,
                        currentPosition: candidate.currentPosition,
                        currentCompany: candidate.currentCompany
                      })
                    }}
                    className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    ✏️ Modifier
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                    >
                      ✓ Sauvegarder
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditData({})
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                    >
                      ✕ Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Status Change Section */}
        {allowedNextStatuses.length > 0 && (
          <section className="bg-white/80 border-b border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#3b5335ff]">Changer le statut:</span>
                <div className="flex gap-2 flex-wrap">
                  {allowedNextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={changingStatus}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all hover:shadow-md disabled:opacity-50 ${getStatusColor(status)}`}
                    >
                      → {CANDIDATE_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabs Navigation */}
        <section className="bg-white/80 border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              {[
                { id: 'overview' as const, label: 'Vue d\'ensemble', icon: '👤' },
                { id: 'experience' as const, label: 'Expérience', icon: '💼' },
                { id: 'documents' as const, label: 'Documents', icon: '📄' },
                { id: 'activity' as const, label: 'Activité', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#ffaf50ff] text-[#3b5335ff]'
                      : 'border-transparent text-gray-600 hover:text-[#3b5335ff]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Informations Personnelles</h2>

                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                            <input
                              type="text"
                              value={editData.firstName || ''}
                              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                            <input
                              type="text"
                              value={editData.lastName || ''}
                              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={editData.email || ''}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                            <input
                              type="tel"
                              value={editData.phone || ''}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Poste Actuel</label>
                            <input
                              type="text"
                              value={editData.currentPosition || ''}
                              onChange={(e) => setEditData({ ...editData, currentPosition: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise Actuelle</label>
                            <input
                              type="text"
                              value={editData.currentCompany || ''}
                              onChange={(e) => setEditData({ ...editData, currentCompany: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{candidate.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{candidate.phone || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Niveau d&apos;expérience</p>
                            <p className="font-medium">{EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Disponibilité</p>
                            <p className="font-medium">{candidate.availability || 'Non spécifiée'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Source</p>
                            <p className="font-medium">{candidate.source}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assigné à</p>
                            <p className="font-medium">{candidate.assignedToName || 'Non assigné'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Compétences</h2>
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="space-y-4">
                          {candidate.skills.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h3 className="font-semibold text-[#3b5335ff]">{skill.name}</h3>
                                {skill.yearsOfExperience && (
                                  <p className="text-sm text-gray-600">{skill.yearsOfExperience} ans d&apos;expérience</p>
                                )}
                              </div>
                              <span className="px-3 py-1 bg-[#3b5335ff] text-white text-sm rounded-full">
                                {SKILL_LEVEL_LABELS[skill.level]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Aucune compétence renseignée</p>
                      )}
                    </div>

                    {/* Rating */}
                    {candidate.overallRating && (
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Évaluations</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Note Globale</p>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500 text-2xl">★</span>
                              <span className="text-2xl font-bold">{candidate.overallRating.toFixed(1)}</span>
                              <span className="text-gray-500">/ 5</span>
                            </div>
                          </div>
                          {candidate.technicalRating && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Technique</p>
                              <div className="flex items-center gap-2">
                                <span className="text-blue-500 text-2xl">★</span>
                                <span className="text-2xl font-bold">{candidate.technicalRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {candidate.culturalFitRating && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Culture Fit</p>
                              <div className="flex items-center gap-2">
                                <span className="text-green-500 text-2xl">★</span>
                                <span className="text-2xl font-bold">{candidate.culturalFitRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {candidate.communicationRating && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Communication</p>
                              <div className="flex items-center gap-2">
                                <span className="text-purple-500 text-2xl">★</span>
                                <span className="text-2xl font-bold">{candidate.communicationRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <>
                    {/* Work Experience */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Expériences Professionnelles</h2>
                      {candidate.workExperience && candidate.workExperience.length > 0 ? (
                        <div className="space-y-6">
                          {candidate.workExperience.map((exp) => (
                            <div key={exp.id} className="border-l-4 border-[#ffaf50ff] pl-4">
                              <h3 className="text-lg font-bold text-[#3b5335ff]">{exp.position}</h3>
                              <p className="text-gray-700 font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500 mb-2">
                                {formatDate(exp.startDate)} - {exp.isCurrent ? 'Présent' : formatDate(exp.endDate)}
                              </p>
                              {exp.description && (
                                <p className="text-gray-600 mb-2">{exp.description}</p>
                              )}
                              {exp.technologies && exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {exp.technologies.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Aucune expérience renseignée</p>
                      )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Formation</h2>
                      {candidate.education && candidate.education.length > 0 ? (
                        <div className="space-y-4">
                          {candidate.education.map((edu) => (
                            <div key={edu.id} className="p-4 bg-gray-50 rounded-lg">
                              <h3 className="font-bold text-[#3b5335ff]">{edu.degree}</h3>
                              <p className="text-gray-700">{edu.institution}</p>
                              <p className="text-sm text-gray-500">
                                {edu.field} • {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Aucune formation renseignée</p>
                      )}
                    </div>
                  </>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Documents</h2>
                    <div className="space-y-4">
                      {candidate.resumeId && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">CV</p>
                            <p className="text-sm text-gray-500">Document ID: {candidate.resumeId}</p>
                          </div>
                          <button className="text-[#3b5335ff] hover:text-[#ffaf50ff]">
                            Télécharger →
                          </button>
                        </div>
                      )}
                      {candidate.linkedinUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">LinkedIn</p>
                            <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {candidate.linkedinUrl}
                            </a>
                          </div>
                        </div>
                      )}
                      {candidate.portfolioUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Portfolio</p>
                            <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {candidate.portfolioUrl}
                            </a>
                          </div>
                        </div>
                      )}
                      {!candidate.resumeId && !candidate.linkedinUrl && !candidate.portfolioUrl && (
                        <p className="text-gray-500">Aucun document disponible</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Historique d&apos;Activité</h2>
                    {candidate.activities && candidate.activities.length > 0 ? (
                      <div className="space-y-4">
                        {[...candidate.activities].reverse().map((activity) => (
                          <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-10 h-10 bg-[#3b5335ff] rounded-full flex items-center justify-center text-white">
                              {activity.type === 'status_change' && '🔄'}
                              {activity.type === 'note_added' && '📝'}
                              {activity.type === 'profile_updated' && '✏️'}
                              {activity.type === 'document_uploaded' && '📄'}
                              {activity.type === 'email_sent' && '📧'}
                              {!['status_change', 'note_added', 'profile_updated', 'document_uploaded', 'email_sent'].includes(activity.type) && '•'}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-500">
                                Par {activity.userName} • {formatDateTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune activité enregistrée</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Add Note */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Ajouter une Note</h3>
                  <form onSubmit={handleAddNote} className="space-y-4">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Écrivez une note..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                      required
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isPrivateNote}
                        onChange={(e) => setIsPrivateNote(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Note privée</span>
                    </label>
                    <button
                      type="submit"
                      disabled={addingNote}
                      className="w-full bg-[#3b5335ff] text-white py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50"
                    >
                      {addingNote ? 'Ajout...' : '+ Ajouter la Note'}
                    </button>
                  </form>
                </div>

                {/* Recent Notes */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Notes Récentes</h3>
                  {candidate.notes && candidate.notes.length > 0 ? (
                    <div className="space-y-4">
                      {[...candidate.notes].reverse().slice(0, 5).map((note) => (
                        <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{note.authorName}</span>
                            {note.isPrivate && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                🔒 Privé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune note</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé le</span>
                      <span className="font-medium">{formatDate(candidate.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière MAJ</span>
                      <span className="font-medium">{formatDate(candidate.updatedAt)}</span>
                    </div>
                    {candidate.lastContactedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernier Contact</span>
                        <span className="font-medium">{formatDate(candidate.lastContactedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notes</span>
                      <span className="font-medium">{candidate.notes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activités</span>
                      <span className="font-medium">{candidate.activities?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Interviews */}
                {candidate.interviews && candidate.interviews.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Entretiens à Venir</h3>
                    <div className="space-y-4">
                      {candidate.interviews
                        .filter(interview => interview.status === 'scheduled')
                        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                        .slice(0, 3)
                        .map((interview) => (
                          <div key={interview.id} className="p-4 bg-gradient-to-r from-[#3b5335ff]/10 to-[#ffaf50ff]/10 rounded-lg border-l-4 border-[#ffaf50ff]">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-[#3b5335ff]">
                                {interview.type === 'phone' && '📞'}
                                {interview.type === 'video' && '🎥'}
                                {interview.type === 'in_person' && '🏢'}
                                {interview.type === 'technical' && '💻'}
                                {interview.type === 'hr' && '👔'}
                                {' '}
                                {interview.jobTitle || 'Entretien'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              📅 {formatDateTime(interview.scheduledDate)}
                            </p>
                            <p className="text-xs text-gray-500">
                              ⏱️ {interview.duration} minutes
                            </p>
                            {interview.meetingLink && (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                🔗 Lien de visioconférence
                              </a>
                            )}
                          </div>
                        ))}
                      {candidate.interviews.filter(i => i.status === 'scheduled').length === 0 && (
                        <p className="text-gray-500 text-sm">Aucun entretien planifié</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Email Composer Modal */}
        {showEmailComposer && (
          <EmailComposer
            candidateId={candidateId}
            candidateName={`${candidate.firstName} ${candidate.lastName}`}
            candidateEmail={candidate.email}
            onClose={() => setShowEmailComposer(false)}
            onSent={() => {
              fetchCandidate() // Refresh to show email activity
            }}
          />
        )}

        {/* Interview Scheduler Modal */}
        {showInterviewScheduler && (
          <InterviewScheduler
            candidateId={candidateId}
            candidateName={`${candidate.firstName} ${candidate.lastName}`}
            onClose={() => setShowInterviewScheduler(false)}
            onScheduled={() => {
              fetchCandidate() // Refresh to show interview
            }}
          />
        )}
      </div>
    </AdminGuard>
  )
}
