// components/AdminHeader.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Logohiring from '../../../public/logo-hiring.png'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

export default function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems: Array<{ href: string; label: string; icon: string; badge?: string }> = [
    { href: '/admin', label: 'Candidats Hub', icon: '👥', badge: 'CRM' },
    { href: '/admin/processes', label: 'Processus', icon: '🎯' },
    { href: '/admin/workflows', label: 'Workflows', icon: '🤖' },
    { href: '/admin/analytics-enhanced', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings', label: 'Paramètres', icon: '⚙️' },
  ]

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
        : 'bg-[#f8f7f3ff] dark:bg-gray-900 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/admin"
              className="group flex items-center"
              onClick={handleLinkClick}
            >
              <div className="relative">
                <Image
                  src={Logohiring}
                  alt="Hi-ring Logo"
                  width={150}
                  height={60}
                  className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#ffaf50ff] to-transparent opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300" />
              </div>
              <span className="ml-2 text-xs font-semibold text-[#3b5335ff] bg-[#ffaf50ff]/20 px-2 py-1 rounded">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  pathname === item.href
                    ? 'text-[#3b5335ff] bg-[#ffaf50ff]/10 shadow-inner'
                    : 'text-[#3b5335ff]/80 hover:text-[#3b5335ff] hover:bg-white/50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-semibold text-sm">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-[#ffaf50ff] text-[#3b5335ff] text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Active indicator */}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-[#ffaf50ff] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side: Notifications + User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-600">
              <div className="text-right">
                <div className="text-sm font-medium text-[#3b5335ff]">
                  {session?.user?.name || session?.user?.email || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">Administrateur</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#3b5335ff] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                title="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle for mobile */}
            <ThemeToggle />

            {/* Notification Bell for mobile */}
            <NotificationBell />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isMenuOpen
                  ? 'bg-[#3b5335ff] text-white'
                  : 'bg-white text-[#3b5335ff] shadow-md hover:shadow-lg'
              }`}
              aria-label="Toggle menu"
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
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {/* User Info Mobile */}
              <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-[#3b5335ff]">
                  {session?.user?.name || session?.user?.email || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">Administrateur</div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 group relative ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-[#ffaf50ff]/10 to-[#3b5335ff]/5 text-[#3b5335ff] border border-[#ffaf50ff]/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#3b5335ff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-[#ffaf50ff] text-[#3b5335ff] text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {pathname === item.href && (
                      <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full animate-pulse" />
                    )}
                  </div>
                </Link>
              ))}

              {/* Logout Button Mobile */}
              <button
                onClick={handleLogout}
                className="w-full mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
