// components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logohiring from '../../../public/logo-hiring.png'

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
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 py-1 sm:py-0 header-scrolled'
        : 'bg-cream-100 dark:bg-gray-900 shadow-sm'
    }`}>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-500 text-primary-700 dark:text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white font-semibold"
      >
        Aller au contenu principal
      </a>
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center"
              onClick={handleLinkClick}
            >
              <div className="relative bg-transparent rounded-xl px-4 py-2.5 transition-all duration-500 group-hover:shadow-lg">
                <Image
                  src={Logohiring}
                  alt="Hi-ring Logo"
                  width={180}
                  height={80}
                  className="h-8 sm:h-14 w-auto object-contain transition-all duration-500 group-hover:scale-110"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group px-6 py-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 hover:scale-105 hover:-translate-y-0.5 ${
                  pathname === item.href
                    ? 'text-primary-700 dark:text-accent-500 bg-accent-500/10 dark:bg-accent-500/20 shadow-inner'
                    : 'text-primary-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-accent-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="font-semibold uppercase text-sm tracking-wide">{item.label}</span>

                {/* Indicateur actif - ombre colorée */}
                {pathname === item.href && (
                  <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(255,175,80,0.3)] dark:shadow-[inset_0_0_20px_rgba(255,175,80,0.4)]" />
                )}

                {/* Effet hover shadow - ombre qui apparaît de haut en bas */}
                {pathname !== item.href && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-accent-500/30 via-accent-500/15 to-transparent opacity-0 group-hover:opacity-100 transform origin-top scale-y-0 group-hover:scale-y-100 transition-all duration-300 ease-out" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {!mounted ? (
              <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" />
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`relative p-3 min-w-[48px] min-h-[48px] rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 active:scale-95 ${
                  isMenuOpen
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                    : 'bg-white dark:bg-gray-800 text-primary-700 dark:text-gray-200 shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-500/50'
                }`}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMenuOpen}
                suppressHydrationWarning
              >
                {/* Animated hamburger icon */}
                <div className="relative w-5 h-5 flex flex-col justify-center items-center">
                  <span className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                  }`} />
                  <span className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                  }`} />
                  <span className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                  }`} />
                </div>

                {/* Pulse indicator when closed */}
                {!isMenuOpen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[var(--header-height-mobile)] sm:top-[var(--header-height-desktop)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50 overflow-y-auto z-[60]">
            <div className="px-3 pt-4 pb-safe space-y-1.5 max-h-[calc(100vh-var(--header-height-mobile))] sm:max-h-[calc(100vh-var(--header-height-desktop))]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-4 py-3 min-h-[44px] rounded-lg font-medium transition-all duration-300 group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-accent-500/10 to-primary-500/5 dark:from-accent-500/20 dark:to-accent-500/5 text-primary-700 dark:text-accent-500 border border-accent-500/20 dark:border-accent-500/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-accent-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm uppercase">{item.label}</span>
                    {pathname === item.href && (
                      <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Section info mobile */}
              <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
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