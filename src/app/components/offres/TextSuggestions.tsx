// src/app/components/offres/TextSuggestions.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  ListChecks,
  Award,
  Gift
} from 'lucide-react'
import { TEXT_SUGGESTIONS, type TextSuggestion } from '@/app/types/offres'

type SuggestionCategory = 'description' | 'responsabilites' | 'qualifications' | 'avantages'

interface TextSuggestionsProps {
  category: SuggestionCategory
  onInsert: (text: string) => void
  typeContrat?: string
  categorie?: string
}

interface TextSuggestionsPanelProps {
  onInsert: (text: string, category: SuggestionCategory) => void
  typeContrat?: string
  categorie?: string
  activeCategory?: SuggestionCategory
}

const CATEGORY_CONFIG: Record<SuggestionCategory, { label: string; icon: React.ElementType; color: string }> = {
  description: {
    label: 'Description',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
  },
  responsabilites: {
    label: 'Responsabilit\u00e9s',
    icon: ListChecks,
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20'
  },
  qualifications: {
    label: 'Qualifications',
    icon: Award,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
  },
  avantages: {
    label: 'Avantages',
    icon: Gift,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
  }
}

// Extended suggestions library
const EXTENDED_SUGGESTIONS: TextSuggestion[] = [
  ...TEXT_SUGGESTIONS,
  // More description suggestions
  {
    id: 'desc-mission-1',
    category: 'description',
    title: 'Mission du poste',
    text: 'Au sein de notre \u00e9quipe dynamique, vous aurez pour mission principale de contribuer activement au d\u00e9veloppement et \u00e0 la croissance de notre activit\u00e9.',
    tags: ['mission', 'intro']
  },
  {
    id: 'desc-context-1',
    category: 'description',
    title: 'Contexte de croissance',
    text: 'Dans le cadre de notre forte croissance, nous recherchons un(e) professionnel(le) motiv\u00e9(e) pour rejoindre notre \u00e9quipe.',
    tags: ['context', 'growth']
  },
  // More responsabilites
  {
    id: 'resp-report-1',
    category: 'responsabilites',
    title: 'Reporting',
    text: 'Produire des rapports r\u00e9guliers et assurer le suivi des indicateurs de performance',
    tags: ['reporting', 'kpi']
  },
  {
    id: 'resp-client-1',
    category: 'responsabilites',
    title: 'Relation client',
    text: 'G\u00e9rer et d\u00e9velopper un portefeuille de clients strat\u00e9giques',
    tags: ['client', 'commercial']
  },
  {
    id: 'resp-innovation-1',
    category: 'responsabilites',
    title: 'Innovation',
    text: 'Proposer des solutions innovantes et participer \u00e0 l\'am\u00e9lioration continue des processus',
    tags: ['innovation', 'process']
  },
  {
    id: 'resp-veille-1',
    category: 'responsabilites',
    title: 'Veille technologique',
    text: 'Effectuer une veille technologique et concurrentielle r\u00e9guli\u00e8re',
    tags: ['veille', 'tech']
  },
  // More qualifications
  {
    id: 'qual-soft-1',
    category: 'qualifications',
    title: 'Soft skills',
    text: 'Excellentes capacit\u00e9s d\'analyse, de synth\u00e8se et de communication',
    tags: ['softskills']
  },
  {
    id: 'qual-autonomy-1',
    category: 'qualifications',
    title: 'Autonomie',
    text: 'Autonome, rigoureux(se) et dot\u00e9(e) d\'un excellent sens de l\'organisation',
    tags: ['autonomy', 'organization']
  },
  {
    id: 'qual-team-1',
    category: 'qualifications',
    title: 'Esprit d\'\u00e9quipe',
    text: 'Fort esprit d\'\u00e9quipe et capacit\u00e9 \u00e0 travailler dans un environnement collaboratif',
    tags: ['teamwork']
  },
  {
    id: 'qual-adapt-1',
    category: 'qualifications',
    title: 'Adaptabilit\u00e9',
    text: 'Capacit\u00e9 d\'adaptation et aptitude \u00e0 g\u00e9rer plusieurs projets simultan\u00e9ment',
    tags: ['adaptability', 'multitask']
  },
  // More avantages
  {
    id: 'avt-rtt-1',
    category: 'avantages',
    title: 'RTT',
    text: '12 jours de RTT par an en plus des cong\u00e9s l\u00e9gaux',
    tags: ['rtt', 'vacation']
  },
  {
    id: 'avt-bonus-1',
    category: 'avantages',
    title: 'Prime',
    text: 'Prime annuelle sur objectifs pouvant atteindre 10% du salaire',
    tags: ['bonus', 'salary']
  },
  {
    id: 'avt-stock-1',
    category: 'avantages',
    title: 'BSPCE',
    text: 'Plan de BSPCE (stock options) pour tous les collaborateurs',
    tags: ['stock', 'startup']
  },
  {
    id: 'avt-events-1',
    category: 'avantages',
    title: '\u00c9v\u00e9nements',
    text: 'Team buildings et \u00e9v\u00e9nements d\'\u00e9quipe r\u00e9guliers',
    tags: ['events', 'culture']
  },
  {
    id: 'avt-materiel-1',
    category: 'avantages',
    title: 'Mat\u00e9riel',
    text: 'MacBook Pro et mat\u00e9riel de qualit\u00e9 fournis',
    tags: ['equipment', 'tech']
  },
  {
    id: 'avt-cafe-1',
    category: 'avantages',
    title: 'Caf\u00e9 & Snacks',
    text: 'Caf\u00e9, th\u00e9 et snacks \u00e0 disposition',
    tags: ['food', 'office']
  }
]

