// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { useApi } from '../hooks/useApi'

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
      
      alert('✅ Message envoyé avec succès !')
      
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
        <input
          type="text"
          name="nom"
          placeholder="Nom complet *"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        
        <input
          type="tel"
          name="telephone"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <input
        type="email"
        name="email"
        placeholder="Email *"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      
      <input
        type="text"
        name="sujet"
        placeholder="Sujet *"
        value={formData.sujet}
        onChange={(e) => setFormData({...formData, sujet: e.target.value})}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? '📨 Envoi en cours...' : '🚀 Envoyer le message'}
      </button>
    </form>
  )
}