// src/app/candidates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Candidate,
  CandidateStatus,
  ExperienceLevel,
  CANDIDATE_STATUS_LABELS,
  EXPERIENCE_LEVEL_LABELS
} from '@/app/types/candidates'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

export default function CandidatesPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus[]>([])
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel[]>([])
  const [skillsFilter, setSkillsFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchCandidates()
  }, [searchTerm, statusFilter, experienceFilter, skillsFilter, currentPage])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError('')

      // Build query params
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter.length > 0) params.append('status', statusFilter.join(','))
      if (experienceFilter.length > 0) params.append('experienceLevel', experienceFilter.join(','))
      if (skillsFilter) params.append('skills', skillsFilter)
      params.append('page', currentPage.toString())
      params.append('limit', '20')
      params.append('isActive', 'true')
      params.append('isArchived', 'false')

      const response = await fetch(`/api/candidates?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidates')
      }

      setCandidates(data.candidates)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      console.error('Error fetching candidates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatusFilter = (status: CandidateStatus) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
    setCurrentPage(1)
  }

  const toggleExperienceFilter = (level: ExperienceLevel) => {
    setExperienceFilter(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
    setCurrentPage(1)
  }

  const getStatusColor = (status: CandidateStatus): string => {
    const colors: Record<CandidateStatus, string> = {
      [CandidateStatus.NEW]: 'bg-blue-100 text-blue-800',
      [CandidateStatus.CONTACTED]: 'bg-purple-100 text-purple-800',
      [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
      [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-orange-100 text-orange-800',
      [CandidateStatus.INTERVIEW_COMPLETED]: 'bg-cyan-100 text-cyan-800',
      [CandidateStatus.OFFER_SENT]: 'bg-indigo-100 text-indigo-800',
      [CandidateStatus.OFFER_ACCEPTED]: 'bg-green-100 text-green-800',
      [CandidateStatus.OFFER_REJECTED]: 'bg-red-100 text-red-800',
      [CandidateStatus.HIRED]: 'bg-green-200 text-green-900',
      [CandidateStatus.REJECTED]: 'bg-red-100 text-red-800',
      [CandidateStatus.ON_HOLD]: 'bg-gray-100 text-gray-800',
      [CandidateStatus.ARCHIVED]: 'bg-gray-200 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getExperienceBadge = (level: ExperienceLevel): string => {
    const colors: Record<ExperienceLevel, string> = {
      [ExperienceLevel.ENTRY]: 'bg-green-50 text-green-700 border border-green-200',
      [ExperienceLevel.JUNIOR]: 'bg-blue-50 text-blue-700 border border-blue-200',
      [ExperienceLevel.MID]: 'bg-purple-50 text-purple-700 border border-purple-200',
      [ExperienceLevel.SENIOR]: 'bg-orange-50 text-orange-700 border border-orange-200',
      [ExperienceLevel.LEAD]: 'bg-red-50 text-red-700 border border-red-200',
      [ExperienceLevel.EXECUTIVE]: 'bg-gray-800 text-white border border-gray-900'
    }
    return colors[level] || 'bg-gray-50 text-gray-700'
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Gestion des Candidats
                </h1>
                <p className="text-xl opacity-90">
                  {total} candidat{total !== 1 ? 's' : ''} au total
                </p>
              </div>
              <Link
                href="/candidates/new"
                className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                + Nouveau Candidat
              </Link>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher par nom, email, poste..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
              />
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(CandidateStatus).filter(s => s !== CandidateStatus.ARCHIVED).map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      statusFilter.includes(status)
                        ? getStatusColor(status) + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {CANDIDATE_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Niveau d&apos;expérience</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(ExperienceLevel).map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleExperienceFilter(level)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      experienceFilter.includes(level)
                        ? getExperienceBadge(level) + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {EXPERIENCE_LEVEL_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Candidates List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des candidats...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-600">Aucun candidat trouvé.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Candidat</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Poste Actuel</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Expérience</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Compétences</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Statut</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Note</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {candidate.firstName} {candidate.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{candidate.email}</div>
                                <div className="text-xs text-gray-400">{candidate.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{candidate.currentPosition || '-'}</div>
                              <div className="text-xs text-gray-500">{candidate.currentCompany || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getExperienceBadge(candidate.experienceLevel)}`}>
                                {EXPERIENCE_LEVEL_LABELS[candidate.experienceLevel]}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {candidate.primarySkills?.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-0.5 bg-[#3b5335ff] text-white text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {(candidate.primarySkills?.length || 0) > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{(candidate.primarySkills?.length || 0) - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                {CANDIDATE_STATUS_LABELS[candidate.status]}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {candidate.overallRating ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="text-sm font-medium">{candidate.overallRating.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Non noté</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/candidates/${candidate.id}`}
                                className="text-[#3b5335ff] hover:text-[#ffaf50ff] font-medium text-sm"
                              >
                                Voir →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
