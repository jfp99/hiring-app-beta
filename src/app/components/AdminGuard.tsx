// app/components/AdminGuard.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '@/app/types/auth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Rediriger vers la page de login si non authentifié ou non admin
    const userRole = (session?.user as any)?.role
    const isAdmin = userRole === UserRole.SUPER_ADMIN ||
                    userRole === UserRole.ADMIN ||
                    userRole === UserRole.RECRUITER

    if (!session || !isAdmin) {
      console.log('❌ Access denied, redirecting to login...')
      router.push('/auth/login')
    }
  }, [session, status, router])

  // État de chargement
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
          <p className="text-[#3b5335ff] font-medium">Vérification des accès...</p>
        </div>
      </div>
    )
  }

  // Si pas de session ou pas admin, ne rien afficher (la redirection est en cours)
  const userRole = (session?.user as any)?.role
  const isAdmin = userRole === UserRole.SUPER_ADMIN ||
                  userRole === UserRole.ADMIN ||
                  userRole === UserRole.RECRUITER

  if (!session || !isAdmin) {
    return null
  }

  // Si authentifié et admin, afficher le contenu
  return <>{children}</>
}