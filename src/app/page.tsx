// app/page.tsx
'use client'

import Header from '../app/components/Header'
import Footer from '../app/components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
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
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#ffaf50ff] rounded-full filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-xl opacity-10 animate-bounce"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Votre Partenaire en 
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                Recrutement
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Nous connectons les <span className="font-semibold text-[#ffaf50ff]">talents exceptionnels</span> aux <span className="font-semibold text-[#ffaf50ff]">entreprises innovantes</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/offres-emploi" 
                className="btn-primary text-lg px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold min-w-[200px] text-center"
              >
                🔍 Voir nos offres
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl min-w-[200px] text-center"
              >
                💬 Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section améliorée */}
      <section className="py-20 bg-white/80 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '500+', label: 'Candidats placés', icon: '👥' },
              { number: '150+', label: 'Entreprises partenaires', icon: '🏢' },
              { number: '98%', label: 'Taux de satisfaction', icon: '⭐' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section améliorée */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des solutions sur mesure pour répondre à tous vos besoins en recrutement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '👥',
                title: 'Recrutement Permanent',
                description: 'Trouvez le talent parfait pour vos équipes en CDI',
                features: ['Profils qualifiés', 'Process rapide', 'Garantie de succès'],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⏱️',
                title: 'Intérim & CDD',
                description: 'Solutions flexibles pour vos besoins temporaires',
                features: ['Réactivité immédiate', 'Profils adaptés', 'Gestion simplifiée'],
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🎯',
                title: 'Chasse de Têtes',
                description: 'Accédez aux profils les plus recherchés du marché',
                features: ['Approche discrète', 'Talents rares', 'Expertise sectorielle'],
                color: 'from-purple-500 to-pink-500'
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 overflow-hidden border border-gray-100"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#ffaf50ff] to-[#ff9500ff] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-3xl">{service.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#3b5335ff] mb-4 text-center group-hover:text-[#2a3d26ff] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-8 pb-8">
                  <button className="w-full bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                    En savoir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à transformer votre carrière ?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Rejoignez les centaines de talents qui ont trouvé leur voie grâce à notre accompagnement personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              🚀 Commencer maintenant
            </Link>
            <Link 
              href="/offres-emploi" 
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300"
            >
              📋 Voir les offres
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}