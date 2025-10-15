// src/app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '../types/auth'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Redirect based on role
    const userRole = (session.user as any)?.role

    switch (userRole) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        router.push('/admin')
        break
      case UserRole.RECRUITER:
        router.push('/recruiter/dashboard')
        break
      case UserRole.HIRING_MANAGER:
        router.push('/hiring-manager/dashboard')
        break
      case UserRole.CLIENT:
        router.push('/client/dashboard')
        break
      case UserRole.CANDIDATE:
        router.push('/candidate/profile')
        break
      default:
        // For any other case, show the general dashboard
        break
    }
  }, [session, status, router])

  // Loading state
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
          <p className="text-[#3b5335ff] font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  // General dashboard for users without specific dashboards yet
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue, {session.user?.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Votre tableau de bord Hi-ring
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full">
              <span className="text-sm font-medium">Rôle:</span>
              <span className="ml-2 px-3 py-1 bg-[#ffaf50ff] text-[#3b5335ff] rounded-full text-sm font-bold">
                {(session.user as any)?.role}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#3b5335ff] mb-8 text-center">
            Actions Rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* View Jobs */}
            <Link
              href="/offres-emploi"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 p-8 text-center"
            >
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-[#3b5335ff] mb-2">
                Voir les Offres
              </h3>
              <p className="text-gray-600">
                Parcourez toutes les offres d'emploi disponibles
              </p>
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 p-8 text-center"
            >
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-[#3b5335ff] mb-2">
                Mon Profil
              </h3>
              <p className="text-gray-600">
                Gérez vos informations personnelles
              </p>
            </Link>

            {/* Contact Support */}
            <Link
              href="/contact"
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 p-8 text-center"
            >
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-[#3b5335ff] mb-2">
                Support
              </h3>
              <p className="text-gray-600">
                Contactez notre équipe pour toute assistance
              </p>
            </Link>
          </div>

          {/* Role-specific message */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Tableau de bord personnalisé en cours de développement
                </h4>
                <p className="text-blue-800">
                  Votre tableau de bord personnalisé pour le rôle{' '}
                  <span className="font-semibold">{(session.user as any)?.role}</span> sera bientôt disponible.
                  En attendant, vous pouvez utiliser les fonctionnalités ci-dessus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}