// components/Footer.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import SocialLinks from './SocialLinks'
import { CheckCircle, XCircle, Check } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('Veuillez entrer votre email')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message || 'Merci pour votre inscription !')
        setEmail('')
      } else {
        setMessage(data.error || 'Erreur lors de l\'inscription')
      }
    } catch  {
      setMessage('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-gray-900 dark:to-gray-950 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              Hiring
            </h3>
            <span className="text-lg font-semibold text-accent-500">Cabinet de Conseil en Recrutement</span>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Votre partenaire de confiance pour le recrutement et la mise en relation 
              des talents avec les entreprises les plus innovantes. 
              Ensemble, construisons l&#39;avenir du travail.
            </p>
            <SocialLinks />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-accent-500">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/vision', label: 'Notre Vision' },
                { href: '/offres-emploi', label: 'Offres d\'emploi' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-300 hover:pl-2 block transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 dark:focus-visible:ring-accent-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-accent-500">Newsletter</h4>
            <p className="text-gray-300 mb-4 text-sm">
              Recevez les dernières offres et actualités du recrutement.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent placeholder-gray-400 text-white transition-all duration-300"
                required
                disabled={loading}
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 dark:focus-visible:ring-accent-400 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 hover:shadow-lg'
                }`}
                suppressHydrationWarning
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
                    Inscription...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    S'abonner
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Message de confirmation/erreur */}
            {message && (
              <div className={`mt-3 p-3 rounded-lg text-sm border flex items-center gap-2 ${
                message.includes('Merci')
                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {message.includes('Merci') ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Social Media Icons */}
            <SocialLinks className="justify-center" />

            {/* Copyright */}
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-2">
                © {currentYear} <span className="text-accent-500 font-semibold">Hiring</span>.
                Tous droits réservés.
              </div>
              <div className="bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent font-bold text-xs">
                2025 HIRING - Cabinet de Recrutement
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {[
                { href: '/confidentialite', label: 'Confidentialité' },
                { href: '/cgu', label: 'CGU' },
                { href: '/mentions-legales', label: 'Mentions légales' },
                { href: '/cookies', label: 'Cookies' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-accent-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 dark:focus-visible:ring-accent-400 rounded"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Site sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}