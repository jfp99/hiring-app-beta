// src/app/candidate/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import DocumentManager from '../../components/DocumentManager'
import { useApi } from '../../hooks/useApi'

interface CandidateProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  currentTitle?: string
  currentCompany?: string
  yearsOfExperience?: number
  location?: {
    city: string
    country: string
  }
  skills?: string[]
  summary?: string
  linkedIn?: string
  portfolio?: string
}

export default function CandidateProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { loading, error, callApi } = useApi()

  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'applications'>('profile')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchProfile()
  }, [session, status])

  const fetchProfile = async () => {
    try {
      // For now, we'll use mock data
      // In production, this would fetch from /api/candidates/profile
      setProfile({
        id: '1',
        firstName: session?.user?.name?.split(' ')[0] || 'John',
        lastName: session?.user?.name?.split(' ')[1] || 'Doe',
        email: session?.user?.email || 'john.doe@example.com',
        phone: '+33 6 12 34 56 78',
        currentTitle: 'Développeur Full Stack',
        currentCompany: 'TechCorp',
        yearsOfExperience: 5,
        location: {
          city: 'Paris',
          country: 'France'
        },
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        summary: 'Développeur passionné avec 5 ans d\'expérience dans le développement web moderne.',
        linkedIn: 'https://linkedin.com/in/johndoe',
        portfolio: 'https://johndoe.dev'
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update
    setIsEditing(false)
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
          <p className="text-[#3b5335ff] font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-xl opacity-90 mb-1">
                {profile?.currentTitle}
                {profile?.currentCompany && ` chez ${profile.currentCompany}`}
              </p>
              <p className="text-lg opacity-80">
                📍 {profile?.location?.city}, {profile?.location?.country}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{profile?.yearsOfExperience}</div>
                <div className="text-sm opacity-80">Années d'exp.</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{profile?.skills?.length || 0}</div>
                <div className="text-sm opacity-80">Compétences</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white shadow-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'profile', label: 'Mon Profil', icon: '👤' },
              { id: 'documents', label: 'Mes Documents', icon: '📄' },
              { id: 'applications', label: 'Mes Candidatures', icon: '📮' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap
                  transition-all duration-200 flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-[#ffaf50ff] text-[#3b5335ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#3b5335ff]">
                  Informations Personnelles
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-[#ffaf50ff] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#ff9500ff] transition-colors"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Edit form fields would go here */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-[#3b5335ff] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a3d26ff]"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Coordonnées
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium">{profile?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Téléphone</label>
                        <p className="font-medium">{profile?.phone || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">LinkedIn</label>
                        <p className="font-medium">
                          {profile?.linkedIn ? (
                            <a href={profile.linkedIn} target="_blank" className="text-[#ffaf50ff] hover:underline">
                              Voir le profil
                            </a>
                          ) : (
                            'Non renseigné'
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Portfolio</label>
                        <p className="font-medium">
                          {profile?.portfolio ? (
                            <a href={profile.portfolio} target="_blank" className="text-[#ffaf50ff] hover:underline">
                              Visiter
                            </a>
                          ) : (
                            'Non renseigné'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Résumé Professionnel
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {profile?.summary || 'Aucun résumé ajouté'}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-[#ffaf50ff]/10 text-[#3b5335ff] px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )) || <p className="text-gray-500">Aucune compétence ajoutée</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <DocumentManager
                entityType="candidate"
                entityId={profile?.id || '1'}
                canUpload={true}
                canDelete={true}
                title="Mes Documents"
              />

              {/* Upload Tips */}
              <div className="mt-8 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  📚 Conseils pour vos documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="font-semibold mb-1">CV à jour</h4>
                      <p className="text-sm opacity-90">
                        Assurez-vous que votre CV reflète vos dernières expériences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📜</span>
                    <div>
                      <h4 className="font-semibold mb-1">Lettres de motivation</h4>
                      <p className="text-sm opacity-90">
                        Personnalisez vos lettres pour chaque candidature
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <h4 className="font-semibold mb-1">Diplômes & Certificats</h4>
                      <p className="text-sm opacity-90">
                        Ajoutez vos diplômes et certifications pertinentes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h4 className="font-semibold mb-1">Recommandations</h4>
                      <p className="text-sm opacity-90">
                        Les lettres de recommandation renforcent votre profil
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">
                Mes Candidatures
              </h2>

              {/* Empty state */}
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📮</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune candidature en cours
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez à postuler aux offres qui vous intéressent
                </p>
                <a
                  href="/offres-emploi"
                  className="inline-block bg-[#ffaf50ff] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#ff9500ff] transition-colors"
                >
                  Voir les offres disponibles
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}