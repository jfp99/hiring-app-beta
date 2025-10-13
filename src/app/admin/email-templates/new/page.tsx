'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

const templateTypes = [
  { value: 'interview_invitation', label: 'Invitation à un entretien' },
  { value: 'offer_letter', label: 'Lettre d\'offre' },
  { value: 'rejection_soft', label: 'Refus poli' },
  { value: 'rejection_hard', label: 'Refus direct' },
  { value: 'initial_contact', label: 'Premier contact' },
  { value: 'follow_up', label: 'Suivi' },
  { value: 'interview_reminder', label: 'Rappel d\'entretien' },
  { value: 'thank_you', label: 'Remerciement' },
  { value: 'custom', label: 'Personnalisé' }
]

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
  { key: 'interviewDate', label: 'Date entretien', description: 'Date de l\'entretien' },
  { key: 'interviewTime', label: 'Heure entretien', description: 'Heure de l\'entretien' },
  { key: 'interviewLocation', label: 'Lieu entretien', description: 'Lieu de l\'entretien' },
  { key: 'interviewLink', label: 'Lien entretien', description: 'Lien visioconférence' },
  { key: 'salary', label: 'Salaire', description: 'Salaire proposé' },
  { key: 'startDate', label: 'Date début', description: 'Date de début proposée' },
  { key: 'currentDate', label: 'Date actuelle', description: 'Date du jour' }
]

export default function NewEmailTemplatePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('custom')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  // Preview data
  const [previewData, setPreviewData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    position: 'Développeur Full Stack',
    companyName: 'Hi-Ring',
    recruiterName: 'Marie Martin',
    recruiterEmail: 'marie.martin@hi-ring.com',
    recruiterPhone: '+33 6 12 34 56 78',
    interviewDate: '15 janvier 2025',
    interviewTime: '14:00',
    interviewLocation: '123 Rue de Example, Paris',
    interviewLink: 'https://meet.example.com/abc-123',
    salary: '45000€',
    startDate: '1er février 2025',
    currentDate: new Date().toLocaleDateString('fr-FR')
  })

  const insertVariable = (variable: string, target: 'subject' | 'body') => {
    const variableTag = `{{${variable}}}`
    if (target === 'subject') {
      setSubject(prev => prev + variableTag)
    } else {
      setBody(prev => prev + variableTag)
    }
  }

  const replaceVariables = (text: string) => {
    let result = text
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    })
    return result
  }

  const extractVariables = (text: string): string[] => {
    const regex = /{{(\w+)}}/g
    const matches = text.matchAll(regex)
    const variables = Array.from(matches, m => m[1])
    return [...new Set(variables)] // Remove duplicates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setError('Vous devez être connecté')
      return
    }

    setSaving(true)
    setError('')

    try {
      const allVariables = [
        ...extractVariables(subject),
        ...extractVariables(body)
      ]

      const templateData = {
        name,
        type,
        subject,
        body,
        isActive,
        variables: allVariables,
        createdBy: (session.user as any).id || session.user.email,
        createdByName: session.user.name || session.user.email
      }

      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create template')
      }

      router.push('/admin/email-templates')
    } catch (err: any) {
      console.error('Error creating template:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <AdminHeader />

        {/* Header */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin/email-templates" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour aux templates
            </Link>

            <h1 className="text-4xl font-bold mb-2">Nouveau Template d'Email</h1>
            <p className="text-xl opacity-90">
              Créez un template personnalisé pour vos communications
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">Informations de base</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du template *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Invitation entretien - Standard"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de template *
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                          required
                        >
                          {templateTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                          Template actif (peut être utilisé immédiatement)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Sujet de l'email *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showPreview ? '👁️ Masquer' : '👁️ Prévisualiser'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Invitation à un entretien - {{position}}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
                      required
                    />
                    {showPreview && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">Aperçu:</p>
                        <p className="text-sm font-medium text-gray-900">{replaceVariables(subject)}</p>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Corps du message *
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Rédigez votre message ici... Utilisez {{variable}} pour insérer des variables dynamiques"
                      rows={15}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent font-mono text-sm"
                      required
                    />
                    {showPreview && (
                      <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-600 mb-2">Aperçu:</p>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {replaceVariables(body)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variables Detected */}
                  {(extractVariables(subject).length > 0 || extractVariables(body).length > 0) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Variables détectées ({extractVariables(subject + body).length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {extractVariables(subject + body).map((variable, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-full">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-[#3b5335ff] text-white py-3 rounded-lg font-bold hover:bg-[#2a3d26ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Création en cours...' : '✓ Créer le Template'}
                    </button>
                    <Link
                      href="/admin/email-templates"
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                    >
                      Annuler
                    </Link>
                  </div>
                </form>
              </div>

              {/* Sidebar - Variables */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Variables disponibles</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Cliquez sur une variable pour l'insérer dans le corps du message
                  </p>

                  <div className="space-y-2">
                    {availableVariables.map(variable => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => insertVariable(variable.key, 'body')}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{variable.label}</div>
                            <div className="text-xs text-gray-500">{variable.description}</div>
                          </div>
                          <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded group-hover:bg-blue-100">
                            {`{{${variable.key}}}`}
                          </code>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Astuce</h4>
                  <p className="text-sm text-blue-800">
                    Les variables sont automatiquement remplacées par les données réelles lors de l'envoi de l'email.
                    Utilisez-les pour personnaliser vos messages!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
