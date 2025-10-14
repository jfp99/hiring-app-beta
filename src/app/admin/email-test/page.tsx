'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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

export default function EmailTestPage() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
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
    } catch (err) {
      console.error('Error fetching email status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    if (!testEmail) {
      toast.warning('Veuillez entrer une adresse email', {
        description: 'Une adresse email est requise pour envoyer un test'
      })
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })

      const data = await response.json()

      setResult({
        success: data.success,
        message: data.message || data.error || 'Réponse inconnue',
        provider: data.provider
      })

      if (data.success) {
        setTestEmail('')
      }
    } catch (err: any) {
      console.error('Error sending test email:', err)
      setResult({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de test'
      })
    } finally {
      setSending(false)
    }
  }

  if (loading || !emailStatus) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Chargement...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
        <AdminHeader />

        {/* Header */}
        <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="text-white/80 hover:text-white mb-4 inline-block">
              ← Retour au tableau de bord
            </Link>

            <h1 className="text-4xl font-bold mb-2">Configuration Email</h1>
            <p className="text-xl opacity-90">
              Testez et vérifiez votre configuration email pour les workflows automatiques
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">Statut de Configuration</h2>

              <div className="space-y-4">
                {/* Provider Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Fournisseur d'Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{emailStatus.provider}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    emailStatus.status === 'configured'
                      ? 'bg-green-100 text-green-800 dark:text-green-300'
                      : emailStatus.status === 'mock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800 dark:text-red-300'
                  }`}>
                    {emailStatus.status === 'configured' ? '✓ Configuré' :
                     emailStatus.status === 'mock' ? '⚠️ Mode Test' : '✗ Non Configuré'}
                  </span>
                </div>

                {/* SendGrid Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">SendGrid</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {emailStatus.details.sendgrid ? 'Clé API configurée' : 'Non configuré'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    emailStatus.details.sendgrid
                      ? 'bg-green-100 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {emailStatus.details.sendgrid ? '✓' : '—'}
                  </span>
                </div>

                {/* SMTP Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">SMTP</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {emailStatus.details.smtp ? 'Serveur SMTP configuré' : 'Non configuré'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    emailStatus.details.smtp
                      ? 'bg-green-100 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {emailStatus.details.smtp ? '✓' : '—'}
                  </span>
                </div>

                {/* From Email */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Expéditeur</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{emailStatus.details.fromName}</span>
                    {' <'}
                    <span className="text-blue-600">{emailStatus.details.from}</span>
                    {'>'}
                  </p>
                </div>
              </div>

              {/* Warning if not configured */}
              {emailStatus.status === 'mock' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">Mode Test Actif</p>
                      <p className="text-sm text-yellow-700">
                        Les emails ne seront pas réellement envoyés. Configurez SendGrid ou SMTP
                        pour activer l'envoi d'emails réels.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Test Email Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">Envoyer un Email de Test</h2>

              <form onSubmit={handleTestEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse Email de Test
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="votre.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Un email de test sera envoyé à cette adresse pour vérifier la configuration
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending || !testEmail}
                  className="w-full bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3b5335ff]"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      📧 Envoyer Email de Test
                    </>
                  )}
                </button>
              </form>

              {/* Result */}
              {result && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-1 ${
                        result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                      }`}>
                        {result.success ? 'Succès!' : 'Échec'}
                      </p>
                      <p className={`text-sm ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.provider && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Fournisseur: {result.provider}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Setup Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#3b5335ff] mb-4">Configuration SendGrid</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">1. Créer un compte SendGrid</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Inscrivez-vous gratuitement sur{' '}
                    <a
                      href="https://signup.sendgrid.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      sendgrid.com
                    </a>{' '}
                    (100 emails/jour gratuits)
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">2. Créer une clé API</p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                    <li>Allez dans Settings → API Keys</li>
                    <li>Cliquez sur "Create API Key"</li>
                    <li>Nom: "Hi-Ring Recruitment"</li>
                    <li>Type: "Full Access" (ou "Restricted Access" avec Mail Send uniquement)</li>
                    <li>Copiez la clé (elle ne sera affichée qu'une fois!)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">3. Configurer dans .env.local</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono">
{`# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx

# Email Settings
EMAIL_FROM=noreply@votre-domaine.com
EMAIL_FROM_NAME=Hi-Ring Recrutement`}
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">4. Redémarrer le serveur</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-xs font-mono">npm run dev</pre>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">5. Tester la configuration</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Utilisez le formulaire ci-dessus pour envoyer un email de test!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AdminGuard>
  )
}
