'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

interface Candidate {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  currentPosition?: string
  status: string
  stage: string
  appliedPosition?: string
  location?: string
  experience?: string
  createdAt: string
}

interface EmailTemplate {
  id: string
  name: string
  type: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
}

const availableVariables = [
  { key: 'firstName', label: 'Prénom', description: 'Prénom du candidat' },
  { key: 'lastName', label: 'Nom', description: 'Nom du candidat' },
  { key: 'fullName', label: 'Nom complet', description: 'Prénom + Nom' },
  { key: 'email', label: 'Email', description: 'Email du candidat' },
  { key: 'position', label: 'Poste', description: 'Titre du poste' },
  { key: 'companyName', label: 'Entreprise', description: 'Nom de l\'entreprise' },
  { key: 'recruiterName', label: 'Recruteur', description: 'Nom du recruteur' },
  { key: 'recruiterEmail', label: 'Email recruteur', description: 'Email du recruteur' },
  { key: 'recruiterPhone', label: 'Tél recruteur', description: 'Téléphone du recruteur' },
  { key: 'currentDate', label: 'Date actuelle', description: 'Date du jour' }
]

export default function BulkEmailPage() {
  const { data: session } = useSession()
  const [step, setStep] = useState(1) // 1: Select candidates, 2: Select template, 3: Customize, 4: Review & Send

  // Candidates state
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filterStage, setFilterStage] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

  // Variables state
  const [globalVariables, setGlobalVariables] = useState<Record<string, string>>({
    companyName: 'Hi-Ring',
    recruiterName: session?.user?.name || '',
    recruiterEmail: session?.user?.email || '',
    recruiterPhone: '+33 1 23 45 67 89',
    currentDate: new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  // Sending state
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sendResults, setSendResults] = useState<{
    success: number
    failed: number
    total: number
  }>({ success: 0, failed: 0, total: 0 })

  useEffect(() => {
    fetchCandidates()
    fetchTemplates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/candidates')
      const data = await response.json()

      if (response.ok) {
        setCandidates(data.candidates || [])
      }
    } catch (err) {
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates?isActive=true')
      const data = await response.json()

      if (response.ok) {
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStage = filterStage === 'all' || candidate.stage === filterStage
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    const matchesSearch = !searchQuery ||
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStage && matchesStatus && matchesSearch
  })

  const toggleCandidate = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const toggleAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c._id)))
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
  }

  const replaceVariables = (text: string, candidate: Candidate) => {
    let result = text

    // Candidate-specific variables
    const candidateVars: Record<string, string> = {
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email || '',
      position: candidate.appliedPosition || candidate.currentPosition || ''
    }

    // Merge with global variables
    const allVars = { ...globalVariables, ...candidateVars }

    Object.entries(allVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    })

    return result
  }

  const handleSendBulk = async () => {
    if (!selectedTemplate || selectedCandidates.size === 0) return

    setSending(true)
    setSendProgress(0)
    setSendResults({ success: 0, failed: 0, total: selectedCandidates.size })

    const selectedCandidatesList = candidates.filter(c => selectedCandidates.has(c._id))
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < selectedCandidatesList.length; i++) {
      const candidate = selectedCandidatesList[i]

      try {
        // Prepare variables for this candidate
        const candidateVariables: Record<string, string> = {
          ...globalVariables,
          firstName: candidate.firstName || '',
          lastName: candidate.lastName || '',
          fullName: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email || '',
          position: candidate.appliedPosition || candidate.currentPosition || ''
        }

        const response = await fetch(`/api/email-templates/${selectedTemplateId}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: candidate._id,
            variables: candidateVariables
          })
        })

        if (response.ok) {
          successCount++
        } else {
          failedCount++
        }
      } catch (err) {
        console.error('Error sending email to', candidate.email, err)
        failedCount++
      }

      // Update progress
      const progress = ((i + 1) / selectedCandidatesList.length) * 100
      setSendProgress(progress)
      setSendResults({ success: successCount, failed: failedCount, total: selectedCandidates.size })

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setSending(false)

    // Show results
    if (successCount > 0) {
      toast.success(`${successCount} email${successCount > 1 ? 's' : ''} envoyé${successCount > 1 ? 's' : ''} avec succès!`, {
        description: failedCount > 0 ? `${failedCount} échec${failedCount > 1 ? 's' : ''}` : 'Tous les emails ont été envoyés'
      })
    } else if (failedCount > 0) {
      toast.error('Échec de l\'envoi des emails', {
        description: `${failedCount} email${failedCount > 1 ? 's' : ''} n'${failedCount > 1 ? 'ont' : 'a'} pas pu être envoyé${failedCount > 1 ? 's' : ''}`
      })
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <AdminHeader />

        {/* Header */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour au tableau de bord
            </Link>

            <h1 className="text-4xl font-bold mb-2">Envoi d'Emails en Masse</h1>
            <p className="text-xl opacity-90">
              Envoyez des emails personnalisés à plusieurs candidats simultanément
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="bg-white/80 border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Sélectionner les candidats', icon: '👥' },
                { num: 2, label: 'Choisir le template', icon: '📧' },
                { num: 3, label: 'Personnaliser', icon: '✏️' },
                { num: 4, label: 'Envoyer', icon: '🚀' }
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <button
                    onClick={() => setStep(s.num)}
                    className={`flex items-center gap-3 ${
                      step >= s.num ? 'text-[#3b5335ff]' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      step >= s.num
                        ? 'bg-[#ffaf50ff] text-[#3b5335ff]'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s.num ? '✓' : s.icon}
                    </div>
                    <span className="font-medium hidden md:inline">{s.label}</span>
                  </button>
                  {idx < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > s.num ? 'bg-[#ffaf50ff]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Step 1: Select Candidates */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-2">
                    Sélectionner les Candidats ({selectedCandidates.size})
                  </h2>
                  <p className="text-gray-600">
                    Choisissez les candidats qui recevront l'email
                  </p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                  />
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                  >
                    <option value="all">Toutes les étapes</option>
                    <option value="applied">Candidature reçue</option>
                    <option value="screening">Présélection</option>
                    <option value="interview">Entretien</option>
                    <option value="offer">Offre</option>
                    <option value="hired">Embauché</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                {/* Select All */}
                <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={toggleAll}
                    className="w-5 h-5 rounded"
                  />
                  <label className="font-medium text-gray-700">
                    Sélectionner tous ({filteredCandidates.length} candidats)
                  </label>
                </div>

                {/* Candidates List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredCandidates.map(candidate => (
                    <div
                      key={candidate._id}
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        selectedCandidates.has(candidate._id)
                          ? 'border-[#ffaf50ff] bg-[#ffaf50ff]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleCandidate(candidate._id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate._id)}
                          onChange={() => toggleCandidate(candidate._id)}
                          className="w-5 h-5 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {candidate.stage}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                          {candidate.appliedPosition && (
                            <p className="text-sm text-gray-500">{candidate.appliedPosition}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedCandidates.size === 0}
                    className="bg-[#3b5335ff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant: Choisir le template →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Template */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-2">
                    Choisir un Template d'Email
                  </h2>
                  <p className="text-gray-600">
                    Sélectionnez le template à envoyer aux {selectedCandidates.size} candidats
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        selectedTemplateId === template.id
                          ? 'border-[#ffaf50ff] bg-[#ffaf50ff]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <h3 className="text-lg font-bold text-[#3b5335ff] mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">Type: {template.type}</p>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Sujet:</p>
                        <p className="text-gray-600 mb-3">{template.subject}</p>
                        <p className="font-medium mb-1">Aperçu:</p>
                        <p className="text-gray-600 line-clamp-3">{template.body.substring(0, 150)}...</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedTemplateId}
                    className="bg-[#3b5335ff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant: Personnaliser →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Customize Variables */}
            {step === 3 && selectedTemplate && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-2">
                    Personnaliser les Variables
                  </h2>
                  <p className="text-gray-600">
                    Configurez les variables globales qui seront utilisées pour tous les candidats
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {availableVariables
                    .filter(v => !['firstName', 'lastName', 'fullName', 'email', 'position'].includes(v.key))
                    .map(variable => (
                      <div key={variable.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {variable.label}
                        </label>
                        <input
                          type="text"
                          value={globalVariables[variable.key] || ''}
                          onChange={(e) => setGlobalVariables(prev => ({
                            ...prev,
                            [variable.key]: e.target.value
                          }))}
                          placeholder={variable.description}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                        />
                      </div>
                    ))}
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#3b5335ff] mb-4">Aperçu (exemple avec un candidat)</h3>
                  {filteredCandidates.length > 0 && selectedCandidates.size > 0 && (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Sujet:</p>
                        <p className="font-medium text-gray-900">
                          {replaceVariables(selectedTemplate.subject, candidates.find(c => selectedCandidates.has(c._id))!)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Corps du message:</p>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {replaceVariables(selectedTemplate.body, candidates.find(c => selectedCandidates.has(c._id))!)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="bg-[#3b5335ff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all"
                  >
                    Suivant: Envoyer →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Send */}
            {step === 4 && selectedTemplate && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-2">
                    Revue et Envoi
                  </h2>
                  <p className="text-gray-600">
                    Vérifiez les détails avant d'envoyer les emails
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Candidats sélectionnés</p>
                      <p className="text-3xl font-bold text-blue-900">{selectedCandidates.size}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">Template</p>
                      <p className="text-lg font-bold text-green-900">{selectedTemplate.name}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">Type</p>
                      <p className="text-lg font-bold text-purple-900">{selectedTemplate.type}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  {sending && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[#3b5335ff]">Envoi en cours...</h3>
                        <span className="text-sm text-gray-600">
                          {sendResults.success + sendResults.failed} / {sendResults.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div
                          className="bg-[#ffaf50ff] h-4 rounded-full transition-all duration-300"
                          style={{ width: `${sendProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">✓ Réussis: {sendResults.success}</span>
                        {sendResults.failed > 0 && (
                          <span className="text-red-600">✗ Échecs: {sendResults.failed}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Attention</p>
                        <p>
                          Vous êtes sur le point d'envoyer {selectedCandidates.size} emails.
                          Cette action ne peut pas être annulée. Assurez-vous que tous les détails sont corrects.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    disabled={sending}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleSendBulk}
                    disabled={sending}
                    className="bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3b5335ff]"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        🚀 Envoyer {selectedCandidates.size} emails
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
