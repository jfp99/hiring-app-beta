'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-lg shadow-lg border',
          title: 'font-semibold',
          description: 'text-sm',
          actionButton: 'bg-primary-500 text-white hover:bg-primary-600',
          cancelButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          closeButton: 'bg-white hover:bg-gray-100',
        },
      }}
    />
  )
}
