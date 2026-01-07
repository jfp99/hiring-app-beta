// src/app/components/offres-public/FavoritesButton.tsx
'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/app/hooks/useFavorites'

interface FavoritesButtonProps {
  offerId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZES = {
  sm: { icon: 'w-4 h-4', button: 'p-1.5', text: 'text-xs' },
  md: { icon: 'w-5 h-5', button: 'p-2', text: 'text-sm' },
  lg: { icon: 'w-6 h-6', button: 'p-3', text: 'text-base' }
}

export default function FavoritesButton({
  offerId,
  className = '',
  size = 'md',
  showLabel = false
}: FavoritesButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const isFav = isFavorite(offerId)
  const sizeClasses = SIZES[size]

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(offerId)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 rounded-lg transition-all
        ${sizeClasses.button}
        ${isFav
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        }
        ${className}
      `}
      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`${sizeClasses.icon} transition-all ${isFav ? 'fill-current scale-110' : ''}`}
      />
      {showLabel && (
        <span className={`font-medium ${sizeClasses.text}`}>
          {isFav ? 'Favori' : 'Favoris'}
        </span>
      )}
    </button>
  )
}

// Favorites counter badge
export function FavoritesCount({ className = '' }: { className?: string }) {
  const { favorites } = useFavorites()
  const count = favorites.length

  if (count === 0) return null

  return (
    <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold bg-red-500 text-white rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

// Full favorites panel/modal
interface FavoritesPanelProps {
  isOpen: boolean
  onClose: () => void
  offers: Array<{
    id: string
    titre: string
    entreprise: string
    lieu: string
    typeContrat: string
  }>
  onOfferClick?: (offerId: string) => void
}

export function FavoritesPanel({ isOpen, onClose, offers, onOfferClick }: FavoritesPanelProps) {
  const { favorites, clearFavorites, toggleFavorite } = useFavorites()

  const favoriteOffers = offers.filter(o => favorites.includes(o.id))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Mes favoris
              </h2>
              <p className="text-sm text-gray-500">
                {favoriteOffers.length} offre{favoriteOffers.length !== 1 ? 's' : ''} sauvegardée{favoriteOffers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {favoriteOffers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun favori
              </h3>
              <p className="text-sm text-gray-500">
                Cliquez sur le coeur pour sauvegarder des offres
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onOfferClick?.(offer.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {offer.titre}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {offer.entreprise} • {offer.lieu}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {offer.typeContrat}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(offer.id)
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favoriteOffers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFavorites}
              className="w-full py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Supprimer tous les favoris
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
