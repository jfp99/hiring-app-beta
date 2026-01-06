// src/app/components/offres/OffrePreview.tsx
'use client'

import { useState } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  X,
  MapPin,
  Building2,
  Briefcase,
  Euro,
  Calendar,
  Mail
} from 'lucide-react'
import type { OffreFormData } from '@/app/types/offres'

interface OffrePreviewProps {
  data: Partial<OffreFormData>
  isOpen?: boolean
  onClose?: () => void
  mode?: 'inline' | 'modal' | 'sidebar'
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const DEVICE_SIZES: Record<DeviceType, { width: number; label: string; icon: React.ElementType }> = {
  mobile: { width: 375, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, label: 'Tablette', icon: Tablet },
  desktop: { width: 1024, label: 'Desktop', icon: Monitor }
}

// Simulated job offer card as it would appear on the public page
function JobOfferCard({ data }: { data: Partial<OffreFormData> }) {
  const isNew = true // For preview, always show as new

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header badges */}
      <div className="px-4 pt-4 flex items-center gap-2">
        {isNew && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            NOUVEAU
          </span>
        )}
        {data.categorie && (
          <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
            {data.categorie}
          </span>
        )}
      </div>

      {/* Title and company */}
      <div className="px-4 pt-2 pb-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {data.titre || 'Titre du poste'}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <Building2 className="w-4 h-4" />
          <span>{data.entreprise || 'Entreprise'}</span>
          <span className="text-gray-300">|</span>
          <MapPin className="w-4 h-4" />
          <span>{data.lieu || 'Lieu'}</span>
        </div>
      </div>

      {/* Description preview */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {data.description?.replace(/<[^>]*>/g, '').slice(0, 150) || 'Description du poste...'}
        </p>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {data.typeContrat && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg">
            <Briefcase className="w-3 h-3" />
            {data.typeContrat}
          </span>
        )}
        {data.salaire && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg">
            <Euro className="w-3 h-3" />
            {data.salaire}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Aujourd&apos;hui
        </span>
        <button className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all">
          Voir l&apos;offre
        </button>
      </div>
    </article>
  )
}

// Full job detail page preview
function JobDetailPreview({ data }: { data: Partial<OffreFormData> }) {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {data.categorie && (
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 rounded-full mb-3">
              {data.categorie}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {data.titre || 'Titre du poste'}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {data.entreprise || 'Entreprise'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.lieu || 'Lieu'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {data.typeContrat || 'Type de contrat'}
            </span>
            {data.salaire && (
              <span className="flex items-center gap-1">
                <Euro className="w-4 h-4" />
                {data.salaire}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Description */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Description du poste</h2>
          {data.descriptionHtml ? (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: data.descriptionHtml }}
            />
          ) : (
            <p className="text-gray-700">
              {data.description || 'Aucune description fournie.'}
            </p>
          )}
        </section>

        {/* Responsabilit\u00e9s */}
        {data.responsabilites && data.responsabilites.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Responsabilit\u00e9s</h2>
            <ul className="space-y-2">
              {data.responsabilites.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Qualifications */}
        {data.qualifications && data.qualifications.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Qualifications requises</h2>
            <ul className="space-y-2">
              {data.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <Check className="w-5 h-5 flex-shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Comp\u00e9tences */}
        {data.competences && (
          <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Comp\u00e9tences</h2>
            <div className="flex flex-wrap gap-2">
              {data.competences.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Avantages */}
        {data.avantages && data.avantages.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Avantages</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.avantages.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Int\u00e9ress\u00e9(e) ?</h3>
          <p className="text-gray-600 mb-4">
            Envoyez votre candidature \u00e0 {data.emailContact || 'contact@hi-ring.fr'}
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg">
            <Mail className="w-5 h-5 inline-block mr-2" />
            Postuler maintenant
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OffrePreview({
  data,
  isOpen = true,
  onClose,
  mode = 'inline'
}: OffrePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [viewType, setViewType] = useState<'card' | 'detail'>('card')
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = () => {
    const slug = data.slug || 'preview'
    const url = `https://hi-ring.fr/offres-emploi/${slug}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (!isOpen) return null

  const content = (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          {/* Device selector */}
          {(Object.keys(DEVICE_SIZES) as DeviceType[]).map((d) => {
            const config = DEVICE_SIZES[d]
            const Icon = config.icon
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`p-2 rounded-lg transition-all ${
                  device === d
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600'
                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={config.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* View type */}
          <button
            onClick={() => setViewType('card')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              viewType === 'card'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Carte
          </button>
          <button
            onClick={() => setViewType('detail')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              viewType === 'detail'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600'
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            D\u00e9tail
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
              linkCopied
                ? 'bg-green-100 text-green-700'
                : 'bg-white dark:bg-gray-700 text-gray-600 hover:text-primary-600'
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copi\u00e9 !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier lien
              </>
            )}
          </button>

          {/* Open in new tab */}
          <button
            onClick={() => window.open(`/offres-emploi/preview`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-600 hover:text-primary-600 rounded-lg transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir
          </button>

          {/* Close button (for modal mode) */}
          {mode === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 p-4 flex justify-center">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300"
          style={{
            width: device === 'desktop' ? '100%' : `${DEVICE_SIZES[device].width}px`,
            maxWidth: `${DEVICE_SIZES[device].width}px`,
            height: viewType === 'card' ? 'fit-content' : '100%'
          }}
        >
          {/* Device frame for mobile/tablet */}
          {device !== 'desktop' && (
            <div className="bg-gray-800 px-3 py-2 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
          )}

          {/* Content */}
          <div className={`${device !== 'desktop' ? 'overflow-auto' : ''}`} style={{ height: viewType === 'detail' ? 'calc(100% - 32px)' : 'auto' }}>
            {viewType === 'card' ? (
              <div className="p-4">
                <JobOfferCard data={data} />
              </div>
            ) : (
              <JobDetailPreview data={data} />
            )}
          </div>
        </div>
      </div>

      {/* Device info */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
        <span className="text-xs text-gray-500">
          {DEVICE_SIZES[device].label} - {DEVICE_SIZES[device].width}px
        </span>
      </div>
    </div>
  )

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          {content}
        </div>
      </div>
    )
  }

  if (mode === 'sidebar') {
    return (
      <div className="h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {content}
      </div>
    )
  }

  return content
}

// Compact preview for inline use
export function OffrePreviewCompact({ data }: { data: Partial<OffreFormData> }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p className="text-xs text-gray-500 mb-2 font-medium">Aper\u00e7u rapide</p>
      <JobOfferCard data={data} />
    </div>
  )
}
