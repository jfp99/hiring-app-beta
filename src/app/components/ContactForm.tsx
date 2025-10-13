// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { User, Mail, Phone, MessageSquare, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '../hooks/useApi'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function ContactForm() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
    type: 'candidat'
  })

  const { loading, error, callApi } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await callApi('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      // Reset du formulaire après succès
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: '',
        type: 'candidat'
      })

      toast.success('Message envoyé avec succès!', {
        description: 'Nous vous répondrons dans les plus brefs délais'
      })

    } catch (err) {
      console.error('❌ Erreur envoi message:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}
      
      {/* Type de contact */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Vous êtes *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="candidat">👤 Candidat</option>
          <option value="entreprise">🏢 Entreprise</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          name="nom"
          placeholder="Votre nom complet"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          leftIcon={<User className="w-5 h-5" />}
          required
        />

        <Input
          type="tel"
          name="telephone"
          placeholder="Votre téléphone"
          value={formData.telephone}
          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
          leftIcon={<Phone className="w-5 h-5" />}
        />
      </div>

      <Input
        type="email"
        name="email"
        placeholder="votre@email.com"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        leftIcon={<Mail className="w-5 h-5" />}
        required
      />

      <Input
        type="text"
        name="sujet"
        placeholder="Objet de votre message"
        value={formData.sujet}
        onChange={(e) => setFormData({...formData, sujet: e.target.value})}
        leftIcon={<MessageSquare className="w-5 h-5" />}
        required
      />
      
      <textarea
        name="message"
        placeholder="Votre message *"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        rows={6}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        required
      />
      
      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        size="lg"
        isLoading={loading}
        className="w-full"
      >
        Envoyer le message
      </Button>
    </form>
  )
}