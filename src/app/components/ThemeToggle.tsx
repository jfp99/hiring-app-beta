'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Clair' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Sombre' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'Système' },
  ]

  const currentIcon = themes.find(t => t.value === theme)?.icon || <Sun className="w-4 h-4" />

  // Prevent SSR mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-center
          w-10 h-10 rounded-lg
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-200
          transition-all duration-300
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-accent-500
        "
        aria-label="Changer le thème"
      >
        {currentIcon}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="
              absolute right-0 mt-2 w-48
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-xl
              py-2 z-50
              animate-scale-in
            "
          >
            {themes.map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2.5 text-left
                  flex items-center gap-3
                  transition-colors duration-200
                  ${theme === value
                    ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                {icon}
                <span className="font-medium">{label}</span>
                {theme === value && (
                  <span className="ml-auto text-accent-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Simple toggle button (light/dark only)
export function SimpleThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent SSR mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-200
        transition-all duration-300
        hover:scale-110 hover:rotate-180
        focus:outline-none focus:ring-2 focus:ring-accent-500
      "
      aria-label={`Passer au mode ${resolvedTheme === 'light' ? 'sombre' : 'clair'}`}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
