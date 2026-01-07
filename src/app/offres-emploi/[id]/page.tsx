// app/offres-emploi/[id]/page.tsx
'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { useApi } from '../../hooks/useApi'
import { useFavorites } from '../../hooks/useFavorites'
import {
  MapPin, Building2, Briefcase, Calendar, Euro, Mail,
  ArrowLeft, Share2, Heart, CheckCircle2,
  GraduationCap, Award, Sparkles, Users
} from 'lucide-react'

interface Offre {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  descriptionHtml?: string
  competences: string
  emailContact: string
  datePublication: string
  categorie: string
  statut: string
  // Enhanced fields
  responsabilites?: string[]
  qualifications?: string[]
  avantages?: string[]
  media?: {
    logoUrl?: string
    bannerUrl?: string
    videoUrl?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

export default function OffreDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [offre, setOffre] = useState<Offre | null>(null)
  const { loading, error, callApi } = useApi()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [showShareToast, setShowShareToast] = useState(false)

  useEffect(() => {
    const loadOffre = async () => {
      try {
        const result = await callApi('/offres')
        if (result.success && result.offres) {
          const foundOffre = result.offres.find((o: Offre) => o.id === unwrappedParams.id)
          if (foundOffre) {
            setOffre(foundOffre)
          }
        }
      } catch (err) {
        console.error('Error loading offer:', err)
      }
    }
    loadOffre()
  }, [unwrappedParams.id, callApi])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: offre?.titre,
        text: `Offre d'emploi: ${offre?.titre} chez ${offre?.entreprise}`,
        url
      })
    } else {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Helper to check if a field has content
  const hasContent = (value: unknown): boolean => {
    if (!value) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l&apos;offre...</p>
        </div>
      </div>
    )
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Offre non trouvee
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "Cette offre n'existe pas ou a ete supprimee."}
            </p>
            <Link
              href="/offres-emploi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux offres
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const isFav = isFavorite(offre.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Share toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          Lien copie !
        </div>
      )}

      {/* Back navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/offres-emploi"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Banner if exists */}
              {offre.media?.bannerUrl && (
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700">
                  <img
                    src={offre.media.bannerUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Category & Contract badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hasContent(offre.categorie) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      {offre.categorie}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded-full text-sm font-medium">
                    {offre.typeContrat}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {offre.titre}
                </h1>

                {/* Key info */}
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{offre.entreprise}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{offre.lieu}</span>
                  </div>
                  {hasContent(offre.salaire) && offre.salaire !== 'Non specifie' && (
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-green-600 dark:text-green-400">{offre.salaire}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis interesse(e) par le poste de ${offre.titre} et je vous adresse ma candidature.%0D%0A%0D%0ACordialement`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Postuler
                  </a>
                  <button
                    onClick={() => toggleFavorite(offre.id)}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFav
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {hasContent(offre.description) && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  Description du poste
                </h2>
                {offre.descriptionHtml ? (
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: offre.descriptionHtml }}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                    {offre.description}
                  </p>
                )}
              </section>
            )}

            {/* Responsabilites */}
            {hasContent(offre.responsabilites) && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  Responsabilites
                </h2>
                <ul className="space-y-3">
                  {offre.responsabilites!.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Qualifications */}
            {hasContent(offre.qualifications) && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  Qualifications requises
                </h2>
                <ul className="space-y-3">
                  {offre.qualifications!.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Avantages */}
            {hasContent(offre.avantages) && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Avantages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offre.avantages!.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
                    >
                      <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Competences */}
            {hasContent(offre.competences) && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Competences recherchees
                </h2>
                <div className="flex flex-wrap gap-2">
                  {offre.competences.split(',').map((comp, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      {comp.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Company card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4 mb-4">
                {offre.media?.logoUrl ? (
                  <img
                    src={offre.media.logoUrl}
                    alt={offre.entreprise}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {offre.entreprise.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{offre.entreprise}</h3>
                  <p className="text-sm text-gray-500">Recruteur</p>
                </div>
              </div>
              <a
                href={`mailto:${offre.emailContact}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Contacter
              </a>
            </div>

            {/* Job details card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Details du poste</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Type de contrat</span>
                  <span className="font-medium text-gray-900 dark:text-white">{offre.typeContrat}</span>
                </div>
                {hasContent(offre.lieu) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Localisation</span>
                    <span className="font-medium text-gray-900 dark:text-white">{offre.lieu}</span>
                  </div>
                )}
                {hasContent(offre.salaire) && offre.salaire !== 'Non specifie' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Salaire</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{offre.salaire}</span>
                  </div>
                )}
                {hasContent(offre.categorie) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Categorie</span>
                    <span className="font-medium text-gray-900 dark:text-white">{offre.categorie}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Publiee le
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(offre.datePublication)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply CTA */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Interesse(e) ?</h3>
              <p className="text-primary-100 text-sm mb-4">
                Postulez maintenant et rejoignez {offre.entreprise}
              </p>
              <a
                href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis interesse(e) par le poste de ${offre.titre} chez ${offre.entreprise} et je vous adresse ma candidature.%0D%0A%0D%0ACordialement`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-700 rounded-xl font-medium hover:bg-primary-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Postuler par email
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
