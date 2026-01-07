// src/app/lib/categoryTemplates.ts
// Predefined templates to auto-populate fields based on job category

import type { OffreFormData } from '@/app/types/offres'

export interface CategoryTemplate {
  categorie: string
  // Default values for auto-population
  defaults: {
    responsabilites: string[]
    qualifications: string[]
    avantages: string[]
    competences: string
    descriptionIntro?: string
  }
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    categorie: 'Technologie',
    defaults: {
      responsabilites: [
        'Concevoir et développer des solutions techniques innovantes',
        'Participer aux revues de code et assurer la qualité du code',
        'Collaborer avec les équipes produit et design',
        'Documenter les solutions techniques mises en place',
        'Assurer la maintenance et l\'évolution des applications existantes'
      ],
      qualifications: [
        'Formation Bac+5 en informatique ou équivalent',
        'Maîtrise des méthodologies Agile (Scrum, Kanban)',
        'Capacité à travailler en équipe et à communiquer efficacement',
        'Veille technologique active et curiosité technique',
        'Maîtrise de l\'anglais technique'
      ],
      avantages: [
        'Télétravail 2-3 jours par semaine',
        'Budget formation annuel (conférences, certifications)',
        'Équipement de travail haut de gamme',
        'Tickets restaurant',
        'Mutuelle d\'entreprise prise en charge à 100%'
      ],
      competences: 'Git, CI/CD, Tests unitaires, Architecture logicielle',
      descriptionIntro: 'Rejoignez notre équipe technique passionnée et participez au développement de solutions innovantes dans un environnement stimulant.'
    }
  },
  {
    categorie: 'Management',
    defaults: {
      responsabilites: [
        'Manager et accompagner une équipe dans son développement',
        'Définir et suivre les objectifs de performance',
        'Piloter les projets stratégiques du département',
        'Assurer le reporting auprès de la direction',
        'Recruter et développer les talents de l\'équipe'
      ],
      qualifications: [
        'Expérience significative en management d\'équipe (5+ ans)',
        'Excellentes capacités de communication et de leadership',
        'Aptitude à la prise de décision et à la gestion des priorités',
        'Vision stratégique et orientation résultats',
        'Maîtrise des outils de pilotage et reporting'
      ],
      avantages: [
        'Package de rémunération attractif (fixe + variable)',
        'Véhicule de fonction ou car allowance',
        'Plan d\'épargne entreprise avec abondement',
        'Assurance santé famille premium',
        'Accès à un réseau de dirigeants'
      ],
      competences: 'Leadership, Gestion de projet, KPIs, Stratégie, Négociation',
      descriptionIntro: 'Nous recherchons un leader inspirant pour piloter notre équipe et contribuer activement à notre croissance.'
    }
  },
  {
    categorie: 'Data',
    defaults: {
      responsabilites: [
        'Collecter, nettoyer et analyser de grands volumes de données',
        'Développer des modèles prédictifs et algorithmes ML/AI',
        'Créer des dashboards et visualisations de données',
        'Collaborer avec les équipes métier pour comprendre leurs besoins',
        'Assurer la qualité et la gouvernance des données'
      ],
      qualifications: [
        'Formation supérieure en Data Science, Statistiques ou Mathématiques',
        'Maîtrise de Python et des librairies data (Pandas, NumPy, Scikit-learn)',
        'Expérience avec les bases de données SQL et NoSQL',
        'Connaissance des outils de visualisation (Power BI, Tableau)',
        'Capacité à vulgariser des analyses complexes'
      ],
      avantages: [
        'Accès à des ressources cloud illimitées pour vos projets',
        'Participation à des conférences Data (Strata, DataGo)',
        'Formations certifiantes prises en charge',
        'Flexibilité horaire et télétravail',
        'Prime sur objectifs'
      ],
      competences: 'Python, SQL, Machine Learning, Power BI, Big Data, ETL',
      descriptionIntro: 'Intégrez notre équipe Data et transformez les données en insights stratégiques pour l\'entreprise.'
    }
  },
  {
    categorie: 'Design',
    defaults: {
      responsabilites: [
        'Concevoir des interfaces utilisateur intuitives et esthétiques',
        'Réaliser des wireframes, maquettes et prototypes interactifs',
        'Conduire des recherches utilisateurs et tests d\'usabilité',
        'Maintenir et faire évoluer le design system',
        'Collaborer étroitement avec les développeurs pour l\'implémentation'
      ],
      qualifications: [
        'Formation en Design (UX/UI, Design Graphique) ou équivalent',
        'Maîtrise de Figma, Sketch ou Adobe XD',
        'Connaissance des principes d\'accessibilité (WCAG)',
        'Portfolio démontrant votre expertise',
        'Sensibilité aux tendances design et veille active'
      ],
      avantages: [
        'MacBook Pro et écran haute résolution fournis',
        'Licences créatives (Adobe, Figma Pro)',
        'Budget formation design (UX certifications)',
        'Participation à des événements design',
        'Horaires flexibles pour favoriser la créativité'
      ],
      competences: 'Figma, UI/UX Design, Prototypage, Design System, User Research',
      descriptionIntro: 'Rejoignez notre studio design et créez des expériences utilisateur exceptionnelles qui font la différence.'
    }
  },
  {
    categorie: 'Marketing',
    defaults: {
      responsabilites: [
        'Définir et déployer la stratégie marketing digitale',
        'Gérer les campagnes d\'acquisition (SEO, SEA, Social Ads)',
        'Analyser les performances et optimiser le ROI',
        'Développer la notoriété de marque',
        'Collaborer avec les équipes commerciales et produit'
      ],
      qualifications: [
        'Formation supérieure en Marketing ou Communication',
        'Expérience significative en marketing digital',
        'Maîtrise de Google Analytics, Google Ads, Meta Business',
        'Compétences en content marketing et copywriting',
        'Esprit analytique et créatif'
      ],
      avantages: [
        'Budget marketing à gérer en autonomie',
        'Accès aux outils marketing premium (HubSpot, SEMrush)',
        'Participation à des salons et événements marketing',
        'Prime sur performance des campagnes',
        'Formation continue aux nouvelles tendances'
      ],
      competences: 'SEO, SEA, Google Analytics, Social Media, Content Marketing, CRM',
      descriptionIntro: 'Nous cherchons un talent marketing pour accélérer notre croissance et développer notre visibilité.'
    }
  },
  {
    categorie: 'Finance',
    defaults: {
      responsabilites: [
        'Élaborer les budgets et prévisions financières',
        'Assurer le suivi et l\'analyse de la performance',
        'Produire les reportings financiers',
        'Participer aux clôtures comptables mensuelles/annuelles',
        'Conseiller la direction sur les décisions financières'
      ],
      qualifications: [
        'Formation supérieure en Finance, Comptabilité ou Gestion (DSCG, Master)',
        'Expérience en contrôle de gestion ou audit',
        'Maîtrise avancée d\'Excel et des outils BI',
        'Connaissance des normes comptables (French GAAP, IFRS)',
        'Rigueur, précision et sens de l\'analyse'
      ],
      avantages: [
        'Prime d\'intéressement et participation',
        'Épargne salariale avec abondement',
        'RTT et flexibilité horaire',
        'Possibilité d\'évolution vers des postes de direction',
        'Formation aux nouveaux outils financiers'
      ],
      competences: 'Comptabilité, Excel, SAP, Business Intelligence, Analyse financière',
      descriptionIntro: 'Intégrez notre direction financière et contribuez à la performance économique de l\'entreprise.'
    }
  },
  {
    categorie: 'RH',
    defaults: {
      responsabilites: [
        'Piloter les recrutements de A à Z',
        'Accompagner les managers dans la gestion de leurs équipes',
        'Gérer l\'administration du personnel',
        'Développer la marque employeur',
        'Mettre en place des projets RH structurants'
      ],
      qualifications: [
        'Formation supérieure en Ressources Humaines',
        'Expérience confirmée en recrutement et gestion RH',
        'Connaissance du droit du travail',
        'Excellentes qualités relationnelles et d\'écoute',
        'Maîtrise des outils SIRH'
      ],
      avantages: [
        'Participation à des événements RH (salons, conférences)',
        'Formations certifiantes RH',
        'Environnement de travail bienveillant',
        'RTT et télétravail',
        'CE actif avec nombreux avantages'
      ],
      competences: 'Recrutement, Droit du travail, SIRH, Paie, Formation',
      descriptionIntro: 'Rejoignez notre équipe RH et contribuez à développer notre capital humain, notre première richesse.'
    }
  },
  {
    categorie: 'Commercial',
    defaults: {
      responsabilites: [
        'Prospecter et développer un portefeuille clients',
        'Identifier les besoins et proposer des solutions adaptées',
        'Négocier et conclure les contrats commerciaux',
        'Assurer le suivi et la fidélisation des clients',
        'Atteindre et dépasser les objectifs de vente'
      ],
      qualifications: [
        'Formation commerciale (BTS, Licence, Master)',
        'Expérience réussie en B2B ou B2C',
        'Excellent relationnel et sens de la négociation',
        'Autonomie et persévérance',
        'Permis B et mobilité géographique'
      ],
      avantages: [
        'Rémunération attractive (fixe + variable déplafonné)',
        'Véhicule de fonction',
        'Challenges commerciaux avec récompenses',
        'Formation produits et techniques de vente',
        'Évolution rapide vers des postes de management'
      ],
      competences: 'Prospection, Négociation, CRM, Vente B2B/B2C, Closing',
      descriptionIntro: 'Nous recherchons un commercial ambitieux pour accompagner notre développement commercial.'
    }
  },
  {
    categorie: 'Juridique',
    defaults: {
      responsabilites: [
        'Rédiger et négocier les contrats commerciaux',
        'Assurer une veille juridique et réglementaire',
        'Conseiller les équipes sur les aspects légaux',
        'Gérer les contentieux et précontentieux',
        'Superviser la conformité RGPD et compliance'
      ],
      qualifications: [
        'Master 2 en Droit des affaires ou équivalent',
        'Expérience en cabinet d\'avocats ou direction juridique',
        'Maîtrise du droit des contrats et droit commercial',
        'Rigueur et capacité de synthèse',
        'Anglais juridique courant'
      ],
      avantages: [
        'Accès aux bases juridiques premium (Lexis, Dalloz)',
        'Formation continue (séminaires juridiques)',
        'Environnement stimulant et varié',
        'RTT et flexibilité',
        'Participation aux décisions stratégiques'
      ],
      competences: 'Droit des contrats, RGPD, Contentieux, Droit des sociétés, Compliance',
      descriptionIntro: 'Intégrez notre direction juridique et apportez votre expertise pour sécuriser nos activités.'
    }
  },
  {
    categorie: 'Autre',
    defaults: {
      responsabilites: [
        'Contribuer activement aux projets de l\'entreprise',
        'Collaborer avec les différentes équipes',
        'Proposer des améliorations et innovations',
        'Assurer le reporting de vos activités',
        'Participer à l\'atteinte des objectifs collectifs'
      ],
      qualifications: [
        'Formation adaptée au poste',
        'Expérience professionnelle pertinente',
        'Capacité d\'adaptation et polyvalence',
        'Bon relationnel et esprit d\'équipe',
        'Motivation et engagement'
      ],
      avantages: [
        'Environnement de travail agréable',
        'Opportunités de formation',
        'Mutuelle d\'entreprise',
        'Tickets restaurant',
        'RTT'
      ],
      competences: '',
      descriptionIntro: 'Rejoignez notre équipe et contribuez au succès de l\'entreprise dans un environnement dynamique.'
    }
  }
]

