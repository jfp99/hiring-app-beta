// src/app/candidates/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, Briefcase, Building2, Linkedin } from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import ResumeUploader from '@/app/components/ResumeUploader'
import CustomFieldInput from '@/app/components/CustomFieldInput'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { CandidateStatus, ExperienceLevel } from '@/app/types/candidates'
import { CustomFieldDefinition, validateFieldValue } from '@/app/types/customFields'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentPosition: string
  currentCompany: string
  experienceLevel: ExperienceLevel
  status: CandidateStatus
  source: string
  linkedIn: string
  primarySkills: string[]
  workExperience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    graduationYear: string
  }>
  summary: string
}

export default function NewCandidatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResumeUploader, setShowResumeUploader] = useState(true)
  const [newSkill, setNewSkill] = useState('')

  // Custom fields
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: '',
    currentCompany: '',
    experienceLevel: ExperienceLevel.MID,
    status: CandidateStatus.NEW,
    source: 'Manual Entry',
    linkedIn: '',
    primarySkills: [],
    workExperience: [],
    education: [],
    summary: ''
  })

  // Fetch custom field definitions
  useEffect(() => {
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

  const handleParsedData = (parsed: any) => {
    // Reset form to initial state, then populate with parsed data
    setFormData({
      firstName: parsed.firstName || '',
      lastName: parsed.lastName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      currentPosition: parsed.workExperience?.[0]?.position || '',
      currentCompany: parsed.workExperience?.[0]?.company || '',
      experienceLevel: ExperienceLevel.MID,
      status: CandidateStatus.NEW,
      source: 'Resume Upload',
      linkedIn: parsed.linkedIn || '',
      primarySkills: parsed.primarySkills || [],
      workExperience: parsed.workExperience || [],
      education: parsed.education || [],
      summary: parsed.summary || ''
    })
    setShowResumeUploader(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.primarySkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        primarySkills: [...prev.primarySkills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.filter(s => s !== skill)
    }))
  }

  const handleClearForm = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les données seront perdues.')) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPosition: '',
        currentCompany: '',
        experienceLevel: ExperienceLevel.MID,
        status: CandidateStatus.NEW,
        source: 'Manual Entry',
        linkedIn: '',
        primarySkills: [],
        workExperience: [],
        education: [],
        summary: ''
      })
      setCustomFieldValues({})
      setShowResumeUploader(true)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCustomFieldErrors({})

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Veuillez remplir les champs obligatoires (nom, prénom, email)')
      }

      // Validate custom fields
      const fieldErrors: Record<string, string> = {}
      for (const field of customFields) {
        const value = customFieldValues[field.name]
        const validation = validateFieldValue(field, value)
        if (!validation.valid) {
          fieldErrors[field.name] = validation.error!
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setCustomFieldErrors(fieldErrors)
        throw new Error('Veuillez corriger les erreurs dans les champs personnalisés')
      }

      // Prepare data for API
      const candidateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        currentPosition: formData.currentPosition,
        currentCompany: formData.currentCompany,
        experienceLevel: formData.experienceLevel,
        status: formData.status,
        source: formData.source,
        linkedIn: formData.linkedIn,
        skills: formData.primarySkills.map(skill => ({
          name: skill,
          level: 'intermediate'
        })),
        workExperience: formData.workExperience.map(exp => ({
          ...exp,
          current: exp.endDate.toLowerCase().includes('présent') || exp.endDate.toLowerCase().includes('present')
        })),
        education: formData.education,
        summary: formData.summary,
        customFields: customFieldValues
      }

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du candidat')
      }

      // Redirect to candidate detail page
      router.push(`/candidates/${result.candidateId}`)
    } catch (err: any) {
      console.error('Error creating candidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl opacity-10 animate-bounce"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Nouveau Candidat</h1>
                <p className="text-lg md:text-xl text-gray-200">
                  Ajoutez un nouveau candidat manuellement ou importez son CV
                </p>
              </div>
              <Link href="/candidates">
                <Button variant="tertiary" size="md">
                  ← Retour à la liste
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Resume Uploader - Left Column */}
              <div className="lg:col-span-1">
                {showResumeUploader ? (
                  <ResumeUploader onParsed={handleParsedData} />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-accent-500 mb-4">
                      CV Importé
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Les informations du CV ont été pré-remplies dans le formulaire.
                    </p>
                    <Button
                      onClick={() => setShowResumeUploader(true)}
                      variant="ghost"
                      size="md"
                      className="w-full"
                    >
                      Importer un autre CV
                    </Button>
                  </div>
                )}

                {/* Stats Card */}
                <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span>Formats Supportés</span>
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Documents Texte:</p>
                      <div className="flex flex-wrap gap-1">
                        {['PDF', 'DOC', 'DOCX', 'TXT', 'RTF', 'ODT'].map(format => (
                          <span key={format} className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Images (scan de CV):</p>
                      <div className="flex flex-wrap gap-1">
                        {['WEBP', 'JPG', 'PNG', 'GIF', 'BMP'].map(format => (
                          <span key={format} className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form - Right Column */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                  {/* Progress Indicator */}
                  <div className="mb-8 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${formData.firstName && formData.lastName && formData.email ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        1
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">Infos personnelles</span>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-accent-500 transition-all ${formData.primarySkills.length > 0 ? 'w-full' : 'w-1/2'}`}></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${formData.primarySkills.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        2
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">Compétences</span>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-shake">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800 dark:text-red-300 mb-1">Erreur</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6 pb-3 border-b-2 border-accent-500">
                      Informations Personnelles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="text"
                        name="firstName"
                        label="Prénom"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        leftIcon={<User className="w-5 h-5" />}
                        placeholder="Jean"
                      />
                      <Input
                        type="text"
                        name="lastName"
                        label="Nom"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        leftIcon={<User className="w-5 h-5" />}
                        placeholder="Dupont"
                      />
                      <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        leftIcon={<Mail className="w-5 h-5" />}
                        placeholder="jean.dupont@exemple.com"
                      />
                      <Input
                        type="tel"
                        name="phone"
                        label="Téléphone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        leftIcon={<Phone className="w-5 h-5" />}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6 pb-3 border-b-2 border-accent-500">
                      Informations Professionnelles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        type="text"
                        name="currentPosition"
                        label="Poste Actuel"
                        value={formData.currentPosition}
                        onChange={handleInputChange}
                        leftIcon={<Briefcase className="w-5 h-5" />}
                        placeholder="Développeur Full Stack"
                      />
                      <Input
                        type="text"
                        name="currentCompany"
                        label="Entreprise Actuelle"
                        value={formData.currentCompany}
                        onChange={handleInputChange}
                        leftIcon={<Building2 className="w-5 h-5" />}
                        placeholder="Acme Corp"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Niveau d'Expérience *
                        </label>
                        <select
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value={ExperienceLevel.JUNIOR}>Junior (0-2 ans)</option>
                          <option value={ExperienceLevel.MID}>Mid-Level (2-5 ans)</option>
                          <option value={ExperienceLevel.SENIOR}>Senior (5-10 ans)</option>
                          <option value={ExperienceLevel.LEAD}>Lead (10+ ans)</option>
                          <option value={ExperienceLevel.EXECUTIVE}>Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Statut Initial
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value={CandidateStatus.NEW}>Nouveau</option>
                          <option value={CandidateStatus.CONTACTED}>Contacté</option>
                          <option value={CandidateStatus.SCREENING}>Présélection</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          type="url"
                          name="linkedIn"
                          label="LinkedIn"
                          value={formData.linkedIn}
                          onChange={handleInputChange}
                          leftIcon={<Linkedin className="w-5 h-5" />}
                          placeholder="https://linkedin.com/in/..."
                          helpText="Profil LinkedIn du candidat"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-accent-500 mb-6 pb-3 border-b-2 border-accent-500">
                      Compétences
                    </h2>
                    <div className="mb-4">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            placeholder="Ex: React, Python, Marketing..."
                            helpText="Appuyez sur Entrée ou cliquez sur Ajouter"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          variant="primary"
                          size="md"
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                    {formData.primarySkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.primarySkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#3b5335ff] text-white rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                      Résumé
                    </h2>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Résumé du profil du candidat..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                    />
                  </div>

                  {/* Work Experience Summary */}
                  {formData.workExperience.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                        Expérience Professionnelle ({formData.workExperience.length})
                      </h2>
                      <div className="space-y-3">
                        {formData.workExperience.map((exp, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-medium text-[#3b5335ff]">{exp.position}</p>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.startDate} - {exp.endDate}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Summary */}
                  {formData.education.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                        Formation ({formData.education.length})
                      </h2>
                      <div className="space-y-3">
                        {formData.education.map((edu, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-medium text-[#3b5335ff]">{edu.degree}</p>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            <p className="text-xs text-gray-500 mt-1">{edu.graduationYear}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {customFields.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                        Informations Complémentaires
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customFields.map((field) => (
                          <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <CustomFieldInput
                              field={field}
                              value={customFieldValues[field.name]}
                              onChange={(value) => {
                                setCustomFieldValues(prev => ({
                                  ...prev,
                                  [field.name]: value
                                }))
                                // Clear error when user changes value
                                if (customFieldErrors[field.name]) {
                                  setCustomFieldErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors[field.name]
                                    return newErrors
                                  })
                                }
                              }}
                              error={customFieldErrors[field.name]}
                              disabled={loading}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      isLoading={loading}
                      className="flex-1"
                    >
                      Créer le Candidat
                    </Button>
                    <Button
                      type="button"
                      onClick={handleClearForm}
                      disabled={loading}
                      variant="tertiary"
                      size="lg"
                    >
                      Réinitialiser
                    </Button>
                    <Link
                      href="/candidates"
                      className="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95 bg-transparent text-primary-700 hover:bg-gray-100 focus:ring-primary-500 px-6 py-3 text-lg"
                    >
                      Annuler
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
