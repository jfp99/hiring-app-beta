// components/Footer.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    // Intégration newsletter
    console.log('Email inscrit:', email)
    setEmail('')
    alert('Merci pour votre inscription à notre newsletter !')
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-[#2a3d26ff] to-[#1e2c1aff] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
              HiringSimple
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Votre partenaire de confiance pour le recrutement et la mise en relation 
              des talents avec les entreprises les plus innovantes. 
              Ensemble, construisons l'avenir du travail.
            </p>
            <div className="flex space-x-4">
              {['📘', '📷', '🐦', '💼'].map((icon, index) => (
                <button 
                  key={index}
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#ffaf50ff] hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  <span className="text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#ffaf50ff]">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/vision', label: 'Notre Vision' },
                { href: '/offres-emploi', label: 'Offres d\'emploi' },
                { href: '/contact', label: 'Contact' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-[#ffaf50ff] transition-colors duration-300 hover:pl-2 block transform hover:-translate-y-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#ffaf50ff]">Newsletter</h4>
            <p className="text-gray-300 mb-4 text-sm">
              Recevez les dernières offres et actualités du recrutement.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent placeholder-gray-400 text-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 shadow-md"
              >
                S'abonner ✓
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} <span className="text-[#ffaf50ff] font-semibold">HiringSimple</span>. 
              Tous droits réservés. 
              <span className="mx-2">•</span>
              <span className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent font-bold">
                2025 HIRING
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { href: '/confidentialite', label: 'Confidentialité' },
                { href: '/cgu', label: 'CGU' },
                { href: '/mentions-legales', label: 'Mentions légales' },
                { href: '/cookies', label: 'Cookies' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-[#ffaf50ff] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="text-green-400 text-lg">🔒</span>
                <span>Site sécurisé</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="text-blue-400 text-lg">⭐</span>
                <span>4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse hover:animate-none">
          <span className="text-2xl">💬</span>
        </button>
      </div>
    </footer>
  )
}