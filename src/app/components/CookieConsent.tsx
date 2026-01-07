'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Cookie consent categories
export interface CookiePreferences {
  essential: boolean // Always true, required for site function
  analytics: boolean // Vercel Analytics, performance tracking
  marketing: boolean // Future: ads, remarketing
  functional: boolean // Theme preferences, language, etc.
  timestamp: string // ISO date of consent
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: true,
  timestamp: ''
}

const CONSENT_KEY = 'cookie-consent'

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      return JSON.parse(stored) as CookiePreferences
    }
  } catch {
    // Invalid JSON, clear it
    localStorage.removeItem(CONSENT_KEY)
  }
  return null
}

export function hasAnalyticsConsent(): boolean {
  const prefs = getCookiePreferences()
  return prefs?.analytics ?? false
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if consent was already given
    const stored = getCookiePreferences()
    if (!stored) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
    setPreferences(stored)
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    const withTimestamp = {
      ...prefs,
      essential: true, // Always required
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(withTimestamp))
    setPreferences(withTimestamp)

    // Trigger analytics consent event for Vercel Analytics
    if (typeof window !== 'undefined') {
      // Vercel Analytics uses window.va for consent
      const windowWithVa = window as Window & { va?: (event: string, data: Record<string, boolean>) => void }
      if (windowWithVa.va && prefs.analytics) {
        windowWithVa.va('consent', { analytics: true })
      }
    }

    closeBanner()
  }

  const closeBanner = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowBanner(false)
      setIsClosing(false)
    }, 300)
  }

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: ''
    })
  }

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: ''
    })
  }

  const saveCustom = () => {
    savePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4
        transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowDetails(false)}
      />

      {/* Banner */}
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700 overflow-hidden
          transform transition-all duration-300 ${isClosing ? 'translate-y-8 scale-95' : 'translate-y-0 scale-100'}`}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.7 0 1.38.08 2.03.23" />
              </svg>
            </div>
            <h2 id="cookie-title" className="text-lg font-semibold text-white">
              Gestion des cookies
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            Nous utilisons des cookies pour ameliorer votre experience, analyser le trafic et personnaliser le contenu.
            Vous pouvez choisir les cookies que vous acceptez.
          </p>

          {/* Cookie details (expandable) */}
          {showDetails && (
            <div className="mb-4 space-y-3 animate-fadeIn">
              {/* Essential */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">Essentiels</span>
                      <span className="px-2 py-0.5 text-xs bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded">
                        Requis
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Necessaires au fonctionnement du site (session, securite)
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-accent-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Analytiques</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nous aident a comprendre comment vous utilisez le site (Vercel Analytics)
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics
                        ? 'bg-accent-500 justify-end'
                        : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                    role="switch"
                    aria-checked={preferences.analytics}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Marketing */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Marketing</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Permettent de personnaliser les publicites (actuellement non utilises)
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing
                        ? 'bg-accent-500 justify-end'
                        : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                    role="switch"
                    aria-checked={preferences.marketing}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Functional */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Fonctionnels</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Memorisent vos preferences (theme, langue)
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.functional
                        ? 'bg-accent-500 justify-end'
                        : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                    role="switch"
                    aria-checked={preferences.functional}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showDetails ? (
              <>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300
                    bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                    rounded-lg transition-colors min-h-[44px]"
                >
                  Retour
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white
                    bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors
                    shadow-lg shadow-accent-500/25 min-h-[44px] active:scale-95"
                >
                  Sauvegarder mes choix
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={acceptEssential}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300
                    bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                    rounded-lg transition-colors min-h-[44px] active:scale-95"
                >
                  Refuser optionnels
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-accent-600 dark:text-accent-400
                    bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-900/50
                    rounded-lg transition-colors min-h-[44px] active:scale-95"
                >
                  Personnaliser
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white
                    bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors
                    shadow-lg shadow-accent-500/25 min-h-[44px] active:scale-95"
                >
                  Tout accepter
                </button>
              </>
            )}
          </div>

          {/* Link to policy */}
          <div className="mt-4 text-center">
            <Link
              href="/cookies"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400
                underline underline-offset-2 transition-colors"
            >
              En savoir plus sur notre politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Small button to re-open cookie settings (for footer)
export function CookieSettingsButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const openSettings = () => {
    // Remove consent to re-show banner
    localStorage.removeItem(CONSENT_KEY)
    window.location.reload()
  }

  if (!mounted) return null

  return (
    <button
      onClick={openSettings}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent-500
        dark:hover:text-accent-400 transition-colors underline underline-offset-2"
    >
      Gerer les cookies
    </button>
  )
}
