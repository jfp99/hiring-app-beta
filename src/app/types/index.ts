// src/types/database.ts
export interface ContactForm {
  _id: string;
  nom: string;
  email: string;
  telephone?: string; // Optionnel car peut varier entre candidats et entreprises
  message?: string;   // Optionnel car peut varier
  type: string;      // 'Candidat' ou 'Entreprise'
  // Champs spécifiques aux candidats
  prenom?: string;
  cv?: string;
  // Champs spécifiques aux entreprises
  entreprise?: string;
  poste?: string;
  besoins?: string;
  createdAt: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  createdAt: string;
}

export interface JobOffer {
  _id: string;
  titre: string;
  entreprise: string;
  lieu: string;
  typeContrat: string;
  description: string;
  competences: string;
  salaire: string;
  emailContact: string;
  statut: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface NewJobOffer {
  titre: string;
  entreprise: string;
  lieu: string;
  typeContrat: string;
  description: string;
  competences: string;
  salaire: string;
  emailContact: string;
}