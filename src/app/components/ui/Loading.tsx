import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'accent' | 'white' | 'current'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4'
}

const colors = {
  primary: 'border-primary-500 dark:border-primary-400',
  accent: 'border-accent-500 dark:border-accent-400',
  white: 'border-white',
  current: 'border-current'
}

export function LoadingSpinner({
  size = 'md',
  variant = 'accent',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full border-t-transparent
        ${sizes[size]}
        ${colors[variant]}
        ${className}
      `.trim()}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

export interface LoadingOverlayProps {
  message?: string
  size?: LoadingSpinnerProps['size']
  variant?: LoadingSpinnerProps['variant']
  fullScreen?: boolean
  className?: string
}

export function LoadingOverlay({
  message = 'Chargement...',
  size = 'lg',
  variant = 'accent',
  fullScreen = false,
  className = ''
}: LoadingOverlayProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    : 'absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg'

  return (
    <div className={`${containerClasses} flex items-center justify-center ${className}`}>
      <div className="text-center">
        <LoadingSpinner size={size} variant={variant} className="mx-auto mb-4" />
        {message && (
          <p className="text-primary-700 dark:text-gray-200 font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Chargement...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" variant="accent" className="mx-auto mb-6" />
        <p className="text-primary-700 dark:text-gray-200 font-medium text-lg">
          {message}
        </p>
      </div>
    </div>
  )
}

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <Skeleton variant="rectangular" className="w-full h-40 mb-4" />
      <Skeleton className="w-3/4 mb-2" />
      <Skeleton className="w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  )
}

export default LoadingSpinner
