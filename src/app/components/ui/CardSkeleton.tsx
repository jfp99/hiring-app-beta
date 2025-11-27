// components/ui/CardSkeleton.tsx
'use client'

interface CardSkeletonProps {
  variant?: 'default' | 'service' | 'team' | 'testimonial'
  count?: number
}

export function CardSkeleton({ variant = 'default', count = 1 }: CardSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'service':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="p-6">
              <div className="skeleton-text skeleton-text-lg w-3/4 mb-4"></div>
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-5/6"></div>
              <div className="space-y-2 mt-4">
                <div className="skeleton-text skeleton-text-sm w-1/2"></div>
                <div className="skeleton-text skeleton-text-sm w-2/3"></div>
                <div className="skeleton-text skeleton-text-sm w-1/2"></div>
              </div>
              <div className="skeleton w-full h-10 mt-4 rounded-lg"></div>
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image h-64"></div>
            <div className="p-6">
              <div className="skeleton-text skeleton-text-lg w-2/3 mb-2"></div>
              <div className="skeleton-text skeleton-text-sm w-1/2 mb-4"></div>
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-5/6"></div>
              <div className="skeleton-text w-4/5"></div>
            </div>
          </div>
        )

      case 'testimonial':
        return (
          <div className="skeleton-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="skeleton skeleton-circle w-16 h-16"></div>
              <div className="flex-1">
                <div className="skeleton-text skeleton-text-lg w-1/2 mb-2"></div>
                <div className="skeleton-text skeleton-text-sm w-1/3"></div>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton w-5 h-5 rounded"></div>
              ))}
            </div>
            <div className="skeleton-text w-full"></div>
            <div className="skeleton-text w-5/6"></div>
            <div className="skeleton-text w-4/5"></div>
          </div>
        )

      default:
        return (
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="p-6">
              <div className="skeleton-text skeleton-text-lg w-3/4 mb-3"></div>
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-5/6"></div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-pulse">
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}

export function ImageWithLoading({
  src,
  alt,
  className = '',
  containerClassName = ''
}: {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}) {
  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <div className="img-placeholder absolute inset-0 z-10">
        <div className="img-spinner"></div>
      </div>
      <img
        src={src}
        alt={alt}
        className={`img-loading ${className}`}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement
          img.classList.remove('img-loading')
          img.classList.add('img-loaded')
          const placeholder = img.previousElementSibling
          if (placeholder) {
            placeholder.classList.add('hidden')
          }
        }}
      />
    </div>
  )
}

export default CardSkeleton
