// services/[slug]/page.tsx
'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SectionHeaderBadge, BriefcaseIcon, CheckCircleIcon, RocketIcon, StarIcon, UsersIcon } from '../../components/ui/SectionHeaderBadge'
import { servicesData } from '../servicesData'

// Helper function to convert emoji icons to SVG
const getIconSVG = (iconText: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    '✓': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    '🎯': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    '📊': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    '🛡️': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    '⚡': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    '🎓': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    '🔄': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    '📋': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    '🤝': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    '⚖️': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    '📝': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    '👥': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    '🚀': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    '💰': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    '📈': (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }

  return iconMap[iconText] || <span className="text-5xl">{iconText}</span>
}

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'benefits' | 'pricing'>('benefits')

  const resolvedParams = use(params)
  const service = servicesData[resolvedParams.slug as keyof typeof servicesData]

  if (!service) {
    router.push('/')
    return null
  }

  const scrollToDetails = () => {
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-cream-100 dark:bg-gray-900">
      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-700 dark:text-accent-500 hover:text-primary-600 dark:hover:text-accent-600 font-semibold transition-colors duration-300 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux services
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden py-6">
        <Image
          src={service.heroImage}
          alt={service.title}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-80`}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <SectionHeaderBadge variant="hero" className="mb-3">
            {service.title}
          </SectionHeaderBadge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            {service.subtitle}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed mb-4">
            {service.description}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-primary-700 rounded-xl font-bold text-base hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Demander un devis
            </Link>
            <button
              onClick={scrollToDetails}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-base hover:bg-white/30 transition-all duration-300"
            >
              En savoir plus ↓
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section id="details" className="sticky top-16 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'benefits', label: 'Avantages', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) },
              { id: 'pricing', label: 'Tarification', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 min-w-fit px-6 py-4 font-semibold text-center border-b-4 transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-500 dark:text-accent-400 bg-accent-500/5'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-accent-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Benefits */}
      {activeTab === 'benefits' && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <SectionHeaderBadge variant="accent" icon={<StarIcon />}>
                Les Avantages
              </SectionHeaderBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-700 dark:text-accent-500 mb-4">
                Pourquoi choisir ce service ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {service.mainBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="text-gray-700 dark:text-gray-300 mb-4">{getIconSVG(benefit.icon)}</div>
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional content based on service type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {'targetProfiles' in service && (
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Profils concernés
                  </h3>
                  <ul className="space-y-3">
                    {service.targetProfiles.map((profile: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {profile}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {'sectors' in service && (
                <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Secteurs d'activité
                  </h3>
                  <ul className="space-y-3">
                    {service.sectors.map((sector: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <BriefcaseIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {sector}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {'missionTypes' in service && (
                <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Types de missions
                  </h3>
                  <ul className="space-y-3">
                    {service.missionTypes.map((type: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <RocketIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {type}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {'forWho' in service && (
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Pour qui ?
                  </h3>
                  <ul className="space-y-3">
                    {service.forWho.map((item: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <UsersIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {'rpoModels' in service && (
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.rpoModels.map((model: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <h4 className="text-xl font-bold text-primary-700 dark:text-accent-500 mb-2">
                        {model.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{model.description}</p>
                      <p className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                        💡 {model.bestFor}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {'advantages' in service && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Pour l'entreprise
                  </h3>
                  <ul className="space-y-3">
                    {service.advantages.forCompany.map((advantage: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6">
                    Pour le consultant
                  </h3>
                  <ul className="space-y-3">
                    {service.advantages.forConsultant.map((advantage: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {'services' in service && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-primary-700 dark:text-accent-500 mb-6 text-center">
                  Services inclus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.services.map((serviceItem: string, index: number) => (
                    <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircleIcon className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0" />
                      {serviceItem}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pricing */}
      {activeTab === 'pricing' && (
        <section className="py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <SectionHeaderBadge variant="accent" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}>
                Tarification
              </SectionHeaderBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-700 dark:text-accent-500 mb-4">
                Une tarification transparente
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Adaptée à vos besoins et votre budget
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-primary-700 dark:text-accent-500 mb-2">
                  {service.pricing.model}
                </h3>
                <div className="text-6xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-4">
                  {service.pricing.percentage}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {service.pricing.details}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-gray-700 dark:text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary-700 dark:text-accent-500 mb-2">
                      Garantie
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {service.pricing.guarantee}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-gray-700 dark:text-gray-300 flex justify-center mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-primary-700 dark:text-accent-500 mb-2">
                    Transparent
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Pas de frais cachés
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-gray-700 dark:text-gray-300 flex justify-center mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-primary-700 dark:text-accent-500 mb-2">
                    Flexible
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Adapté à vos besoins
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="text-gray-700 dark:text-gray-300 flex justify-center mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-primary-700 dark:text-accent-500 mb-2">
                    Performance
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Payez uniquement au résultat
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/contact"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Demander un devis personnalisé
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white dark:from-gray-900 to-cream-100 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionHeaderBadge variant="accent" icon={<StarIcon />}>
              Témoignages
            </SectionHeaderBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-700 dark:text-accent-500 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-bold text-primary-700 dark:text-accent-500">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-500 dark:from-primary-600 dark:via-primary-700 dark:to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <SectionHeaderBadge variant="hero" className="mb-8" icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}>
            Prêt à démarrer ?
          </SectionHeaderBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Discutons de votre projet
          </h2>
          <p className="text-xl text-white/90 dark:text-white/95 mb-10 max-w-3xl mx-auto">
            Notre équipe est à votre disposition pour vous accompagner et répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-10 py-4 bg-white dark:bg-accent-500 text-primary-700 dark:text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Nous contacter
            </Link>
            <Link
              href="/offres-emploi"
              className="px-10 py-4 bg-white/20 dark:bg-white/30 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/30 dark:hover:bg-white/40 transition-all duration-300"
            >
              Voir nos offres
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
