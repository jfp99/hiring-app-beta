// src/app/components/EmailComposer.tsx
'use client'

import { useState, useEffect } from 'react'
import { EmailTemplate, EMAIL_TEMPLATE_TYPE_LABELS, TEMPLATE_VARIABLES } from '@/app/types/emails'

interface EmailComposerProps {
  candidateId: string
  candidateName: string
  candidateEmail: string
  onClose: () => void
  onSent: () => void
}

export default function EmailComposer({
  candidateId,
  candidateName,
  candidateEmail,
  onClose,
  onSent
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showVariables, setShowVariables] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/email-templates?isActive=true')
      const data = await response.json()

      if (response.ok) {
        setTemplates(data.templates)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    setSelectedTemplateId(templateId)

    if (templateId) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)

        // Initialize variables that need to be filled
        const requiredVars: Record<string, string> = {}
        template.variables.forEach(varKey => {
          // Set default values for some variables
          if (varKey === 'firstName') requiredVars[varKey] = candidateName.split(' ')[0] || ''
          else if (varKey === 'lastName') requiredVars[varKey] = candidateName.split(' ').slice(1).join(' ') || ''
          else if (varKey === 'fullName') requiredVars[varKey] = candidateName
          else if (varKey === 'email') requiredVars[varKey] = candidateEmail
          else if (varKey === 'companyName') requiredVars[varKey] = 'Hi-Ring'
          else if (varKey === 'currentDate') {
            requiredVars[varKey] = new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
          else requiredVars[varKey] = ''
        })
        setVariables(requiredVars)
      }
    } else {
      setSubject('')
      setBody('')
      setVariables({})
    }
  }

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }

  const previewText = (text: string) => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value || `{{${key}}}`)
    })
    return result
  }

  const handleSend = async () => {
    if (!selectedTemplateId) {
      setError('Veuillez sélectionner un template')
      return
    }

    // Check if all required variables are filled
    const missingVars = Object.entries(variables)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      setError(`Veuillez remplir les variables suivantes: ${missingVars.join(', ')}`)
      return
    }

    try {
      setSending(true)
      setError('')

      const response = await fetch(`/api/email-templates/${selectedTemplateId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          variables
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email')
      }

      onSent()
      onClose()
    } catch (err: any) {
      console.error('Error sending email:', err)
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Envoyer un Email</h2>
            <p className="text-sm opacity-90">
              À: {candidateName} ({candidateEmail})
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
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un Template *
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
            >
              <option value="">-- Choisir un template --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({EMAIL_TEMPLATE_TYPE_LABELS[template.type]})
                </option>
              ))}
            </select>
          </div>

          {selectedTemplateId && (
            <>
              {/* Variables Section */}
              {Object.keys(variables).length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="flex items-center gap-2 text-[#3b5335ff] font-medium hover:text-[#ffaf50ff] transition-colors mb-3"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${showVariables ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Variables du Template ({Object.keys(variables).length})
                  </button>

                  {showVariables && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {Object.entries(variables).map(([key, value]) => {
                        const varInfo = TEMPLATE_VARIABLES.find(v => v.key === key)
                        return (
                          <div key={key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {varInfo?.label || key}
                              {!value && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleVariableChange(key, e.target.value)}
                              placeholder={varInfo?.example || key}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Subject Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-800">{previewText(subject)}</p>
                </div>
              </div>

              {/* Body Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[300px] whitespace-pre-wrap">
                  <p className="text-gray-800">{previewText(body)}</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Mode Démo</p>
                    <p>
                      L'email ne sera pas réellement envoyé mais sera enregistré dans les logs et l'historique du candidat.
                      Pour activer l'envoi réel d'emails, configurez un service d'envoi (SendGrid, AWS SES, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedTemplateId || sending}
            className="px-6 py-2 bg-[#ffaf50ff] text-[#3b5335ff] rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3b5335ff]"></div>
                Envoi...
              </span>
            ) : (
              'Envoyer l\'Email'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
