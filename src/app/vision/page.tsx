// app/vision/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const recruteurs = [
  {
    nom: 'Izia Grazilly',
    poste: 'Senior Recruiter & Tech Specialist',
    experience: '5 ans d\'expérience',
    description: 'Spécialiste en recrutement tech, Izia excelle dans la détection des talents rares et leur accompagnement personnalisé. Son approche humaine et sa connaissance approfondie des métiers techniques en font une partenaire de choix pour les startups et scale-ups.',
    competences: ['Recrutement Tech', 'Chasse de Têtes', 'Gestion de Carrière', 'Startup Ecosystem'],
    photo: '/api/placeholder/400/400',
    stats: { placements: 80, satisfaction: 98, specialite: 'Tech' },
    citation: "Chaque recrutement réussi est une nouvelle success story qui commence."
  },
  {
    nom: 'Hugo Mathieu',
    poste: 'Talent Acquisition Manager',
    experience: '4 ans d\'expérience',
    description: 'Passionné par l\'innovation, Hugo accompagne les startups dans leur croissance et les aide à bâtir des équipes performantes. Son expertise en employer branding et sa vision stratégique du recrutement font de lui un acteur clé du paysage entrepreneurial français.',
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
      
      {/* Hero Section */}
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
              { id: 'equipe', label: 'Notre Équipe' },
              { id: 'valeurs', label: 'Nos Valeurs' },
              { id: 'mission', label: 'Notre Mission' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] shadow-lg'
                    : 'bg-white text-[#3b5335ff] hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu des onglets */}
      <div className="py-20 bg-white/80 backdrop-blur-sm">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recruteurs.map((recruteur, index) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
                  >
                    <div className="p-8">
                      {/* En-tête avec photo et stats */}
                      <div className="flex items-start space-x-6 mb-6">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#f8f7f3ff] to-gray-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-200">
                            <Image
                              src={recruteur.photo}
                              alt={recruteur.nom}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                            {recruteur.nom}
                          </h3>
                          <p className="text-[#ffaf50ff] font-semibold mb-1">
                            {recruteur.poste}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {recruteur.experience}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-6">
                        {recruteur.description}
                      </p>

                      {/* Citation */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-[#f8f7f3ff] to-[#f0eee4ff] rounded-xl border border-gray-200">
                        <p className="text-gray-700 italic text-center">
                          "{recruteur.citation}"
                        </p>
                      </div>

                      {/* Compétences */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {recruteur.competences.map((competence, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {competence}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-white transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.placements}+
                          </div>
                          <div className="text-xs text-gray-500">Placements</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-white transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-500">Satisfaction</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-white transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff]">
                            {recruteur.stats.specialite}
                          </div>
                          <div className="text-xs text-gray-500">Spécialité</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barre colorée en bas avec effet hover */}
                    <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Confiance',
                    description: 'Nous bâtissons des relations durables basées sur la transparence et la confiance mutuelle.',
                    features: ['Transparence totale', 'Engagement mutuel', 'Respect des engagements'],
                    color: 'from-[#3b5335ff] to-[#2a3d26ff]'
                  },
                  {
                    title: 'Innovation',
                    description: 'Nous repoussons les limites du recrutement traditionnel avec des approches créatives.',
                    features: ['Solutions innovantes', 'Adaptabilité', 'Veille technologique'],
                    color: 'from-[#ffaf50ff] to-[#ff9500ff]'
                  },
                  {
                    title: 'Excellence',
                    description: 'Chaque recrutement est minutieusement préparé pour garantir la parfaite adéquation.',
                    features: ['Rigueur méthodologique', 'Attention aux détails', 'Qualité constante'],
                    color: 'from-[#3b5335ff] to-[#ffaf50ff]'
                  }
                ].map((valeur, index) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
                  >
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-[#3b5335ff] mb-4 text-center group-hover:text-[#2a3d26ff] transition-colors">
                        {valeur.title}
                      </h3>
                      <p className="text-gray-600 text-center mb-6 leading-relaxed">
                        {valeur.description}
                      </p>
                      <ul className="space-y-3">
                        {valeur.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Barre colorée en bas avec effet hover */}
                    <div className={`h-2 bg-gradient-to-r ${valeur.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    
                    {/* Overlay coloré au hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${valeur.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
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
                  Transformer l&#39;expérience du recrutement pour tous les acteurs
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pour les Candidats */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#3b5335ff] mb-6 text-center group-hover:text-[#2a3d26ff] transition-colors">
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
                          <span className="w-6 h-6 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-sm">✓</span>
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                {/* Pour les Entreprises */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#3b5335ff] mb-6 text-center group-hover:text-[#2a3d26ff] transition-colors">
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
                          <span className="w-6 h-6 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-sm">✓</span>
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 group bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="p-8 text-white text-center">
                  <h4 className="text-2xl font-bold mb-4">
                    Rejoignez la Révolution Hiring
                  </h4>
                  <p className="text-lg opacity-90 mb-6">
                    Découvrez comment nous pouvons transformer votre approche du recrutement
                  </p>
                  <button className="bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    Prendre rendez-vous
                  </button>
                </div>
                
                {/* Barre colorée en bas avec effet hover */}
                <div className="h-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}