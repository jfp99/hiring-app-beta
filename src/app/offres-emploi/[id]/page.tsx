// app/offres-emploi/[id]/page.tsx
'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { useApi } from '../../hooks/useApi'
import {
  MapPin, Building2, Briefcase, Calendar, Euro, Mail,
  ArrowLeft, CheckCircle2, Shield,
  GraduationCap, Award, Sparkles, Users, Clock, Send,
  ExternalLink, ChevronRight
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateEn = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const hasContent = (value: unknown): boolean => {
    if (!value) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  const ensureArray = (value: unknown): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value.trim()) {
      return value.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  const hasArrayContent = (value: unknown): boolean => {
    return ensureArray(value).length > 0
  }

  // Generate tag colors using site palette
  const getTagColor = (index: number) => {
    const colors = [
      'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Offre non trouvee
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {error || "Cette offre n'existe pas ou a ete supprimee."}
            </p>
            <Link
              href="/offres-emploi"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
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

  const competencesList = offre.competences ? offre.competences.split(',').map(c => c.trim()).filter(Boolean) : []

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {offre.titre}
                  </h1>
                  <p className="text-primary-600 dark:text-accent-500 font-medium">
                    {offre.entreprise} - {offre.lieu}
                  </p>
                </div>
                {/* Shield Icon */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  {offre.media?.logoUrl ? (
                    <img
                      src={offre.media.logoUrl}
                      alt={offre.entreprise}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg"
                    />
                  ) : (
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-accent-500" />
                  )}
                </div>
              </div>
            </div>

            {/* L'ENTREPRISE & LE CONTEXTE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                L&apos;ENTREPRISE & LE CONTEXTE
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
                {offre.entreprise} recherche un(e) {offre.titre} pour rejoindre ses equipes a {offre.lieu}.
              </p>
            </div>

            {/* LE POSTE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                LE POSTE
              </h2>
              {hasContent(offre.description) ? (
                <>
                  {offre.descriptionHtml ? (
                    <div
                      className="prose prose-gray dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[15px] prose-headings:text-gray-900 dark:prose-headings:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:text-[15px]"
                      dangerouslySetInnerHTML={{ __html: offre.descriptionHtml }}
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-[15px]">
                      {offre.description}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-[15px]">
                  Description a venir...
                </p>
              )}

              {/* Vos missions */}
              <div className="mt-6">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Vos missions :</h3>
                {hasArrayContent(offre.responsabilites) ? (
                  <ul className="space-y-2">
                    {ensureArray(offre.responsabilites).map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:bg-primary-500 before:rounded-full">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic text-[15px]">
                    Missions a definir...
                  </p>
                )}
              </div>
            </div>

            {/* ENVIRONNEMENT TECHNIQUE (Competences) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                ENVIRONNEMENT TECHNIQUE
              </h2>
              {hasContent(offre.competences) ? (
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300 text-[15px]">
                    <span className="font-semibold text-gray-900 dark:text-white">Competences requises : </span>
                    {offre.competences}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-[15px]">
                  Environnement technique a preciser...
                </p>
              )}
            </div>

            {/* LE PROFIL */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                LE PROFIL
              </h2>
              {hasArrayContent(offre.qualifications) ? (
                <ul className="space-y-2">
                  {ensureArray(offre.qualifications).map((item, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-1.5 before:bg-primary-500 before:rounded-full">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-[15px]">
                  Profil recherche a definir...
                </p>
              )}
            </div>

            {/* CE QUE L'ON AIME (Avantages) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                CE QUE L&apos;ON <span className="text-accent-500">&#10084;</span>
              </h2>
              {hasArrayContent(offre.avantages) ? (
                <ul className="space-y-2">
                  {ensureArray(offre.avantages).map((item, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-[15px]">
                  Avantages a decouvrir...
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Job Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8">
                {/* Updated date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                  <Calendar className="w-4 h-4" />
                  <span>Publiee le {formatDate(offre.datePublication)}</span>
                </div>

                {/* Job Info */}
                <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Type</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{offre.typeContrat}</span>
                  </div>

                  {hasContent(offre.salaire) && offre.salaire !== 'Non specifie' && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Salaire</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{offre.salaire}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Localisation</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{offre.lieu}</span>
                  </div>

                  {hasContent(offre.categorie) && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Categorie</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{offre.categorie}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Teletravail</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Hybride</span>
                  </div>
                </div>

                {/* Categories */}
                {hasContent(offre.categorie) && (
                  <div className="mb-8">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block mb-3">Categories</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium">
                        {offre.categorie}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <a
                  href={`mailto:${offre.emailContact}?subject=Candidature - ${offre.titre}&body=Bonjour,%0D%0A%0D%0AJe suis interesse(e) par le poste de ${offre.titre} chez ${offre.entreprise}.%0D%0A%0D%0ACordialement`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Ca m&apos;interesse
                </a>
              </div>

              {/* Tags Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8">
                <h3 className="text-sm font-bold text-primary-600 dark:text-accent-500 uppercase tracking-wider mb-4">
                  Tags
                </h3>
                {competencesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {competencesList.map((comp, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${getTagColor(index)}`}
                      >
                        #{comp.toLowerCase().replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                    Aucun tag defini
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
