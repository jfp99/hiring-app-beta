// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logohiring from '../../../../public/logo-hiring.png'

export default function LoginPage() {
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
            Connexion
          </h1>
          <p className="mt-2 text-gray-600">
            Accédez à votre espace professionnel
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
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#3b5335ff] mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                placeholder="votre@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#3b5335ff] mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
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
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="mt-6 space-y-3">
            {/* Demo Accounts Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Comptes de démonstration:
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <span className="font-semibold">Admin:</span> admin@hi-ring.com / Admin123!@#
                </div>
                <div>
                  <span className="font-semibold">Recruteur:</span> recruiter@hi-ring.com / Admin123!@#
                </div>
                <div>
                  <span className="font-semibold">Client:</span> client@techcorp.com / Admin123!@#
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Pas encore de compte?{' '}
              </span>
              <Link
                href="/auth/register"
                className="text-sm text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium"
              >
                Demander un accès
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#3b5335ff]">
            Retour à l'accueil
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