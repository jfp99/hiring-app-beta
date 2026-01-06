// src/app/components/offres/BulkActions.tsx
'use client'

import { useState } from 'react'
import {
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Copy,
  Download,
  MoreHorizontal,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { OffreEnhanced, OffreStatut, BulkActionRequest } from '@/app/types/offres'
import { STATUT_CONFIG } from '@/app/types/offres'

interface BulkActionsProps {
  selectedIds: string[]
  offres: OffreEnhanced[]
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkAction: (action: BulkActionRequest) => Promise<void>
  totalCount: number
  isLoading?: boolean
}

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${
            confirmVariant === 'danger'
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              confirmVariant === 'danger'
                ? 'text-red-600 dark:text-red-400'
                : 'text-primary-600 dark:text-primary-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isLoading ? 'En cours...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BulkActions({
  selectedIds,
  offres,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  totalCount,
  isLoading
}: BulkActionsProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: BulkActionRequest | null
    title: string
    message: string
    confirmLabel: string
    confirmVariant: 'danger' | 'primary'
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: '',
    confirmLabel: '',
    confirmVariant: 'primary'
  })
  const [actionLoading, setActionLoading] = useState(false)

  const selectedCount = selectedIds.length
  const allSelected = selectedCount === totalCount && totalCount > 0
  const someSelected = selectedCount > 0 && selectedCount < totalCount

  // Get selected offres
  const selectedOffres = offres.filter((o) => selectedIds.includes(o.id))

  // Export to Excel
  const handleExport = () => {
    const exportData = selectedOffres.map((offre) => ({
      'Titre': offre.titre,
      'Entreprise': offre.entreprise,
      'Lieu': offre.lieu,
      'Type de contrat': offre.typeContrat,
      'Cat\u00e9gorie': offre.categorie,
      'Salaire': offre.salaire || '',
      'Statut': STATUT_CONFIG[offre.statut].label,
      'Date de cr\u00e9ation': format(new Date(offre.createdAt), 'dd/MM/yyyy', { locale: fr }),
      'Email de contact': offre.emailContact,
      'Description': offre.description?.replace(/<[^>]*>/g, '') || ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Offres')

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 20)
    }))
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `offres_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  // Confirm and execute action
  const confirmAction = (action: BulkActionRequest, title: string, message: string, confirmLabel: string, variant: 'danger' | 'primary' = 'primary') => {
    setConfirmDialog({
      isOpen: true,
      action,
      title,
      message,
      confirmLabel,
      confirmVariant: variant
    })
  }

  const executeAction = async () => {
    if (!confirmDialog.action) return

    setActionLoading(true)
    try {
      await onBulkAction(confirmDialog.action)
      onClearSelection()
    } finally {
      setActionLoading(false)
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
    }
  }

  // Action handlers
  const handlePublish = () => {
    confirmAction(
      { offreIds: selectedIds, action: 'changeStatus', targetStatus: 'active' },
      'Publier les offres',
      `Vous allez publier ${selectedCount} offre(s). Elles seront imm\u00e9diatement visibles sur le site.`,
      'Publier',
      'primary'
    )
  }

  const handleUnpublish = () => {
    confirmAction(
      { offreIds: selectedIds, action: 'changeStatus', targetStatus: 'draft' },
      'D\u00e9publier les offres',
      `Vous allez d\u00e9publier ${selectedCount} offre(s). Elles ne seront plus visibles sur le site.`,
      'D\u00e9publier',
      'primary'
    )
  }

  const handleArchive = () => {
    confirmAction(
      { offreIds: selectedIds, action: 'archive' },
      'Archiver les offres',
      `Vous allez archiver ${selectedCount} offre(s). Vous pourrez les restaurer ult\u00e9rieurement.`,
      'Archiver',
      'primary'
    )
  }

  const handleDelete = () => {
    confirmAction(
      { offreIds: selectedIds, action: 'delete' },
      'Supprimer les offres',
      `Vous allez supprimer d\u00e9finitivement ${selectedCount} offre(s). Cette action est irr\u00e9versible.`,
      'Supprimer',
      'danger'
    )
  }

  const handleDuplicate = () => {
    confirmAction(
      { offreIds: selectedIds, action: 'duplicate' },
      'Dupliquer les offres',
      `Vous allez cr\u00e9er ${selectedCount} copie(s) en tant que brouillon(s).`,
      'Dupliquer',
      'primary'
    )
  }

  const handleStatusChange = (status: OffreStatut) => {
    const config = STATUT_CONFIG[status]
    confirmAction(
      { offreIds: selectedIds, action: 'changeStatus', targetStatus: status },
      `Changer le statut`,
      `Vous allez d\u00e9finir ${selectedCount} offre(s) comme "${config.label}".`,
      'Confirmer',
      'primary'
    )
    setShowStatusMenu(false)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className="sticky top-16 z-20 flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl shadow-sm">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-2 text-primary-700 dark:text-primary-300"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5" />
            ) : someSelected ? (
              <div className="relative">
                <Square className="w-5 h-5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-sm" />
                </div>
              </div>
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>

          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {selectedCount} offre{selectedCount > 1 ? 's' : ''} s\u00e9lectionn\u00e9e{selectedCount > 1 ? 's' : ''}
          </span>

          <button
            onClick={onClearSelection}
            className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
            title="Effacer la s\u00e9lection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick actions */}
          <button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            title="Publier"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Publier</span>
          </button>

          <button
            onClick={handleUnpublish}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="D\u00e9publier"
          >
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">D\u00e9publier</span>
          </button>

          <button
            onClick={handleArchive}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            title="Archiver"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archiver</span>
          </button>

          <button
            onClick={handleDuplicate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Dupliquer</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Exporter en Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>

          {/* Status change dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Changer le statut"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Changer le statut
                  </div>
                  {(Object.keys(STATUT_CONFIG) as OffreStatut[]).map((status) => {
                    const config = STATUT_CONFIG[status]
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span className={`w-2 h-2 rounded-full ${config.bgColor}`} style={{ backgroundColor: config.color.replace('text-', '') }} />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={executeAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        isLoading={actionLoading}
      />
    </>
  )
}

// Selection checkbox for list/grid items
export function SelectionCheckbox({
  id,
  isSelected,
  onToggle
}: {
  id: string
  isSelected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle(id)
      }}
      className={`p-1 rounded transition-colors ${
        isSelected
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
      }`}
    >
      {isSelected ? (
        <CheckSquare className="w-5 h-5" />
      ) : (
        <Square className="w-5 h-5" />
      )}
    </button>
  )
}
