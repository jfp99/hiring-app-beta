// components/DeleteConfirmModal.tsx
'use client'

import { X, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  isDeleting?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
          {/* Header */}
          <div className="relative border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
            {itemName && (
              <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                  {itemName}
                </p>
              </div>
            )}
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300">
                ⚠️ Cette action est irréversible et ne peut pas être annulée.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 p-6">
            <Button
              type="button"
              onClick={onClose}
              variant="tertiary"
              size="lg"
              className="flex-1"
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              variant="secondary"
              size="lg"
              className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white"
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
