// app/contact/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
    type: 'candidat'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Formulaire soumis:', formData)
    alert('Merci pour votre message ! Nous vous recontacterons rapidement.')
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      sujet: '',
      message: '',
      type: 'candidat'
    })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section améliorée */}
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

      {/* Contact Section améliorée */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Informations de contact améliorées */}
            <div>
              <h2 className="text-4xl font-bold text-[#3b5335ff] mb-8">
                Prenons contact
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Que vous soyez candidat à la recherche de nouvelles opportunités ou entreprise en quête de talents, notre équipe est là pour vous accompagner.
              </p>

              <div className="space-y-8">
                {[
                  {
                    icon: '📍',
                    title: 'Notre agence',
                    content: '123 Avenue des Recruteurs\n75001 Paris, France',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '📞',
                    title: 'Téléphone',
                    content: '+33 1 23 45 67 89',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '✉️',
                    title: 'Email',
                    content: 'contact@hiringsimple.com',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '🕒',
                    title: 'Horaires',
                    content: 'Lun - Ven: 9h00 - 18h00',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((info, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-6 group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <span className="text-2xl text-white">{info.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                        {info.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Réseaux sociaux */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-[#3b5335ff] mb-6">Suivez-nous</h3>
                <div className="flex space-x-4">
                  {['LinkedIn', 'Twitter', 'Instagram', 'Facebook'].map((network, index) => (
                    <button
                      key={network}
                      className="w-14 h-14 bg-white rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center hover:bg-[#ffaf50ff] hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="text-xl">
                        {['💼', '🐦', '📷', '📘'][index]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire de contact amélioré */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[#3b5335ff] mb-2">
                  Envoyez-nous un message
                </h3>
                <p className="text-gray-600">
                  Nous vous répondons sous 24 heures
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de contact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Vous êtes *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'candidat', label: '👤 Candidat', icon: '🎯' },
                      { value: 'entreprise', label: '🏢 Entreprise', icon: '💼' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          formData.type === option.value
                            ? 'border-[#ffaf50ff] bg-orange-50 text-[#3b5335ff] shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
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
                        <div className="text-center">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-semibold">{option.label}</div>
                        </div>
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
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] hover:shadow-2xl'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi en cours...
                    </span>
                  ) : (
                    '📨 Envoyer le message'
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
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
              📞 Nous appeler
            </a>
            <a 
              href="mailto:contact@hiringsimple.com" 
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] transform hover:-translate-y-1 transition-all duration-300"
            >
              ✉️ Envoyer un email
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}