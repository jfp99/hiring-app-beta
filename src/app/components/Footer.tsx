// components/Footer.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

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
        setMessage(data.message || '✅ Merci pour votre inscription !')
        setEmail('')
      } else {
        setMessage(data.error || '❌ Erreur lors de l\'inscription')
      }
    } catch  {
      setMessage('❌ Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: 'https://www.linkedin.com/company/hi-ring/'
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      ),
      url: 'https://www.instagram.com/cab.hiring'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://www.facebook.com/profile.php?id=61578306652910&locale=fr_FR'
    }
  ]

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
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-500 hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 dark:focus-visible:ring-accent-400"
                  aria-label={`Suivez-nous sur ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
                  'S\'abonner ✓'
                )}
              </button>
            </form>

            {/* Message de confirmation/erreur */}
            {message && (
              <div className={`mt-3 p-3 rounded-lg text-sm border ${
                message.includes('✅') 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {message}
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
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] bg-white/10 rounded-full flex items-center justify-center hover:bg-accent-500 hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 dark:focus-visible:ring-accent-400"
                  aria-label={`Suivez-nous sur ${social.name}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {social.icon.props.children}
                  </svg>
                </a>
              ))}
            </div>

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