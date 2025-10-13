'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

interface AnalyticsData {
  totalCandidates: number
  activeCandidates: number
  hiredCount: number
  rejectedCount: number
  conversionRate: number
  avgTimeToHire: number
  funnel: {
    stage: string
    count: number
    percentage: number
    dropOffRate: number
  }[]
  sourceData: {
    source: string
    candidates: number
    hired: number
    conversionRate: number
    avgTimeToHire: number
  }[]
  recruiterPerformance: {
    recruiterId: string
    recruiterName: string
    activeCandidates: number
    hired: number
    avgTimeToHire: number
    responseTime: number
  }[]
  timelineData: {
    month: string
    applied: number
    interviewed: number
    hired: number
  }[]
}

export default function EnhancedAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [selectedView, setSelectedView] = useState<'overview' | 'funnel' | 'sources' | 'recruiters'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch candidates
      const response = await fetch('/api/candidates')
      const data = await response.json()

      if (response.ok) {
        const candidates = data.candidates || []

        // Filter by date range
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))

        const filteredCandidates = candidates.filter((c: any) => {
          const createdDate = new Date(c.createdAt)
          return createdDate >= cutoffDate
        })

        // Calculate metrics
        const analytics = calculateAnalytics(filteredCandidates)
        setAnalyticsData(analytics)
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (candidates: any[]): AnalyticsData => {
    const total = candidates.length
    const active = candidates.filter(c => c.isActive && !c.isArchived).length
    const hired = candidates.filter(c => c.status === 'hired' || c.appStatus === 'hired').length
    const rejected = candidates.filter(c => c.status === 'rejected' || c.appStatus === 'rejected').length

    // Funnel analysis
    const stages = [
      { name: 'new', label: 'Nouveau' },
      { name: 'contacted', label: 'Contacté' },
      { name: 'screening', label: 'Présélection' },
      { name: 'interview_scheduled', label: 'Entretien Planifié' },
      { name: 'interview_completed', label: 'Entretien Terminé' },
      { name: 'offer_sent', label: 'Offre Envoyée' },
      { name: 'offer_accepted', label: 'Offre Acceptée' },
      { name: 'hired', label: 'Embauché' }
    ]

    const funnel = stages.map((stage, idx) => {
      const count = candidates.filter(c =>
        c.status === stage.name || c.appStatus === stage.name
      ).length

      const percentage = total > 0 ? (count / total) * 100 : 0

      // Calculate drop-off rate (% lost from previous stage)
      let dropOffRate = 0
      if (idx > 0) {
        const prevCount = candidates.filter(c =>
          c.status === stages[idx - 1].name || c.appStatus === stages[idx - 1].name
        ).length
        dropOffRate = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0
      }

      return {
        stage: stage.label,
        count,
        percentage,
        dropOffRate
      }
    })

    // Source analysis
    const sourceMap = new Map<string, any[]>()
    candidates.forEach(c => {
      const source = c.source || 'Unknown'
      if (!sourceMap.has(source)) {
        sourceMap.set(source, [])
      }
      sourceMap.get(source)!.push(c)
    })

    const sourceData = Array.from(sourceMap.entries()).map(([source, candidatesList]) => {
      const hiredCount = candidatesList.filter(c => c.status === 'hired' || c.appStatus === 'hired').length
      const conversionRate = (hiredCount / candidatesList.length) * 100

      const hiredCandidates = candidatesList.filter(c => c.status === 'hired' || c.appStatus === 'hired')
      const totalDays = hiredCandidates.reduce((sum, c) => {
        const created = new Date(c.createdAt)
        const now = new Date()
        return sum + Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)
      const avgTimeToHire = hiredCandidates.length > 0 ? Math.round(totalDays / hiredCandidates.length) : 0

      return {
        source,
        candidates: candidatesList.length,
        hired: hiredCount,
        conversionRate,
        avgTimeToHire
      }
    }).sort((a, b) => b.candidates - a.candidates)

    // Recruiter performance
    const recruiterMap = new Map<string, any[]>()
    candidates.forEach(c => {
      const recruiterId = c.assignedTo || 'unassigned'
      const recruiterName = c.assignedToName || 'Non assigné'
      if (!recruiterMap.has(recruiterId)) {
        recruiterMap.set(recruiterId, [])
      }
      recruiterMap.get(recruiterId)!.push({ ...c, recruiterName })
    })

    const recruiterPerformance = Array.from(recruiterMap.entries()).map(([recruiterId, candidatesList]) => {
      const recruiterName = candidatesList[0].recruiterName
      const hiredCount = candidatesList.filter(c => c.status === 'hired' || c.appStatus === 'hired').length

      const hiredCandidates = candidatesList.filter(c => c.status === 'hired' || c.appStatus === 'hired')
      const totalDays = hiredCandidates.reduce((sum, c) => {
        const created = new Date(c.createdAt)
        const now = new Date()
        return sum + Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)
      const avgTimeToHire = hiredCandidates.length > 0 ? Math.round(totalDays / hiredCandidates.length) : 0

      return {
        recruiterId,
        recruiterName,
        activeCandidates: candidatesList.filter(c => c.isActive).length,
        hired: hiredCount,
        avgTimeToHire,
        responseTime: 0 // Placeholder
      }
    }).sort((a, b) => b.hired - a.hired)

    // Timeline data (last 6 months)
    const timelineData: any[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthCandidates = candidates.filter(c => {
        const createdDate = new Date(c.createdAt)
        return createdDate >= monthStart && createdDate <= monthEnd
      })

      timelineData.push({
        month: monthStr,
        applied: monthCandidates.length,
        interviewed: monthCandidates.filter(c => c.interviews && c.interviews.length > 0).length,
        hired: monthCandidates.filter(c => c.status === 'hired' || c.appStatus === 'hired').length
      })
    }

    // Average time to hire
    const hiredCandidates = candidates.filter(c => c.status === 'hired' || c.appStatus === 'hired')
    const totalDays = hiredCandidates.reduce((sum, c) => {
      const created = new Date(c.createdAt)
      const now = new Date()
      return sum + Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)
    const avgTimeToHire = hiredCandidates.length > 0 ? Math.round(totalDays / hiredCandidates.length) : 0

    return {
      totalCandidates: total,
      activeCandidates: active,
      hiredCount: hired,
      rejectedCount: rejected,
      conversionRate: total > 0 ? (hired / total) * 100 : 0,
      avgTimeToHire,
      funnel,
      sourceData,
      recruiterPerformance,
      timelineData
    }
  }

  const exportToCSV = () => {
    if (!analyticsData) return

    let csv = 'Analytics Report\n\n'
    csv += `Date Range: ${dateRange} days\n`
    csv += `Generated: ${new Date().toLocaleString('fr-FR')}\n\n`

    // Overview
    csv += 'Overview\n'
    csv += 'Total Candidates,' + analyticsData.totalCandidates + '\n'
    csv += 'Active Candidates,' + analyticsData.activeCandidates + '\n'
    csv += 'Hired,' + analyticsData.hiredCount + '\n'
    csv += 'Conversion Rate,' + analyticsData.conversionRate.toFixed(2) + '%\n'
    csv += 'Avg Time to Hire,' + analyticsData.avgTimeToHire + ' days\n\n'

    // Funnel
    csv += 'Funnel Analysis\n'
    csv += 'Stage,Count,Percentage,Drop-off Rate\n'
    analyticsData.funnel.forEach(stage => {
      csv += `${stage.stage},${stage.count},${stage.percentage.toFixed(1)}%,${stage.dropOffRate.toFixed(1)}%\n`
    })
    csv += '\n'

    // Sources
    csv += 'Source Performance\n'
    csv += 'Source,Candidates,Hired,Conversion Rate,Avg Time to Hire\n'
    analyticsData.sourceData.forEach(source => {
      csv += `${source.source},${source.candidates},${source.hired},${source.conversionRate.toFixed(1)}%,${source.avgTimeToHire} days\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading || !analyticsData) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des analytics...</p>
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

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Analytics Avancés</h1>
                <p className="text-xl opacity-90">
                  Analyses approfondies de votre processus de recrutement
                </p>
              </div>

              <div className="flex gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-[#ffaf50ff]"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                  <option value="180">6 derniers mois</option>
                  <option value="365">1 an</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  📊 Exporter CSV
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* View Tabs */}
        <section className="bg-white/80 border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2">
              {[
                { id: 'overview' as const, label: 'Vue d\'ensemble', icon: '📊' },
                { id: 'funnel' as const, label: 'Entonnoir', icon: '🔽' },
                { id: 'sources' as const, label: 'Sources', icon: '🎯' },
                { id: 'recruiters' as const, label: 'Recruteurs', icon: '👥' }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setSelectedView(view.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedView === view.id
                      ? 'bg-[#3b5335ff] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {view.icon} {view.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Overview */}
            {selectedView === 'overview' && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Candidats</h3>
                    <p className="text-4xl font-bold text-gray-900">{analyticsData.totalCandidates}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Actifs</h3>
                    <p className="text-4xl font-bold text-gray-900">{analyticsData.activeCandidates}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Embauchés</h3>
                    <p className="text-4xl font-bold text-gray-900">{analyticsData.hiredCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Taux de Conversion</h3>
                    <p className="text-4xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Temps Moyen</h3>
                    <p className="text-4xl font-bold text-gray-900">{analyticsData.avgTimeToHire}j</p>
                  </div>
                </div>

                {/* Timeline Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-[#3b5335ff] mb-6">Évolution sur 6 Mois</h2>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {analyticsData.timelineData.map((data, index) => {
                      const maxValue = Math.max(...analyticsData.timelineData.map(d => d.applied))
                      const appliedHeight = (data.applied / maxValue) * 100
                      const interviewedHeight = (data.interviewed / maxValue) * 100
                      const hiredHeight = (data.hired / maxValue) * 100

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                          <div className="flex-1 w-full flex items-end justify-center gap-1">
                            <div
                              className="bg-blue-500 rounded-t w-1/3"
                              style={{ height: `${appliedHeight}%` }}
                              title={`Candidatures: ${data.applied}`}
                            />
                            <div
                              className="bg-yellow-500 rounded-t w-1/3"
                              style={{ height: `${interviewedHeight}%` }}
                              title={`Entretiens: ${data.interviewed}`}
                            />
                            <div
                              className="bg-green-500 rounded-t w-1/3"
                              style={{ height: `${hiredHeight}%` }}
                              title={`Embauchés: ${data.hired}`}
                            />
                          </div>
                          <p className="text-xs text-gray-600 font-medium">{data.month}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-700">Candidatures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-700">Entretiens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-700">Embauchés</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Funnel Analysis */}
            {selectedView === 'funnel' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Analyse de l'Entonnoir de Conversion</h2>
                <div className="space-y-4">
                  {analyticsData.funnel.map((stage, idx) => {
                    const width = Math.max(20, 100 - (idx * 10))
                    return (
                      <div key={idx} className="relative">
                        <div
                          className="relative"
                          style={{
                            paddingLeft: `${(100 - width) / 2}%`,
                            paddingRight: `${(100 - width) / 2}%`
                          }}
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg">{stage.stage}</p>
                                <p className="text-sm opacity-90">{stage.count} candidats ({stage.percentage.toFixed(1)}%)</p>
                              </div>
                              {idx > 0 && stage.dropOffRate > 0 && (
                                <div className="text-right">
                                  <p className="text-sm opacity-75">Perte</p>
                                  <p className="text-xl font-bold text-red-200">-{stage.dropOffRate.toFixed(1)}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Source Analysis */}
            {selectedView === 'sources' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Performance par Source</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Source</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Candidats</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Embauchés</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Taux de Conversion</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Temps Moyen</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.sourceData.map((source, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{source.source}</td>
                          <td className="py-3 px-4 text-right">{source.candidates}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-bold">{source.hired}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded ${
                              source.conversionRate > 10 ? 'bg-green-100 text-green-800' :
                              source.conversionRate > 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {source.conversionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{source.avgTimeToHire} jours</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded font-bold ${
                              source.conversionRate > 10 ? 'bg-green-100 text-green-800' :
                              source.conversionRate > 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {source.conversionRate > 10 ? '🚀 Excellent' :
                               source.conversionRate > 5 ? '⚡ Bon' : '⚠️ À améliorer'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recruiter Performance */}
            {selectedView === 'recruiters' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6">Performance des Recruteurs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.recruiterPerformance.map((recruiter, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#ffaf50ff] transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#3b5335ff] to-[#2a3d26ff] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {recruiter.recruiterName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{recruiter.recruiterName}</h3>
                          <p className="text-sm text-gray-600">{recruiter.activeCandidates} candidats actifs</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Embauches</span>
                          <span className="text-lg font-bold text-green-600">{recruiter.hired}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Temps moyen</span>
                          <span className="text-lg font-bold text-blue-600">{recruiter.avgTimeToHire}j</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Performance</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              recruiter.hired >= 5 ? 'bg-green-100 text-green-800' :
                              recruiter.hired >= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {recruiter.hired >= 5 ? '🌟 Excellent' :
                               recruiter.hired >= 2 ? '⭐ Bon' : '📊 Débutant'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
