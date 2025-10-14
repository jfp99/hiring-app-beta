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
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    stats: { placements: 80, satisfaction: 98, specialite: 'Tech' },
    citation: "Chaque recrutement réussi est une nouvelle success story qui commence."
  },
  {
    nom: 'Hugo Mathieu',
    poste: 'Talent Acquisition Manager',
    experience: '4 ans d\'expérience',
    description: 'Passionné par l\'innovation, Hugo accompagne les startups dans leur croissance et les aide à bâtir des équipes performantes. Son expertise en employer branding et sa vision stratégique du recrutement font de lui un acteur clé du paysage entrepreneurial français.',
    competences: ['Startups', 'Growth Hiring', 'Employer Branding', 'Stratégie RH'],
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
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
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="inline-block bg-[#ffaf50ff]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-[#ffaf50ff] font-semibold">🎯 Notre Vision</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Révolutionner le
                <span className="block mt-2 bg-gradient-to-r from-[#ffaf50ff] via-[#ff9500ff] to-[#ffaf50ff] bg-clip-text text-transparent animate-pulse">
                  Recrutement
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-200">
                Une approche <span className="font-semibold text-[#ffaf50ff]">humaine</span> et <span className="font-semibold text-[#ffaf50ff]">innovante</span> qui place les talents et les entreprises au cœur de notre mission.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#equipe"
                  onClick={() => setActiveTab('equipe')}
                  className="group bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Découvrir l'équipe
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </a>

                <a
                  href="#valeurs"
                  onClick={() => setActiveTab('valeurs')}
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    Nos Valeurs
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Hero Image - Right Side */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Équipe Hi-Ring Vision"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/80 to-transparent"></div>

                {/* Floating Stats Cards */}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff]">10+</div>
                    <div className="text-xs text-gray-600">Années</div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#ffaf50ff]">200+</div>
                    <div className="text-xs text-gray-600">Placements</div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff]">97%</div>
                    <div className="text-xs text-gray-600">Succès</div>
                  </div>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -top-4 -right-4 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-full shadow-lg font-bold transform rotate-12 animate-bounce">
                🌟 Excellence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
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
                    : 'bg-white dark:bg-gray-800 text-[#3b5335ff] dark:text-[#ffaf50ff] hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu des onglets */}
      <div className="py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {activeTab === 'equipe' && (
          <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
                  <span className="text-[#ffaf50ff] font-semibold text-sm">👥 Équipe Experte</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                  Notre Équipe de Choc
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Des experts passionnés qui mettent leur énergie au service de votre succès
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {recruteurs.map((recruteur, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                  >
                    {/* Large Profile Image Header */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={recruteur.photo}
                        alt={recruteur.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/90 via-[#3b5335ff]/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-3xl font-bold mb-1">
                          {recruteur.nom}
                        </h3>
                        <p className="text-[#ffaf50ff] font-semibold text-lg">
                          {recruteur.poste}
                        </p>
                        <p className="text-white/80 text-sm">
                          {recruteur.experience}
                        </p>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                        {recruteur.description}
                      </p>

                      {/* Citation */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-[#f8f7f3ff] dark:from-gray-700 to-[#f0eee4ff] dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 relative">
                        <div className="absolute -top-3 left-4 text-4xl text-[#ffaf50ff]">&ldquo;</div>
                        <p className="text-gray-700 dark:text-gray-200 italic text-center pt-2">
                          {recruteur.citation}
                        </p>
                      </div>

                      {/* Compétences */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {recruteur.competences.map((competence, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
                          >
                            {competence}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">
                            {recruteur.stats.placements}+
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Placements</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">
                            {recruteur.stats.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                          <div className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">
                            {recruteur.stats.specialite}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Spécialité</div>
                        </div>
                      </div>
                    </div>

                    {/* Barre colorée en bas avec effet hover */}
                    <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                ))}
              </div>

              {/* Office/Team Culture Images Section - NEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                    alt="Équipe en réunion"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="font-bold text-lg mb-1">Collaboration</h4>
                      <p className="text-sm text-white/90">Travail d'équipe quotidien</p>
                    </div>
                  </div>
                </div>
                <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&h=400&fit=crop"
                    alt="Espace de travail"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="font-bold text-lg mb-1">Innovation</h4>
                      <p className="text-sm text-white/90">Environnement créatif</p>
                    </div>
                  </div>
                </div>
                <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop"
                    alt="Succès partagé"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="font-bold text-lg mb-1">Excellence</h4>
                      <p className="text-sm text-white/90">Résultats exceptionnels</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'valeurs' && (
          <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
                  <span className="text-[#ffaf50ff] font-semibold text-sm">⭐ Nos Principes</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                  Nos Valeurs
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Les principes qui guident chacune de nos actions et décisions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {[
                  {
                    title: 'Confiance',
                    icon: '🤝',
                    description: 'Nous bâtissons des relations durables basées sur la transparence et la confiance mutuelle.',
                    features: ['Transparence totale', 'Engagement mutuel', 'Respect des engagements'],
                    color: 'from-[#3b5335ff] to-[#2a3d26ff]',
                    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop'
                  },
                  {
                    title: 'Innovation',
                    icon: '💡',
                    description: 'Nous repoussons les limites du recrutement traditionnel avec des approches créatives.',
                    features: ['Solutions innovantes', 'Adaptabilité', 'Veille technologique'],
                    color: 'from-[#ffaf50ff] to-[#ff9500ff]',
                    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop'
                  },
                  {
                    title: 'Excellence',
                    icon: '🏆',
                    description: 'Chaque recrutement est minutieusement préparé pour garantir la parfaite adéquation.',
                    features: ['Rigueur méthodologique', 'Attention aux détails', 'Qualité constante'],
                    color: 'from-[#3b5335ff] to-[#ffaf50ff]',
                    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop'
                  }
                ].map((valeur, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={valeur.image}
                        alt={valeur.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white flex items-center gap-3">
                        <span className="text-4xl">{valeur.icon}</span>
                        <h3 className="text-2xl font-bold">{valeur.title}</h3>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                        {valeur.description}
                      </p>
                      <ul className="space-y-3">
                        {valeur.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
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

              {/* Values in Action - Image Showcase */}
              <div className="bg-gradient-to-br from-[#f8f7f3ff] dark:from-gray-700 to-white dark:to-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                    Nos Valeurs en Action
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Au quotidien, dans chaque interaction
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { img: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=300&h=300&fit=crop', label: 'Transparence' },
                    { img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=300&h=300&fit=crop', label: 'Collaboration' },
                    { img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=300&h=300&fit=crop', label: 'Créativité' },
                    { img: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=300&fit=crop', label: 'Performance' }
                  ].map((item, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <span className="text-white font-semibold">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'mission' && (
          <section>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
                  <span className="text-[#ffaf50ff] font-semibold text-sm">🎯 Notre Mission</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
                  Notre Mission
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Transformer l&#39;expérience du recrutement pour tous les acteurs
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pour les Candidats */}
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#ffaf50ff] to-[#ff9500ff] rounded-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6 text-center group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
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
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                {/* Pour les Entreprises */}
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#3b5335ff] to-[#2a3d26ff] rounded-full flex items-center justify-center text-3xl">
                        🏢
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6 text-center group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
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
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
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
                  <a href="/contact" className="inline-block bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    Prendre rendez-vous
                  </a>
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