// src/app/auth/login/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Logohiring from '../../../../public/logo-hiring.png'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error on input change
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
            Bienvenue sur Hi-Ring
          </h1>
          <p className="mt-2 text-gray-600">
            Connectez-vous à votre espace administrateur
          </p>
        </div>

        {/* Login Form */}
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
              value={formData.email}
              onChange={handleInputChange}
              placeholder="votre@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
              error={error && error.includes('Email') ? error : undefined}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                label="Mot de passe"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
                error={error && !error.includes('Email') ? error : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff]"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Se souvenir de moi
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Besoin d&apos;aide? Contactez votre administrateur système.
            </p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffaf50ff] mx-auto mb-4"></div>
          <p className="text-[#3b5335ff] font-medium">Chargement...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}