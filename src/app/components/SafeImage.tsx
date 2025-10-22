'use client'

import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  onError?: () => void
}

/**
 * SafeImage Component
 *
 * A wrapper around img tags that handles loading states and errors gracefully.
 * Shows a skeleton loader while loading and a fallback on error.
 *
 * @param src - Image URL
 * @param alt - Alternative text for accessibility
 * @param className - Additional CSS classes
 * @param fallbackSrc - Optional fallback image URL
 * @param onError - Optional error callback
 */
export default function SafeImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/placeholder.jpg',
  onError
}: SafeImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)

    // Try fallback image if not already using it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false) // Reset error state to try fallback
    }

    // Call optional error callback
    if (onError) {
      onError()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-shimmer rounded-lg" />
      )}

      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />

      {/* Error Fallback UI */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center p-4">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}
