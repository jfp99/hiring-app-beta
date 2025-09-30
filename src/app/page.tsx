// app/page.tsx
'use client'

import Header from './components/Header'
import Footer from './components/Footer'
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
      
      {/* Hero Section */}
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
                className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold min-w-[200px] text-center"
              >
                Voir nos offres
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl min-w-[200px] text-center"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '50+', label: 'Candidats placés', color: 'from-[#3b5335ff] to-[#2a3d26ff]' },
              { number: '50+', label: 'Entreprises partenaires', color: 'from-[#ffaf50ff] to-[#ff9500ff]' },
              { number: '98%', label: 'Taux de satisfaction', color: 'from-[#3b5335ff] to-[#ffaf50ff]' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
              >
                <div className="p-8">
                  <div className="text-4xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
                </div>
                
                {/* Barre colorée en bas avec effet hover */}
                <div className={`h-2 bg-gradient-to-r ${stat.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                {/* Overlay coloré au hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
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
                title: 'Recrutement Permanent',
                description: 'Trouvez le talent parfait pour vos équipes en CDI',
                features: ['Profils qualifiés', 'Process rapide', 'Garantie de succès'],
                color: 'from-[#3b5335ff] to-[#2a3d26ff]'
              },
              {
                title: 'Intérim & CDD',
                description: 'Solutions flexibles pour vos besoins temporaires',
                features: ['Réactivité immédiate', 'Profils adaptés', 'Gestion simplifiée'],
                color: 'from-[#ffaf50ff] to-[#ff9500ff]'
              },
              {
                title: 'Chasse de Têtes',
                description: 'Accédez aux profils les plus recherchés du marché',
                features: ['Approche discrète', 'Talents rares', 'Expertise sectorielle'],
                color: 'from-[#3b5335ff] to-[#ffaf50ff]'
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#3b5335ff] mb-4 text-center group-hover:text-[#2a3d26ff] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-[#ffaf50ff] rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Barre colorée en bas avec effet hover */}
                <div className={`h-2 bg-gradient-to-r ${service.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                {/* Overlay coloré au hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
              Notre Processus
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une méthode éprouvée pour des recrutements réussis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Analyse des besoins',
                description: 'Compréhension approfondie de vos exigences',
                color: 'from-[#3b5335ff] to-[#2a3d26ff]'
              },
              {
                step: '02',
                title: 'Recherche de talents',
                description: 'Sourcing actif des meilleurs profils',
                color: 'from-[#ffaf50ff] to-[#ff9500ff]'
              },
              {
                step: '03',
                title: 'Sélection rigoureuse',
                description: 'Évaluation technique et comportementale',
                color: 'from-[#3b5335ff] to-[#ffaf50ff]'
              },
              {
                step: '04',
                title: 'Intégration réussie',
                description: 'Accompagnement jusqu\'à la prise de poste',
                color: 'from-[#2a3d26ff] to-[#ff9500ff]'
              }
            ].map((process, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden text-center"
              >
                <div className="p-8">
                  <div className="text-3xl font-bold text-[#3b5335ff] mb-4 group-hover:text-[#2a3d26ff] transition-colors">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-3 group-hover:text-[#2a3d26ff] transition-colors">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {process.description}
                  </p>
                </div>
                
                {/* Barre colorée en bas avec effet hover */}
                <div className={`h-2 bg-gradient-to-r ${process.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                {/* Overlay coloré au hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${process.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Excellence',
                description: 'Nous visons la perfection dans chaque recrutement',
                features: ['Qualité', 'Précision', 'Rigueur'],
                color: 'from-[#3b5335ff] to-[#2a3d26ff]'
              },
              {
                title: 'Innovation',
                description: 'Nous repoussons les limites du recrutement traditionnel',
                features: ['Créativité', 'Adaptabilité', 'Proactivité'],
                color: 'from-[#ffaf50ff] to-[#ff9500ff]'
              },
              {
                title: 'Confiance',
                description: 'Nous bâtissons des relations durables et transparentes',
                features: ['Transparence', 'Fiabilité', 'Loyauté'],
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à transformer votre carrière ?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Rejoignez les talents qui ont trouvé leur voie grâce à notre accompagnement personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Commencer maintenant
            </Link>
            <Link 
              href="/offres-emploi" 
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}