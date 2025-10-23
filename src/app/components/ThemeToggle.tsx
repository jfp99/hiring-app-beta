'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent SSR mismatch
  if (!mounted) {
    return (
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center justify-center
        w-9 h-9 md:w-10 md:h-10 rounded-lg
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-200
        transition-all duration-300
        hover:scale-110 hover:rotate-180
        focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1
        cursor-pointer
      "
      aria-label={`Passer au mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 md:w-5 md:h-5" />
      ) : (
        <Sun className="w-4 h-4 md:w-5 md:h-5" />
      )}
    </button>
  )
}
