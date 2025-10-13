'use client'

import { CustomFieldDefinition, CustomFieldType, validateFieldValue } from '@/app/types/customFields'

interface CustomFieldInputProps {
  field: CustomFieldDefinition
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}

export default function CustomFieldInput({
  field,
  value,
  onChange,
  error,
  disabled
}: CustomFieldInputProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  const renderInput = () => {
    const baseInputClasses = `w-full px-4 py-2 border ${
      error ? 'border-red-500' : 'border-gray-300'
    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`

    switch (field.type) {
      case CustomFieldType.TEXT:
      case CustomFieldType.EMAIL:
      case CustomFieldType.PHONE:
      case CustomFieldType.URL:
        return (
          <input
            type={
              field.type === CustomFieldType.EMAIL ? 'email' :
              field.type === CustomFieldType.PHONE ? 'tel' :
              field.type === CustomFieldType.URL ? 'url' :
              'text'
            }
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          />
        )

      case CustomFieldType.TEXTAREA:
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            rows={4}
            className={baseInputClasses}
            required={field.required}
          />
        )

      case CustomFieldType.NUMBER:
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputClasses}
            required={field.required}
          />
        )

      case CustomFieldType.DATE:
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          />
        )

      case CustomFieldType.CHECKBOX:
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff] cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-gray-700">{field.description || field.label}</span>
          </label>
        )

      case CustomFieldType.DROPDOWN:
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">Sélectionner...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case CustomFieldType.MULTI_SELECT:
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleChange([...currentValues, option])
                    } else {
                      handleChange(currentValues.filter((v: string) => v !== option))
                    }
                  }}
                  disabled={disabled}
                  className="w-4 h-4 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff] cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      {field.type !== CustomFieldType.CHECKBOX && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Description (except for checkbox which shows it inline) */}
      {field.description && field.type !== CustomFieldType.CHECKBOX && (
        <p className="text-xs text-gray-500 -mt-1">{field.description}</p>
      )}

      {/* Input */}
      {renderInput()}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Validation hint */}
      {!error && field.validation && (
        <p className="text-xs text-gray-500">
          {field.validation.min !== undefined && field.validation.max !== undefined && (
            field.type === CustomFieldType.NUMBER
              ? `Valeur entre ${field.validation.min} et ${field.validation.max}`
              : `${field.validation.min}-${field.validation.max} caractères`
          )}
          {field.validation.min !== undefined && field.validation.max === undefined && (
            field.type === CustomFieldType.NUMBER
              ? `Minimum: ${field.validation.min}`
              : `Minimum ${field.validation.min} caractères`
          )}
          {field.validation.max !== undefined && field.validation.min === undefined && (
            field.type === CustomFieldType.NUMBER
              ? `Maximum: ${field.validation.max}`
              : `Maximum ${field.validation.max} caractères`
          )}
        </p>
      )}
    </div>
  )
}
