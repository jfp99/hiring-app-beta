'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, Calendar, Clock, TrendingUp, Users, PartyPopper } from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

interface Candidate {
  _id: string
  firstName: string
  lastName: string
  email: string
  stage: string
  status: string
  createdAt: string
  interviews?: any[]
  activities?: any[]
}

interface StageMetrics {
  stage: string
  count: number
  percentage: number
}

interface TimelineData {
  month: string
  applied: number
  interviewed: number
  hired: number
}

export default function AnalyticsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days

  // Calculated metrics
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [activeCandidates, setActiveCandidates] = useState(0)
  const [interviewsScheduled, setInterviewsScheduled] = useState(0)
  const [hiredCount, setHiredCount] = useState(0)
  const [stageMetrics, setStageMetrics] = useState<StageMetrics[]>([])
  const [conversionRate, setConversionRate] = useState(0)
  const [avgTimeToHire, setAvgTimeToHire] = useState(0)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])

  useEffect(() => {
    fetchCandidates()
  }, [dateRange])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/candidates')
      const data = await response.json()

      if (response.ok) {
        const candidatesList = data.candidates || []

        // Filter by date range
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))

        const filteredCandidates = candidatesList.filter((c: Candidate) => {
          const createdDate = new Date(c.createdAt)
          return createdDate >= cutoffDate
        })

        setCandidates(filteredCandidates)
        calculateMetrics(filteredCandidates)
      }
    } catch (err) {
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (candidatesList: Candidate[]) => {
    // Total candidates
    setTotalCandidates(candidatesList.length)

    // Active candidates (not rejected or hired)
    const active = candidatesList.filter(c => c.status === 'active').length
    setActiveCandidates(active)

    // Interviews scheduled
    const withInterviews = candidatesList.filter(c =>
      c.interviews && c.interviews.length > 0
    ).length
    setInterviewsScheduled(withInterviews)

    // Hired count
    const hired = candidatesList.filter(c => c.stage === 'hired').length
    setHiredCount(hired)

    // Conversion rate (applied to hired)
    if (candidatesList.length > 0) {
      setConversionRate((hired / candidatesList.length) * 100)
    }

    // Stage distribution
    const stages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']
    const stageDistribution = stages.map(stage => {
      const count = candidatesList.filter(c => c.stage === stage).length
      return {
        stage,
        count,
        percentage: candidatesList.length > 0 ? (count / candidatesList.length) * 100 : 0
      }
    })
    setStageMetrics(stageDistribution)

    // Average time to hire (for hired candidates)
    const hiredCandidates = candidatesList.filter(c => c.stage === 'hired')
    if (hiredCandidates.length > 0) {
      const totalDays = hiredCandidates.reduce((sum, c) => {
        const created = new Date(c.createdAt)
        const now = new Date()
        const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      setAvgTimeToHire(Math.round(totalDays / hiredCandidates.length))
    }

    // Timeline data (last 6 months)
    const monthsData: TimelineData[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthCandidates = candidatesList.filter(c => {
        const createdDate = new Date(c.createdAt)
        return createdDate >= monthStart && createdDate <= monthEnd
      })

      monthsData.push({
        month: monthStr,
        applied: monthCandidates.length,
        interviewed: monthCandidates.filter(c => c.interviews && c.interviews.length > 0).length,
        hired: monthCandidates.filter(c => c.stage === 'hired').length
      })
    }
    setTimelineData(monthsData)
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      applied: 'Candidature reçue',
      screening: 'Présélection',
      interview: 'Entretien',
      offer: 'Offre',
      hired: 'Embauché',
      rejected: 'Rejeté'
    }
    return labels[stage] || stage
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-500',
      screening: 'bg-purple-500',
      interview: 'bg-yellow-500',
      offer: 'bg-orange-500',
      hired: 'bg-green-500',
      rejected: 'bg-red-500'
    }
    return colors[stage] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement des données...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Header */}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour au tableau de bord
            </Link>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Tableau de Bord Analytique</h1>
                <p className="text-xl opacity-90">
                  Suivez les performances et métriques de votre processus de recrutement
                </p>
              </div>

              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
              >
                <option value="7" className="text-gray-900">7 derniers jours</option>
                <option value="30" className="text-gray-900">30 derniers jours</option>
                <option value="90" className="text-gray-900">90 derniers jours</option>
                <option value="180" className="text-gray-900">6 derniers mois</option>
                <option value="365" className="text-gray-900">1 an</option>
              </select>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Candidates */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Candidats</h3>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCandidates}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dans la période sélectionnée</p>
              </div>

              {/* Active Candidates */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Candidats Actifs</h3>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeCandidates}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En cours de traitement</p>
              </div>

              {/* Interviews Scheduled */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Entretiens</h3>
                  <Calendar className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{interviewsScheduled}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Candidats avec entretiens</p>
              </div>

              {/* Hired */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Embauchés</h3>
                  <PartyPopper className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{hiredCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Taux: {conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Stage Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">
                  Distribution par Étape
                </h2>
                <div className="space-y-4">
                  {stageMetrics.map(metric => (
                    <div key={metric.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getStageLabel(metric.stage)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.count} ({metric.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`${getStageColor(metric.stage)} h-3 rounded-full transition-all duration-300`}
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">
                  Entonnoir de Conversion
                </h2>
                <div className="space-y-3">
                  {stageMetrics
                    .filter(m => !['rejected'].includes(m.stage))
                    .map((metric, index) => {
                      const width = Math.max(20, 100 - (index * 15))
                      return (
                        <div
                          key={metric.stage}
                          className="relative"
                          style={{ paddingLeft: `${(100 - width) / 2}%`, paddingRight: `${(100 - width) / 2}%` }}
                        >
                          <div className={`${getStageColor(metric.stage)} text-white p-4 rounded-lg text-center`}>
                            <p className="font-bold text-lg">{metric.count}</p>
                            <p className="text-sm opacity-90">{getStageLabel(metric.stage)}</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">
                Évolution sur 6 Mois
              </h2>
              <div className="space-y-6">
                {/* Chart */}
                <div className="relative h-64">
                  <div className="absolute inset-0 flex items-end justify-between gap-4">
                    {timelineData.map((data, index) => {
                      const maxValue = Math.max(...timelineData.map(d => d.applied))
                      const appliedHeight = (data.applied / maxValue) * 100
                      const interviewedHeight = (data.interviewed / maxValue) * 100
                      const hiredHeight = (data.hired / maxValue) * 100

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                          <div className="flex-1 w-full flex items-end justify-center gap-1">
                            {/* Applied */}
                            <div className="relative flex-1 group">
                              <div
                                className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                                style={{ height: `${appliedHeight}%` }}
                              >
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Candidatures: {data.applied}
                                </div>
                              </div>
                            </div>
                            {/* Interviewed */}
                            <div className="relative flex-1 group">
                              <div
                                className="bg-yellow-500 rounded-t transition-all duration-300 hover:bg-yellow-600"
                                style={{ height: `${interviewedHeight}%` }}
                              >
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Entretiens: {data.interviewed}
                                </div>
                              </div>
                            </div>
                            {/* Hired */}
                            <div className="relative flex-1 group">
                              <div
                                className="bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                                style={{ height: `${hiredHeight}%` }}
                              >
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Embauchés: {data.hired}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{data.month}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Candidatures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Entretiens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Embauchés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average Time to Hire */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Temps Moyen d&apos;Embauche</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgTimeToHire} jours</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Durée moyenne du processus de recrutement
                </p>
              </div>

              {/* Success Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Taux de Réussite</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Candidats embauchés / Total des candidatures
                </p>
              </div>

              {/* Interview-to-Hire Ratio */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Taux Entretien → Embauche</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {interviewsScheduled > 0 ? ((hiredCount / interviewsScheduled) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Efficacité du processus d&apos;entretien
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
