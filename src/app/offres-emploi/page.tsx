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
  
  const { loading, error, callApi } = useApi()

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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Offres 
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                d&#39;Emploi
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Découvrez nos opportunités de carrière et rejoignez des entreprises <span className="font-semibold text-[#ffaf50ff]">innovantes</span>
            </p>
          </div>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Barre de recherche */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un poste, une entreprise, une compétence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent placeholder-gray-400 text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-6 py-3 rounded-2xl font-bold shadow-lg">
              {offres.length} offre{offres.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <select
              value={filters.categorie}
              onChange={(e) => setFilters({...filters, categorie: e.target.value})}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
            >
              <option value="toutes">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.lieu}
              onChange={(e) => setFilters({...filters, lieu: e.target.value})}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
            >
              <option value="tous">Tous les lieux</option>
              {lieux.map(lieu => (
                <option key={lieu} value={lieu}>{lieu}</option>
              ))}
            </select>

            <select
              value={filters.typeContrat}
              onChange={(e) => setFilters({...filters, typeContrat: e.target.value})}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent"
            >
              <option value="tous">Tous les types de contrat</option>
              {typesContrat.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button
              onClick={() => setFilters({categorie: 'toutes', lieu: 'tous', typeContrat: 'tous'})}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl shadow-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Liste des offres */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* États de chargement et d'erreur */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffaf50ff] mb-4"></div>
                <p className="text-[#3b5335ff] font-semibold">Chargement des offres...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden p-6 mb-8">
              <div className="flex items-center gap-3 text-red-700">
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
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-[#3b5335ff] mb-4">
                  Aucune offre ne correspond à vos critères
                </h3>
                <p className="text-gray-600 mb-8">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
                <button
                  onClick={() => {
                    setFilters({categorie: 'toutes', lieu: 'tous', typeContrat: 'tous'})
                    setSearchTerm('')
                  }}
                  className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
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
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
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
                        
                        <h3 className="text-2xl font-bold text-[#3b5335ff] mb-3 group-hover:text-[#2a3d26ff] transition-colors">
                          {offre.titre}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            {offre.entreprise}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            {offre.lieu}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            Publiée le {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed line-clamp-2">
                          {offre.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold">
                            {offre.typeContrat}
                          </span>
                          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
                            {offre.salaire}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                            Temps plein
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 lg:items-end">
                        <Link
                            href={`/offres-emploi/${offre.id}`}
                            className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-center min-w-[140px] shadow-lg"
                          >
                            Voir l&#39;offre
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
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous pour être alerté des nouvelles offres correspondant à votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              S&#39;inscrire aux alertes
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300"
            >
              Déposer une candidature spontanée
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}