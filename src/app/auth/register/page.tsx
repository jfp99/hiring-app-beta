// src/app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, User, Building, Phone, MessageSquare, CheckCircle } from 'lucide-react'
import Logohiring from '../../../../public/logo-hiring.png'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Implement registration request API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
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
              Demande envoyée!
            </h1>
            <p className="text-gray-600 mb-6">
              Votre demande d'accès a été envoyée avec succès. Notre équipe vous contactera sous 24-48h pour finaliser votre inscription.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Un email de confirmation vous a été envoyé à <strong>{formData.email}</strong>
            </p>
            <Link href="/auth/login">
              <Button variant="secondary" className="w-full mb-3">
                Retour à la connexion
              </Button>
            </Link>
            <Link href="/">
              <Button variant="tertiary" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-600">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
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
            Demander un accès
          </h1>
          <p className="mt-2 text-gray-600">
            Remplissez le formulaire ci-dessous pour obtenir un compte
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span>❌</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Les comptes sont créés manuellement pour garantir la sécurité de notre plateforme. Vous recevrez un email avec vos identifiants sous 24-48h.
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <Input
                id="name"
                name="name"
                type="text"
                required
                label="Nom complet"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Jean Dupont"
                leftIcon={<User className="w-5 h-5" />}
                autoComplete="name"
              />

              {/* Email Field */}
              <Input
                id="email"
                name="email"
                type="email"
                required
                label="Adresse email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jean@entreprise.com"
                leftIcon={<Mail className="w-5 h-5" />}
                autoComplete="email"
              />

              {/* Company Field */}
              <Input
                id="company"
                name="company"
                type="text"
                required
                label="Entreprise"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Nom de l'entreprise"
                leftIcon={<Building className="w-5 h-5" />}
                autoComplete="organization"
              />

              {/* Phone Field */}
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                label="Téléphone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+33 1 23 45 67 89"
                leftIcon={<Phone className="w-5 h-5" />}
                autoComplete="tel"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Décrivez brièvement vos besoins..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-[#ffaf50ff] border-gray-300 rounded focus:ring-[#ffaf50ff] mt-1"
              />
              <span className="ml-2 text-sm text-gray-600">
                J'accepte les{' '}
                <Link href="/privacy" className="text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium">
                  politique de confidentialité
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Envoyer la demande
            </Button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Vous avez déjà un compte?{' '}
            </span>
            <Link
              href="/auth/login"
              className="text-sm text-[#ffaf50ff] hover:text-[#ff9500ff] font-medium"
            >
              Se connecter
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
