// app/page.tsx
'use client'

import Header from './components/Header'
import Footer from './components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Hero Section avec Image de fond */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="inline-block bg-[#ffaf50ff]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-[#ffaf50ff] font-semibold">🚀 Votre succès commence ici</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Connectons les
                <span className="block mt-2 bg-gradient-to-r from-[#ffaf50ff] via-[#ff9500ff] to-[#ffaf50ff] bg-clip-text text-transparent animate-pulse">
                  Talents & Entreprises
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-200">
                Expertise en recrutement depuis plus de 10 ans. Nous transformons vos ambitions professionnelles en réalité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/offres-emploi"
                  className="group bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Découvrir nos offres
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>

                <Link
                  href="/contact"
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    Nous contacter
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                  alt="Équipe professionnelle en réunion"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/80 to-transparent"></div>

                {/* Floating Stats Cards */}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff]">500+</div>
                    <div className="text-xs text-gray-600">Placements</div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#ffaf50ff]">98%</div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff]">15j</div>
                    <div className="text-xs text-gray-600">Avg. Time</div>
                  </div>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -top-4 -right-4 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-full shadow-lg font-bold transform rotate-12 animate-bounce">
                ⭐ #1 en France
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Partners Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 font-semibold mb-8">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {['🏢 Microsoft', '🏭 Amazon', '🏛 Google', '🏦 Meta', '🏪 Apple'].map((company, idx) => (
              <div key={idx} className="text-2xl font-bold text-gray-700 hover:text-[#3b5335ff] transition-colors cursor-pointer">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section avec Images */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f8f7f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#3b5335ff]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#3b5335ff] font-semibold">💼 Nos Services</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#3b5335ff] mb-4">
              Des Solutions Sur Mesure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Que vous soyez une entreprise en quête de talents ou un candidat à la recherche d'opportunités, nous avons la solution adaptée à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Recrutement Permanent',
                description: 'Trouvez le talent parfait pour vos équipes en CDI avec notre processus de sélection rigoureux et notre accompagnement personnalisé',
                features: ['Profils qualifiés', 'Process rapide', 'Garantie 3 mois', 'Suivi post-placement'],
                image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
                icon: '👔',
                color: 'from-[#3b5335ff] to-[#2a3d26ff]'
              },
              {
                title: 'Intérim & CDD',
                description: 'Solutions flexibles et réactives pour répondre à vos besoins de renforcement temporaire avec des profils disponibles immédiatement',
                features: ['Disponibilité immédiate', 'Profils adaptés', 'Gestion administrative', 'Flexibilité totale'],
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop',
                icon: '⚡',
                color: 'from-[#ffaf50ff] to-[#ff9500ff]'
              },
              {
                title: 'Chasse de Têtes Executive',
                description: 'Accédez aux profils de direction et experts les plus recherchés grâce à notre approche discrète et notre réseau exclusif',
                features: ['Approche confidentielle', 'Talents rares', 'Expertise sectorielle', 'Network premium'],
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
                icon: '🎯',
                color: 'from-[#3b5335ff] to-[#ffaf50ff]'
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-60`}></div>
                  <div className="absolute top-4 right-4 text-4xl">{service.icon}</div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#3b5335ff] mb-3 group-hover:text-[#2a3d26ff] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-[#ffaf50ff] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                    En savoir plus →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works avec Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ffaf50ff]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#3b5335ff] font-semibold">🔄 Notre Méthode</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#3b5335ff] mb-4">
              Un Processus Éprouvé
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              De l'analyse de vos besoins jusqu'à l'intégration réussie, nous vous accompagnons à chaque étape
            </p>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#3b5335ff] to-[#ffaf50ff]"></div>

            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Analyse Approfondie',
                  description: 'Nous prenons le temps de comprendre votre culture d\'entreprise, vos enjeux et vos objectifs pour cibler les profils parfaitement alignés',
                  image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
                  icon: '🔍',
                  side: 'left'
                },
                {
                  step: '02',
                  title: 'Sourcing Actif',
                  description: 'Notre équipe utilise des techniques avancées de chasse et notre réseau étendu pour identifier les meilleurs talents du marché',
                  image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&h=400&fit=crop',
                  icon: '🎯',
                  side: 'right'
                },
                {
                  step: '03',
                  title: 'Évaluation Rigoureuse',
                  description: 'Tests techniques, entretiens comportementaux et vérification des références pour garantir le match parfait',
                  image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
                  icon: '✅',
                  side: 'left'
                },
                {
                  step: '04',
                  title: 'Intégration & Suivi',
                  description: 'Un accompagnement continu pour assurer une prise de poste réussie et une satisfaction durable des deux parties',
                  image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop',
                  icon: '🚀',
                  side: 'right'
                }
              ].map((process, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    process.side === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{process.icon}</div>
                      <div>
                        <div className="text-sm font-bold text-[#ffaf50ff] mb-1">ÉTAPE {process.step}</div>
                        <h3 className="text-2xl font-bold text-[#3b5335ff]">{process.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{process.description}</p>
                  </div>

                  {/* Center Badge */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#3b5335ff] to-[#ffaf50ff] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10 border-4 border-white">
                    {process.step}
                  </div>

                  {/* Image */}
                  <div className="flex-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <Image
                        src={process.image}
                        alt={process.title}
                        width={600}
                        height={400}
                        className="w-full h-64 object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/60 to-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-[#f8f7f3ff] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#3b5335ff]/10 px-4 py-2 rounded-full mb-4">
              <span className="text-[#3b5335ff] font-semibold">⭐ Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#3b5335ff] mb-4">
              Ce Qu'ils Disent de Nous
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La satisfaction de nos clients et candidats est notre meilleure récompense
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Martin',
                role: 'DRH - Tech Corp',
                content: 'Hi-Ring a transformé notre processus de recrutement. Professionnalisme, réactivité et résultats au rendez-vous. Une vraie valeur ajoutée !',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
              },
              {
                name: 'Thomas Dubois',
                role: 'Développeur Full Stack',
                content: 'Grâce à Hi-Ring, j\'ai trouvé le poste idéal en moins de 2 semaines. Un accompagnement personnalisé et une écoute remarquable.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
              },
              {
                name: 'Marie Leroy',
                role: 'CEO - Startup Innovation',
                content: 'Des profils de qualité, un suivi rigoureux et une compréhension parfaite de nos besoins. Je recommande vivement !',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-[#ffaf50ff]/20"
                    unoptimized
                  />
                  <div>
                    <h4 className="font-bold text-[#3b5335ff]">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#ffaf50ff]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section avec Images */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=600&fit=crop"
            alt="Office background"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3b5335ff]/95 to-[#2a3d26ff]/95"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Des Chiffres Qui Parlent
            </h2>
            <p className="text-xl text-gray-200">
              Plus d'une décennie d'excellence dans le recrutement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '🎯', number: '500+', label: 'Placements Réussis', suffix: '' },
              { icon: '🏢', number: '150+', label: 'Entreprises Partenaires', suffix: '' },
              { icon: '😊', number: '98', label: 'Taux de Satisfaction', suffix: '%' },
              { icon: '⚡', number: '15', label: 'Jours en Moyenne', suffix: 'j' }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 transform group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-gray-200 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#3b5335ff] via-[#2a3d26ff] to-[#3b5335ff] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-[#ffaf50ff]/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
            <span className="text-[#ffaf50ff] font-bold text-lg">🚀 Prêt à Démarrer ?</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transformons Ensemble Votre
            <span className="block mt-2 text-[#ffaf50ff]">Avenir Professionnel</span>
          </h2>

          <p className="text-xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Que vous cherchiez le talent idéal ou l'opportunité de vos rêves, notre équipe d'experts est là pour vous accompagner vers le succès.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/contact"
              className="group bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-5 rounded-xl text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-3"
            >
              Commencer Maintenant
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/offres-emploi"
              className="group border-2 border-white text-white px-12 py-5 rounded-xl text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              Explorer les Offres
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffaf50ff]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sans engagement
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffaf50ff]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Réponse sous 24h
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffaf50ff]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% gratuit
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
