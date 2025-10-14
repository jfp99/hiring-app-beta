// app/admin/login/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLogin() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new login page
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
        <p className="text-[#3b5335ff] dark:text-gray-200 font-medium">Redirection vers la nouvelle page de connexion...</p>
      </div>
    </div>
  )
}
