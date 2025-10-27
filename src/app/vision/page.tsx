// app/vision/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { SectionHeaderBadge, CheckCircleIcon, UsersIcon, TargetIcon, StarIcon, ChatIcon, BuildingIcon } from '../components/ui/SectionHeaderBadge'

const recruteurs = [
  {
    nom: 'Hugo Mathieu',
    poste: 'Responsable Commerce',
    experience: 'Co-fondateur Hi-ring',
    description: 'Après avoir vécu au Mexique, Hugo maîtrise l\'espagnol et accompagne des clients sur des postes stratégiques en Espagne. Fort de son expérience dans la grande distribution, le retail et l\'IT (où il a encadré une équipe de recrutement IT dans une ESN), il développe une vision concrète du recrutement alliant compréhension des besoins opérationnels, management et approche humaine des relations professionnelles.',
    competences: ['Espagnol courant', 'Grande Distribution', 'Retail', 'IT Recruitment', 'Team Management', 'Développement Commercial'],
    photo: '/team/hugo-mathieu.jpg',
    stats: { experience: 'Multi-sectoriel', satisfaction: 98, specialite: 'IT & Digital', placements: 150 },
    citation: "Une approche personnalisée et exigeante pour connecter les bons talents aux bons projets.",
    contact: { email: 'hugo@hi-ring.fr', phone: '06 66 74 76 18' }
  },
  {
    nom: 'Izia Grazilly',
    poste: 'Responsable Recrutement',
    experience: 'Co-fondatrice Hi-ring',
    description: 'Izia a débuté sa carrière dans un cabinet de recrutement IT, spécialisée sur les métiers de la Data, de l\'Infrastructure et de la Cybersécurité à l\'échelle nationale. Première salariée d\'une ESN aixoise, elle a contribué activement à la croissance des agences d\'Aix, Toulouse et Paris, ainsi qu\'à la structuration de la stratégie de recrutement. Ses principaux enjeux : attirer, engager et fidéliser les talents. Cette expérience lui a permis de développer des compétences clés : adaptabilité, écoute, résilience et créativité.',
    competences: ['Data', 'Infrastructure', 'Cybersécurité', 'IT Recruitment', 'Stratégie de Recrutement', 'Talent Acquisition'],
    photo: '/team/izia-grazilly.jpg',
    stats: { experience: 'IT & Tech', satisfaction: 98, specialite: 'Data & Cybersécurité', placements: 200 },
    citation: "Attirer, engager et fidéliser les talents avec adaptabilité et créativité.",
    contact: { email: 'izia@hi-ring.fr', phone: '06 09 11 15 98' }
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
              <SectionHeaderBadge variant="hero" icon={<CheckCircleIcon />}>
                Notre Vision
              </SectionHeaderBadge>

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
                  className="group bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Découvrir l'équipe
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </a>

                <a
                  href="#valeurs"
                  onClick={() => setActiveTab('valeurs')}
                  className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white hover:text-primary-700 dark:hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    Nos Valeurs
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">5+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Années</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#ffaf50ff]">50+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Placements</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">95%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Succès</div>
                  </div>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -top-4 -right-4 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-full shadow-lg font-bold transform rotate-12 animate-bounce">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Excellence
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="py-3 sm:py-6 md:py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-4">
            {[
              { id: 'equipe', label: 'Notre Équipe' },
              { id: 'valeurs', label: 'Nos Valeurs' },
              { id: 'mission', label: 'Notre Mission' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
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
                <SectionHeaderBadge variant="accent" icon={<UsersIcon />}>
                  Équipe Experte
                </SectionHeaderBadge>
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
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col"
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

                    <div className="p-8 flex flex-col flex-grow">
                      {/* Description - Variable height */}
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                        {recruteur.description}
                      </p>

                      {/* Spacer to push content below */}
                      <div className="flex-grow"></div>

                      {/* Citation - Aligned */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-[#f8f7f3ff] dark:from-gray-700 to-[#f0eee4ff] dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 relative">
                        <div className="absolute -top-3 left-4 text-4xl text-[#ffaf50ff]">&ldquo;</div>
                        <p className="text-gray-700 dark:text-gray-200 italic text-center pt-2">
                          {recruteur.citation}
                        </p>
                      </div>

                      {/* Compétences - Aligned */}
                      <div className="flex flex-wrap gap-1.5 mb-6 min-h-[48px]">
                        {recruteur.competences.map((competence, idx) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm h-fit"
                          >
                            {competence}
                          </span>
                        ))}
                      </div>

                      {/* Stats - Aligned at bottom */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors flex flex-col items-center justify-center min-h-[50px] sm:min-h-[60px]">
                          <div className="text-sm sm:text-base md:text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] break-words">
                            {recruteur.stats.placements}+
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Placements</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors flex flex-col items-center justify-center min-h-[50px] sm:min-h-[60px]">
                          <div className="text-sm sm:text-base md:text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] break-words">
                            {recruteur.stats.satisfaction}%
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Satisfaction</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors flex flex-col items-center justify-center min-h-[50px] sm:min-h-[60px]">
                          <div className="text-xs sm:text-sm md:text-base lg:text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] break-words leading-tight">
                            {recruteur.stats.specialite}
                          </div>
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
                <SectionHeaderBadge variant="accent" icon={<StarIcon />}>
                  Nos Principes
                </SectionHeaderBadge>
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
                    icon: (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                    ),
                    description: 'Nous bâtissons des relations durables basées sur la transparence et la confiance mutuelle.',
                    features: ['Transparence totale', 'Engagement mutuel', 'Respect des engagements'],
                    color: 'from-[#3b5335ff] to-[#2a3d26ff]',
                    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop'
                  },
                  {
                    title: 'Innovation',
                    icon: (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    ),
                    description: 'Nous repoussons les limites du recrutement traditionnel avec des approches créatives.',
                    features: ['Solutions innovantes', 'Adaptabilité', 'Veille technologique'],
                    color: 'from-[#ffaf50ff] to-[#ff9500ff]',
                    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop'
                  },
                  {
                    title: 'Excellence',
                    icon: (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ),
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
                        <div className="text-white">{valeur.icon}</div>
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
                <SectionHeaderBadge variant="accent" icon={<CheckCircleIcon />}>
                  Notre Mission
                </SectionHeaderBadge>
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
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6 text-center group-hover:text-primary-600 dark:group-hover:text-accent-600 transition-colors">
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
                          <span className="w-6 h-6 bg-accent-500 dark:bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <span className="text-white text-sm font-bold">✓</span>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                {/* Pour les Entreprises */}
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6 text-center group-hover:text-primary-600 dark:group-hover:text-accent-600 transition-colors">
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
                          <span className="w-6 h-6 bg-accent-500 dark:bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <span className="text-white text-sm font-bold">✓</span>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Barre colorée en bas avec effet hover */}
                  <div className="h-2 bg-gradient-to-r from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 group bg-gradient-to-br from-primary-500 via-primary-600 to-primary-500 dark:from-primary-600 dark:via-primary-700 dark:to-primary-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="p-8 text-white text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    Rejoignez la Révolution Hiring
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl opacity-90 dark:opacity-95 mb-6">
                    Découvrez comment nous pouvons transformer votre approche du recrutement
                  </p>
                  <a href="/contact" className="inline-block bg-accent-500 dark:bg-accent-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary-700 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    Prendre rendez-vous
                  </a>
                </div>

                {/* Barre colorée en bas avec effet hover */}
                <div className="h-2 bg-gradient-to-r from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* Nos Clients Section */}
              <div className="mt-24">
                <div className="text-center mb-16">
                  <SectionHeaderBadge variant="accent" icon={<BuildingIcon />}>
                    Nos Clients
                  </SectionHeaderBadge>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-6">
                    Une Diversité de Clients
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Qu'il s'agisse de <strong className="text-[#3b5335ff] dark:text-[#ffaf50ff]">petites structures ou de grands groupes</strong>, nous accompagnons une grande diversité de clients dans des <strong className="text-[#3b5335ff] dark:text-[#ffaf50ff]">environnements multiples et exigeants</strong> sur la France entière mais également à l'étranger.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: (
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                        </svg>
                      ),
                      title: 'Start-ups',
                      description: 'Entreprises innovantes en croissance',
                      color: 'from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700'
                    },
                    {
                      icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      ),
                      title: 'PME/ETI',
                      description: 'Structures en développement',
                      color: 'from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700'
                    },
                    {
                      icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      ),
                      title: 'Grands Groupes',
                      description: 'Organisations internationales',
                      color: 'from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700'
                    },
                    {
                      icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      title: 'International',
                      description: 'France et étranger',
                      color: 'from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700'
                    }
                  ].map((client, index) => (
                    <div
                      key={index}
                      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${client.color}`}></div>
                      <div className="p-6 text-center">
                        <div className="text-gray-600 dark:text-gray-400 mb-4 flex justify-center group-hover:text-primary-600 dark:group-hover:text-accent-500 transition-colors duration-300">{client.icon}</div>
                        <h3 className="text-xl font-bold text-primary-700 dark:text-accent-500 mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-600 transition-colors duration-300">
                          {client.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {client.description}
                        </p>
                      </div>
                    </div>
                  ))}
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