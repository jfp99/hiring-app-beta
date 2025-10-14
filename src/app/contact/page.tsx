// app/contact/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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

  const [isVisible, setIsVisible] = useState(false)
  
  const { loading, error, callApi } = useApi()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Dans app/contact/page.tsx - modifiez la fonction handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    // Validation côté client avant envoi
    const requiredFields = ['nom', 'email', 'sujet', 'message'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '');

    if (missingFields.length > 0) {
      toast.warning('Veuillez remplir tous les champs obligatoires', {
        description: missingFields.join(', ')
      })
      return;
    }

    // Utiliser l'API appropriée selon le type
    const endpoint = formData.type === 'candidat' ? '/candidats' : '/entreprises';
    
    console.log('📤 [CONTACT] Sending data to:', endpoint, formData);
    
    const result = await callApi(endpoint, {
      method: 'POST',
      body: formData
    })
    
    if (result.success) {
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
      toast.success('Message envoyé avec succès!', {
        description: result.message || 'Nous vous recontacterons dans les plus brefs délais'
      })
    } else {
      throw new Error(result.error || 'Erreur lors de l\'envoi du message')
    }
    
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err)
    // L'erreur est déjà affichée par le hook useApi
  }
}

  const contactInfos = [
    {
      icon: '🏢',
      title: 'Notre agence',
      content: '123 Avenue des Recruteurs\n75001 Paris, France',
      color: 'from-[#3b5335ff] to-[#2a3d26ff]'
    },
    {
      icon: '📞',
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      color: 'from-[#ffaf50ff] to-[#ff9500ff]'
    },
    {
      icon: '✉️',
      title: 'Email',
      content: 'contact@recrutement.com',
      color: 'from-[#3b5335ff] to-[#ffaf50ff]'
    },
    {
      icon: '🕒',
      title: 'Horaires',
      content: 'Lun - Ven: 9h00 - 18h00',
      color: 'from-[#2a3d26ff] to-[#ff9500ff]'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff] dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#ffaf50ff] rounded-full filter blur-3xl opacity-10 animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
              <div className="inline-block bg-[#ffaf50ff]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-[#ffaf50ff] font-semibold">📞 Contactez-nous</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Parlons de
                <span className="block mt-2 bg-gradient-to-r from-[#ffaf50ff] via-[#ff9500ff] to-[#ffaf50ff] bg-clip-text text-transparent animate-pulse">
                  Votre Projet
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 leading-relaxed text-gray-200">
                Notre équipe d'experts est à votre écoute pour transformer vos ambitions en réalité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+33123456789"
                  className="group bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-center relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Appelez-nous
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </a>

                <a
                  href="#form"
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#3b5335ff] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    Formulaire
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop"
                  alt="Équipe de contact Hi-Ring"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/80 to-transparent"></div>

                {/* Floating Stats Cards */}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">24h</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Réponse</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#ffaf50ff]">500+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Clients</div>
                  </div>
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-center transform hover:scale-110 transition-transform">
                    <div className="text-2xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff]">98%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Satisfait</div>
                  </div>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="absolute -top-4 -right-4 bg-[#ffaf50ff] text-[#3b5335ff] px-6 py-3 rounded-full shadow-lg font-bold transform rotate-12 animate-bounce">
                💬 Nous sommes là
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '24h', label: 'Délai de réponse moyen', color: 'from-[#3b5335ff] to-[#2a3d26ff]' },
              { number: '500+', label: 'Candidats accompagnés', color: 'from-[#ffaf50ff] to-[#ff9500ff]' },
              { number: '98%', label: 'Taux de satisfaction', color: 'from-[#3b5335ff] to-[#ffaf50ff]' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                <div className="p-8">
                  <div className="text-4xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium text-lg">{stat.label}</div>
                </div>
                
                <div className={`h-2 bg-gradient-to-r ${stat.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-b from-white dark:from-gray-900 to-[#f8f7f3ff] dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
              Prenons Contact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Que vous soyez candidat ou entreprise, notre équipe est là pour vous accompagner
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {contactInfos.map((info, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{info.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {info.content}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`h-2 bg-gradient-to-r ${info.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    
                    <div className={`absolute inset-0 bg-gradient-to-r ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                  </div>
                ))}
              </div>

              {/* Carte de localisation */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">Notre localisation</h3>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl h-48 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-300">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p>Carte interactive</p>
                      <p className="text-sm">Paris, France</p>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                    Envoyez-nous un message
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nous vous répondons sous 24 heures
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <span className="text-lg">❌</span>
                      <span className="font-semibold">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type de contact */}
                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-3">
                      Vous êtes *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'candidat', label: '👤 Candidat', description: 'Je cherche un emploi' },
                        { value: 'entreprise', label: '🏢 Entreprise', description: 'Je recrute' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`group/option relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            formData.type === option.value
                              ? 'border-[#ffaf50ff] bg-[#ffaf50ff]/10 text-[#3b5335ff] dark:text-[#ffaf50ff] shadow-inner'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                          <span className="font-semibold text-lg mb-1">{option.label}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{option.description}</span>

                          <div className="absolute inset-0 bg-gradient-to-r from-[#ffaf50ff]/5 to-transparent opacity-0 group-hover/option:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                        disabled={loading}
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        disabled={loading}
                        placeholder="Votre numéro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      required
                      disabled={loading}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                      Sujet *
                    </label>
                    <input
                      type="text"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder={
                        formData.type === 'candidat'
                          ? "Ex: Candidature Développeur Full Stack"
                          : "Ex: Besoin de recrutement"
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder={
                        formData.type === 'candidat'
                          ? "Décrivez votre profil, vos compétences et vos attentes..."
                          : "Décrivez vos besoins en recrutement, le poste à pourvoir..."
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] hover:shadow-2xl'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#3b5335ff] border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer le message'
                    )}
                  </button>
                </form>

                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
                  En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                </p>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - NEW */}
      <section className="py-20 bg-gradient-to-b from-white dark:from-gray-900 to-[#f8f7f3ff] dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#ffaf50ff] font-semibold text-sm">👥 Notre Équipe</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
              Rencontrez Nos Experts
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Des professionnels passionnés, à votre écoute pour vous accompagner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Martin',
                role: 'Directrice des Relations Clients',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
                email: 'sophie.martin@hiring.com',
                phone: '+33 1 23 45 67 89',
                specialty: 'Recrutement Tech & Digital'
              },
              {
                name: 'Thomas Dubois',
                role: 'Consultant Senior',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
                email: 'thomas.dubois@hiring.com',
                phone: '+33 1 23 45 67 90',
                specialty: 'Management & Leadership'
              },
              {
                name: 'Marie Lefevre',
                role: 'Responsable Candidats',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
                email: 'marie.lefevre@hiring.com',
                phone: '+33 1 23 45 67 91',
                specialty: 'Accompagnement Carrière'
              }
            ].map((member, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3b5335ff]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white">
                      <p className="text-sm mb-2">{member.specialty}</p>
                      <div className="flex gap-3">
                        <a href={`mailto:${member.email}`} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#ffaf50ff] transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </a>
                        <a href={`tel:${member.phone}`} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#ffaf50ff] transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{member.role}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Paris, France
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section className="py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#ffaf50ff] font-semibold text-sm">💬 Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
              Ils Nous Font Confiance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez les expériences de nos candidats et entreprises partenaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Laurent Mercier',
                role: 'Développeur Full Stack',
                company: 'Recruté chez TechCorp',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                testimonial: 'Grâce à Hiring, j\'ai trouvé le poste de mes rêves en moins de 3 semaines. L\'accompagnement personnalisé et les conseils de Sophie m\'ont vraiment aidé à me démarquer.',
                rating: 5
              },
              {
                name: 'Isabelle Durand',
                role: 'DRH',
                company: 'StartupInnovante',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                testimonial: 'Un service exceptionnel ! L\'équipe a parfaitement compris nos besoins et nous a présenté des candidats de qualité. Nous avons recruté 3 personnes en 2 mois.',
                rating: 5
              },
              {
                name: 'Alexandre Chen',
                role: 'Product Manager',
                company: 'Recruté chez DataCorp',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
                testimonial: 'Professionnalisme, réactivité et écoute. L\'équipe de Hiring a su identifier mes attentes et m\'a accompagné jusqu\'à la signature. Je recommande à 100% !',
                rating: 5
              },
              {
                name: 'Caroline Petit',
                role: 'CEO',
                company: 'DesignStudio',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
                testimonial: 'Hiring est devenu notre partenaire privilégié pour tous nos recrutements. La qualité des profils et le suivi post-recrutement font toute la différence.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-[#ffaf50ff]/20"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[#3b5335ff] dark:text-[#ffaf50ff]">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#ffaf50ff]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  &ldquo;{testimonial.testimonial}&rdquo;
                </p>
                <div className="absolute top-4 right-4 text-6xl text-[#ffaf50ff]/10 font-serif">&ldquo;</div>
                <div className="h-1 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7f3ff] dark:from-gray-800 to-white dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ffaf50ff]/10 dark:bg-[#ffaf50ff]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#ffaf50ff] font-semibold text-sm">🔄 Processus</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Un processus simple et transparent pour vous accompagner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: '📞',
                title: 'Premier Contact',
                description: 'Remplissez le formulaire ou appelez-nous directement',
                color: 'from-[#3b5335ff] to-[#2a3d26ff]',
                image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=300&h=200&fit=crop'
              },
              {
                step: '02',
                icon: '🔍',
                title: 'Analyse Détaillée',
                description: 'Étude approfondie de votre profil ou de vos besoins',
                color: 'from-[#ffaf50ff] to-[#ff9500ff]',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop'
              },
              {
                step: '03',
                icon: '🎯',
                title: 'Solutions Sur Mesure',
                description: 'Propositions personnalisées adaptées à votre situation',
                color: 'from-[#3b5335ff] to-[#ffaf50ff]',
                image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop'
              },
              {
                step: '04',
                icon: '✨',
                title: 'Suivi Continu',
                description: 'Accompagnement personnalisé jusqu\'au succès final',
                color: 'from-[#2a3d26ff] to-[#ff9500ff]',
                image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop'
              }
            ].map((process, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={process.image}
                    alt={process.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-4xl">{process.icon}</div>
                  <div className="absolute top-2 right-2">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-[#3b5335ff]">
                      {process.step}
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-[#3b5335ff] dark:text-[#ffaf50ff] mb-2 group-hover:text-[#2a3d26ff] dark:group-hover:text-[#ff9500ff] transition-colors">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {process.description}
                  </p>
                </div>

                <div className={`h-2 bg-gradient-to-r ${process.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>

                <div className={`absolute inset-0 bg-gradient-to-r ${process.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Rejoignez les centaines de talents et d'entreprises qui nous font confiance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+33123456789"
              className="bg-[#ffaf50ff] text-[#3b5335ff] dark:text-gray-900 px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Nous appeler
            </a>
            <a
              href="mailto:contact@recrutement.com"
              className="border-2 border-white text-white px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-[#3b5335ff] dark:hover:text-gray-900 transform hover:-translate-y-1 transition-all duration-300"
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