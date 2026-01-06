// app/offres-emploi/[id]/page.tsx
'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { useApi } from '../../hooks/useApi'

interface Offre {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  competences: string
  emailContact: string
  datePublication: string
  categorie: string
  statut: string
}

export default function OffreDetail({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise
  const unwrappedParams = use(params)
  const [offre, setOffre] = useState<Offre | null>(null)
  const [activeSection, setActiveSection] = useState('description')
  const { loading, error, callApi } = useApi()

  useEffect(() => {
    const loadOffre = async () => {
      try {
        console.log('🔍 [OFFRE-DETAIL] Loading offer with ID:', unwrappedParams.id)

        // Utiliser l'API offres existante pour récupérer toutes les offres
        const result = await callApi('/offres')

        if (result.success && result.offres) {
          // Trouver l'offre spécifique par ID
          const foundOffre = result.offres.find((o: Offre) => o.id === unwrappedParams.id)

          if (foundOffre) {
            console.log('✅ [OFFRE-DETAIL] Offer found:', foundOffre.titre)
            setOffre(foundOffre)
          } else {
            console.log('❌ [OFFRE-DETAIL] Offer not found with ID:', unwrappedParams.id)
            setOffre(null)
          }
        } else {
          console.log('❌ [OFFRE-DETAIL] No offers found in response')
          setOffre(null)
        }
      } catch (err) {
        console.error('❌ [OFFRE-DETAIL] Error loading offer:', err)
        setOffre(null)
      }
    }

    loadOffre()
  }, [unwrappedParams.id, callApi])

  // Générer des données dérivées pour l'affichage
  const responsabilites = offre?.description 
    ? offre.description.split('.').filter(item => item.trim().length > 0).slice(0, 5)
    : []

  const qualifications = offre?.competences 
    ? offre.competences.split(',').map(q => q.trim()).filter(q => q.length > 0)
    : []

  const avantages = [
    "Salaire compétitif",
    "Environnement de travail dynamique",
    "Opportunités d'évolution",
    "Formation continue",
    "Télétravail partiel possible",
    "Mutuelle entreprise"
  ]

  const sections = [
    { id: 'description', label: 'Description' },
    { id: 'responsabilites', label: 'Responsabilités' },
    { id: 'qualifications', label: 'Compétences' },
    { id: 'avantages', label: 'Avantages' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffaf50ff] mb-4"></div>
          <p className="text-[#3b5335ff] dark:text-[#ffaf50ff] font-semibold">Chargement de l&#39;offre...</p>
        </div>
      </div>
    )
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">😵</div>
              <h2 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                Offre non trouvée
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {error || "L'offre que vous recherchez n'existe pas ou a été supprimée."}
              </p>
              <Link 
                href="/offres-emploi"
                className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-block"
              >
                Retour aux offres
              </Link>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <span className="bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                {offre.categorie}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {offre.titre}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                {offre.entreprise}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                {offre.lieu}
              </span>
              <span className="bg-[#ffaf50ff] text-[#3b5335ff] px-4 py-2 rounded-full font-bold">
                {offre.typeContrat}
              </span>
              {offre.salaire && offre.salaire !== 'À négocier' && (
                <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                  {offre.salaire}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis intéressé(e) par le poste de ${offre.titre} et je vous adresse ma candidature.%0D%0A%0D%0ACordialement`}
                className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Postuler maintenant
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </a>
              <Link
                href="/offres-emploi"
                className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  Voir toutes les offres
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <section className="py-3 sm:py-6 md:py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop view - 4 buttons in a row */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 md:gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] dark:text-gray-900 shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-[#3b5335ff] dark:text-[#ffaf50ff] hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Mobile view - 2x2 grid for better space usage */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] dark:text-gray-900 shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-[#3b5335ff] dark:text-[#ffaf50ff] shadow-md active:shadow-lg'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section Description */}
              {activeSection === 'description' && (
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">Description du poste</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                      <p className="text-lg mb-6">{offre.description}</p>

                      <div className="bg-gradient-to-r from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl border border-gray-200 dark:border-gray-600 mt-6">
                        <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">Ce qui rend ce poste unique</h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                          <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            Opportunité de travailler sur des projets innovants chez {offre.entreprise}
                          </li>
                          <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            Environnement dynamique et collaboratif à {offre.lieu}
                          </li>
                          <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                            Contrat {offre.typeContrat} avec des perspectives d'évolution
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}

              {/* Section Responsabilités */}
              {activeSection === 'responsabilites' && (
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">Responsabilités principales</h2>
                    <div className="space-y-4">
                      {responsabilites.map((responsabilite, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group/item">
                          <span className="w-8 h-8 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold group-hover/item:scale-110 transition-transform duration-300">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 text-lg">{responsabilite.trim()}.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}

              {/* Section Compétences */}
              {activeSection === 'qualifications' && (
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">Compétences recherchées</h2>
                    
                    {qualifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {qualifications.map((qualification, index) => (
                          <div key={index} className="group/item bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-6">
                            <div className="flex items-start gap-3">
                              <span className="w-3 h-3 bg-green-500 rounded-full group-hover/item:scale-125 transition-transform duration-300 flex-shrink-0 mt-1.5"></span>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">{qualification}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          Aucune compétence spécifique requise.
                          <br />
                          L'entreprise recherche avant tout de la motivation et de la capacité d'apprentissage.
                        </p>
                      </div>
                    )}

                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-3">Soft Skills appréciées</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Autonomie', 'Esprit d\'équipe', 'Curiosité', 'Adaptabilité', 'Communication'].map((skill, index) => (
                          <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}

              {/* Section Avantages */}
              {activeSection === 'avantages' && (
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">Avantages & bénéfices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {avantages.map((avantage, index) => (
                        <div key={index} className="group/item bg-white dark:bg-gray-700 rounded-xl border-2 border-[#ffaf50ff] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                          <div className="flex items-center gap-3">
                            <span className="text-[#ffaf50ff] text-xl">✓</span>
                            <p className="text-gray-700 dark:text-gray-200 font-semibold group-hover/item:text-[#3b5335ff] dark:group-hover/item:text-[#ffaf50ff] transition-colors duration-300">
                              {avantage}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {offre.salaire && offre.salaire !== 'À négocier' && (
                      <div className="mt-6 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border border-accent-200 dark:border-accent-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-accent-700 dark:text-accent-300 mb-2">Rémunération attractive</h3>
                        <p className="text-accent-600 dark:text-accent-400 font-semibold text-lg">{offre.salaire}</p>
                      </div>
                    )}
                  </div>
                  <div className="h-2 bg-gradient-to-r from-[#2a3d26ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Carte entreprise */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">À propos de l&#39;entreprise</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-[#ffaf50ff] dark:to-[#ff9500ff] rounded-xl flex items-center justify-center text-white dark:text-[#3b5335ff] font-bold text-lg">
                        {offre.entreprise.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{offre.entreprise}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Recrute activement</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                        <div className="text-lg font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">⭐</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Entreprise notée 4.8/5</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                        <div className="text-lg font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">🚀</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Croissance rapide</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* Carte poste */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">Détails du poste</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Type de contrat</span>
                      <span className="font-semibold text-[#3b5335ff] dark:text-[#ffaf50ff]">{offre.typeContrat}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Salaire</span>
                      <span className="font-semibold text-accent-600 dark:text-accent-400">{offre.salaire}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Localisation</span>
                      <span className="font-semibold text-[#3b5335ff] dark:text-[#ffaf50ff]">{offre.lieu}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400">Publiée le</span>
                      <span className="font-semibold text-[#3b5335ff] dark:text-[#ffaf50ff]">
                        {new Date(offre.datePublication).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* CTA Sidebar */}
              <div className="group bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="p-6 text-white text-center">
                  <h4 className="text-lg font-bold mb-3">Intéressé(e) par cette offre ?</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Postulez maintenant et rejoignez {offre.entreprise}
                  </p>
                  <a
                    href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis intéressé(e) par le poste de ${offre.titre} chez ${offre.entreprise} et je vous adresse ma candidature.%0D%0A%0D%0ACordialement`}
                    className="group block w-full bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm mb-3 cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Postuler par email
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </a>
                  <Link
                    href="/contact"
                    className="group block w-full border-2 border-white text-white px-4 py-3 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transform hover:-translate-y-1 transition-all duration-300 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Nous contacter
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </span>
                  </Link>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}