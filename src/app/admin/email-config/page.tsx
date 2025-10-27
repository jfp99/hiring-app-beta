'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BarChart3, Check, AlertTriangle, X, Mail, User, TestTube, Send, FileText, Lightbulb } from 'lucide-react'
import AdminHeader from '@/app/components/AdminHeader'
import Footer from '@/app/components/Footer'
import AdminGuard from '@/app/components/AdminGuard'

interface EmailStatus {
  status: 'configured' | 'mock' | 'not_configured'
  provider: string | null
  details: {
    sendgrid: boolean
    smtp: boolean
    from: string
    fromName: string
  }
}

export default function EmailConfigPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message?: string
    error?: string
    provider?: string
  } | null>(null)

  useEffect(() => {
    fetchEmailStatus()
  }, [])

  const fetchEmailStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/email/test')
      const data = await response.json()

      if (response.ok) {
        setEmailStatus(data)
      }
    } catch (error) {
      console.error('Error fetching email status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testEmail) {
      setTestResult({
        success: false,
        error: 'Veuillez entrer une adresse email'
      })
      return
    }

    try {
      setTesting(true)
      setTestResult(null)

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })

      const data = await response.json()
      setTestResult(data)

      // Refresh status after test
      await fetchEmailStatus()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du test'
      setTestResult({
        success: false,
        error: errorMessage
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-100 text-green-800 dark:text-green-300 border-green-300'
      case 'mock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-red-100 text-red-800 dark:text-red-300 border-red-300'
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Configuration Email
            </h1>
            <p className="text-xl opacity-90">
              Configurez et testez votre service d'envoi d&apos;emails
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-accent-500" />
                    <span>Statut actuel</span>
                  </h2>

                  {emailStatus && (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Statut:</span>
                        <span className={`px-4 py-2 rounded-lg border-2 font-bold ${getStatusBadge(emailStatus.status)}`}>
                          {emailStatus.status === 'configured' ? <><Check className="w-4 h-4 inline" /> Configuré</> :
                           emailStatus.status === 'mock' ? <><AlertTriangle className="w-4 h-4 inline" /> Mode Test (Mock)</> :
                           <><X className="w-4 h-4 inline" /> Non configuré</>}
                        </span>
                      </div>

                      {/* Provider */}
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Fournisseur:</span>
                        <span className="text-[#3b5335ff] font-bold">
                          {emailStatus.provider || 'Aucun'}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {emailStatus.details.sendgrid ?
                              <Check className="w-8 h-8 text-green-500" /> :
                              <X className="w-8 h-8 text-red-500" />
                            }
                            <span className="font-semibold text-gray-700 dark:text-gray-300">SendGrid</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {emailStatus.details.sendgrid ? 'API Key configurée' : 'Non configuré'}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {emailStatus.details.smtp ?
                              <Check className="w-8 h-8 text-green-500" /> :
                              <X className="w-8 h-8 text-red-500" />
                            }
                            <span className="font-semibold text-gray-700 dark:text-gray-300">SMTP</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {emailStatus.details.smtp ? 'Identifiants configurés' : 'Non configuré'}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-6 h-6 text-primary-600 dark:text-accent-500" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Email expéditeur</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                            {emailStatus.details.from}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-6 h-6 text-primary-600 dark:text-accent-500" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Nom expéditeur</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {emailStatus.details.fromName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Email Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 flex items-center gap-3">
                    <TestTube className="w-6 h-6 text-accent-500" />
                    <span>Tester l'envoi d'email</span>
                  </h2>

                  <form onSubmit={handleTestEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adresse email de test
                      </label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="votre.email@example.com"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled={testing}
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Un email de test sera envoyé à cette adresse
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={testing || !testEmail}
                      className="w-full bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {testing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3b5335ff]"></div>
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Envoyer un email de test</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Test Result */}
                  {testResult && (
                    <div className={`mt-6 p-4 rounded-lg border-2 ${
                      testResult.success
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {testResult.success ? <Check className="w-5 h-5 text-green-500 inline" /> : <X className="w-5 h-5 text-red-500 inline" />}
                        </span>
                        <div className="flex-1">
                          <p className={`font-bold ${
                            testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                          }`}>
                            {testResult.success ? 'Succès!' : 'Erreur'}
                          </p>
                          <p className={`mt-1 text-sm ${
                            testResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {testResult.message || testResult.error}
                          </p>
                          {testResult.provider && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                              Fournisseur: {testResult.provider}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration Instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-[#3b5335ff] mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-accent-500" />
                    <span>Configuration</span>
                  </h2>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Pour configurer l'envoi d&apos;emails, ajoutez les variables suivantes dans votre fichier <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env.local</code>:
                    </p>

                    <div className="space-y-6">
                      {/* SendGrid Option */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-[#3b5335ff] mb-2">
                          Option 1: SendGrid (Recommandé)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Service d&apos;emailing professionnel avec 100 emails/jour gratuits
                        </p>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <div>SENDGRID_API_KEY=your_sendgrid_api_key</div>
                          <div>EMAIL_FROM=noreply@your-domain.com</div>
                          <div>EMAIL_FROM_NAME=Your App Name</div>
                        </div>
                        <a
                          href="https://signup.sendgrid.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-[#ffaf50ff] hover:underline text-sm font-medium"
                        >
                          → Créer un compte SendGrid gratuit
                        </a>
                      </div>

                      {/* SMTP/Gmail Option */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-[#3b5335ff] mb-2">
                          Option 2: SMTP (Gmail, Outlook, etc.)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Utilisez votre compte email existant
                        </p>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <div>EMAIL_PROVIDER=smtp</div>
                          <div>SMTP_HOST=smtp.gmail.com</div>
                          <div>SMTP_PORT=587</div>
                          <div>SMTP_SECURE=false</div>
                          <div>SMTP_USER=your.email@gmail.com</div>
                          <div>SMTP_PASS=your_app_password</div>
                          <div>EMAIL_FROM=your.email@gmail.com</div>
                          <div>EMAIL_FROM_NAME=Your App Name</div>
                        </div>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-[#ffaf50ff] hover:underline text-sm font-medium"
                        >
                          → Générer un mot de passe d&apos;application Gmail
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Note:</strong> Après avoir ajouté les variables d&apos;environnement, redémarrez le serveur de développement pour que les changements prennent effet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
