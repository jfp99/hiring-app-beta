// src/app/candidates/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  Calendar,
  Edit,
  Check,
  User,
  Briefcase,
  Star,
  FileText,
  BarChart3,
  Clock,
  MapPin,
  Link as LinkIcon,
  RefreshCw,
  StickyNote,
  Zap,
  Save,
  Video,
  Building2,
  MessageSquare,
  Send,
  Paperclip
} from 'lucide-react'
import {
  Candidate,
  CandidateStatus,
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_FLOW,
  EXPERIENCE_LEVEL_LABELS,
  SKILL_LEVEL_LABELS,
  INTERVIEW_TYPE_LABELS,
  CandidateNote,
  CandidateActivity,
  InterviewSchedule
} from '@/app/types/candidates'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import EmailComposer from '@/app/components/EmailComposer'
import InterviewScheduler from '@/app/components/InterviewScheduler'
import InterviewFeedbackForm from '@/app/components/InterviewFeedbackForm'
import InterviewFeedbackDisplay from '@/app/components/InterviewFeedbackDisplay'
import TagInput from '@/app/components/TagInput'
import QuickScoreForm from '@/app/components/QuickScoreForm'
import QuickScoreDisplay from '@/app/components/QuickScoreDisplay'
import CommentForm from '@/app/components/CommentForm'
import CommentThread from '@/app/components/CommentThread'
import CustomFieldDisplay from '@/app/components/CustomFieldDisplay'
import { Comment } from '@/app/types/comments'
import { CustomFieldDefinition } from '@/app/types/customFields'

