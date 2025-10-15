// app/admin/page.tsx
'use client'

import AdminHeader from '../components/AdminHeader'
import Footer from '../components/Footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Briefcase, Building2, MapPin, Mail, DollarSign, FileText, RefreshCw } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import AdminGuard from '@/app/components/AdminGuard'
import { signOut } from 'next-auth/react'
import CustomFieldManager from '@/app/components/CustomFieldManager'
import { toast } from 'sonner'
import { EmptyData } from '@/app/components/ui'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

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
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false)
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
      toast.error('Champs manquants', {
        description: missingFields.join(', ')
      });
      return;
    }

    // Vérifier que typeContrat n'est pas vide
    if (!newOffre.typeContrat) {
      toast.warning('Veuillez sélectionner un type de contrat');
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

    toast.success('Offre ajoutée avec succès!', {
      description: 'L\'offre est maintenant visible sur le site'
    })
  } catch (err) {
    console.error('❌ [ADMIN] Error adding offer:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    toast.error('Erreur lors de l\'ajout de l\'offre', {
      description: errorMessage
    })
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
      toast.info('Données de debug', {
        description: 'Consultez la console pour les détails'
      })
    } catch (err) {
      console.error('Debug error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      toast.error('Erreur de debug', {
        description: errorMessage
      })
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 dark:from-gray-900 dark:to-gray-800">
      <AdminHeader />

      {/* Hero Section Admin */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-accent-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-500 rounded-full filter blur-3xl opacity-10 animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-semibold mb-4 leading-tight text-white">
              Administration
              <span className="block mt-2 bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent font-bold">
                Tableau de Bord
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed text-gray-200 font-normal">
              Gérez vos contacts, newsletters et offres d'emploi
            </p>
          </div>
        </div>
      </section>

      {/* Navigation des Tabs */}
      <section className="py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'contacts' as const, label: 'Contacts', count: contacts.length, icon: '👤' },
                { id: 'newsletters' as const, label: 'Newsletters', count: newsletters.length, icon: '📧' },
                { id: 'offres' as const, label: 'Offres', count: offres.length, icon: '💼' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-primary-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-lg'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-primary-500 dark:bg-accent-500 text-white dark:text-primary-700 px-2 py-1 rounded-full text-sm">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}

              {/* Bouton Ajouter une offre - plus petit */}
              <button
                onClick={() => setActiveTab('add-offre')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-accent-400 dark:focus-visible:ring-offset-gray-900 ${
                  activeTab === 'add-offre'
                    ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-primary-700 shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-primary-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-lg'
                }`}
              >
                <span>➕</span>
                Ajouter une offre
              </button>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 items-center">
              {/* Bouton Actualiser */}
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="tertiary"
                size="md"
                leftIcon={<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />}
              >
                Actualiser
              </Button>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-700 dark:text-accent-500">
                  Contacts ({contacts.length})
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
              
              {contacts.length === 0 ? (
                <EmptyData
                  title="Aucun contact"
                  description="Les contacts soumis via le formulaire apparaîtront ici."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Téléphone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Message</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.type === 'candidat'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {contact.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{contact.nom}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{contact.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{contact.telephone}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            <div className="truncate" title={contact.message}>
                              {contact.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(contact.date)}</td>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-primary-700 dark:text-accent-500">
                  Inscriptions Newsletter ({newsletters.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {newsletters.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{sub.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(sub.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Offres */}
          {activeTab === 'offres' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-primary-700 dark:text-accent-500">
                  Offres d'Emploi ({offres.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {offres.filter(o => o.statut === 'active').length} active(s),
                  {offres.filter(o => o.statut === 'inactive').length} inactive(s)
                </p>
              </div>

              {offres.length === 0 ? (
                <EmptyData
                  title="Aucune offre d'emploi"
                  description="Ajoutez votre première offre pour commencer."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Titre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Entreprise</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Lieu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Salaire</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700 dark:text-gray-200">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {offres.map((offre) => (
                        <tr key={offre.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{offre.titre}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{offre.entreprise}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{offre.lieu}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{offre.typeContrat}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{offre.salaire}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(offre.datePublication)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              offre.statut === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-primary-700 dark:text-accent-500">
                    Ajouter une Nouvelle Offre d'Emploi
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Tous les champs marqués d&apos;un * sont obligatoires
                </p>
                </div>
                <form onSubmit={handleAddOffre} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titre du poste */}
                    <Input
                        type="text"
                        name="titre"
                        label="Titre du poste"
                        required
                        value={newOffre.titre}
                        onChange={handleInputChange}
                        leftIcon={<Briefcase className="w-5 h-5" />}
                        placeholder="Ex: Développeur Full Stack"
                    />

                    {/* Entreprise */}
                    <Input
                        type="text"
                        name="entreprise"
                        label="Entreprise"
                        required
                        value={newOffre.entreprise}
                        onChange={handleInputChange}
                        leftIcon={<Building2 className="w-5 h-5" />}
                        placeholder="Ex: TechCorp"
                    />

                    {/* Lieu */}
                    <Input
                        type="text"
                        name="lieu"
                        label="Lieu"
                        required
                        value={newOffre.lieu}
                        onChange={handleInputChange}
                        leftIcon={<MapPin className="w-5 h-5" />}
                        placeholder="Ex: Paris, Lyon, Remote"
                    />

                    {/* Type de contrat */}
                    <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                        Type de contrat *
                    </label>
                    <select
                        name="typeContrat"
                        required
                        value={newOffre.typeContrat}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Sélectionnez un type de contrat *</option>
                        {typesContrat.map(type => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    </div>

                    {/* Catégorie */}
                    <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                        Catégorie *
                    </label>
                    <select
                        name="categorie"
                        required
                        value={newOffre.categorie}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    </div>

                    {/* Salaire */}
                    <Input
                        type="text"
                        name="salaire"
                        label="Salaire"
                        value={newOffre.salaire}
                        onChange={handleInputChange}
                        leftIcon={<DollarSign className="w-5 h-5" />}
                        placeholder="Ex: 45-55K€, Selon profil"
                        helpText="Facultatif - Indiquez une fourchette ou 'Selon profil'"
                    />

                    {/* Email de contact */}
                    <div className="md:col-span-2">
                        <Input
                            type="email"
                            name="emailContact"
                            label="Email de contact"
                            required
                            value={newOffre.emailContact}
                            onChange={handleInputChange}
                            leftIcon={<Mail className="w-5 h-5" />}
                            placeholder="contact@entreprise.com"
                        />
                    </div>

                    {/* Description du poste */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                        Description du poste *
                    </label>
                    <textarea
                        name="description"
                        required
                        value={newOffre.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Décrivez les missions, responsabilités et enjeux du poste..."
                    />
                    </div>

                    {/* Compétences requises */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">
                        Compétences requises
                    </label>
                    <textarea
                        name="competences"
                        value={newOffre.competences}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Listez les compétences techniques et soft skills requises (séparées par des virgules)"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ex: React, Node.js, MongoDB, Communication, Travail d'équipe
                    </p>
                    </div>
                </div>

                {/* Aperçu des données (pour debug) */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-medium text-primary-700 dark:text-gray-200 mb-2">Aperçu des données:</h4>
                    <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto">
                    {JSON.stringify(newOffre, null, 2)}
                    </pre>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
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
                        variant="tertiary"
                        size="lg"
                    >
                        Réinitialiser
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="secondary"
                        size="lg"
                        isLoading={loading}
                    >
                        Publier l&apos;offre
                    </Button>
                </div>
                </form>
            </div>
            )}

        </div>
      </section>

      <Footer />

      {/* Custom Field Manager Modal */}
      {showCustomFieldManager && (
        <CustomFieldManager onClose={() => setShowCustomFieldManager(false)} />
      )}
    </div>
    </AdminGuard>
  )
}