// app/offres-emploi/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

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

  // Charger les offres
  useEffect(() => {
    const loadOffres = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
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
  }, [filters, searchTerm, callApi])

  const categories = ['Technologie', 'Management', 'Data']
  const lieux = ['Paris', 'Lyon', 'Toulouse']
  const typesContrat = ['CDI', 'CDD', 'Freelance']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-32 overflow-hidden">
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

                {/* Floating Stats Cards */}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">{offres.length}+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Offres</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#ffaf50ff]">50+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Entreprises</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">95%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Match</div>
                  </div>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -top-4 -right-4 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-full shadow-lg font-bold transform rotate-12 animate-bounce">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Nouveautés
                </span>
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

            {/* Compteur de résultats */}
            <div className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-4 py-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold shadow-lg text-center sm:text-left whitespace-nowrap">
              {offres.length} offre{offres.length > 1 ? 's' : ''}
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
      <section className="py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* États de chargement et d'erreur */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffaf50ff] mb-4"></div>
                <p className="text-[#3b5335ff] dark:text-[#ffaf50ff] font-semibold">Chargement des offres...</p>
              </div>
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
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                  Aucune offre ne correspond à vos critères
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
                <button
                  onClick={() => {
                    setFilters({categorie: 'toutes', lieu: 'tous', typeContrat: 'tous'})
                    setSearchTerm('')
                  }}
                  className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  suppressHydrationWarning
                >
                  Voir toutes les offres
                </button>
              </div>
              <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ) : (
            <div className="grid gap-8">
              {offres.map((offre, index) => (
                <div
                  key={offre.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
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
                          className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer min-w-[140px]"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-800 dark:to-gray-900 text-white">
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

      <Footer />
    </div>
  )
}