// Get template by category
export function getCategoryTemplate(categorie: string): CategoryTemplate | undefined {
  return CATEGORY_TEMPLATES.find(t => t.categorie === categorie)
}

// Apply template defaults to form data (only fills empty fields)
export function applyTemplateDefaults(
  formData: Partial<OffreFormData>,
  categorie: string,
  overwriteExisting: boolean = false
): Partial<OffreFormData> {
  const template = getCategoryTemplate(categorie)
  if (!template) return formData

  const result = { ...formData }

  // Apply responsabilites
  if (overwriteExisting || !result.responsabilites || result.responsabilites.length === 0) {
    result.responsabilites = [...template.defaults.responsabilites]
  }

  // Apply qualifications
  if (overwriteExisting || !result.qualifications || result.qualifications.length === 0) {
    result.qualifications = [...template.defaults.qualifications]
  }

  // Apply avantages
  if (overwriteExisting || !result.avantages || result.avantages.length === 0) {
    result.avantages = [...template.defaults.avantages]
  }

  // Apply competences
  if (overwriteExisting || !result.competences || result.competences.trim() === '') {
    result.competences = template.defaults.competences
  }

  // Apply description intro if description is empty
  if (overwriteExisting || !result.description || result.description.trim() === '') {
    if (template.defaults.descriptionIntro) {
      result.description = template.defaults.descriptionIntro
      result.descriptionHtml = `<p>${template.defaults.descriptionIntro}</p>`
    }
  }

  return result
}

// Check if template defaults are different from current data
export function hasTemplateChanges(
  formData: Partial<OffreFormData>,
  categorie: string
): boolean {
  const template = getCategoryTemplate(categorie)
  if (!template) return false

  // Check if any field would be updated
  if ((!formData.responsabilites || formData.responsabilites.length === 0) &&
      template.defaults.responsabilites.length > 0) return true
  if ((!formData.qualifications || formData.qualifications.length === 0) &&
      template.defaults.qualifications.length > 0) return true
  if ((!formData.avantages || formData.avantages.length === 0) &&
      template.defaults.avantages.length > 0) return true
  if ((!formData.competences || formData.competences.trim() === '') &&
      template.defaults.competences) return true
  if ((!formData.description || formData.description.trim() === '') &&
      template.defaults.descriptionIntro) return true

  return false
}
