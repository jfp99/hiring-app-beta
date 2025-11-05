// services/servicesData.ts
export const servicesData = {
  'cdi': {
    title: 'Recrutements en CDI',
    subtitle: 'Renforcez durablement vos équipes avec des talents qualifiés',
    description: 'Notre service de recrutement en CDI est conçu pour vous accompagner dans la construction d\'équipes solides et pérennes. Nous comprenons que chaque recrutement en CDI est un investissement stratégique pour votre entreprise.',
    heroImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=600&fit=crop',
    icon: '👔',
    color: 'from-primary-500 to-primary-600',

    mainBenefits: [
      {
        title: 'Profils qualifiés et vérifiés',
        description: 'Nous effectuons un sourcing approfondi et une présélection rigoureuse pour vous présenter uniquement des candidats qui correspondent parfaitement à vos critères techniques et culturels.',
        icon: '✓'
      },
      {
        title: 'Approche personnalisée',
        description: 'Chaque mission fait l\'objet d\'une analyse détaillée de vos besoins, de votre culture d\'entreprise et de vos objectifs à long terme pour garantir un match parfait.',
        icon: '🎯'
      },
      {
        title: 'Suivi post-placement',
        description: 'Notre accompagnement ne s\'arrête pas à la signature du contrat. Nous assurons un suivi régulier pendant la période d\'intégration pour garantir la réussite du recrutement.',
        icon: '📊'
      },
      {
        title: 'Garantie période d\'essai',
        description: 'Nous offrons une garantie complète pendant toute la durée de la période d\'essai, avec remplacement gratuit si nécessaire.',
        icon: '🛡️'
      }
    ],

    processSteps: [
      {
        number: '01',
        title: 'Analyse des besoins',
        description: 'Entretien approfondi pour comprendre vos attentes, votre culture d\'entreprise et définir le profil idéal.',
        duration: '1-2 jours'
      },
      {
        number: '02',
        title: 'Sourcing & Chasse',
        description: 'Recherche active sur nos bases de données, réseaux professionnels et approche directe des meilleurs talents.',
        duration: '1-2 semaines'
      },
      {
        number: '03',
        title: 'Présélection',
        description: 'Entretiens téléphoniques et en visio, vérification des compétences techniques et évaluation de la motivation.',
        duration: '3-5 jours'
      },
      {
        number: '04',
        title: 'Présentation',
        description: 'Envoi de 3 à 5 profils présélectionnés avec CV détaillés, compte-rendu d\'entretien et recommandations.',
        duration: '2-3 jours'
      },
      {
        number: '05',
        title: 'Accompagnement',
        description: 'Coordination des entretiens, négociation salariale, préparation des offres et suivi jusqu\'à l\'intégration.',
        duration: 'Continu'
      }
    ],

    targetProfiles: [
      'Cadres et managers expérimentés',
      'Ingénieurs et techniciens spécialisés',
      'Commerciaux et business developers',
      'Fonctions supports (RH, Finance, Marketing)',
      'Profils IT et Data',
      'Spécialistes métiers sectoriels'
    ],

    sectors: [
      'Industrie & Manufacturing',
      'IT & Digital',
      'Commerce & Distribution',
      'Services & Conseil',
      'Finance & Assurance',
      'Santé & Pharmaceutique'
    ],

    testimonials: [
      {
        author: 'Marie L.',
        role: 'DRH - Groupe industriel',
        text: 'Hi-ring nous a permis de recruter 3 ingénieurs en moins de 2 mois. Leur compréhension de nos besoins techniques et culturels a fait toute la différence.',
        rating: 5
      },
      {
        author: 'Thomas B.',
        role: 'CEO - Scale-up Tech',
        text: 'L\'approche personnalisée et le suivi post-placement sont exceptionnels. Tous nos recrutements via Hi-ring ont été des succès.',
        rating: 5
      }
    ],

    pricing: {
      model: 'Success fee',
      percentage: '15-20%',
      details: 'Pourcentage du salaire annuel brut, payable uniquement en cas de recrutement réussi',
      guarantee: 'Garantie complète pendant toute la période d\'essai'
    }
  },

  'freelance': {
    title: 'Missions Freelance',
    subtitle: 'Répondez à vos besoins ponctuels avec des spécialistes disponibles rapidement',
    description: 'Notre réseau de freelances qualifiés vous permet d\'intervenir rapidement sur des projets spécifiques, de renforcer temporairement vos équipes ou d\'apporter une expertise pointue sur des missions à durée déterminée.',
    heroImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop',
    icon: '⚡',
    color: 'from-accent-500 to-accent-600',

    mainBenefits: [
      {
        title: 'Disponibilité rapide',
        description: 'Accédez à un vivier de freelances qualifiés et disponibles sous 48h à 1 semaine selon l\'urgence et la spécialité requise.',
        icon: '⚡'
      },
      {
        title: 'Spécialistes qualifiés',
        description: 'Tous nos freelances sont rigoureusement sélectionnés, avec vérification de leurs références, portfolio et compétences techniques.',
        icon: '🎓'
      },
      {
        title: 'Flexibilité maximale',
        description: 'Missions de quelques jours à plusieurs mois, à temps plein ou partiel, sur site ou en remote selon vos besoins.',
        icon: '🔄'
      },
      {
        title: 'Gestion administrative simplifiée',
        description: 'Nous gérons les aspects contractuels et administratifs pour vous permettre de vous concentrer sur votre projet.',
        icon: '📋'
      }
    ],

    processSteps: [
      {
        number: '01',
        title: 'Brief mission',
        description: 'Définition rapide du besoin, compétences requises, durée, budget et modalités d\'intervention.',
        duration: '2-4 heures'
      },
      {
        number: '02',
        title: 'Matching express',
        description: 'Sélection dans notre base de freelances actifs et présentation de 2-3 profils pertinents.',
        duration: '24-48h'
      },
      {
        number: '03',
        title: 'Entretiens',
        description: 'Organisation d\'entretiens téléphoniques ou visio avec les freelances sélectionnés.',
        duration: '2-3 jours'
      },
      {
        number: '04',
        title: 'Démarrage',
        description: 'Contractualisation rapide et démarrage de la mission selon vos contraintes.',
        duration: '1-3 jours'
      },
      {
        number: '05',
        title: 'Suivi mission',
        description: 'Points réguliers pour assurer la satisfaction et la bonne réalisation des objectifs.',
        duration: 'Hebdomadaire'
      }
    ],

    targetProfiles: [
      'Développeurs & Ingénieurs IT',
      'Data Scientists & Analystes',
      'Chefs de projet & Product Owners',
      'Consultants métiers',
      'Designers & UX/UI',
      'Spécialistes Marketing Digital'
    ],

    missionTypes: [
      'Développement de projet spécifique',
      'Renfort ponctuel d\'équipe',
      'Expertise technique pointue',
      'Conseil et accompagnement',
      'Formation et transfert de compétences',
      'Audit et diagnostic'
    ],

    testimonials: [
      {
        author: 'Sophie M.',
        role: 'CTO - Startup FinTech',
        text: 'Nous avons trouvé un développeur React/Node.js senior en 48h pour un projet urgent. Performance exceptionnelle !',
        rating: 5
      },
      {
        author: 'Alexandre D.',
        role: 'Directeur Digital',
        text: 'Les freelances proposés sont toujours de haut niveau. C\'est devenu notre solution privilégiée pour nos pics d\'activité.',
        rating: 5
      }
    ],

    pricing: {
      model: 'Commission sur TJM',
      percentage: '8-12%',
      details: 'Pourcentage sur le taux journalier du freelance, facturation mensuelle',
      guarantee: 'Remplacement gratuit sous 48h en cas de problème'
    }
  },

  'portage': {
    title: 'Portage Salarial',
    subtitle: 'Solutions flexibles grâce à notre partenariat exclusif',
    description: 'Le portage salarial combine les avantages du statut de salarié et l\'autonomie du consultant indépendant. Grâce à notre partenariat avec une société de portage reconnue, nous vous proposons une solution souple et sécurisée.',
    heroImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
    icon: '🤝',
    color: 'from-primary-600 to-accent-500',

    mainBenefits: [
      {
        title: 'Partenariat exclusif',
        description: 'Collaboration avec une société de portage certifiée, garantissant sécurité juridique et avantages sociaux optimaux.',
        icon: '🤝'
      },
      {
        title: 'Solution souple',
        description: 'Idéal pour les missions temporaires avec la sécurité d\'un contrat de travail classique (assurance chômage, retraite, mutuelle).',
        icon: '🔄'
      },
      {
        title: 'Sécurité juridique',
        description: 'Respect total du droit du travail, conformité URSSAF et protection sociale complète pour le consultant.',
        icon: '⚖️'
      },
      {
        title: 'Simplicité administrative',
        description: 'La société de portage gère toute l\'administration (facturation, bulletins de paie, déclarations) pendant que vous vous concentrez sur votre mission.',
        icon: '📝'
      }
    ],

    processSteps: [
      {
        number: '01',
        title: 'Étude de faisabilité',
        description: 'Analyse de votre besoin et vérification de l\'adéquation avec le portage salarial.',
        duration: '1 jour'
      },
      {
        number: '02',
        title: 'Présentation solution',
        description: 'Explication détaillée du fonctionnement, simulation financière et présentation de notre partenaire.',
        duration: '2-3 jours'
      },
      {
        number: '03',
        title: 'Recherche consultant',
        description: 'Sourcing et sélection du consultant porté adapté à votre mission.',
        duration: '1-2 semaines'
      },
      {
        number: '04',
        title: 'Contractualisation',
        description: 'Signature du contrat commercial avec la société de portage et convention de mission.',
        duration: '3-5 jours'
      },
      {
        number: '05',
        title: 'Suivi & Gestion',
        description: 'Suivi de la mission, gestion des temps et validation mensuelle des prestations.',
        duration: 'Mensuel'
      }
    ],

    forWho: [
      'Entreprises recherchant flexibilité et sécurité',
      'Missions temporaires de moyenne durée (3-18 mois)',
      'Projets nécessitant une expertise spécifique',
      'Remplacement temporaire (congé, maladie)',
      'Test avant embauche en CDI',
      'Besoins ponctuels sans création de poste'
    ],

    advantages: {
      forCompany: [
        'Aucune charge administrative',
        'Flexibilité contractuelle',
        'Pas de gestion RH',
        'Facturation simplifiée',
        'Possibilité de transformation en CDI'
      ],
      forConsultant: [
        'Statut de salarié',
        'Protection sociale complète',
        'Assurance chômage',
        'Retraite et prévoyance',
        'Formation professionnelle',
        'Accompagnement personnalisé'
      ]
    },

    testimonials: [
      {
        author: 'Laurent P.',
        role: 'Directeur Industriel',
        text: 'Le portage salarial nous a permis d\'accueillir un expert lean manufacturing pendant 12 mois sans les contraintes d\'un CDI. Parfait pour notre projet de transformation.',
        rating: 5
      },
      {
        author: 'Nathalie R.',
        role: 'Consultante portée',
        text: 'Grâce à Hi-ring, j\'ai pu me concentrer sur mes missions tout en gardant la sécurité d\'un statut de salariée. Le meilleur des deux mondes !',
        rating: 5
      }
    ],

    pricing: {
      model: 'Frais de gestion',
      percentage: '5-10%',
      details: 'Frais de gestion facturés par la société de portage sur le CA HT du consultant',
      guarantee: 'Accompagnement inclus tout au long de la mission'
    }
  },

  'rpo': {
    title: 'Recrutement RPO',
    subtitle: 'Expertise dédiée, agilité et optimisation des coûts',
    description: 'Le Recruitment Process Outsourcing (RPO) est une solution complète d\'externalisation de tout ou partie de votre processus de recrutement. Bénéficiez d\'une équipe dédiée qui devient une extension de votre département RH.',
    heroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=600&fit=crop',
    icon: '🎯',
    color: 'from-primary-500 to-accent-600',

    mainBenefits: [
      {
        title: 'Expertise dédiée',
        description: 'Une équipe de recruteurs expérimentés intégrée à votre organisation, connaissant parfaitement vos enjeux et votre culture.',
        icon: '👥'
      },
      {
        title: 'Agilité renforcée',
        description: 'Capacité à absorber les pics d\'activité et à s\'adapter rapidement à l\'évolution de vos besoins en recrutement.',
        icon: '🚀'
      },
      {
        title: 'Optimisation des coûts',
        description: 'Réduction significative du coût par recrutement par rapport à une solution interne ou multi-cabinets traditionnels.',
        icon: '💰'
      },
      {
        title: 'Objectifs atteints',
        description: 'KPIs définis ensemble, reporting transparent et pilotage de la performance en temps réel pour garantir l\'atteinte de vos objectifs.',
        icon: '📈'
      }
    ],

    processSteps: [
      {
        number: '01',
        title: 'Diagnostic & Cadrage',
        description: 'Audit de votre processus de recrutement actuel, définition du périmètre RPO et des objectifs à atteindre.',
        duration: '2-3 semaines'
      },
      {
        number: '02',
        title: 'Setup & Intégration',
        description: 'Mise en place de l\'équipe dédiée, accès aux outils, formation et intégration à vos processus internes.',
        duration: '3-4 semaines'
      },
      {
        number: '03',
        title: 'Phase pilote',
        description: 'Démarrage sur un périmètre défini avec ajustements progressifs des méthodes et processus.',
        duration: '2-3 mois'
      },
      {
        number: '04',
        title: 'Déploiement complet',
        description: 'Extension à l\'ensemble du périmètre défini avec montée en puissance progressive.',
        duration: '1-2 mois'
      },
      {
        number: '05',
        title: 'Optimisation continue',
        description: 'Analyse des KPIs, amélioration continue des processus et adaptation aux évolutions de vos besoins.',
        duration: 'Permanent'
      }
    ],

    rpoModels: [
      {
        name: 'RPO Full',
        description: 'Externalisation complète de votre fonction recrutement',
        bestFor: 'Entreprises en forte croissance ou restructuration RH'
      },
      {
        name: 'RPO Partiel',
        description: 'Externalisation d\'une partie des recrutements (par métier, niveau, région)',
        bestFor: 'Compléter une équipe RH interne sur des profils spécifiques'
      },
      {
        name: 'RPO Projet',
        description: 'Mission temporaire pour un projet de recrutement massif ou spécifique',
        bestFor: 'Ouverture de site, transformation, projet ponctuel'
      },
      {
        name: 'RPO On-Demand',
        description: 'Solution flexible activable selon vos pics d\'activité',
        bestFor: 'Entreprises avec des besoins saisonniers ou fluctuants'
      }
    ],

    services: [
      'Sourcing multi-canal (jobboards, réseaux, chasse)',
      'Gestion des candidatures et présélection',
      'Conduite des entretiens de première intention',
      'Coordination des entretiens clients',
      'Gestion de l\'expérience candidat',
      'Reporting et analytics',
      'Conseil et accompagnement stratégique',
      'Marque employeur et communication'
    ],

    testimonials: [
      {
        author: 'Catherine V.',
        role: 'DRH Groupe - 500+ collaborateurs',
        text: 'Le RPO nous a permis de recruter 45 personnes en 6 mois tout en réduisant nos coûts de recrutement de 30%. L\'équipe Hi-ring est devenue indispensable.',
        rating: 5
      },
      {
        author: 'Marc T.',
        role: 'CEO - PME industrielle',
        text: 'Sans département RH dédié, le RPO nous donne accès à une expertise professionnelle pour nos recrutements. C\'est comme avoir une équipe interne sans les contraintes.',
        rating: 5
      }
    ],

    pricing: {
      model: 'Forfait mensuel',
      percentage: 'Sur mesure',
      details: 'Tarification adaptée au volume et à la complexité des recrutements, avec prix dégressifs',
      guarantee: 'Engagement sur les délais et la qualité des recrutements'
    }
  }
}
