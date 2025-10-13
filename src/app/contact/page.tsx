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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#ffaf50ff] rounded-full filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#ffaf50ff] rounded-full filter blur-xl opacity-10 animate-bounce"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Contactez-
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                nous
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Prêt à transformer votre carrière ou à recruter les meilleurs talents ?{' '}
              <span className="font-semibold text-[#ffaf50ff]">Parlons-en !</span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '24h', label: 'Délai de réponse moyen', color: 'from-[#3b5335ff] to-[#2a3d26ff]' },
              { number: '500+', label: 'Candidats accompagnés', color: 'from-[#ffaf50ff] to-[#ff9500ff]' },
              { number: '98%', label: 'Taux de satisfaction', color: 'from-[#3b5335ff] to-[#ffaf50ff]' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
              >
                <div className="p-8">
                  <div className="text-4xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
                </div>
                
                <div className={`h-2 bg-gradient-to-r ${stat.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
              Prenons Contact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{info.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#3b5335ff] mb-2 group-hover:text-[#2a3d26ff] transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
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
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-4">Notre localisation</h3>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-48 flex items-center justify-center">
                    <div className="text-center text-gray-500">
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
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-3">
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
                          <span className="font-semibold text-lg mb-1">{option.label}</span>
                          <span className="text-sm text-gray-500">{option.description}</span>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-[#ffaf50ff]/5 to-transparent opacity-0 group-hover/option:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        required
                        disabled={loading}
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        disabled={loading}
                        placeholder="Votre numéro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                      required
                      disabled={loading}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all resize-none"
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

                <p className="text-center text-gray-500 text-sm mt-6">
                  En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                </p>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-[#3b5335ff] to-[#ffaf50ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3b5335ff] mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et efficace pour vous accompagner
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Vous contactez',
                description: 'Remplissez le formulaire ou appelez-nous',
                color: 'from-[#3b5335ff] to-[#2a3d26ff]'
              },
              {
                step: '02',
                title: 'Analyse besoin',
                description: 'Étude de votre profil ou de vos besoins',
                color: 'from-[#ffaf50ff] to-[#ff9500ff]'
              },
              {
                step: '03',
                title: 'Proposition',
                description: 'Solutions adaptées à votre situation',
                color: 'from-[#3b5335ff] to-[#ffaf50ff]'
              },
              {
                step: '04',
                title: 'Accompagnement',
                description: 'Suivi personnalisé jusqu\'au résultat',
                color: 'from-[#2a3d26ff] to-[#ff9500ff]'
              }
            ].map((process, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden text-center"
              >
                <div className="p-8">
                  <div className="text-3xl font-bold text-[#3b5335ff] mb-4 group-hover:text-[#2a3d26ff] transition-colors">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#3b5335ff] mb-3 group-hover:text-[#2a3d26ff] transition-colors">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
      <section className="py-20 bg-gradient-to-r from-[#3b5335ff] to-[#2a3d26ff] text-white">
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
              className="bg-[#ffaf50ff] text-[#3b5335ff] px-12 py-4 rounded-lg text-lg font-bold hover:bg-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Nous appeler
            </a>
            <a 
              href="mailto:contact@recrutement.com" 
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