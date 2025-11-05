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
        ? 'bg-primary-600/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-primary-700/50 dark:border-gray-700/50 py-1 sm:py-0'
        : 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-900 dark:to-gray-950 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-20">
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
                  className="h-7 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
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
                    ? 'text-white dark:text-accent-500 bg-white/10 dark:bg-accent-500/20 shadow-inner'
                    : 'text-white/90 dark:text-gray-200 hover:text-white dark:hover:text-accent-400 hover:bg-white/10 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="font-semibold uppercase text-sm">{item.label}</span>

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
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            {!mounted ? (
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" />
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                  isMenuOpen
                    ? 'bg-accent-500 dark:bg-accent-500 text-white'
                    : 'bg-white/10 dark:bg-gray-800 text-white dark:text-gray-200 shadow-md hover:shadow-lg hover:bg-white/20'
                }`}
                aria-label="Toggle menu"
                suppressHydrationWarning
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-primary-600/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-primary-700/50 dark:border-gray-700/50">
            <div className="px-3 pt-1.5 pb-3 space-y-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-3 py-2.5 rounded-lg font-medium transition-all duration-300 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                    pathname === item.href
                      ? 'bg-white/10 dark:from-accent-500/20 dark:to-accent-500/5 text-white dark:text-accent-500 border border-white/20 dark:border-accent-500/30'
                      : 'text-white/90 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800 hover:text-white dark:hover:text-accent-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm uppercase">{item.label}</span>
                    {pathname === item.href && (
                      <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Section info mobile */}
              <div className="pt-2 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="space-y-1.5">
                  {/* Contact Hugo */}
                  <a
                    href="tel:+33666747618"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-accent-500/10 to-primary-500/5 dark:from-accent-500/20 dark:to-accent-500/5 border border-accent-500/20 dark:border-accent-500/30 hover:shadow-md transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-500/20 dark:bg-accent-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-primary-700 dark:text-accent-400 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors">Hugo: 06 66 74 76 18</p>
                    </div>
                  </a>

                  {/* Contact Izia */}
                  <a
                    href="tel:+33609111598"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary-500/10 to-accent-500/5 dark:from-primary-500/20 dark:to-primary-500/5 border border-primary-500/20 dark:border-primary-500/30 hover:shadow-md transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500/20 dark:bg-primary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">Izia: 06 09 11 15 98</p>
                    </div>
                  </a>

                  {/* Business Hours */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Lun-Ven: 9h-18h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}