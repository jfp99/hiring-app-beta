'use client'

import { getTagColorClass } from '@/app/types/tags'

interface TagProps {
  name: string
  onRemove?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Tag({ name, onRemove, size = 'sm', className = '' }: TagProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${getTagColorClass(name)} ${sizeClasses[size]} ${className}`}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:scale-110 transition-transform"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}

// Tag List Component
interface TagListProps {
  tags: string[]
  onRemove?: (tag: string) => void
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TagList({ tags, onRemove, maxDisplay, size = 'sm', className = '' }: TagListProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags
  const hiddenCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0

  if (tags.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayTags.map((tag) => (
        <Tag
          key={tag}
          name={tag}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
          size={size}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
          +{hiddenCount}
        </span>
      )}
    </div>
  )
}
