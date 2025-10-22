// components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logohiring from '../../../public/logo-hiring.png'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/vision', label: 'Vision' },
    { href: '/offres-emploi', label: 'Offres d\'emploi' },
    { href: '/contact', label: 'Contact' },
  ]

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 py-2 sm:py-0'
        : 'bg-cream-100 dark:bg-gray-900 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="group flex items-center"
              onClick={handleLinkClick}
            >
              <div className="relative">
                <Image
                  src={Logohiring}
                  alt="Hi-ring Logo"
                  width={180}
                  height={80}
                  className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-transparent opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                  pathname === item.href
                    ? 'text-primary-700 dark:text-accent-500 bg-accent-500/10 dark:bg-accent-500/20 shadow-inner'
                    : 'text-primary-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-accent-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="font-semibold">{item.label}</span>

                {/* Indicateur actif */}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-accent-500 rounded-full" />
                )}

                {/* Effet hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              </Link>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {!mounted ? (
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" />
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                  isMenuOpen
                    ? 'bg-primary-500 dark:bg-accent-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-primary-700 dark:text-gray-200 shadow-lg hover:shadow-xl'
                }`}
                aria-label="Toggle menu"
                suppressHydrationWarning
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-4 py-4 rounded-xl font-medium transition-all duration-300 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-accent-500/10 to-primary-500/5 dark:from-accent-500/20 dark:to-accent-500/5 text-primary-700 dark:text-accent-500 border border-accent-500/20 dark:border-accent-500/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-accent-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.label}</span>
                    {pathname === item.href && (
                      <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Section info mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <p>📞 +33 1 23 45 67 89</p>
                  <p>🕒 Lun - Ven: 9h-18h</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}