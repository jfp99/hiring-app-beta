'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Default context value to prevent errors
const defaultContext: ThemeContextType = {
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {}
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get initial theme from localStorage
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'

    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return 'dark'
    return 'light'
  }

  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement

    // Remove old theme class
    root.classList.remove('light', 'dark')

    // Add new theme class
    root.classList.add(newTheme)

    // Set data attribute
    root.setAttribute('data-theme', newTheme)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff')
    }
  }

  // Apply theme on mount
  useEffect(() => {
    setMounted(true)
    // Apply the current theme immediately when component mounts
    applyTheme(theme)
  }, [theme])

  // Update theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme)
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Always provide context with safe defaults
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
