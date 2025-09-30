// app/contact/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
    type: 'candidat'
  })
  
  const { loading, error, callApi, reset } = useApi()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await callApi('/contact', {
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
      
      // Message de succès
      alert(result.message || '✅ Votre message a été envoyé avec succès ! Nous vous recontacterons dans les plus brefs délais.')
      
    } catch (err) {
      // L'erreur est déjà gérée par le hook useApi
      console.error('Erreur lors de l\'envoi du message:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Contactez-
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                nous
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Prêt à transformer votre carrière ou à recruter les meilleurs talents ? <span className="font-semibold text-[#ffaf50ff]">Parlons-en !</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Informations de contact */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-8">
                Prenons contact
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Que vous soyez candidat à la recherche de nouvelles opportunités ou entreprise en quête de talents, notre équipe est là pour vous accompagner.
              </p>

              <div className="grid grid-cols-1 gap-8">
                {[
                  {
                    title: 'Notre agence',
                    content: '123 Avenue des Recruteurs\n75001 Paris, France',
                    color: 'from-[#3b5335ff] to-[#2a3d26ff]'
                  },
                  {
                    title: 'Téléphone',
                    content: '+33 1 23 45 67 89',
                    color: 'from-[#ffaf50ff] to-[#ff9500ff]'
                  },
                  {
                    title: 'Email',
                    content: 'contact@hiringsimple.com',
                    color: 'from-[#3b5335ff] to-[#ffaf50ff]'
                  },
                  {
                    title: 'Horaires',
                    content: 'Lun - Ven: 9h00 - 18h00',
                    color: 'from-[#2a3d26ff] to-[#ff9500ff]'
                  }
                ].map((info, index) => (
                  <div 
                    key={index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                          {info.content}
                        </p>
                      </div>
                    </div>
                    
                    {/* Barre colorée en bas avec effet hover */}
                    <div className={`h-2 bg-gradient-to-r ${info.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    
                    {/* Overlay coloré au hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                  </div>
                ))}
              </div>

              {/* Réseaux sociaux */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-[#3b5335ff] mb-6">Suivez-nous</h3>
                <div className="flex space-x-4">
                  {[
                    { icon: '💼', label: 'LinkedIn', color: 'from-[#3b5335ff] to-[#2a3d26ff]' },
                    { icon: '🐦', label: 'Twitter', color: 'from-[#ffaf50ff] to-[#ff9500ff]' },
                    { icon: '📷', label: 'Instagram', color: 'from-[#3b5335ff] to-[#ffaf50ff]' },
                    { icon: '📘', label: 'Facebook', color: 'from-[#2a3d26ff] to-[#ff9500ff]' }
                  ].map((social, index) => (
                    <div 
                      key={index}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
                    >
                      <button className="w-14 h-14 flex items-center justify-center">
                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{social.icon}</span>
                      </button>
                      
                      {/* Barre colorée en bas avec effet hover */}
                      <div className={`h-1 bg-gradient-to-r ${social.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                      
                      {/* Overlay coloré au hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-[#3b5335ff] mb-2">
                    Envoyez-nous un message
                  </h3>
                  <p className="text-gray-600">
                    Nous vous répondons sous 24 heures
                  </p>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700">
                      <span className="text-lg">❌</span>
                      <span className="font-semibold">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type de contact */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Vous êtes *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'candidat', label: 'Candidat' },
                        { value: 'entreprise', label: 'Entreprise' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`group/option relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            formData.type === option.value
                              ? 'border-[#ffaf50ff] bg-[#ffaf50ff]/10 text-[#3b5335ff] shadow-inner'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={option.value}
                            checked={formData.type === option.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="font-semibold">{option.label}</span>
                          
                          {/* Effet hover pour les options */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#ffaf50ff]/5 to-transparent opacity-0 group-hover/option:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all duration-300"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all duration-300"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="sujet" className="block text-sm font-semibold text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <input
                      type="text"
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder="Ex: Candidature Développeur Full Stack"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Décrivez votre projet, vos attentes ou posez-nous vos questions..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all duration-300 resize-none"
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] hover:shadow-2xl'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer le message'
                    )}
                  </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                  En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                </p>
              </div>
              
              {/* Barre colorée en bas avec effet hover */}
              <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Rejoignez les centaines de talents et d'entreprises qui nous font confiance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+33123456789" 
              className="bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Nous appeler
            </a>
            <a 
              href="mailto:contact@hiringsimple.com" 
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300"
            >
              Envoyer un email
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}