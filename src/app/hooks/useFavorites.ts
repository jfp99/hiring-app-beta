// src/app/hooks/useFavorites.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hiring_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
    }
  }, [favorites, isLoaded])

  // Check if an offer is in favorites
  const isFavorite = useCallback((offerId: string) => {
    return favorites.includes(offerId)
  }, [favorites])

  // Toggle favorite status
  const toggleFavorite = useCallback((offerId: string) => {
    setFavorites(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId)
      } else {
        return [...prev, offerId]
      }
    })
  }, [])

  // Add to favorites
  const addFavorite = useCallback((offerId: string) => {
    setFavorites(prev => {
      if (prev.includes(offerId)) {
        return prev
      }
      return [...prev, offerId]
    })
  }, [])

  // Remove from favorites
  const removeFavorite = useCallback((offerId: string) => {
    setFavorites(prev => prev.filter(id => id !== offerId))
  }, [])

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    isLoaded,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.length
  }
}
