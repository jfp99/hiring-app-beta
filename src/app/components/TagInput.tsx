'use client'

import { useState, useRef, useEffect } from 'react'
import { PREDEFINED_TAGS, getTagColorClass, TagColor, createCustomTag, Tag } from '@/app/types/tags'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  allowCustom?: boolean
  showSuggestions?: boolean
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Ajouter des tags...',
  maxTags = 10,
  allowCustom = true,
  showSuggestions = true
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter predefined tags based on input
  const suggestions = PREDEFINED_TAGS.filter(tag =>
    tag.name.toLowerCase().includes(input.toLowerCase()) &&
    !tags.includes(tag.name)
  ).slice(0, 8)

  const handleAddTag = (tagName: string) => {
    if (tags.length >= maxTags) return
    if (tags.includes(tagName)) return

    onChange([...tags, tagName])
    setInput('')
    setShowDropdown(false)
  }

  const handleRemoveTag = (tagName: string) => {
    onChange(tags.filter(t => t !== tagName))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()

      // Check if there's an exact match in suggestions
      const exactMatch = suggestions.find(
        s => s.name.toLowerCase() === input.toLowerCase()
      )

      if (exactMatch) {
        handleAddTag(exactMatch.name)
      } else if (allowCustom) {
        handleAddTag(input.trim())
      } else if (suggestions.length > 0) {
        handleAddTag(suggestions[0].name)
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag if input is empty
      onChange(tags.slice(0, -1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setInput('')
    }
  }

  useEffect(() => {
    if (input && showSuggestions) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [input, showSuggestions])

  return (
    <div className="relative">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tagName) => (
          <span
            key={tagName}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTagColorClass(tagName)}`}
          >
            {tagName}
            <button
              type="button"
              onClick={() => handleRemoveTag(tagName)}
              className="hover:scale-110 transition-transform"
              aria-label={`Remove ${tagName}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input Field */}
      {tags.length < maxTags && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => handleAddTag(tag.name)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColorClass(tag.name)}`}>
                    {tag.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tag.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No suggestions, custom tag hint */}
          {showDropdown && suggestions.length === 0 && input && allowCustom && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="px-3 py-2 text-sm text-gray-600">
                Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Entrée</kbd> pour créer "{input}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tags limit indicator */}
      {tags.length >= maxTags && (
        <p className="text-xs text-gray-500 mt-1">
          Limite de {maxTags} tags atteinte
        </p>
      )}
    </div>
  )
}