function SuggestionCard({
  suggestion,
  onInsert
}: {
  suggestion: TextSuggestion
  onInsert: (text: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onInsert(suggestion.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {suggestion.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {suggestion.text}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {suggestion.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-all ${
            copied
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30'
          }`}
          title="Ins\u00e9rer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// Compact version for inline use
export default function TextSuggestions({
  category,
  onInsert,
  typeContrat,
  categorie
}: TextSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSuggestions = useMemo(() => {
    return EXTENDED_SUGGESTIONS.filter((s) => {
      if (s.category !== category) return false
      if (typeContrat && s.typeContrat && s.typeContrat !== typeContrat) return false
      if (categorie && s.categorie && s.categorie !== categorie) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          s.title.toLowerCase().includes(query) ||
          s.text.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [category, typeContrat, categorie, searchQuery])

  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${config.color}`}
      >
        <Lightbulb className="w-4 h-4" />
        <span>Suggestions</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Suggestions list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredSuggestions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune suggestion trouv\u00e9e
              </p>
            ) : (
              filteredSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onInsert={onInsert}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Full panel version for sidebar
export function TextSuggestionsPanel({
  onInsert,
  typeContrat,
  categorie,
  activeCategory = 'description'
}: TextSuggestionsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory>(activeCategory)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSuggestions = useMemo(() => {
    return EXTENDED_SUGGESTIONS.filter((s) => {
      if (s.category !== selectedCategory) return false
      if (typeContrat && s.typeContrat && s.typeContrat !== typeContrat) return false
      if (categorie && s.categorie && s.categorie !== categorie) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          s.title.toLowerCase().includes(query) ||
          s.text.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [selectedCategory, typeContrat, categorie, searchQuery])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Suggestions de texte
          </h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(Object.keys(CATEGORY_CONFIG) as SuggestionCategory[]).map((cat) => {
          const config = CATEGORY_CONFIG[cat]
          const Icon = config.icon
          const count = EXTENDED_SUGGESTIONS.filter((s) => s.category === cat).length

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{config.label}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Suggestions list */}
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {filteredSuggestions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucune suggestion trouv\u00e9e
          </p>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onInsert={(text) => onInsert(text, selectedCategory)}
            />
          ))
        )}
      </div>
    </div>
  )
}