export default function CandidateProfilePage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string
  const { data: session } = useSession()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'documents' | 'interviews' | 'activity' | 'scores' | 'comments'>('overview')

  // Comments
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // Custom fields
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])

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

  // Interview feedback
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewSchedule | null>(null)

  // Quick Score
  const [showQuickScoreForm, setShowQuickScoreForm] = useState(false)

  useEffect(() => {
    fetchCandidate()
  }, [candidateId])

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments()
    }
  }, [activeTab, candidateId])

  useEffect(() => {
    // Fetch custom field definitions
    const fetchCustomFields = async () => {
      try {
        const response = await fetch('/api/custom-fields?isActive=true')
        const data = await response.json()
        if (data.success) {
          setCustomFields(data.fields)
        }
      } catch (err) {
        console.error('Error fetching custom fields:', err)
      }
    }
    fetchCustomFields()
  }, [])

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

  const fetchComments = async () => {
    try {
      setLoadingComments(true)

      const response = await fetch(`/api/comments?candidateId=${candidateId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments')
      }

      setComments(data.comments || [])
    } catch (err: any) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoadingComments(false)
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
      toast.success('Statut mis à jour avec succès', {
        description: `Le statut du candidat a été changé`
      })
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour du statut', {
        description: err.message
      })
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
      toast.success('Note ajoutée avec succès', {
        description: isPrivateNote ? 'Note privée enregistrée' : 'Note enregistrée'
      })
    } catch (err: any) {
      toast.error('Erreur lors de l\'ajout de la note', {
        description: err.message
      })
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
      toast.success('Profil mis à jour avec succès', {
        description: 'Les modifications ont été enregistrées'
      })
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour du profil', {
        description: err.message
      })
    }
  }

  const handleFeedbackSubmit = async (feedbackData: any) => {
    if (!selectedInterview) return

    try {
      const response = await fetch(
        `/api/candidates/${candidateId}/interviews/${selectedInterview.id}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData)
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit feedback')
      }

      // Refresh candidate data to show new feedback
      await fetchCandidate()
      setShowFeedbackForm(false)
      setSelectedInterview(null)
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      throw err
    }
  }

  const handleTagsUpdate = async (newTags: string[]) => {
    if (!candidate) return

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags })
      })

      if (!response.ok) {
        throw new Error('Failed to update tags')
      }

      await fetchCandidate()
      toast.success('Tags mis à jour avec succès', {
        description: 'Les tags du candidat ont été modifiés'
      })
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour des tags', {
        description: err.message
      })
    }
  }

  const handleQuickScoreSubmit = async (scoreData: any) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/quick-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit quick score')
      }

      // Refresh candidate data to show new score
      await fetchCandidate()
      setShowQuickScoreForm(false)
    } catch (err: any) {
      console.error('Error submitting quick score:', err)
      throw err
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
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement du profil...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (error || !candidate) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
          <AdminHeader />
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-red-800 dark:text-red-300 font-bold mb-2">Erreur</h2>
              <p className="text-red-600 dark:text-red-400">{error || 'Candidat non trouvé'}</p>
              <Link href="/candidates" className="text-red-800 dark:text-red-300 underline mt-4 inline-block hover:text-red-600 dark:hover:text-red-200">
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
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/candidates" className="text-white/80 hover:text-white dark:text-gray-300 dark:hover:text-white mb-4 inline-block cursor-pointer">
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
                  <span className="text-white/70 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </span>
                  {candidate.phone && (
                    <span className="text-white/70 dark:text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQuickScoreForm(true)}
                  className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer dark:bg-accent-500 dark:text-primary-900"
                >
                  <Zap className="w-5 h-5" />
                  Évaluation Rapide
                </button>
                <button
                  onClick={() => setShowInterviewScheduler(true)}
                  className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer dark:bg-gray-700 dark:text-accent-500"
                >
                  <Calendar className="w-5 h-5" />
                  Planifier Entretien
                </button>
                <button
                  onClick={() => setShowEmailComposer(true)}
                  className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer dark:bg-gray-700 dark:text-accent-500"
                >
                  <Mail className="w-5 h-5" />
                  Envoyer Email
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
                    className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer dark:bg-accent-500 dark:text-primary-900"
                  >
                    <Edit className="w-5 h-5 inline mr-2" />
                    Modifier
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <Save className="w-5 h-5 inline mr-2" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditData({})
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer dark:bg-gray-600 dark:hover:bg-gray-700"
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
          <section className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#3b5335ff] dark:text-accent-500">Changer le statut:</span>
                <div className="flex gap-2 flex-wrap">
                  {allowedNextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={changingStatus}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer ${getStatusColor(status)}`}
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
        <section className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              {[
                { id: 'overview' as const, label: 'Vue d\'ensemble', icon: '👤' },
                { id: 'experience' as const, label: 'Expérience', icon: '💼' },
                { id: 'scores' as const, label: 'Évaluations', icon: '⭐' },
                { id: 'documents' as const, label: 'Documents', icon: '📄' },
                { id: 'interviews' as const, label: 'Entretiens', icon: '📅' },
                { id: 'comments' as const, label: 'Commentaires', icon: '💬' },
                { id: 'activity' as const, label: 'Activité', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#ffaf50ff] text-[#3b5335ff] dark:border-accent-500 dark:text-accent-500'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-[#3b5335ff] dark:hover:text-accent-500'
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
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Informations Personnelles</h2>

                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                            <input
                              type="text"
                              value={editData.firstName || ''}
                              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                            <input
                              type="text"
                              value={editData.lastName || ''}
                              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input
                              type="email"
                              value={editData.email || ''}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                            <input
                              type="tel"
                              value={editData.phone || ''}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste Actuel</label>
                            <input
                              type="text"
                              value={editData.currentPosition || ''}
                              onChange={(e) => setEditData({ ...editData, currentPosition: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entreprise Actuelle</label>
                            <input
                              type="text"
                              value={editData.currentCompany || ''}
                              onChange={(e) => setEditData({ ...editData, currentCompany: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.phone || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Niveau d'expérience</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Disponibilité</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.availability || 'Non spécifiée'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.source}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Assigné à</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{candidate.assignedToName || 'Non assigné'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Compétences</h2>
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="space-y-4">
                          {candidate.skills.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex-1">
                                <h3 className="font-semibold text-[#3b5335ff] dark:text-accent-500">{skill.name}</h3>
                                {skill.yearsOfExperience && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{skill.yearsOfExperience} ans d'expérience</p>
                                )}
                              </div>
                              <span className="px-3 py-1 bg-[#3b5335ff] dark:bg-accent-500 text-white dark:text-primary-900 text-sm rounded-full">
                                {SKILL_LEVEL_LABELS[skill.level]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Aucune compétence renseignée</p>
                      )}
                    </div>

                    {/* Rating */}
                    {candidate.overallRating && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Évaluations</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Note Globale</p>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500 dark:text-yellow-400 text-2xl">★</span>
                              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{candidate.overallRating.toFixed(1)}</span>
                              <span className="text-gray-500 dark:text-gray-400">/ 5</span>
                            </div>
                          </div>
                          {candidate.technicalRating && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Technique</p>
                              <div className="flex items-center gap-2">
                                <span className="text-blue-500 dark:text-blue-400 text-2xl">★</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{candidate.technicalRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {candidate.culturalFitRating && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Culture Fit</p>
                              <div className="flex items-center gap-2">
                                <span className="text-green-500 dark:text-green-400 text-2xl">★</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{candidate.culturalFitRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {candidate.communicationRating && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Communication</p>
                              <div className="flex items-center gap-2">
                                <span className="text-purple-500 dark:text-purple-400 text-2xl">★</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{candidate.communicationRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {customFields.length > 0 && candidate.customFields && Object.keys(candidate.customFields).length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Informations Complémentaires</h2>
                        <div>
                          {customFields
                            .filter(field => field.showInProfile && candidate.customFields?.[field.name] !== undefined)
                            .map((field) => (
                              <CustomFieldDisplay
                                key={field.id}
                                field={field}
                                value={candidate.customFields?.[field.name]}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <>
                    {/* Work Experience */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Expériences Professionnelles</h2>
                      {candidate.workExperience && candidate.workExperience.length > 0 ? (
                        <div className="space-y-6">
                          {candidate.workExperience.map((exp) => (
                            <div key={exp.id} className="border-l-4 border-[#ffaf50ff] dark:border-accent-500 pl-4">
                              <h3 className="text-lg font-bold text-[#3b5335ff] dark:text-accent-500">{exp.position}</h3>
                              <p className="text-gray-700 dark:text-gray-200 font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {formatDate(exp.startDate)} - {exp.isCurrent ? 'Présent' : formatDate(exp.endDate)}
                              </p>
                              {exp.description && (
                                <p className="text-gray-600 dark:text-gray-300 mb-2">{exp.description}</p>
                              )}
                              {exp.technologies && exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {exp.technologies.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded border border-gray-200 dark:border-gray-600">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Aucune expérience renseignée</p>
                      )}
                    </div>

                    {/* Education */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Formation</h2>
                      {candidate.education && candidate.education.length > 0 ? (
                        <div className="space-y-4">
                          {candidate.education.map((edu) => (
                            <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                              <h3 className="font-bold text-[#3b5335ff] dark:text-accent-500">{edu.degree}</h3>
                              <p className="text-gray-700 dark:text-gray-200">{edu.institution}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {edu.field} • {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Aucune formation renseignée</p>
                      )}
                    </div>
                  </>
                )}

                {/* Scores Tab */}
                {activeTab === 'scores' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500">⚡ Évaluations Rapides</h2>
                      <button
                        onClick={() => setShowQuickScoreForm(true)}
                        className="px-4 py-2 bg-[#ffaf50ff] dark:bg-accent-500 text-[#3b5335ff] dark:text-primary-900 rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer"
                      >
                        + Nouvelle Évaluation
                      </button>
                    </div>
                    <QuickScoreDisplay quickScores={candidate.quickScores || []} />
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Documents</h2>
                    <div className="space-y-4">
                      {candidate.resumeId && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">CV</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Document ID: {candidate.resumeId}</p>
                          </div>
                          <button className="text-[#3b5335ff] dark:text-accent-500 hover:text-[#ffaf50ff] dark:hover:text-accent-400 cursor-pointer">
                            Télécharger →
                          </button>
                        </div>
                      )}
                      {candidate.linkedinUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">LinkedIn</p>
                            <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                              {candidate.linkedinUrl}
                            </a>
                          </div>
                        </div>
                      )}
                      {candidate.portfolioUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Portfolio</p>
                            <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                              {candidate.portfolioUrl}
                            </a>
                          </div>
                        </div>
                      )}
                      {!candidate.resumeId && !candidate.linkedinUrl && !candidate.portfolioUrl && (
                        <p className="text-gray-500 dark:text-gray-400">Aucun document disponible</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Interviews Tab */}
                {activeTab === 'interviews' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Entretiens</h2>
                      {candidate.interviews && candidate.interviews.length > 0 ? (
                        <div className="space-y-6">
                          {candidate.interviews
                            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                            .map((interview) => (
                            <div key={interview.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              {/* Interview Header */}
                              <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-700 dark:to-gray-600 text-white p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="text-lg font-bold">
                                      {INTERVIEW_TYPE_LABELS[interview.type]} - {interview.jobTitle || 'Position'}
                                    </h3>
                                    <p className="text-sm opacity-90">
                                      📅 {formatDateTime(interview.scheduledDate)} • ⏱️ {interview.duration} min
                                    </p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    interview.status === 'completed' ? 'bg-green-500' :
                                    interview.status === 'scheduled' ? 'bg-blue-500' :
                                    interview.status === 'cancelled' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  }`}>
                                    {interview.status === 'completed' ? 'Terminé' :
                                     interview.status === 'scheduled' ? 'Planifié' :
                                     interview.status === 'cancelled' ? 'Annulé' :
                                     'Reprogrammé'}
                                  </span>
                                </div>
                                {interview.location && (
                                  <p className="text-sm opacity-90">📍 {interview.location}</p>
                                )}
                                {interview.meetingLink && (
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm opacity-90 hover:underline"
                                  >
                                    🔗 Lien de visioconférence
                                  </a>
                                )}
                              </div>

                              {/* Interview Notes */}
                              {interview.notes && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{interview.notes}</p>
                                </div>
                              )}

                              {/* Feedback Section */}
                              <div className="p-4 bg-white dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Feedback d'Entretien ({interview.feedback?.length || 0})
                                  </h4>
                                  {session && (
                                    <button
                                      onClick={() => {
                                        setSelectedInterview(interview)
                                        setShowFeedbackForm(true)
                                      }}
                                      className="px-4 py-2 bg-[#3b5335ff] dark:bg-accent-500 text-white dark:text-primary-900 rounded-lg font-medium hover:bg-[#2a3d26ff] dark:hover:bg-accent-600 transition-all text-sm cursor-pointer"
                                    >
                                      ✍️ Soumettre Feedback
                                    </button>
                                  )}
                                </div>

                                <InterviewFeedbackDisplay interview={interview} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📅</div>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun entretien planifié pour ce candidat</p>
                          <button
                            onClick={() => setShowInterviewScheduler(true)}
                            className="px-6 py-3 bg-[#3b5335ff] dark:bg-accent-500 text-white dark:text-primary-900 rounded-lg font-bold hover:bg-[#2a3d26ff] dark:hover:bg-accent-600 transition-all cursor-pointer"
                          >
                            📅 Planifier un Entretien
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6 flex items-center gap-2">
                        💬 Commentaires & Notes
                        {comments.length > 0 && (
                          <span className="px-3 py-1 bg-[#ffaf50ff] dark:bg-accent-500 text-[#3b5335ff] dark:text-primary-900 rounded-full text-sm font-bold">
                            {comments.length}
                          </span>
                        )}
                      </h2>

                      {/* Add Comment Form */}
                      <div className="mb-8">
                        <CommentForm
                          candidateId={candidateId}
                          onCommentAdded={() => {
                            fetchComments()
                            fetchCandidate() // Refresh to update activity log
                          }}
                        />
                      </div>

                      {/* Comments Thread */}
                      {loadingComments ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] dark:border-accent-500 mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-300">Chargement des commentaires...</p>
                        </div>
                      ) : (
                        <CommentThread
                          comments={comments}
                          onCommentUpdated={() => {
                            fetchComments()
                            fetchCandidate() // Refresh to update activity log
                          }}
                          onCommentDeleted={() => {
                            fetchComments()
                            fetchCandidate() // Refresh to update activity log
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-6">Historique d'Activité</h2>
                    {candidate.activities && candidate.activities.length > 0 ? (
                      <div className="space-y-4">
                        {[...candidate.activities].reverse().map((activity) => (
                          <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex-shrink-0 w-10 h-10 bg-[#3b5335ff] dark:bg-accent-500 rounded-full flex items-center justify-center text-white dark:text-primary-900">
                              {activity.type === 'status_change' && '🔄'}
                              {activity.type === 'note_added' && '📝'}
                              {activity.type === 'profile_updated' && '✏️'}
                              {activity.type === 'document_uploaded' && '📄'}
                              {activity.type === 'email_sent' && '📧'}
                              {activity.type === 'call_made' && '📞'}
                              {activity.type === 'interview_scheduled' && '📅'}
                              {activity.type === 'application_submitted' && '📨'}
                              {activity.type === 'quick_score_added' && '⭐'}
                              {!['status_change', 'note_added', 'profile_updated', 'document_uploaded', 'email_sent', 'call_made', 'interview_scheduled', 'application_submitted', 'quick_score_added'].includes(activity.type) && '•'}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Par {activity.userName} • {formatDateTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Aucune activité enregistrée</p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Add Note */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-4">Ajouter une Note</h3>
                  <form onSubmit={handleAddNote} className="space-y-4">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Écrivez une note..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#ffaf50ff] dark:focus:ring-accent-500 focus:border-transparent"
                      required
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivateNote}
                        onChange={(e) => setIsPrivateNote(e.target.checked)}
                        className="rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Note privée</span>
                    </label>
                    <button
                      type="submit"
                      disabled={addingNote}
                      className="w-full bg-[#3b5335ff] dark:bg-accent-500 text-white dark:text-primary-900 py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] dark:hover:bg-accent-600 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {addingNote ? 'Ajout...' : '+ Ajouter la Note'}
                    </button>
                  </form>
                </div>

                {/* Recent Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-4">Notes Récentes</h3>
                  {candidate.notes && candidate.notes.length > 0 ? (
                    <div className="space-y-4">
                      {[...candidate.notes].reverse().slice(0, 5).map((note) => (
                        <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{note.authorName}</span>
                            {note.isPrivate && (
                              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded">
                                🔒 Privé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{note.content}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(note.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune note</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Créé le</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(candidate.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Dernière MAJ</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(candidate.updatedAt)}</span>
                    </div>
                    {candidate.lastContactedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Dernier Contact</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(candidate.lastContactedAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Notes</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{candidate.notes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Activités</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{candidate.activities?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Tags Management */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-4">🏷️ Tags</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Ajoutez des tags pour catégoriser et filtrer facilement ce candidat
                  </div>
                  <TagInput
                    tags={candidate.tags || []}
                    onChange={handleTagsUpdate}
                    placeholder="Ajouter un tag..."
                    maxTags={10}
                    allowCustom={true}
                    showSuggestions={true}
                  />
                </div>

                {/* Upcoming Interviews */}
                {candidate.interviews && candidate.interviews.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-accent-500 mb-4">Entretiens à Venir</h3>
                    <div className="space-y-4">
                      {candidate.interviews
                        .filter(interview => interview.status === 'scheduled')
                        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                        .slice(0, 3)
                        .map((interview) => (
                          <div key={interview.id} className="p-4 bg-gradient-to-r from-[#3b5335ff]/10 to-[#ffaf50ff]/10 dark:from-accent-500/10 dark:to-primary-900/10 rounded-lg border-l-4 border-[#ffaf50ff] dark:border-accent-500">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-[#3b5335ff] dark:text-accent-500">
                                {interview.type === 'phone' && '📞'}
                                {interview.type === 'video' && '🎥'}
                                {interview.type === 'in_person' && '🏢'}
                                {interview.type === 'technical' && '💻'}
                                {interview.type === 'hr' && '👔'}
                                {' '}
                                {interview.jobTitle || 'Entretien'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                              📅 {formatDateTime(interview.scheduledDate)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ⏱️ {interview.duration} minutes
                            </p>
                            {interview.meetingLink && (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mt-2 inline-block"
                              >
                                🔗 Lien de visioconférence
                              </a>
                            )}
                          </div>
                        ))}
                      {candidate.interviews.filter(i => i.status === 'scheduled').length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun entretien planifié</p>
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

        {/* Interview Feedback Form Modal */}
        {showFeedbackForm && selectedInterview && session && (
          <InterviewFeedbackForm
            candidateId={candidateId}
            candidateName={`${candidate.firstName} ${candidate.lastName}`}
            interview={selectedInterview}
            currentUserId={(session.user as any)?.id || session.user?.email || ''}
            currentUserName={session.user?.name || session.user?.email || ''}
            onSubmit={handleFeedbackSubmit}
            onClose={() => {
              setShowFeedbackForm(false)
              setSelectedInterview(null)
            }}
          />
        )}

        {/* Quick Score Form Modal */}
        {showQuickScoreForm && session && (
          <QuickScoreForm
            candidateId={candidateId}
            candidateName={`${candidate.firstName} ${candidate.lastName}`}
            currentUserId={(session.user as any)?.id || session.user?.email || ''}
            currentUserName={session.user?.name || session.user?.email || ''}
            onSubmit={handleQuickScoreSubmit}
            onClose={() => setShowQuickScoreForm(false)}
          />
        )}
      </div>
    </AdminGuard>
  )
}
