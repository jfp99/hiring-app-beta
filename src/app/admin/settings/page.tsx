'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'
import CustomFieldManager from '@/app/components/CustomFieldManager'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Paramètres
            </h1>
            <p className="text-xl opacity-90">
              Configurez et personnalisez votre système de recrutement
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Configuration Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] flex items-center gap-3">
                    <span>⚙️</span>
                    <span>Configuration Système</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Gérez les paramètres et configurations de votre application
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Custom Fields Manager */}
                    <button
                      onClick={() => setShowCustomFieldManager(true)}
                      className="group text-left w-full"
                    >
                      <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#ffaf50ff] hover:shadow-lg transition-all duration-300 h-full">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-[#ffaf50ff]/10 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🔧
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#3b5335ff] mb-2">
                              Champs Personnalisés
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              Créez et gérez des champs personnalisés pour enrichir les profils candidats
                            </p>
                            <div className="flex items-center gap-2 text-[#ffaf50ff] font-medium text-sm">
                              <span>Gérer les champs</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Placeholder for future settings */}
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-full opacity-50">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                          ⚙️
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-400 mb-2">
                            Autres paramètres
                          </h3>
                          <p className="text-sm text-gray-400">
                            D&apos;autres options de configuration seront ajoutées ici
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] flex items-center gap-3">
                    <span>🔗</span>
                    <span>Liens Rapides</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Accédez rapidement aux autres sections de configuration
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                      href="/admin/workflows"
                      className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-bold text-[#3b5335ff] group-hover:text-purple-600">Workflows</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Automatisation</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/admin/email-config"
                      className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                          🔧
                        </div>
                        <div>
                          <h4 className="font-bold text-[#3b5335ff] group-hover:text-blue-600">Configuration Email</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Paramètres d&apos;envoi</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="/admin/email-templates"
                      className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-400 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                          📧
                        </div>
                        <div>
                          <h4 className="font-bold text-[#3b5335ff] group-hover:text-green-600">Templates Email</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">Modèles d&apos;emails</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Custom Field Manager Modal */}
        {showCustomFieldManager && (
          <CustomFieldManager onClose={() => setShowCustomFieldManager(false)} />
        )}
      </div>
    </AdminGuard>
  )
}
