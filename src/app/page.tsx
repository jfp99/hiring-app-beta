// app/page.tsx
'use client'

import Header from './components/Header'
import Footer from './components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { SectionHeaderBadge, SparklesIcon, BriefcaseIcon, RefreshIcon, TargetIcon, UsersIcon, ChatIcon, RocketIcon, StarIcon } from './components/ui/SectionHeaderBadge'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Keyboard navigation handler for cards
  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, slug: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/services/${slug}`)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Spacer between header and hero */}
      <div className="h-4 bg-cream-100 dark:bg-gray-800"></div>

      <main id="main-content">
      {/* Hero Section avec Image de fond */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-16 sm:py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative Elements - Optimized Animations with CSS containment */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 animate-morph-bg will-change-transform" style={{contain: 'layout style paint'}}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl opacity-15 animate-parallax-float will-change-transform" style={{contain: 'layout style paint'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Text Content */}
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <SectionHeaderBadge variant="hero" icon={<SparklesIcon />}>
                Specialiste conseil en recrutement
              </SectionHeaderBadge>

              <h1 className="text-fluid-5xl font-bold mb-4 sm:mb-6 leading-tight animate-text-blur-in">
                Connectons les
                <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
                  Talents & Entreprises
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 leading-relaxed text-white/90">
                Cabinet de conseil en recrutement fondé par Hugo et Izia. Spécialistes du recrutement IT, Digital, Finance, et Conseil avec une approche personnalisée et exigeante.
              </p>

              <div className="flex flex-col sm:flex-row gap-responsive-sm justify-center">
                <Link
                  href="/offres-emploi"
                  className="group btn-magnetic bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:!text-white px-8 py-4 min-h-[44px] rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 font-bold text-center relative overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-300 focus-visible:ring-offset-2 text-sm sm:text-base cursor-pointer animate-premium-glow"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Découvrir nos offres
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Link>

                <Link
                  href="/contact"
                  className="group border-2 border-white text-white px-8 py-4 min-h-[44px] rounded-xl font-bold hover:bg-white hover:text-primary-700 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 shadow-lg hover:shadow-xl text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 text-sm sm:text-base cursor-pointer backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    Nous contacter
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section avec Images */}
      <section className="section-padding-lg bg-gradient-to-b from-white dark:from-gray-900 to-cream-100 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionHeaderBadge variant="accent" icon={<BriefcaseIcon />}>
              Nos Services
            </SectionHeaderBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-700 dark:text-accent-500 mb-4">
              Notre Accompagnement
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Une collaboration flexible et sur mesure, conçue pour s'adapter à vos objectifs et à vos priorités
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-responsive-md animate-stagger">
            {[
              {
                title: 'Recrutements en CDI',
                description: 'Pour renforcer durablement vos équipes avec des talents qualifiés et alignés sur vos valeurs',
                features: ['Profils qualifiés', 'Approche personnalisée', 'Suivi post-placement', 'Garantie période d\'essai'],
                image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
                color: 'from-primary-500 to-primary-600',
                slug: 'cdi'
              },
              {
                title: 'Missions Freelance',
                description: 'Pour répondre à vos besoins ponctuels avec des profils spécialistes disponibles rapidement',
                features: ['Disponibilité rapide', 'Spécialistes qualifiés', 'Flexibilité', 'Gestion administrative'],
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop',
                color: 'from-accent-500 to-accent-600',
                slug: 'freelance'
              },
              {
                title: 'Portage Salarial',
                description: 'Solutions flexibles grâce à notre partenariat avec une société de portage salarial',
                features: ['Partenariat exclusif', 'Solution souple', 'Sécurité juridique', 'Simplicité administrative'],
                image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop',
                color: 'from-primary-600 to-accent-500',
                slug: 'portage'
              },
              {
                title: 'Recrutement RPO',
                description: 'Bénéficiez d\'une expertise dédiée, d\'une agilité renforcée et d\'une optimisation des coûts pour atteindre vos objectifs plus efficacement',
                features: ['Expertise dédiée', 'Agilité renforcée', 'Optimisation coûts', 'Objectifs atteints'],
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
                color: 'from-primary-500 to-accent-600',
                slug: 'rpo'
              }
            ].map((service, index) => (
              <div
                key={index}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => handleCardKeyDown(e, service.slug)}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover-lift-premium flex flex-col h-full card-border-glow card-hover-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                {/* Image */}
                <div className="relative z-10 h-48 overflow-hidden flex-shrink-0">
                  <Image
                    src={service.image}
                    alt={`Illustration du service ${service.title} - Cabinet de recrutement Hi-Ring`}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                    quality={80}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-60 group-hover:opacity-70 transition-opacity duration-500`}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary-700 dark:text-accent-500 mb-2 sm:mb-3 group-hover:text-primary-600 dark:group-hover:text-accent-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${service.slug}`}
                    className="w-full block text-center bg-gradient-to-r from-primary-500 to-primary-600 dark:from-accent-500 dark:to-accent-600 dark:!text-white text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 mt-auto cursor-pointer relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">En savoir plus →</span>
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talent Pool Section - Notre vivier de talents */}
      <section className="section-padding-lg bg-gradient-to-b from-white dark:from-gray-900 to-cream-100 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-responsive-lg items-center">
            {/* Image */}
            <div className="relative">
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&auto=format&q=80"
                  alt="Équipe de professionnels collaborant - Vivier de talents qualifiés Hi-Ring"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/80 to-transparent group-hover:from-primary-500/90 transition-all duration-500"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            </div>

            {/* Content */}
            <div>
              <SectionHeaderBadge variant="accent" icon={<UsersIcon />}>
                Notre Réseau
              </SectionHeaderBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                Notre Vivier de Talents
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-prose">
                <p>
                  Nous échangeons chaque jour avec un <strong className="text-primary-700 dark:text-accent-500">réseau exclusif de professionnels qualifiés</strong>, certains en recherche active, d'autres à l'écoute d'opportunités ciblées.
                </p>
                <p>
                  Nous connaissons leurs motivations et leurs expertises, afin de proposer des <strong className="text-primary-700 dark:text-accent-500">profils "off-market"</strong> en quête de confidentialité et d'un accompagnement sur mesure.
                </p>
                <p>
                  Notre vivier, <strong className="text-primary-700 dark:text-accent-500">sélectif et dynamique</strong>, nous permet d'identifier rapidement les talents les plus alignés avec vos besoins stratégiques.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button className="group relative w-full text-left bg-primary-500/10 dark:bg-primary-500/20 rounded-xl p-3 sm:p-4 transform hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 card-hover-shadow">
                  <div className="relative z-10 mb-2">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="relative z-10 font-semibold text-sm sm:text-base text-primary-700 dark:text-accent-500">Sourcing Ciblé</div>
                  <div className="relative z-10 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Profils qualifiés et motivés</div>
                </button>
                <button className="group relative w-full text-left bg-accent-500/10 dark:bg-accent-500/20 rounded-xl p-3 sm:p-4 transform hover:scale-105 hover:shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 card-hover-shadow">
                  <div className="relative z-10 mb-2">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="relative z-10 font-semibold text-sm sm:text-base text-primary-700 dark:text-accent-500">Accompagnement</div>
                  <div className="relative z-10 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Suivi personnalisé</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section hidden className="section-padding-lg bg-gradient-to-b from-white dark:from-gray-900 to-cream-100 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionHeaderBadge variant="accent" icon={<StarIcon />}>
              Témoignages
            </SectionHeaderBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-700 dark:text-accent-500 mb-4">
              Ce Qu'ils Disent de Nous
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              La satisfaction de nos clients et candidats est notre meilleure récompense
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-responsive-md">
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
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover shadow effect from top */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent-500/25 via-accent-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0_0_0_0)] transition-[clip-path] !duration-500" />
                <div className="relative flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Image
                    src={testimonial.avatar}
                    alt={`Photo de ${testimonial.name}, ${testimonial.role}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-accent-500/20"
                    sizes="64px"
                    loading="lazy"
                    quality={85}
                  />
                  <div>
                    <h4 className="font-bold text-primary-700 dark:text-accent-500">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="relative flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="relative text-sm sm:text-base text-gray-600 dark:text-gray-300 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding-lg bg-gradient-to-br from-primary-500 via-primary-600 to-primary-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Premium floating decorations - Optimized */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent-500 rounded-full filter blur-2xl opacity-20 animate-soft-bounce" style={{contain: 'layout style paint'}}></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full filter blur-3xl opacity-10 animate-parallax-float" style={{contain: 'layout style paint'}}></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <SectionHeaderBadge variant="hero" icon={<RocketIcon />} className="mb-8">
            Prêt à Démarrer ?
          </SectionHeaderBadge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-text-blur-in">
            Transformons ensemble votre
            <span className="block mt-2 text-accent-500 animate-gradient-flow bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 bg-clip-text text-transparent bg-[length:200%_100%]">avenir professionnel</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed scroll-reveal-delayed">
            Que vous cherchiez le talent idéal ou l'opportunité de vos rêves, notre équipe de spécialistes est là pour vous accompagner vers le succès.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/contact"
              className="group btn-magnetic bg-accent-500 text-primary-700 px-12 py-5 rounded-xl text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-3 cursor-pointer animate-premium-glow relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Commencer Maintenant
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>

            <Link
              href="/offres-emploi"
              className="group border-2 border-white text-white px-12 py-5 rounded-xl text-lg font-bold hover:bg-white hover:text-primary-700 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-3 cursor-pointer backdrop-blur-sm"
            >
              Explorer les Offres
              <svg className="w-6 h-6 group-hover:translate-x-2 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

        </div>
      </section>
      </main>

      {/* Spacer between last section and footer */}
      <div className="h-4 bg-cream-100 dark:bg-gray-800"></div>

      <Footer />
    </div>
  )
}
