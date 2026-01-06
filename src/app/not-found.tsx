// src/app/not-found.tsx
'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-primary-100 dark:text-gray-800 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transform -rotate-3">
              <Search className="w-16 h-16 text-accent-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-primary-700 dark:text-cream-100 mb-4">
          Page introuvable
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 min-h-[44px]"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/offres-emploi"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-primary-700 dark:text-cream-100 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-600 min-h-[44px]"
          >
            <Search className="w-5 h-5" />
            Voir les offres
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Revenir en arrière
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          Besoin d'aide ?{' '}
          <Link href="/contact" className="text-accent-500 hover:text-accent-600 font-medium">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  )
}
