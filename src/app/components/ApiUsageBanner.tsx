// src/app/components/ApiUsageBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react'

interface ApiUsageStats {
  callsToday: number
  callsThisMonth: number
  dailyLimit: number
  monthlyLimit: number
  resetDate: string
}

export default function ApiUsageBanner() {
  const [stats, setStats] = useState<ApiUsageStats | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if banner was dismissed
    const isDismissed = localStorage.getItem('apiUsageBannerDismissed')
    if (isDismissed === 'true') {
      setDismissed(true)
      setLoading(false)
      return
    }

    // Fetch usage stats
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/usage/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      setError('Unable to load API usage statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('apiUsageBannerDismissed', 'true')
    setDismissed(true)
  }

  if (loading || dismissed || error || !stats) {
    return null
  }

  const dailyUsagePercent = (stats.callsToday / stats.dailyLimit) * 100
  const monthlyUsagePercent = (stats.callsThisMonth / stats.monthlyLimit) * 100

  // Determine color based on usage
  const getDailyColor = () => {
    if (dailyUsagePercent >= 90) return 'red'
    if (dailyUsagePercent >= 70) return 'yellow'
    return 'green'
  }

  const getMonthlyColor = () => {
    if (monthlyUsagePercent >= 90) return 'red'
    if (monthlyUsagePercent >= 70) return 'yellow'
    return 'green'
  }

  const dailyColor = getDailyColor()
  const monthlyColor = getMonthlyColor()

  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
      bar: 'bg-green-500 dark:bg-green-400',
      barBg: 'bg-green-100 dark:bg-green-900'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
      bar: 'bg-yellow-500 dark:bg-yellow-400',
      barBg: 'bg-yellow-100 dark:bg-yellow-900'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      bar: 'bg-red-500 dark:bg-red-400',
      barBg: 'bg-red-100 dark:bg-red-900'
    }
  }

  return (
    <div className={`relative rounded-lg border-2 p-4 mb-6 ${colorClasses[dailyColor].bg} ${colorClasses[dailyColor].border}`}>
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-3 right-3 p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors ${colorClasses[dailyColor].text}`}
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`mt-0.5 ${colorClasses[dailyColor].icon}`}>
          {dailyUsagePercent >= 90 ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <TrendingUp className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${colorClasses[dailyColor].text}`}>
            API Usage Statistics
          </h3>
          <p className={`text-sm ${colorClasses[dailyColor].text} opacity-80`}>
            Monitor your CV parsing API usage
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-4 ml-8">
        {/* Daily Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${colorClasses[dailyColor].text}`}>
              Today&apos;s Usage
            </span>
            <span className={`text-sm font-bold ${colorClasses[dailyColor].text}`}>
              {stats.callsToday} / {stats.dailyLimit}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${colorClasses[dailyColor].barBg}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorClasses[dailyColor].bar}`}
              style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${colorClasses[dailyColor].text} opacity-70`}>
            {dailyUsagePercent >= 100
              ? 'Daily limit reached. Resets tomorrow.'
              : `${Math.max(0, stats.dailyLimit - stats.callsToday)} calls remaining today`
            }
          </p>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${colorClasses[monthlyColor].text}`}>
              Monthly Usage
            </span>
            <span className={`text-sm font-bold ${colorClasses[monthlyColor].text}`}>
              {stats.callsThisMonth} / {stats.monthlyLimit}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${colorClasses[monthlyColor].barBg}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorClasses[monthlyColor].bar}`}
              style={{ width: `${Math.min(monthlyUsagePercent, 100)}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${colorClasses[monthlyColor].text} opacity-70`}>
            Resets on {new Date(stats.resetDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Warning Message for High Usage */}
      {(dailyUsagePercent >= 90 || monthlyUsagePercent >= 90) && (
        <div className={`mt-4 ml-8 p-3 rounded-lg ${colorClasses[dailyColor].bg} border ${colorClasses[dailyColor].border}`}>
          <p className={`text-sm font-medium ${colorClasses[dailyColor].text}`}>
            {dailyUsagePercent >= 100 || monthlyUsagePercent >= 100
              ? '⚠️ API limit reached. Please try again later or upgrade your plan.'
              : '⚠️ Approaching API limit. Consider upgrading to continue uninterrupted service.'
            }
          </p>
          <a
            href="/pricing"
            className={`inline-flex items-center gap-1 text-sm font-medium mt-2 ${colorClasses[dailyColor].text} hover:underline`}
          >
            View Pricing Plans
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}
