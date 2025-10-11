// app/admin/page.tsx
'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import AdminGuard from '@/app/components/AdminGuard'
import { signOut } from 'next-auth/react'

interface ContactForm {
  id: string
  nom: string
  email: string
  telephone: string
  message: string
  type: 'candidat' | 'entreprise'
  date: string
}

interface Newsletter {
  id: string
  email: string
  date: string
}

interface Offre {
  id: string
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  competences: string
  emailContact: string
  datePublication: string
  categorie: string
  statut: 'active' | 'inactive'
}

interface NewOffre {
  titre: string
  entreprise: string
  lieu: string
  typeContrat: string
  salaire: string
  description: string
  competences: string
  emailContact: string
  categorie: string
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'newsletters' | 'offres' | 'add-offre'>('contacts')
  const [contacts, setContacts] = useState<ContactForm[]>([])
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [offres, setOffres] = useState<Offre[]>([])
  const [newOffre, setNewOffre] = useState<NewOffre>({
    titre: '',
    entreprise: '',
    lieu: '',
    typeContrat: '',
    salaire: '',
    description: '',
    competences: '',
    emailContact: '',
    categorie: 'Technologie'
  })
  
  const { loading, error, callApi } = useApi()

  // Charger les données
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔄 Starting data fetch...');
      
      // Charger les contacts
      const contactsData = await callApi('/contacts')
      setContacts(contactsData.contacts || [])
      console.log('✅ Contacts loaded:', contactsData.contacts?.length);

      // Charger les newsletters
      const newslettersData = await callApi('/newsletters')
      setNewsletters(newslettersData.newsletters || [])
      console.log('✅ Newsletters loaded:', newslettersData.newsletters?.length);

