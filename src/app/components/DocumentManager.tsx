// src/app/components/DocumentManager.tsx
'use client'

import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import { DocumentType, DocumentStatus } from '../types/documents'
import { useApi } from '../hooks/useApi'

interface Document {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  type: DocumentType
  status: DocumentStatus
  description?: string
  uploadedAt: string
  uploadedBy: string
}

interface DocumentManagerProps {
  entityType: 'candidate' | 'company' | 'job' | 'application'
  entityId: string
  canUpload?: boolean
  canDelete?: boolean
  title?: string
}

export default function DocumentManager({
  entityType,
  entityId,
  canUpload = true,
  canDelete = true,
  title = 'Documents'
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [filter, setFilter] = useState<DocumentType | 'all'>('all')
  const { loading, error, callApi } = useApi()

  // Load documents
  useEffect(() => {
    fetchDocuments()
  }, [entityType, entityId, filter])

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({
        entityType,
        entityId
      })

      if (filter !== 'all') {
        params.append('type', filter)
      }

      const response = await callApi(`/documents?${params.toString()}`)
      setDocuments(response.documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    setIsUploading(true)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', DocumentType.RESUME)
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)

      try {
        await fetch('/api/documents', {
          method: 'POST',
          body: formData
        })
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    }

    setIsUploading(false)
    fetchDocuments() // Refresh list
  }

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
      return
    }

    try {
      await callApi(`/documents/${documentId}`, { method: 'DELETE' })
      fetchDocuments() // Refresh list
    } catch (err) {
      console.error('Error deleting document:', err)
    }
  }

  // Handle document download
  const handleDownload = (documentId: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = `/api/documents/${documentId}?action=download`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle document preview
  const handlePreview = (document: Document) => {
    if (document.mimeType.startsWith('image/') || document.mimeType === 'application/pdf') {
      setSelectedDoc(document)
    } else {
      // For non-previewable files, trigger download
      handleDownload(document.id, document.originalName)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Get status badge color
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return 'bg-green-100 text-green-800'
      case DocumentStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case DocumentStatus.PENDING_REVIEW:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get file icon
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <div className="document-manager">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3b5335ff]">{title}</h2>
          <span className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 && 's'}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', ...Object.values(DocumentType)].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as DocumentType | 'all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === type
                  ? 'bg-[#ffaf50ff] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Tous' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Upload section */}
      {canUpload && (
        <div className="mb-8">
          <FileUpload
            onUpload={handleUpload}
            multiple={true}
            maxSize={10}
            entityType={entityType}
            entityId={entityId}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffaf50ff]"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Documents grid */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all group"
            >
              {/* Document header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate" title={doc.originalName}>
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>

              {/* Document info */}
              <div className="space-y-1 mb-4">
                <p className="text-xs text-gray-600">
                  Type: <span className="font-medium">{doc.type.replace('_', ' ')}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Ajouté le: <span className="font-medium">
                    {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                  </span>
                </p>
                {doc.description && (
                  <p className="text-xs text-gray-600 italic">
                    {doc.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePreview(doc)}
                  className="flex-1 bg-[#3b5335ff] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#2a3d26ff] transition-colors"
                >
                  Voir
                </button>
                <button
                  onClick={() => handleDownload(doc.id, doc.originalName)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Télécharger
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && documents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {canUpload
              ? 'Commencez par télécharger votre premier document'
              : 'Aucun document n\'a été ajouté pour le moment'}
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900 truncate">
                {selectedDoc.originalName}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal content */}
            <div className="p-4 overflow-auto max-h-[70vh]">
              {selectedDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={`/api/documents/${selectedDoc.id}?action=preview`}
                  className="w-full h-[60vh] border-0"
                  title={selectedDoc.originalName}
                />
              ) : selectedDoc.mimeType.startsWith('image/') ? (
                <img
                  src={`/api/documents/${selectedDoc.id}?action=preview`}
                  alt={selectedDoc.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <button
                    onClick={() => handleDownload(selectedDoc.id, selectedDoc.originalName)}
                    className="mt-4 bg-[#ffaf50ff] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#ff9500ff] transition-colors"
                  >
                    Télécharger le fichier
                  </button>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => handleDownload(selectedDoc.id, selectedDoc.originalName)}
                className="bg-[#3b5335ff] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a3d26ff] transition-colors"
              >
                Télécharger
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}