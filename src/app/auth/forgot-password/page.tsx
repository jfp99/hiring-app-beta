// src/app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Logohiring from '../../../../public/logo-hiring.png'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src={Logohiring}
                alt="Hi-ring Logo"
                width={200}
                height={80}
                className="h-16 w-auto object-contain mx-auto"
                priority
              />
            </Link>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#3b5335ff] mb-2">
              Email envoyé!
            </h1>
            <p className="text-gray-600 mb-6">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vérifiez également votre dossier de courrier indésirable.
            </p>
            <Link href="/auth/login">
              <Button variant="secondary" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#3b5335ff]">
              Retour à l&apos;accueil
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#3b5335ff]">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src={Logohiring}
              alt="Hi-ring Logo"
              width={200}
              height={80}
              className="h-16 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-[#3b5335ff]">
            Mot de passe oublié?
          </h1>
          <p className="mt-2 text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span>❌</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <Input
              id="email"
              name="email"
              type="email"
              required
              label="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Envoyer le lien
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#3b5335ff]">
            Retour à l&apos;accueil
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#3b5335ff]">
            Nous contacter
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#3b5335ff]">
            Confidentialité
          </Link>
        </div>
      </div>
    </div>
  )
}
