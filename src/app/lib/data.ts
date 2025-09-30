// lib/data.ts
export interface OffreEmploi {
  id: string;
  titre: string;
  entreprise: string;
  lieu: string;
  typeContrat: string;
  salaire: string;
  description: string;
  responsabilites: string[];
  qualifications: string[];
  avantages: string[];
  datePublication: string;
  categorie: string;
}

export const offresEmploi: OffreEmploi[] = [
  {
    id: '1',
    titre: 'Développeur Full Stack',
    entreprise: 'TechInnov',
    lieu: 'Paris',
    typeContrat: 'CDI',
    salaire: '45K-55K €',
    description: 'Nous recherchons un développeur full stack passionné pour rejoindre notre équipe dynamique.',
    responsabilites: [
      'Développer des applications web modernes',
      'Collaborer avec les équipes produit et design',
      'Maintenir et améliorer le code existant'
    ],
    qualifications: [
      '3+ ans d\'expérience en développement',
      'Maîtrise de React et Node.js',
      'Expérience avec les bases de données SQL'
    ],
    avantages: [
      'Télétravail partiel',
      'Mutuelle entreprise',
      'Tickets restaurant'
    ],
    datePublication: '2024-01-15',
    categorie: 'Technologie'
  },
  {
    id: '2',
    titre: 'Chef de Projet Digital',
    entreprise: 'DigitalBoost',
    lieu: 'Lyon',
    typeContrat: 'CDI',
    salaire: '50K-60K €',
    description: 'Rejoignez notre équipe en tant que chef de projet digital pour piloter des projets innovants.',
    responsabilites: [
      'Gestion de projets digitaux de A à Z',
      'Coordination des équipes techniques et créatives',
      'Suivi budgétaire et reporting'
    ],
    qualifications: [
      '5 ans d\'expérience en gestion de projet',
      'Maîtrise des méthodologies Agile',
      'Excellentes compétences en communication'
    ],
    avantages: [
      'Formation continue',
      'Prime annuelle',
      'Horaires flexibles'
    ],
    datePublication: '2024-01-10',
    categorie: 'Management'
  },
  {
    id: '3',
    titre: 'Data Analyst',
    entreprise: 'DataCorp',
    lieu: 'Toulouse',
    typeContrat: 'CDI',
    salaire: '40K-50K €',
    description: 'Analyste de données pour transformer les données en insights actionnables.',
    responsabilites: [
      'Analyser et interpréter des données complexes',
      'Créer des dashboards et rapports',
      'Collaborer avec les équipes métier'
    ],
    qualifications: [
      'Maîtrise de SQL et Python',
      'Expérience avec Tableau ou Power BI',
      'Compétences en statistiques'
    ],
    avantages: [
      'Équipement fourni',
      'Congés supplémentaires',
      'Événements d\'entreprise'
    ],
    datePublication: '2024-01-08',
    categorie: 'Data'
  }
];