      // Charger les offres
      const offresData = await callApi('/offres')
      setOffres(offresData.offres || [])
      console.log('✅ Offres loaded:', offresData.offres?.length);

    } catch (err) {
      console.error('❌ Error loading data:', err)
    }
  }

  const handleAddOffre = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    console.log('📝 [ADMIN] Starting to add new offer...');
    console.log('📦 [ADMIN] Form data (raw):', newOffre);
    
    // Validation manuelle avant envoi
    const requiredFields = ['titre', 'entreprise', 'lieu', 'typeContrat', 'description', 'emailContact'];
    const missingFields = requiredFields.filter(field => !newOffre[field as keyof NewOffre] || newOffre[field as keyof NewOffre].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ [ADMIN] Missing fields detected:', missingFields);
      alert(`Champs manquants: ${missingFields.join(', ')}`);
      return;
    }

    // Vérifier que typeContrat n'est pas vide
    if (!newOffre.typeContrat) {
      alert('Veuillez sélectionner un type de contrat');
      return;
    }

    // Créer l'objet à envoyer
    const offreToSend = {
      titre: newOffre.titre,
      entreprise: newOffre.entreprise,
      lieu: newOffre.lieu,
      typeContrat: newOffre.typeContrat,
      salaire: newOffre.salaire,
      description: newOffre.description,
      competences: newOffre.competences,
      emailContact: newOffre.emailContact,
      categorie: newOffre.categorie
    };

    console.log('📤 [ADMIN] Sending data:', offreToSend);

    const result = await callApi('/offres', {
      method: 'POST',
      body: offreToSend // On envoie l'objet directement, le hook gère le JSON.stringify
    })
    
    console.log('✅ [ADMIN] Offer added successfully:', result);
    
    // Réinitialiser le formulaire
    setNewOffre({
      titre: '',
      entreprise: '',
      lieu: '',
      typeContrat: '',
      salaire: '',
      description: '',
      competences: '',
      emailContact: '',
      categorie: 'Technologie'
    })
    
    // Recharger les données
    await fetchData()
    
    alert('✅ Offre ajoutée avec succès!')
  } catch (err) {
    console.error('❌ [ADMIN] Error adding offer:', err);
    alert(`❌ Erreur lors de l'ajout de l'offre: ${err.message}`)
  }
}

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setNewOffre(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Date invalide'
    }
  }

  const categories = ['Technologie', 'Management', 'Data', 'Marketing', 'Design', 'Commercial', 'Finance']
  const typesContrat = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'Intérim']

  // Test de connexion à la base de données
  const testConnection = async () => {
    try {
      const debugData = await callApi('/debug')
      console.log('🔧 Debug data:', debugData)
      alert('Check console for debug data')
    } catch (err) {
      console.error('Debug error:', err)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7f3ff] to-[#f0eee4ff]">
      <Header />
      
      {/* Hero Section Admin */}
      <section className="relative bg-gradient-to-br from-[#2a3d26ff] via-[#3b5335ff] to-[#2a3d26ff] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#ffaf50ff] rounded-full filter blur-xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Administration
              <span className="text-[#ffaf50ff] block mt-2 bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] bg-clip-text text-transparent">
                Tableau de Bord
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Gérez vos contacts, newsletters et offres d'emploi
            </p>
          </div>
        </div>
      </section>

      {/* Navigation des Tabs */}
      <section className="py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'contacts' as const, label: 'Contacts', count: contacts.length, icon: '👤' },
                { id: 'newsletters' as const, label: 'Newsletters', count: newsletters.length, icon: '📧' },
                { id: 'offres' as const, label: 'Offres', count: offres.length, icon: '💼' },
                { id: 'add-offre' as const, label: 'Ajouter une offre', icon: '➕' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] shadow-lg'
                      : 'bg-white text-[#3b5335ff] border border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-[#3b5335ff] text-white px-2 py-1 rounded-full text-sm">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-2 items-center">
              <button
                onClick={fetchData}
                disabled={loading}
                className="bg-[#3b5335ff] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#2a3d26ff] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? '🔄' : '🔄'} Actualiser
              </button>
              
              <button
                onClick={testConnection}
                className="bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                🔧 Debug
              </button>

              {/* Bouton de déconnexion */}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <span>❌</span>
                <span className="font-semibold">Erreur:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contenu des Tabs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tab: Contacts */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#3b5335ff]">
                  Contacts ({contacts.length})
                </h2>
                <span className="text-sm text-gray-500">
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
              
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucun contact trouvé.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Téléphone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Message</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.type === 'candidat' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {contact.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.nom}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{contact.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{contact.telephone}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                            <div className="truncate" title={contact.message}>
                              {contact.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(contact.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Newsletters */}
          {activeTab === 'newsletters' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#3b5335ff]">
                  Inscriptions Newsletter ({newsletters.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {newsletters.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{sub.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sub.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Offres */}
          {activeTab === 'offres' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#3b5335ff]">
                  Offres d'Emploi ({offres.length})
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {offres.filter(o => o.statut === 'active').length} active(s), 
                  {offres.filter(o => o.statut === 'inactive').length} inactive(s)
                </p>
              </div>
              
              {offres.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune offre trouvée.</p>
                  <p className="text-sm mt-2">Utilisez le bouton "Debug" pour vérifier la connexion à la base de données.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Titre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Entreprise</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Lieu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Salaire</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3b5335ff]">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {offres.map((offre) => (
                        <tr key={offre.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{offre.titre}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{offre.entreprise}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{offre.lieu}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{offre.typeContrat}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{offre.salaire}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(offre.datePublication)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              offre.statut === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {offre.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Ajouter une offre */}
            {activeTab === 'add-offre' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#3b5335ff]">
                    Ajouter une Nouvelle Offre d'Emploi
                </h2>
                <p className="text-gray-600 mt-2">
                    Tous les champs marqués d'un * sont obligatoires
                </p>
                </div>
                <form onSubmit={handleAddOffre} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titre du poste */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Titre du poste *
                    </label>
                    <input
                        type="text"
                        name="titre"
                        required
                        value={newOffre.titre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Ex: Développeur Full Stack"
                    />
                    </div>

                    {/* Entreprise */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Entreprise *
                    </label>
                    <input
                        type="text"
                        name="entreprise"
                        required
                        value={newOffre.entreprise}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Ex: TechCorp"
                    />
                    </div>

                    {/* Lieu */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Lieu *
                    </label>
                    <input
                        type="text"
                        name="lieu"
                        required
                        value={newOffre.lieu}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Ex: Paris, Lyon, Remote"
                    />
                    </div>

                    {/* Type de contrat */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Type de contrat *
                    </label>
                    <select
                        name="typeContrat"
                        required
                        value={newOffre.typeContrat}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                    >
                        <option value="">Sélectionnez un type de contrat *</option>
                        {typesContrat.map(type => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    </div>

                    {/* Catégorie */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Catégorie *
                    </label>
                    <select
                        name="categorie"
                        required
                        value={newOffre.categorie}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                    >
                        {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    </div>

                    {/* Salaire */}
                    <div>
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Salaire
                    </label>
                    <input
                        type="text"
                        name="salaire"
                        value={newOffre.salaire}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Ex: 45-55K€, Selon profil"
                    />
                    </div>

                    {/* Email de contact */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Email de contact *
                    </label>
                    <input
                        type="email"
                        name="emailContact"
                        required
                        value={newOffre.emailContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="contact@entreprise.com"
                    />
                    </div>

                    {/* Description du poste */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Description du poste *
                    </label>
                    <textarea
                        name="description"
                        required
                        value={newOffre.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Décrivez les missions, responsabilités et enjeux du poste..."
                    />
                    </div>

                    {/* Compétences requises */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#3b5335ff] mb-2">
                        Compétences requises
                    </label>
                    <textarea
                        name="competences"
                        value={newOffre.competences}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffaf50ff] focus:border-transparent transition-all"
                        placeholder="Listez les compétences techniques et soft skills requises (séparées par des virgules)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Ex: React, Node.js, MongoDB, Communication, Travail d'équipe
                    </p>
                    </div>
                </div>

                {/* Aperçu des données (pour debug) */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-[#3b5335ff] mb-2">Aperçu des données:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(newOffre, null, 2)}
                    </pre>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                    type="button"
                    onClick={() => setNewOffre({
                        titre: '',
                        entreprise: '',
                        lieu: '',
                        typeContrat: '',
                        salaire: '',
                        description: '',
                        competences: '',
                        emailContact: '',
                        categorie: 'Technologie'
                    })}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                    Réinitialiser
                    </button>
                    <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#ffaf50ff] to-[#ff9500ff] text-[#3b5335ff] px-8 py-3 rounded-lg font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                    >
                    {loading ? 'Publication...' : 'Publier l\'offre'}
                    </button>
                </div>
                </form>
            </div>
            )}

        </div>
      </section>

      <Footer />
    </div>
    </AdminGuard>
  )
}