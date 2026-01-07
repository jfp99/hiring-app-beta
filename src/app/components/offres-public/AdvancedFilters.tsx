// src/app/components/offres-public/AdvancedFilters.tsx
'use client'

import { useState, useCallback } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Building2,
  Euro,
  Check
} from 'lucide-react'
import { CATEGORIES, CONTRACT_TYPES, LOCATIONS } from '@/app/types/offres'

export interface FilterState {
  search: string
  categories: string[]
  locations: string[]
  contractTypes: string[]
  salaryRange: [number, number]
  remoteOnly: boolean
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
  isLoading?: boolean
}

const SALARY_MIN = 20000
const SALARY_MAX = 150000
const SALARY_STEP = 5000

// Multi-select dropdown component
function MultiSelectDropdown({
  label,
  icon: Icon,
  options,
  selected,
  onChange,
  placeholder
}: {
  label: string
  icon: React.ElementType
  options: readonly string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {selected.length === 0 ? (
            <span className="text-gray-400 truncate">{placeholder}</span>
          ) : (
            <span className="text-gray-900 dark:text-white truncate">
              {selected.length === 1 ? selected[0] : `${selected.length} sélectionnés`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
              {selected.length}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-b border-gray-100 dark:border-gray-700"
              >
                Effacer tout
              </button>
            )}
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <span>{option}</span>
                {selected.includes(option) && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Salary range slider component
function SalaryRangeSlider({
  value,
  onChange
}: {
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
  const [min, max] = value

  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`
    }
    return amount.toString()
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value)
    if (newMin <= max) {
      onChange([newMin, max])
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value)
    if (newMax >= min) {
      onChange([min, newMax])
    }
  }

  const minPercent = ((min - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100
  const maxPercent = ((max - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Fourchette salariale
      </label>
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatSalary(min)} - {formatSalary(max)} EUR/an
            </span>
          </div>
          {(min !== SALARY_MIN || max !== SALARY_MAX) && (
            <button
              type="button"
              onClick={() => onChange([SALARY_MIN, SALARY_MAX])}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Dual range slider */}
        <div className="relative h-2 mt-4 mb-2">
          {/* Track background */}
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

          {/* Active track */}
          <div
            className="absolute h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />

          {/* Min slider */}
          <input
            type="range"
            min={SALARY_MIN}
            max={SALARY_MAX}
            step={SALARY_STEP}
            value={min}
            onChange={handleMinChange}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          />

          {/* Max slider */}
          <input
            type="range"
            min={SALARY_MIN}
            max={SALARY_MAX}
            step={SALARY_STEP}
            value={max}
            onChange={handleMaxChange}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatSalary(SALARY_MIN)}</span>
          <span>{formatSalary(SALARY_MAX)}+</span>
        </div>
      </div>
    </div>
  )
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  resultCount,
  isLoading
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }, [filters, onFiltersChange])

  const resetFilters = useCallback(() => {
    onFiltersChange({
      search: '',
      categories: [],
      locations: [],
      contractTypes: [],
      salaryRange: [SALARY_MIN, SALARY_MAX],
      remoteOnly: false
    })
  }, [onFiltersChange])

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.locations.length > 0,
    filters.contractTypes.length > 0,
    filters.salaryRange[0] !== SALARY_MIN || filters.salaryRange[1] !== SALARY_MAX,
    filters.remoteOnly
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Search bar */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un poste, une entreprise..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle filters button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isExpanded || activeFilterCount > 0
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Results count */}
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 dark:text-white rounded-xl font-bold">
            {isLoading ? (
              <span className="animate-pulse">Chargement...</span>
            ) : (
              <span>{resultCount} offre{resultCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categories */}
            <MultiSelectDropdown
              label="Catégories"
              icon={Briefcase}
              options={CATEGORIES}
              selected={filters.categories}
              onChange={(values) => updateFilter('categories', values)}
              placeholder="Toutes les catégories"
            />

            {/* Locations */}
            <MultiSelectDropdown
              label="Localisation"
              icon={MapPin}
              options={LOCATIONS}
              selected={filters.locations}
              onChange={(values) => updateFilter('locations', values)}
              placeholder="Tous les lieux"
            />

            {/* Contract types */}
            <MultiSelectDropdown
              label="Type de contrat"
              icon={Building2}
              options={CONTRACT_TYPES}
              selected={filters.contractTypes}
              onChange={(values) => updateFilter('contractTypes', values)}
              placeholder="Tous les contrats"
            />

            {/* Salary range */}
            <SalaryRangeSlider
              value={filters.salaryRange}
              onChange={(value) => updateFilter('salaryRange', value)}
            />
          </div>

          {/* Remote toggle and reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.remoteOnly}
                onChange={(e) => updateFilter('remoteOnly', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Télétravail uniquement
              </span>
            </label>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Export default filter state
export const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  locations: [],
  contractTypes: [],
  salaryRange: [SALARY_MIN, SALARY_MAX],
  remoteOnly: false
}
