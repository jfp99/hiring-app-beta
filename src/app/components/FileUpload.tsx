// src/app/components/FileUpload.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { DocumentType } from '../types/documents'

interface FileUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  documentType?: DocumentType
  entityType?: string
  entityId?: string
  className?: string
}

export default function FileUpload({
  onUpload,
  accept = '.pdf,.doc,.docx,.txt,.rtf',
  multiple = false,
  maxSize = 5,
  documentType = DocumentType.RESUME,
  entityType,
  entityId,
  className = ''
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Validate files
  const validateFiles = (files: FileList | File[]): { valid: File[], errors: string[] } => {
    const validFiles: File[] = []
    const newErrors: string[] = []
    const maxSizeBytes = maxSize * 1024 * 1024

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxSizeBytes) {
        newErrors.push(`${file.name} dépasse la taille maximale de ${maxSize}MB`)
        return
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (accept && !accept.includes(fileExtension)) {
        newErrors.push(`${file.name} n'est pas un type de fichier accepté`)
        return
      }

      validFiles.push(file)
    })

    return { valid: validFiles, errors: newErrors }
  }

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const { valid, errors } = validateFiles(files)

      if (errors.length > 0) {
        setErrors(errors)
      }

      if (valid.length > 0) {
        const filesToAdd = multiple ? valid : [valid[0]]
        setSelectedFiles(filesToAdd)
        onUpload(filesToAdd)
      }
    }
  }, [multiple, onUpload, accept, maxSize])

  // Handle file selection via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const { valid, errors } = validateFiles(files)

      if (errors.length > 0) {
        setErrors(errors)
      }

      if (valid.length > 0) {
        const filesToAdd = multiple ? valid : [valid[0]]
        setSelectedFiles(filesToAdd)
        onUpload(filesToAdd)
      }
    }
  }

  // Remove selected file
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setErrors([])
  }

  // Clear all selections
  const clearAll = () => {
    setSelectedFiles([])
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-[#ffaf50ff] bg-[#ffaf50ff]/10 scale-105'
            : 'border-gray-300 hover:border-[#ffaf50ff] hover:bg-gray-50'
          }
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload icon */}
        <div className="mb-4 flex justify-center">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-[#ffaf50ff]' : 'bg-gray-100'}
            transition-colors duration-300
          `}>
            <span className={`text-3xl ${isDragging ? 'animate-bounce' : ''}`}>
              📁
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-[#3b5335ff]">
            {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
          </p>
          <p className="text-sm text-gray-600">
            ou <span className="text-[#ffaf50ff] font-medium">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Formats acceptés: {accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}
          </p>
          <p className="text-xs text-gray-500">
            Taille maximale: {maxSize}MB {multiple && '• Plusieurs fichiers autorisés'}
          </p>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-1">
                Erreur{errors.length > 1 && 's'} lors de la sélection:
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#3b5335ff]">
              Fichier{selectedFiles.length > 1 && 's'} sélectionné{selectedFiles.length > 1 && 's'}:
            </h4>
            {selectedFiles.length > 1 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Tout supprimer
              </button>
            )}
          </div>

          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeFile(index)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-blue-500">💡</span>
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-medium">Conseils pour un téléchargement réussi:</p>
            <ul className="ml-4 space-y-0.5">
              <li>• Assurez-vous que votre CV est à jour</li>
              <li>• Utilisez le format PDF pour une meilleure compatibilité</li>
              <li>• Évitez les caractères spéciaux dans les noms de fichiers</li>
              <li>• Vérifiez que le fichier ne dépasse pas {maxSize}MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}