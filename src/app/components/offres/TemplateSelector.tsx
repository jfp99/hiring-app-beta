// src/app/components/offres/TemplateSelector.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Copy,
  Star,
  Clock,
  ChevronDown,
  X,
  Briefcase,
  Building2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { OffreTemplate, OffreFormData } from '@/app/types/offres'
import { CATEGORIES, CONTRACT_TYPES } from '@/app/types/offres'

interface TemplateSelectorProps {
  templates?: OffreTemplate[]
  onSelect: (template: OffreTemplate | Partial<OffreFormData>) => void
  onCreateNew?: () => void
  isLoading?: boolean
}

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  templates?: OffreTemplate[]
  onSelect: (template: OffreTemplate | Partial<OffreFormData>) => void
  onCreateNew?: () => void
  isLoading?: boolean
}

// Predefined templates for quick start
const DEFAULT_TEMPLATES: OffreTemplate[] = [
  {
    id: 'tpl-cdi-tech',
    name: 'CDI Technologie',
    description: 'Template pour un poste technique en CDI',
    categorie: 'Technologie',
    typeContrat: 'CDI',
    defaultData: {
      typeContrat: 'CDI',
      categorie: 'Technologie',
      entreprise: 'Hi-ring',
      responsabilites: [
        'Concevoir et d\u00e9velopper des applications web performantes',
        'Collaborer avec les \u00e9quipes produit et design',
        'Participer aux code reviews et \u00e0 l\'am\u00e9lioration continue',
        'Effectuer une veille technologique r\u00e9guli\u00e8re'
      ],
      qualifications: [
        'Dipl\u00f4me Bac+5 en informatique ou \u00e9quivalent',
        'Minimum 3 ans d\'exp\u00e9rience en d\u00e9veloppement',
        'Ma\u00eetrise des technologies web modernes',
        'Autonome et excellent esprit d\'\u00e9quipe'
      ],
      avantages: [
        'T\u00e9l\u00e9travail 2-3 jours/semaine',
        'Mutuelle prise en charge \u00e0 100%',
        'Tickets restaurant',
        'Budget formation annuel'
      ]
    },
    useCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'tpl-stage-marketing',
    name: 'Stage Marketing',
    description: 'Template pour un stage en marketing digital',
    categorie: 'Marketing',
    typeContrat: 'Stage',
    defaultData: {
      typeContrat: 'Stage',
      categorie: 'Marketing',
      entreprise: 'Hi-ring',
      salaire: '800-1000\u20ac/mois',
      responsabilites: [
        'Participer \u00e0 la cr\u00e9ation de contenu pour les r\u00e9seaux sociaux',
        'Analyser les performances des campagnes marketing',
        'Contribuer \u00e0 la strat\u00e9gie d\'acquisition',
        'R\u00e9diger des articles de blog et newsletters'
      ],
      qualifications: [
        '\u00c9tudiant(e) en marketing ou communication (Bac+4/5)',
        'Ma\u00eetrise des outils de marketing digital',
        'Excellentes capacit\u00e9s r\u00e9dactionnelles',
        'Cr\u00e9atif(ve) et autonome'
      ],
      avantages: [
        'Tickets restaurant',
        'Remboursement transport 50%',
        'Environnement dynamique',
        'Possibilit\u00e9 d\'embauche'
      ]
    },
    useCount: 23,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'tpl-cdd-data',
    name: 'CDD Data Analyst',
    description: 'Template pour un poste Data en CDD',
    categorie: 'Data',
    typeContrat: 'CDD',
    defaultData: {
      typeContrat: 'CDD',
      categorie: 'Data',
      entreprise: 'Hi-ring',
      responsabilites: [
        'Collecter et analyser les donn\u00e9es m\u00e9tier',
        'Cr\u00e9er des tableaux de bord et rapports',
        'D\u00e9velopper des mod\u00e8les pr\u00e9dictifs',
        'Pr\u00e9senter les insights aux \u00e9quipes'
      ],
      qualifications: [
        'Formation Bac+5 en statistiques ou data science',
        'Exp\u00e9rience avec Python, SQL et outils BI',
        'Capacit\u00e9 \u00e0 vulgariser des concepts complexes',
        'Rigueur et esprit analytique'
      ],
      avantages: [
        'Projet innovant',
        'T\u00e9l\u00e9travail possible',
        'Formation continue',
        'Tickets restaurant'
      ]
    },
    useCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'tpl-freelance-design',
    name: 'Freelance Designer',
    description: 'Template pour une mission freelance en design',
    categorie: 'Design',
    typeContrat: 'Freelance',
    defaultData: {
      typeContrat: 'Freelance',
      categorie: 'Design',
      entreprise: 'Hi-ring',
      responsabilites: [
        'Concevoir des interfaces utilisateur intuitives',
        'Cr\u00e9er des maquettes et prototypes interactifs',
        'Collaborer avec les d\u00e9veloppeurs front-end',
        'Garantir la coh\u00e9rence de la charte graphique'
      ],
      qualifications: [
        'Portfolio de projets UI/UX',
        'Ma\u00eetrise de Figma et outils de design',
        'Compr\u00e9hension des principes d\'accessibilit\u00e9',
        'Autonomie et respect des d\u00e9lais'
      ],
      avantages: [
        'Mission \u00e0 distance',
        'Tarif journalier attractif',
        'Projet cr\u00e9atif',
        'Flexibilit\u00e9 des horaires'
      ]
    },
    useCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'tpl-alternance-rh',
    name: 'Alternance RH',
    description: 'Template pour une alternance en ressources humaines',
    categorie: 'RH',
    typeContrat: 'Alternance',
    defaultData: {
      typeContrat: 'Alternance',
      categorie: 'RH',
      entreprise: 'Hi-ring',
      responsabilites: [
        'Participer au processus de recrutement',
        'G\u00e9rer l\'administration du personnel',
        'Contribuer \u00e0 l\'int\u00e9gration des nouveaux collaborateurs',
        'Suivre les formations et d\u00e9veloppement'
      ],
      qualifications: [
        '\u00c9tudiant(e) en RH ou \u00e9cole de commerce (Bac+4/5)',
        'Bonnes capacit\u00e9s relationnelles',
        'Ma\u00eetrise des outils bureautiques',
        'Organisation et discr\u00e9tion'
      ],
      avantages: [
        'Formation compl\u00e8te aux m\u00e9tiers RH',
        'Tickets restaurant',
        'Participation aux projets transverses',
        'Ambiance conviviale'
      ]
    },
    useCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
]

// Template card component
function TemplateCard({
  template,
  onSelect,
  isDefault = false
}: {
  template: OffreTemplate
  onSelect: (template: OffreTemplate) => void
  isDefault?: boolean
}) {
  return (
    <div
      onClick={() => onSelect(template)}
      className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            isDefault
              ? 'bg-accent-100 dark:bg-accent-900/30'
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <FileText className={`w-5 h-5 ${
              isDefault
                ? 'text-accent-600 dark:text-accent-400'
                : 'text-primary-600 dark:text-primary-400'
            }`} />
          </div>
          {isDefault && (
            <Star className="w-4 h-4 text-accent-500" fill="currentColor" />
          )}
        </div>
        <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {template.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          <Briefcase className="w-3 h-3" />
          {template.typeContrat}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          <Building2 className="w-3 h-3" />
          {template.categorie}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {template.useCount} utilisations
        </span>
        {!isDefault && (
          <span>
            {format(new Date(template.updatedAt), 'dd/MM/yyyy', { locale: fr })}
          </span>
        )}
      </div>
    </div>
  )
}

// Inline template selector
export default function TemplateSelector({
  templates,
  onSelect,
  onCreateNew,
  isLoading
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategorie, setFilterCategorie] = useState<string>('')
  const [filterContrat, setFilterContrat] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Combine default and custom templates
  const allTemplates = useMemo(() => {
    return [...DEFAULT_TEMPLATES, ...(templates || [])]
  }, [templates])

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !t.name.toLowerCase().includes(query) &&
          !t.description.toLowerCase().includes(query)
        ) {
          return false
        }
      }
      if (filterCategorie && t.categorie !== filterCategorie) return false
      if (filterContrat && t.typeContrat !== filterContrat) return false
      return true
    })
  }, [allTemplates, searchQuery, filterCategorie, filterContrat])

  const defaultTemplates = filteredTemplates.filter((t) =>
    DEFAULT_TEMPLATES.some((dt) => dt.id === t.id)
  )
  const customTemplates = filteredTemplates.filter((t) =>
    !DEFAULT_TEMPLATES.some((dt) => dt.id === t.id)
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un template..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || filterCategorie || filterContrat
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {(filterCategorie || filterContrat) && (
            <span className="px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {[filterCategorie, filterContrat].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Create new */}
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau template
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {/* Categorie filter */}
          <div className="relative">
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes cat\u00e9gories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Contract filter */}
          <div className="relative">
            <select
              value={filterContrat}
              onChange={(e) => setFilterContrat(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous contrats</option>
              {CONTRACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {(filterCategorie || filterContrat) && (
            <button
              onClick={() => {
                setFilterCategorie('')
                setFilterContrat('')
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
              Effacer
            </button>
          )}
        </div>
      )}

      {/* Default templates */}
      {defaultTemplates.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent-500" />
            Templates par d\u00e9faut
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onSelect}
                isDefault
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom templates */}
      {customTemplates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mes templates ({customTemplates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun template trouve
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Essayez de modifier vos filtres ou creez un nouveau template.
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Creer un template
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Modal version
export function TemplateSelectorModal({
  isOpen,
  onClose,
  templates,
  onSelect,
  onCreateNew,
  isLoading
}: TemplateSelectorModalProps) {
  if (!isOpen) return null

  const handleSelect = (template: OffreTemplate | Partial<OffreFormData>) => {
    onSelect(template)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Choisir un template
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              S\u00e9lectionnez un template pour d\u00e9marrer rapidement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <TemplateSelector
            templates={templates}
            onSelect={handleSelect}
            onCreateNew={onCreateNew ? () => {
              onCreateNew()
              onClose()
            } : undefined}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
