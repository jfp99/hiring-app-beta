import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-6 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specific empty state variants
export const EmptyCandidates: React.FC<{
  onAddCandidate?: () => void
}> = ({ onAddCandidate }) => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    }
    title="Aucun candidat pour le moment"
    description="Commencez à construire votre pipeline de recrutement en ajoutant votre premier candidat."
    action={
      onAddCandidate
        ? {
            label: 'Ajouter un candidat',
            onClick: onAddCandidate,
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ),
          }
        : undefined
    }
  />
)

export const EmptySearch: React.FC<{
  searchTerm?: string
  onClearFilters?: () => void
}> = ({ searchTerm, onClearFilters }) => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    title="Aucun résultat trouvé"
    description={
      searchTerm
        ? `Aucun résultat pour "${searchTerm}". Essayez d'autres termes de recherche ou filtres.`
        : "Aucun résultat ne correspond à vos critères. Essayez d'ajuster vos filtres."
    }
    action={
      onClearFilters
        ? {
            label: 'Effacer les filtres',
            onClick: onClearFilters,
          }
        : undefined
    }
  />
)

export const EmptyData: React.FC<{
  title: string
  description?: string
}> = ({ title, description }) => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    }
    title={title}
    description={description}
  />
)
