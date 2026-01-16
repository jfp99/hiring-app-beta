// app/offres-emploi/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { useFavorites } from '../hooks/useFavorites'
import {
  AdvancedFilters,
  DEFAULT_FILTERS,
  JobMap,
  AlertsModal,
  FavoritesPanel
} from '../components/offres-public'
import type { FilterState } from '../components/offres-public'
import { Bell, Heart, Map, List, Grid, Building2, MapPin, Calendar, Briefcase } from 'lucide-react'

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
  tags?: string[]
}

type ViewMode = 'list' | 'grid' | 'map'

export default function OffresEmploi() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [offres, setOffres] = useState<Offre[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false)
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false)

  const { favorites } = useFavorites()

  // Debounce search term by 300ms to reduce API calls
  const debouncedFilters = useDebounce(filters, 300)

  const { loading, error, callApi } = useApi()

  // Format date consistently between server and client
  const formatDate = (dateString: string) => {
    if (!isMounted) return ''
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

  // Load offers with filters
  useEffect(() => {
    const loadOffres = async () => {
      try {
        const params = new URLSearchParams()
        if (debouncedFilters.search) params.append('search', debouncedFilters.search)
        if (debouncedFilters.categories.length > 0) {
          debouncedFilters.categories.forEach(cat => params.append('categorie', cat))
        }
        if (debouncedFilters.locations.length > 0) {
          debouncedFilters.locations.forEach(loc => params.append('lieu', loc))
        }
        if (debouncedFilters.contractTypes.length > 0) {
          debouncedFilters.contractTypes.forEach(type => params.append('typeContrat', type))
        }
        if (debouncedFilters.remoteOnly) {
          params.append('lieu', 'Remote')
        }

        const result = await callApi(`/jobs?${params.toString()}`)
        setOffres(result.offres || [])
      } catch {
        setOffres([])
      }
    }

    loadOffres()
  }, [debouncedFilters, callApi])

  // Filter offers by salary range (client-side for now)
  const filteredOffres = useMemo(() => {
    return offres.filter(offre => {
      // Extract numeric salary if possible
      const salaryMatch = offre.salaire?.match(/(\d+)/g)
      if (salaryMatch && salaryMatch.length > 0) {
        const salary = parseInt(salaryMatch[0]) * (offre.salaire.includes('k') || offre.salaire.includes('K') ? 1000 : 1)
        if (salary < debouncedFilters.salaryRange[0] || salary > debouncedFilters.salaryRange[1]) {
          return false
        }
      }
      return true
    })
  }, [offres, debouncedFilters.salaryRange])

  const handleOfferClick = useCallback((offerId: string) => {
    window.location.href = `/offres-emploi/${offerId}`
  }, [])

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
                    <Briefcase className="w-5 h-5" />
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
                    className="group min-h-[48px] bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Voir les offres
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </a>

                  <button
                    onClick={() => setIsAlertsModalOpen(true)}
                    className="group min-h-[48px] border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
                      Créer une alerte
                    </span>
                  </button>
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

        {/* Filters and View Controls */}
        <section id="offres" className="py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredOffres.length}
              isLoading={loading}
            />

            {/* View mode and favorites toggle */}
            <div className="flex items-center justify-between mt-4">
              {/* View mode buttons */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">Liste</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span className="hidden sm:inline">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    viewMode === 'map'
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span className="hidden sm:inline">Carte</span>
                </button>
              </div>

              {/* Favorites button */}
              <button
                onClick={() => setIsFavoritesPanelOpen(true)}
                className="flex items-center gap-2 min-h-[44px] px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'text-red-500 fill-current' : ''}`} />
                <span>Favoris</span>
                {favorites.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Map View */}
        {viewMode === 'map' && (
          <section className="py-8 bg-white/80 dark:bg-gray-900/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 overflow-hidden">
                <JobMap
                  offers={filteredOffres}
                  onOfferClick={(offer) => handleOfferClick(offer.id)}
                  className="h-[500px] rounded-xl"
                />
              </div>
            </div>
          </section>
        )}

        {/* List/Grid View */}
        {viewMode !== 'map' && (
          <section className="section-padding-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Loading state */}
              {loading && (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid gap-8'}`} role="status" aria-label="Chargement des offres">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                      <div className="p-8">
                        <div className="flex gap-3 mb-4">
                          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
                  <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-semibold">Erreur lors du chargement</p>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && filteredOffres.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
                  <div className="p-12 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      {/* Animated ring */}
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <div className="w-full h-full border-4 border-accent-500 rounded-full"></div>
                      </div>
                      {/* Floating icon */}
                      <div className="relative flex items-center justify-center h-full">
                        <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                          <Briefcase className="w-12 h-12 text-accent-600 dark:text-accent-400" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Aucune offre ne correspond à vos critères
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Essayez d&apos;élargir vos critères de recherche ou créez une alerte pour être notifié des nouvelles offres.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                      >
                        Réinitialiser les filtres
                      </button>
                      <button
                        onClick={() => setIsAlertsModalOpen(true)}
                        className="min-h-[44px] px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all active:scale-95"
                      >
                        Créer une alerte
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {!loading && filteredOffres.length > 0 && (
                <div className={`animate-stagger ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid gap-6'}`}>
                  {filteredOffres.map((offre, index) => (
                    <div key={offre.id} style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}>
                      {viewMode === 'grid' ? (
                        <GridCard offre={offre} isMounted={isMounted} formatDate={formatDate} />
                      ) : (
                        <ListCard offre={offre} isMounted={isMounted} formatDate={formatDate} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section-padding-lg bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-800 dark:to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Vous ne trouvez pas votre bonheur ?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Inscrivez-vous pour être alerté des nouvelles offres correspondant à votre profil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsAlertsModalOpen(true)}
                className="group min-h-[48px] bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 font-bold text-center relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Bell className="w-5 h-5" />
                  S&apos;inscrire aux alertes
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
              <Link
                href="/contact"
                className="group min-h-[48px] border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-lg hover:shadow-xl text-center flex items-center justify-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Candidature spontanée
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Modals */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        defaultFilters={{
          categories: filters.categories,
          locations: filters.locations,
          contractTypes: filters.contractTypes
        }}
      />

      <FavoritesPanel
        isOpen={isFavoritesPanelOpen}
        onClose={() => setIsFavoritesPanelOpen(false)}
        offers={offres}
        onOfferClick={handleOfferClick}
      />
    </div>
  )
}

// List view card component
function ListCard({ offre, isMounted, formatDate }: { offre: Offre; isMounted: boolean; formatDate: (date: string) => string }) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <span className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                NOUVEAU
              </span>
              <span className="bg-[#3b5335ff] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                {offre.categorie}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors line-clamp-2">
              {offre.titre}
            </h3>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-[#ffaf50ff] flex-shrink-0" />
                <span className="truncate">{offre.entreprise}</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ffaf50ff] flex-shrink-0" />
                {offre.lieu}
              </span>
              {isMounted && (
                <span className="flex items-center gap-2 hidden sm:flex">
                  <Calendar className="w-4 h-4 text-[#ffaf50ff] flex-shrink-0" />
                  Publiée le {formatDate(offre.datePublication)}
                </span>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed line-clamp-2 text-sm sm:text-base">
              {offre.description}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold">
                {offre.typeContrat}
              </span>
              {offre.tags && offre.tags.length > 0 && offre.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-3 lg:items-end">
            <Link
              href={`/offres-emploi/${offre.id}`}
              className="group/btn flex-1 lg:flex-none min-h-[44px] bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl active:scale-95 font-bold text-center relative overflow-hidden min-w-[120px] sm:min-w-[140px] transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                Voir l&apos;offre
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hover effect bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </article>
  )
}

// Grid view card component
function GridCard({ offre, isMounted, formatDate }: { offre: Offre; isMounted: boolean; formatDate: (date: string) => string }) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Header with category */}
        <div className="mb-3 sm:mb-4">
          <span className="bg-[#3b5335ff] text-white px-2.5 py-1 rounded-full text-xs font-bold">
            {offre.categorie}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
          {offre.titre}
        </h3>

        {/* Company and location */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-sm text-gray-600 dark:text-gray-400 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-[#ffaf50ff] flex-shrink-0" />
            <span className="truncate">{offre.entreprise}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ffaf50ff] flex-shrink-0" />
            <span className="truncate">{offre.lieu}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
          {offre.description}
        </p>

        {/* Contract and tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
            {offre.typeContrat}
          </span>
          {offre.tags && offre.tags.length > 0 && offre.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-lg text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Date */}
        {isMounted && (
          <div className="text-xs text-gray-400 mb-3 sm:mb-4">
            {formatDate(offre.datePublication)}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/offres-emploi/${offre.id}`}
          className="w-full min-h-[44px] py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:text-white rounded-xl font-bold text-center text-sm hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
        >
          Voir l&apos;offre
        </Link>
      </div>

      {/* Hover effect bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </article>
  )
}
