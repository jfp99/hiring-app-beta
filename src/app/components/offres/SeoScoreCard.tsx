// src/app/components/offres/SeoScoreCard.tsx
'use client'

import { useMemo } from 'react'
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Search,
  FileText,
  Link,
  Tag
} from 'lucide-react'
import type { SeoScore, SeoSuggestion, OffreFormData } from '@/app/types/offres'

interface SeoScoreCardProps {
  formData: Partial<OffreFormData>
  compact?: boolean
}

// Calculate SEO score based on form data
function calculateSeoScore(data: Partial<OffreFormData>): SeoScore {
  const suggestions: SeoSuggestion[] = []
  let titleScore = 0
  let descriptionScore = 0
  let keywordsScore = 0
  let slugScore = 0

  // Title analysis (max 25 points)
  const title = data.titre || ''
  if (title.length === 0) {
    suggestions.push({
      type: 'error',
      field: 'titre',
      message: 'Le titre est requis',
      action: 'Ajoutez un titre descriptif'
    })
  } else if (title.length < 30) {
    titleScore = 10
    suggestions.push({
      type: 'warning',
      field: 'titre',
      message: 'Titre trop court',
      action: 'Un titre de 30-60 caract\u00e8res est optimal pour le SEO'
    })
  } else if (title.length > 70) {
    titleScore = 15
    suggestions.push({
      type: 'warning',
      field: 'titre',
      message: 'Titre trop long',
      action: 'Google tronque les titres apr\u00e8s 60 caract\u00e8res'
    })
  } else {
    titleScore = 25
    suggestions.push({
      type: 'success',
      field: 'titre',
      message: 'Longueur du titre optimale'
    })
  }

  // Description analysis (max 35 points)
  const description = data.description || ''
  const descriptionText = description.replace(/<[^>]*>/g, '') // Strip HTML
  if (descriptionText.length === 0) {
    suggestions.push({
      type: 'error',
      field: 'description',
      message: 'La description est requise',
      action: 'Ajoutez une description d\u00e9taill\u00e9e du poste'
    })
  } else if (descriptionText.length < 150) {
    descriptionScore = 10
    suggestions.push({
      type: 'warning',
      field: 'description',
      message: 'Description trop courte',
      action: 'Une description de 300+ mots am\u00e9liore le r\u00e9f\u00e9rencement'
    })
  } else if (descriptionText.length < 500) {
    descriptionScore = 20
    suggestions.push({
      type: 'warning',
      field: 'description',
      message: 'Description correcte mais peut \u00eatre am\u00e9lior\u00e9e',
      action: 'Ajoutez plus de d\u00e9tails sur les responsabilit\u00e9s et avantages'
    })
  } else {
    descriptionScore = 35
    suggestions.push({
      type: 'success',
      field: 'description',
      message: 'Description compl\u00e8te et d\u00e9taill\u00e9e'
    })
  }

  // Keywords analysis (max 20 points)
  const keywords = data.keywords || []
  const competences = data.competences || ''
  const hasKeywords = keywords.length > 0 || competences.length > 20

  if (!hasKeywords) {
    suggestions.push({
      type: 'warning',
      field: 'keywords',
      message: 'Aucun mot-cl\u00e9 d\u00e9fini',
      action: 'Ajoutez des comp\u00e9tences ou mots-cl\u00e9s pour am\u00e9liorer la recherche'
    })
  } else if (keywords.length < 3 && competences.length < 50) {
    keywordsScore = 10
    suggestions.push({
      type: 'warning',
      field: 'keywords',
      message: 'Peu de mots-cl\u00e9s',
      action: 'Ajoutez 3-5 mots-cl\u00e9s pertinents'
    })
  } else {
    keywordsScore = 20
    suggestions.push({
      type: 'success',
      field: 'keywords',
      message: 'Bonne utilisation des mots-cl\u00e9s'
    })
  }

  // Slug analysis (max 20 points)
  const slug = data.slug || ''
  if (!slug) {
    slugScore = 5 // Auto-generated slugs get some points
    suggestions.push({
      type: 'warning',
      field: 'slug',
      message: 'URL personnalis\u00e9e non d\u00e9finie',
      action: 'Un slug personnalis\u00e9 am\u00e9liore le SEO (ex: developpeur-react-paris)'
    })
  } else if (slug.length > 50) {
    slugScore = 10
    suggestions.push({
      type: 'warning',
      field: 'slug',
      message: 'URL trop longue',
      action: 'Gardez l\'URL courte et descriptive'
    })
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    slugScore = 5
    suggestions.push({
      type: 'error',
      field: 'slug',
      message: 'URL contient des caract\u00e8res invalides',
      action: 'Utilisez uniquement des lettres minuscules, chiffres et tirets'
    })
  } else {
    slugScore = 20
    suggestions.push({
      type: 'success',
      field: 'slug',
      message: 'URL optimis\u00e9e'
    })
  }

  // Bonus points for meta fields
  if (data.metaTitle && data.metaTitle.length >= 30) {
    suggestions.push({
      type: 'success',
      field: 'metaTitle',
      message: 'Meta titre d\u00e9fini'
    })
  }

  if (data.metaDescription && data.metaDescription.length >= 120) {
    suggestions.push({
      type: 'success',
      field: 'metaDescription',
      message: 'Meta description d\u00e9finie'
    })
  }

  const total = Math.min(100, titleScore + descriptionScore + keywordsScore + slugScore)

  return {
    total,
    titleScore,
    descriptionScore,
    keywordsScore,
    slugScore,
    suggestions
  }
}

