// app/vision/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const recruteurs = [
  {
    nom: 'Marie Laurent',
    poste: 'Senior Recruiter & Tech Specialist',
    experience: '5 ans d\'expérience',
    description: 'Spécialiste en recrutement tech, Marie excelle dans la détection des talents rares et leur accompagnement personnalisé. Son approche humaine et sa connaissance approfondie des métiers techniques en font une partenaire de choix pour les startups et scale-ups.',
    competences: ['Recrutement Tech', 'Chasse de Têtes', 'Gestion de Carrière', 'Startup Ecosystem'],
    photo: '/api/placeholder/400/400',
    stats: { placements: 150, satisfaction: 98, specialite: 'Tech' },
    citation: "Chaque recrutement réussi est une nouvelle success story qui commence."
  },
  {
    nom: 'Thomas Dubois',
    poste: 'Talent Acquisition Manager',
    experience: '4 ans d\'expérience',
    description: 'Passionné par l\'innovation, Thomas accompagne les startups dans leur croissance et les aide à bâtir des équipes performantes. Son expertise en employer branding et sa vision stratégique du recrutement font de lui un acteur clé du paysage entrepreneurial français.',
    competences: ['Startups', 'Growth Hiring', 'Employer Branding', 'Stratégie RH'],
    photo: '/api/placeholder/400/400',
    stats: { placements: 120, satisfaction: 96, specialite: 'Growth' },
    citation: "Le bon talent au bon moment peut transformer une entreprise."
  }
]

export default function Vision() {
  const [activeTab, setActiveTab] = useState('equipe')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section améliorée */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-5 animate-bounce"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Notre 
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                Vision
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Révolutionner le recrutement grâce à une approche <span className="font-semibold text-[#ffaf50ff]">humaine</span> et <span className="font-semibold text-[#ffaf50ff]">innovante</span>
            </p>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'equipe', label: 'Notre Équipe', icon: '👥' },
              { id: 'valeurs', label: 'Nos Valeurs', icon: '💎' },
              { id: 'mission', label: 'Notre Mission', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu des onglets */}
      <div className="py-16">
        {activeTab === 'equipe' && (
          <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
                  Notre Équipe de Choc
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Des experts passionnés qui mettent leur énergie au service de votre succès
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {recruteurs.map((recruteur, index) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 overflow-hidden border border-gray-100"
                  >
                    <div className="relative">
                      <div className="h-64 bg-gradient-to-br from-[#3b5335ff] to-[#2a3d26ff] relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-6 left-6">
                          <div className="bg-[#ffaf50ff] text-[#3b5335ff] px-4 py-2 rounded-full font-bold text-sm">
                            {recruteur.stats.placements}+ placements
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
                          <Image
                            src={recruteur.photo}
                            alt={recruteur.nom}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                          {recruteur.nom}
                        </h3>
                        <p className="text-[#ffaf50ff] font-semibold mb-1">
                          {recruteur.poste}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          {recruteur.experience}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {recruteur.description}
                        </p>
                      </div>

                      <div className="mb-6 p-4 bg-gradient-to-r from-[#f8f7f3ff] to-[#f0eee4ff] rounded-xl border border-gray-200">
                        <p className="text-gray-700 italic text-center">
                          "{recruteur.citation}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {recruteur.competences.map((competence, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                          >
                            {competence}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.placements}+
                          </div>
                          <div className="text-xs text-gray-500">Placements</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-500">Satisfaction</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.specialite}
                          </div>
                          <div className="text-xs text-gray-500">Spécialité</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'valeurs' && (
          <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
                  Nos Valeurs
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Les principes qui guident chacune de nos actions et décisions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: '🤝',
                    title: 'Confiance',
                    description: 'Nous bâtissons des relations durables basées sur la transparence et la confiance mutuelle.',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '💡',
                    title: 'Innovation',
                    description: 'Nous repoussons les limites du recrutement traditionnel avec des approches créatives.',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '🎯',
                    title: 'Précision',
                    description: 'Chaque recrutement est minutieusement préparé pour garantir la parfaite adéquation.',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '🚀',
                    title: 'Ambition',
                    description: 'Nous visons l\'excellence dans tout ce que nous entreprenons pour nos clients.',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((valeur, index) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 p-8 text-center border border-gray-100"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-r ${valeur.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <span className="text-3xl">{valeur.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#3b5335ff] mb-4 group-hover:text-[#2a3d26ff] transition-colors">
                      {valeur.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {valeur.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'mission' && (
          <section>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
                  Notre Mission
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Transformer l'expérience du recrutement pour tous les acteurs
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-[#3b5335ff]">
                      Pour les Candidats
                    </h3>
                    <ul className="space-y-4">
                      {[
                        'Accompagnement personnalisé tout au long du processus',
                        'Accès à des opportunités exclusives',
                        'Conseils de carrière sur mesure',
                        'Transparence totale sur les postes et les entreprises'
                      ].map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-6 h-6 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm">✓</span>
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-[#3b5335ff]">
                      Pour les Entreprises
                    </h3>
                    <ul className="space-y-4">
                      {[
                        'Accès à des talents présélectionnés et qualifiés',
                        'Processus de recrutement accéléré et optimisé',
                        'Expertise sectorielle pointue',
                        'Garantie de satisfaction et de pérennité'
                      ].map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-6 h-6 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm">✓</span>
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-2xl text-white text-center">
                  <h4 className="text-2xl font-bold mb-4">
                    Rejoignez la Révolution HiringSimple
                  </h4>
                  <p className="text-lg opacity-90 mb-6">
                    Découvrez comment nous pouvons transformer votre approche du recrutement
                  </p>
                  <button className="bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    📞 Prendre rendez-vous
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}