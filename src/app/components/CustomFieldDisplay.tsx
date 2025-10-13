'use client'

import { CustomFieldDefinition, CustomFieldType } from '@/app/types/customFields'

interface CustomFieldDisplayProps {
  field: CustomFieldDefinition
  value: any
}

export default function CustomFieldDisplay({ field, value }: CustomFieldDisplayProps) {
  const renderValue = () => {
    // Handle empty values
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-400 italic">Non renseigné</span>
    }

    switch (field.type) {
      case CustomFieldType.DATE:
        return (
          <span className="text-gray-900">
            {new Date(value).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        )

      case CustomFieldType.CHECKBOX:
        return (
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? '✓ Oui' : '✗ Non'}
          </span>
        )

      case CustomFieldType.MULTI_SELECT:
        return (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(value) && value.map((v: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {v}
              </span>
            ))}
          </div>
        )

      case CustomFieldType.URL:
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            {value}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )

      case CustomFieldType.EMAIL:
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {value}
          </a>
        )

      case CustomFieldType.PHONE:
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {value}
          </a>
        )

      case CustomFieldType.TEXTAREA:
        return (
          <p className="text-gray-900 whitespace-pre-wrap">{value}</p>
        )

      case CustomFieldType.NUMBER:
        return (
          <span className="text-gray-900 font-medium">{value.toLocaleString('fr-FR')}</span>
        )

      case CustomFieldType.DROPDOWN:
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {value}
          </span>
        )

      default:
        return <span className="text-gray-900">{String(value)}</span>
    }
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-shrink-0 min-w-[200px]">
          <span className="text-sm font-medium text-gray-600">{field.label}</span>
          {field.description && (
            <p className="text-xs text-gray-400 mt-1">{field.description}</p>
          )}
        </div>
        <div className="flex-1 text-right">
          {renderValue()}
        </div>
      </div>
    </div>
  )
}
