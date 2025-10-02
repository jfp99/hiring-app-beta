// app/offres-emploi/[id]/page.tsx
'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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

export default function OffreDetail({ params }: { params: { id: string } }) {
  const [offre, setOffre] = useState<Offre | null>(null)
  const [activeSection, setActiveSection] = useState('description')
  const { loading, error, callApi } = useApi()

  useEffect(() => {
    const loadOffre = async () => {
      try {
        console.log('🔍 [OFFRE-DETAIL] Loading offer with ID:', params.id)
        
        // Utiliser l'API offres existante pour récupérer toutes les offres
        const result = await callApi('/offres')
        
        if (result.success && result.offres) {
          // Trouver l'offre spécifique par ID
          const foundOffre = result.offres.find((o: Offre) => o.id === params.id)
          
          if (foundOffre) {
            console.log('✅ [OFFRE-DETAIL] Offer found:', foundOffre.titre)
            setOffre(foundOffre)
          } else {
            console.log('❌ [OFFRE-DETAIL] Offer not found with ID:', params.id)
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
  }, [params.id, callApi])

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
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffaf50ff] mb-4"></div>
          <p className="text-[#3b5335ff] font-semibold">Chargement de l&#39;offre...</p>
        </div>
      </div>
    )
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">😵</div>
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">
                Offre non trouvée
              </h2>
              <p className="text-gray-600 mb-8">
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
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
                className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-4 rounded-lg text-lg font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg text-center"
              >
                Postuler maintenant
              </a>
              <Link 
                href="/offres-emploi"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Voir toutes les offres
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] shadow-lg'
                    : 'bg-white text-[#3b5335ff] hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section Description */}
              {activeSection === 'description' && (
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Description du poste</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      <p className="text-lg mb-6">{offre.description}</p>
                      
                      <div className="bg-gradient-to-r from-[#f8f7f3ff] to-[#f0eee4ff] p-6 rounded-xl border border-gray-200 mt-6">
                        <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Ce qui rend ce poste unique</h3>
                        <ul className="space-y-3 text-gray-700">
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
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Responsabilités principales</h2>
                    <div className="space-y-4">
                      {responsabilites.map((responsabilite, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group/item">
                          <span className="w-8 h-8 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold group-hover/item:scale-110 transition-transform duration-300">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 text-lg">{responsabilite.trim()}.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              )}

              {/* Section Compétences */}
              {activeSection === 'qualifications' && (
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Compétences recherchées</h2>
                    
                    {qualifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {qualifications.map((qualification, index) => (
                          <div key={index} className="group/item bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="w-3 h-3 bg-green-500 rounded-full group-hover/item:scale-125 transition-transform duration-300"></span>
                              <span className="font-semibold text-gray-700">Compétence {index + 1}</span>
                            </div>
                            <p className="text-gray-600">{qualification}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">
                          Aucune compétence spécifique requise. 
                          <br />
                          L'entreprise recherche avant tout de la motivation et de la capacité d'apprentissage.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-blue-800 mb-3">Soft Skills appréciées</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Autonomie', 'Esprit d\'équipe', 'Curiosité', 'Adaptabilité', 'Communication'].map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
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
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Avantages & bénéfices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {avantages.map((avantage, index) => (
                        <div key={index} className="group/item bg-white rounded-xl border-2 border-[#ffaf50ff] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                          <div className="flex items-center gap-3">
                            <span className="text-[#ffaf50ff] text-xl">✓</span>
                            <p className="text-gray-700 font-semibold group-hover/item:text-[#3b5335ff] transition-colors duration-300">
                              {avantage}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {offre.salaire && offre.salaire !== 'À négocier' && (
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-green-800 mb-2">Rémunération attractive</h3>
                        <p className="text-green-700 font-semibold text-lg">{offre.salaire}</p>
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
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">À propos de l&#39;entreprise</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {offre.entreprise.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{offre.entreprise}</p>
                        <p className="text-gray-600 text-sm">Recrute activement</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-white transition-colors">
                        <div className="text-lg font-bold text-[#3b5335ff]">⭐</div>
                        <div className="text-xs text-gray-500">Entreprise notée 4.8/5</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-white transition-colors">
                        <div className="text-lg font-bold text-[#3b5335ff]">🚀</div>
                        <div className="text-xs text-gray-500">Croissance rapide</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* Carte poste */}
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Détails du poste</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Type de contrat</span>
                      <span className="font-semibold text-[#3b5335ff]">{offre.typeContrat}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Salaire</span>
                      <span className="font-semibold text-green-600">{offre.salaire}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Localisation</span>
                      <span className="font-semibold text-[#3b5335ff]">{offre.lieu}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Publiée le</span>
                      <span className="font-semibold text-[#3b5335ff]">
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
              <div className="group bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="p-6 text-white text-center">
                  <h4 className="text-lg font-bold mb-3">Intéressé(e) par cette offre ?</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Postulez maintenant et rejoignez {offre.entreprise}
                  </p>
                  <a 
                    href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis intéressé(e) par le poste de ${offre.titre} chez ${offre.entreprise} et je vous adresse ma candidature.%0D%0A%0D%0ACordialement`}
                    className="block w-full bg-[#ffaf50ff] text-[#3b5335ff] py-3 rounded-xl font-bold hover:bg-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 mb-3 text-center"
                  >
                    Postuler par email
                  </a>
                  <Link 
                    href="/contact"
                    className="block w-full border-2 border-white text-white py-3 rounded-xl font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300 text-center"
                  >
                    Nous contacter
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