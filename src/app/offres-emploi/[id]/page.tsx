// app/offres-emploi/[id]/page.tsx
'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { notFound } from 'next/navigation'
import { offresEmploi } from '../../lib/data'
import { useState } from 'react'
import Link from 'next/link'

interface Props {
  params: {
    id: string
  }
}

export default function OffreDetail({ params }: Props) {
  const offre = offresEmploi.find(o => o.id === params.id)
  const [activeSection, setActiveSection] = useState('description')

  if (!offre) {
    notFound()
  }

  const sections = [
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'responsabilites', label: 'Responsabilités', icon: '🎯' },
    { id: 'qualifications', label: 'Qualifications', icon: '🎓' },
    { id: 'avantages', label: 'Avantages', icon: '⭐' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section améliorée */}
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
            <div className="flex flex-wrap justify-center gap-6 text-lg mb-8">
              <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                🏢 {offre.entreprise}
              </span>
              <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                📍 {offre.lieu}
              </span>
              <span className="flex items-center gap-2 bg-[#ffaf50ff] text-[#3b5335ff] px-4 py-2 rounded-full font-bold">
                💰 {offre.salaire}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-[#ffaf50ff] text-[#3b5335ff] px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                🚀 Postuler maintenant
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300">
                ❤️ Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <section className="py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu détaillé */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {activeSection === 'description' && (
                  <div>
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Description du poste</h2>
                    <p className="text-gray-700 leading-relaxed text-lg mb-8">
                      {offre.description}
                    </p>
                    <div className="bg-gradient-to-r from-[#f8f7f3ff] to-[#f0eee4ff] p-6 rounded-2xl border border-gray-200">
                      <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">💡 Ce qui rend ce poste unique</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                          Opportunité de travailler sur des projets innovants
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                          Environnement dynamique et collaboratif
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full"></span>
                          Possibilités d'évolution rapide
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'responsabilites' && (
                  <div>
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Responsabilités principales</h2>
                    <ul className="space-y-4">
                      {offre.responsabilites.map((responsabilite, index) => (
                        <li key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <span className="w-8 h-8 bg-[#ffaf50ff] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 text-lg">{responsabilite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeSection === 'qualifications' && (
                  <div>
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Qualifications requises</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {offre.qualifications.map((qualification, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="font-semibold text-gray-700">Compétence {index + 1}</span>
                          </div>
                          <p className="text-gray-600">{qualification}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'avantages' && (
                  <div>
                    <h2 className="text-3xl font-bold text-[#3b5335ff] mb-6">Avantages & bénéfices</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {offre.avantages.map((avantage, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border-2 border-[#ffaf50ff] hover:shadow-xl transition-all transform hover:-translate-y-1">
                          <div className="text-3xl mb-3">
                            {['🏠', '💻', '🍽️', '🏥', '🎯', '📈'][index]}
                          </div>
                          <p className="text-gray-700 font-semibold">{avantage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Carte entreprise */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">À propos de l'entreprise</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-xl flex items-center justify-center text-white font-bold">
                      {offre.entreprise.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{offre.entreprise}</p>
                      <p className="text-gray-600 text-sm">Entreprise innovante</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-lg font-bold text-[#3b5335ff]">50-100</div>
                      <div className="text-xs text-gray-500">Employés</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-lg font-bold text-[#3b5335ff]">⭐ 4.8</div>
                      <div className="text-xs text-gray-500">Note</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte poste */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
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
                      {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Sidebar */}
              <div className="bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] rounded-3xl p-6 text-white text-center">
                <h4 className="text-lg font-bold mb-3">Intéressé(e) par cette offre ?</h4>
                <p className="text-sm opacity-90 mb-4">
                  Postulez maintenant et rejoignez une entreprise innovante
                </p>
                <Link 
                  href="/contact" 
                  className="block w-full bg-[#ffaf50ff] text-[#3b5335ff] py-3 rounded-xl font-bold hover:bg-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 mb-3"
                >
                  🚀 Postuler
                </Link>
                <button className="text-sm text-white/80 hover:text-white transition-colors">
                  ⭐ Ajouter aux favoris
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}