// Score color based on value
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'Faible'
}

// Google Preview Component
function GooglePreview({ data }: { data: Partial<OffreFormData> }) {
  const title = data.metaTitle || data.titre || 'Titre du poste'
  const description = data.metaDescription ||
    (data.description?.replace(/<[^>]*>/g, '').slice(0, 160) + '...') ||
    'Description du poste...'
  const slug = data.slug || 'offre-emploi'

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 mb-1">Aper\u00e7u Google</p>
      <div className="space-y-1">
        <p className="text-xs text-green-700 dark:text-green-400 truncate">
          https://hi-ring.fr/offres-emploi/{slug}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium line-clamp-1 hover:underline cursor-pointer">
          {title.slice(0, 60)}{title.length > 60 ? '...' : ''} | Hi-ring
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {description.slice(0, 160)}{description.length > 160 ? '...' : ''}
        </p>
      </div>
    </div>
  )
}

export default function SeoScoreCard({ formData, compact = false }: SeoScoreCardProps) {
  const score = useMemo(() => calculateSeoScore(formData), [formData])

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(score.total / 100) * 125.6} 125.6`}
              className={getScoreColor(score.total)}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(score.total)}`}>
            {score.total}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Score SEO</p>
          <p className={`text-xs ${getScoreColor(score.total)}`}>{getScoreLabel(score.total)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with score */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Score SEO</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(score.total)}`}>
              {score.total}
            </span>
            <span className="text-gray-500">/100</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getScoreBgColor(score.total)}`}
            style={{ width: `${score.total}%` }}
          />
        </div>
        <p className={`mt-1 text-sm ${getScoreColor(score.total)}`}>
          {getScoreLabel(score.total)}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ScoreItem icon={FileText} label="Titre" score={score.titleScore} max={25} />
          <ScoreItem icon={Search} label="Description" score={score.descriptionScore} max={35} />
          <ScoreItem icon={Tag} label="Mots-cl\u00e9s" score={score.keywordsScore} max={20} />
          <ScoreItem icon={Link} label="URL" score={score.slugScore} max={20} />
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {score.suggestions.map((suggestion, index) => (
            <SuggestionItem key={index} suggestion={suggestion} />
          ))}
        </div>
      </div>

      {/* Google Preview */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <GooglePreview data={formData} />
      </div>
    </div>
  )
}

function ScoreItem({
  icon: Icon,
  label,
  score,
  max
}: {
  icon: React.ElementType
  label: string
  score: number
  max: number
}) {
  const percentage = (score / max) * 100

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium">{score}/{max}</span>
        </div>
        <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getScoreBgColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function SuggestionItem({ suggestion }: { suggestion: SeoSuggestion }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    error: 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${bgColors[suggestion.type]}`}>
      {icons[suggestion.type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white">
          {suggestion.message}
        </p>
        {suggestion.action && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {suggestion.action}
          </p>
        )}
      </div>
    </div>
  )
}
