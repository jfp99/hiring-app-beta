// src/app/candidates/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import ResumeUploader from '@/app/components/ResumeUploader'
import { CandidateStatus, ExperienceLevel } from '@/app/types/candidates'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentPosition: string
  currentCompany: string
  experienceLevel: ExperienceLevel
  status: CandidateStatus
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

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPosition: '',
    currentCompany: '',
    experienceLevel: ExperienceLevel.MID,
    status: CandidateStatus.NEW,
    linkedIn: '',
    primarySkills: [],
    workExperience: [],
    education: [],
    summary: ''
  })

  const handleParsedData = (parsed: any) => {
    setFormData(prev => ({
      ...prev,
      firstName: parsed.firstName || prev.firstName,
      lastName: parsed.lastName || prev.lastName,
      email: parsed.email || prev.email,
      phone: parsed.phone || prev.phone,
      linkedIn: parsed.linkedIn || prev.linkedIn,
      primarySkills: parsed.primarySkills || prev.primarySkills,
      workExperience: parsed.workExperience || prev.workExperience,
      education: parsed.education || prev.education,
      summary: parsed.summary || prev.summary,
      // Auto-fill current position from most recent work experience
      currentPosition:
        parsed.workExperience?.[0]?.position || prev.currentPosition,
      currentCompany:
        parsed.workExperience?.[0]?.company || prev.currentCompany
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('Veuillez remplir les champs obligatoires (nom, prénom, email)')
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
        linkedIn: formData.linkedIn,
        primarySkills: formData.primarySkills,
        secondarySkills: [],
        workExperience: formData.workExperience.map(exp => ({
          ...exp,
          current: exp.endDate.toLowerCase().includes('présent') || exp.endDate.toLowerCase().includes('present')
        })),
        education: formData.education,
        summary: formData.summary
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
      router.push(`/candidates/${result.candidate.id}`)
    } catch (err: any) {
      console.error('Error creating candidate:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Nouveau Candidat</h1>
                <p className="text-xl opacity-90">
                  Ajoutez un nouveau candidat manuellement ou importez son CV
                </p>
              </div>
              <Link
                href="/candidates"
                className="bg-white text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                ← Retour à la liste
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
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">
                      CV Importé
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Les informations du CV ont été pré-remplies dans le formulaire.
                    </p>
                    <button
                      onClick={() => setShowResumeUploader(true)}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                    >
                      Importer un autre CV
                    </button>
                  </div>
                )}

                {/* Quick Tips */}
                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h4 className="font-bold text-blue-900 mb-3">💡 Conseils</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Importez un CV pour pré-remplir le formulaire</li>
                    <li>• Les champs marqués * sont obligatoires</li>
                    <li>• Vous pouvez modifier toutes les informations</li>
                    <li>• Le statut initial est "Nouveau"</li>
                  </ul>
                </div>
              </div>

              {/* Form - Right Column */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                      Informations Personnelles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                      Informations Professionnelles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Poste Actuel
                        </label>
                        <input
                          type="text"
                          name="currentPosition"
                          value={formData.currentPosition}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Entreprise Actuelle
                        </label>
                        <input
                          type="text"
                          name="currentCompany"
                          value={formData.currentCompany}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau d'Expérience *
                        </label>
                        <select
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        >
                          <option value={ExperienceLevel.JUNIOR}>Junior (0-2 ans)</option>
                          <option value={ExperienceLevel.MID}>Mid-Level (2-5 ans)</option>
                          <option value={ExperienceLevel.SENIOR}>Senior (5-10 ans)</option>
                          <option value={ExperienceLevel.LEAD}>Lead (10+ ans)</option>
                          <option value={ExperienceLevel.EXECUTIVE}>Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut Initial
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        >
                          <option value={CandidateStatus.NEW}>Nouveau</option>
                          <option value={CandidateStatus.CONTACTED}>Contacté</option>
                          <option value={CandidateStatus.SCREENING}>Présélection</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="linkedIn"
                          value={formData.linkedIn}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 pb-3 border-b-2 border-[#ffaf50ff]">
                      Compétences
                    </h2>
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          placeholder="Ajouter une compétence"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff]"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-6 py-2 bg-[#3b5335ff] text-white rounded-lg hover:bg-[#2a3d26ff] transition-colors"
                        >
                          Ajouter
                        </button>
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

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Création...' : 'Créer le Candidat'}
                    </button>
                    <Link
                      href="/candidates"
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all text-center"
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
