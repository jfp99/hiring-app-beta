import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      width,
      height,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]
      relative overflow-hidden
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-400/20 before:to-transparent
      before:animate-shimmer
    `

    const variants = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    }

    const computedStyle = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    }

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${className}
        `}
        style={computedStyle}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Compound components for common patterns
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 ${className}`}>
    <Skeleton variant="circular" width={48} height={48} />
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </div>
    <Skeleton variant="rectangular" height={100} />
  </div>
)

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-4 pb-3 border-b dark:border-gray-700">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="text" width={100} />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
)

export const SkeletonList = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </div>
)
