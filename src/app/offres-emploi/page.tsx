// app/offres-emploi/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useApi } from '../hooks/useApi'

// Custom debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface Offre {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  datePublication: string
  categorie: string
}

export default function OffresEmploi() {
  const [filters, setFilters] = useState({
    categorie: 'toutes',
    lieu: 'tous',
    typeContrat: 'tous'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [offres, setOffres] = useState<Offre[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Debounce search term by 300ms to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { loading, error, callApi } = useApi()

  // Format date consistently between server and client
  const formatDate = (dateString: string) => {
    if (!isMounted) return '' // Return empty on server to avoid hydration mismatch
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Animation visibility and mounted state
  useEffect(() => {
    setIsVisible(true)
    setIsMounted(true)
  }, [])

  // Charger les offres with debounced search
  useEffect(() => {
    const loadOffres = async () => {
      try {
        const params = new URLSearchParams()
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
        if (filters.categorie !== 'toutes') params.append('categorie', filters.categorie)
        if (filters.lieu !== 'tous') params.append('lieu', filters.lieu)
        if (filters.typeContrat !== 'tous') params.append('typeContrat', filters.typeContrat)

        const result = await callApi(`/jobs?${params.toString()}`)
        setOffres(result.offres || [])
      } catch {
        setOffres([])
      }
    }

    loadOffres()
  }, [filters, debouncedSearchTerm, callApi])

  const categories = ['Technologie', 'Management', 'Data']
  const lieux = ['Paris', 'Lyon', 'Toulouse']
  const typesContrat = ['CDI', 'CDD', 'Freelance']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Spacer between header and hero */}
      <div className="h-4 bg-cream-100 dark:bg-gray-800"></div>

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white section-padding-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content - Left Side */}
            <div
              suppressHydrationWarning
              className={`transform transition-all duration-1000 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}
            >
              <div className="inline-block bg-[#ffaf50ff]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-[#ffaf50ff] font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Opportunités de Carrière
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Trouvez votre
                <span className="block mt-2 bg-gradient-to-r from-[#ffaf50ff] via-[#ff9500ff] to-[#ffaf50ff] bg-clip-text text-transparent animate-pulse">
                  Prochain Défi
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-200">
                Découvrez des opportunités exceptionnelles dans des entreprises <span className="font-semibold text-[#ffaf50ff]">innovantes</span> qui transforment leur secteur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#offres"
                  className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Voir les offres
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </a>

                <Link
                  href="/contact"
                  className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    Candidature spontanée
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Hero Image - Right Side */}
            <div
              suppressHydrationWarning
              className={`relative transform transition-all duration-1000 delay-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop"
                  alt="Équipe de travail Hi-Ring"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/80 to-transparent"></div>

                {/* Logo */}
                <div className="absolute bottom-6 right-6">
                  <div className="bg-white/95 dark:bg-white/90 backdrop-blur-sm rounded-xl p-2">
                    <Image
                      src="/logohiringsansfond.png"
                      alt="Hi-Ring Logo"
                      width={200}
                      height={200}
                      className="w-16 h-auto sm:w-20 md:w-24 lg:w-28"
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                      }}
                      quality={100}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-4 sm:py-6 lg:py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 items-stretch sm:items-center">
            {/* Barre de recherche */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un poste, une entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-400 text-base sm:text-lg text-gray-900 dark:text-white"
                  suppressHydrationWarning
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 text-xl cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Compteur de résultats - ARIA live region for screen readers */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-4 py-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold shadow-lg text-center sm:text-left whitespace-nowrap"
            >
              {loading ? 'Chargement...' : `${offres.length} offre${offres.length > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 sm:justify-center">
            <select
              value={filters.categorie}
              onChange={(e) => setFilters({...filters, categorie: e.target.value})}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base cursor-pointer"
              suppressHydrationWarning
            >
              <option value="toutes">Catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.lieu}
              onChange={(e) => setFilters({...filters, lieu: e.target.value})}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base cursor-pointer"
              suppressHydrationWarning
            >
              <option value="tous">Lieux</option>
              {lieux.map(lieu => (
                <option key={lieu} value={lieu}>{lieu}</option>
              ))}
            </select>

            <select
              value={filters.typeContrat}
              onChange={(e) => setFilters({...filters, typeContrat: e.target.value})}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base cursor-pointer"
              suppressHydrationWarning
            >
              <option value="tous">Contrats</option>
              {typesContrat.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button
              onClick={() => setFilters({categorie: 'toutes', lieu: 'tous', typeContrat: 'tous'})}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-lg sm:rounded-xl shadow-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors font-semibold text-sm sm:text-base cursor-pointer"
              suppressHydrationWarning
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Liste des offres */}
      <section className="section-padding-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* États de chargement avec skeleton loaders */}
          {loading && (
            <div className="grid gap-8" role="status" aria-label="Chargement des offres">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex gap-3 mb-4">
                          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                        <div className="flex gap-4 mb-4">
                          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="lg:w-48">
                        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
              <span className="sr-only">Chargement des offres en cours...</span>
            </div>
          )}

          {error && (
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden p-6 mb-8">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-semibold">Erreur lors du chargement</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-red-500 to-red-600 transform origin-left scale-x-100 transition-transform duration-500"></div>
            </div>
          )}

          {/* Résultats */}
          {!loading && offres.length === 0 ? (
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover-lift-md border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                  Aucune offre ne correspond à vos critères
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Essayez d'élargir vos critères de recherche ou consultez toutes nos opportunités disponibles
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setFilters({categorie: 'toutes', lieu: 'tous', typeContrat: 'tous'})
                      setSearchTerm('')
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                    suppressHydrationWarning
                  >
                    Voir toutes les offres
                  </button>
                  <a
                    href="/contact"
                    className="px-6 py-3 border-2 border-[#3b5335ff] dark:border-[#ffaf50ff] text-[#3b5335ff] dark:text-[#ffaf50ff] rounded-lg font-bold hover:bg-[#3b5335ff] hover:text-white dark:hover:bg-[#ffaf50ff] dark:hover:text-[#3b5335ff] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                  >
                    Candidature spontanée
                  </a>
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ) : (
            <div className="grid gap-8">
              {offres.map((offre) => (
                <article
                  key={offre.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover-lift-md border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-4 py-2 rounded-full text-sm font-bold">
                            NOUVEAU
                          </span>
                          <span className="bg-[#3b5335ff] text-white px-4 py-2 rounded-full text-sm font-bold">
                            {offre.categorie}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
                          {offre.titre}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            {offre.entreprise}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            {offre.lieu}
                          </span>
                          {isMounted && (
                            <span className="flex items-center gap-2" suppressHydrationWarning>
                              <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                              Publiée le {formatDate(offre.datePublication)}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed line-clamp-2">
                          {offre.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold">
                            {offre.typeContrat}
                          </span>
                          <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-semibold">
                            {offre.salaire}
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold">
                            Temps plein
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 lg:items-end">
                        <Link
                          href={`/offres-emploi/${offre.id}`}
                          className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl hover-lift-sm font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer min-w-[140px]"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Voir l&#39;offre
                            <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-lg bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous pour être alerté des nouvelles offres correspondant à votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                S&#39;inscrire aux alertes
                <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            <Link
              href="/contact"
              className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                Déposer une candidature spontanée
                <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* Spacer between last section and footer */}
      <div className="h-4 bg-cream-100 dark:bg-gray-800"></div>

      <Footer />
    </div>
  )
}