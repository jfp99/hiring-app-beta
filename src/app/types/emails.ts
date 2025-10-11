// src/app/types/emails.ts

export enum EmailTemplateType {
  INTERVIEW_INVITATION = 'interview_invitation',
  INTERVIEW_CONFIRMATION = 'interview_confirmation',
  INTERVIEW_REMINDER = 'interview_reminder',
  INTERVIEW_RESCHEDULE = 'interview_reschedule',
  OFFER_LETTER = 'offer_letter',
  OFFER_FOLLOW_UP = 'offer_follow_up',
  REJECTION = 'rejection',
  REJECTION_SOFT = 'rejection_soft',
  GENERAL_FOLLOW_UP = 'general_follow_up',
  INITIAL_CONTACT = 'initial_contact',
  SCREENING_INVITATION = 'screening_invitation',
  ONBOARDING = 'onboarding',
  REFERENCE_REQUEST = 'reference_request',
  CUSTOM = 'custom'
}

export const EMAIL_TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  [EmailTemplateType.INTERVIEW_INVITATION]: 'Invitation à un entretien',
  [EmailTemplateType.INTERVIEW_CONFIRMATION]: 'Confirmation d\'entretien',
  [EmailTemplateType.INTERVIEW_REMINDER]: 'Rappel d\'entretien',
  [EmailTemplateType.INTERVIEW_RESCHEDULE]: 'Reprogrammation d\'entretien',
  [EmailTemplateType.OFFER_LETTER]: 'Offre d\'emploi',
  [EmailTemplateType.OFFER_FOLLOW_UP]: 'Relance d\'offre',
  [EmailTemplateType.REJECTION]: 'Refus de candidature',
  [EmailTemplateType.REJECTION_SOFT]: 'Refus de candidature (courtois)',
  [EmailTemplateType.GENERAL_FOLLOW_UP]: 'Relance générale',
  [EmailTemplateType.INITIAL_CONTACT]: 'Premier contact',
  [EmailTemplateType.SCREENING_INVITATION]: 'Invitation à une présélection',
  [EmailTemplateType.ONBOARDING]: 'Intégration',
  [EmailTemplateType.REFERENCE_REQUEST]: 'Demande de références',
  [EmailTemplateType.CUSTOM]: 'Personnalisé'
}

export interface EmailTemplate {
  id: string
  name: string
  type: EmailTemplateType
  subject: string
  body: string
  isActive: boolean
  isDefault: boolean
  variables: string[] // e.g., ['firstName', 'lastName', 'companyName', 'position']
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface EmailLog {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  templateId?: string
  templateName?: string
  subject: string
  body: string
  sentBy: string
  sentByName: string
  sentAt: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
}

// Available template variables
export const TEMPLATE_VARIABLES = [
  { key: 'firstName', label: 'Prénom du candidat', example: 'Marie' },
  { key: 'lastName', label: 'Nom du candidat', example: 'Dubois' },
  { key: 'fullName', label: 'Nom complet', example: 'Marie Dubois' },
  { key: 'email', label: 'Email du candidat', example: 'marie.dubois@example.com' },
  { key: 'position', label: 'Poste', example: 'Développeur Full Stack' },
  { key: 'companyName', label: 'Nom de l\'entreprise', example: 'Hi-Ring' },
  { key: 'recruiterName', label: 'Nom du recruteur', example: 'Jean Martin' },
  { key: 'recruiterEmail', label: 'Email du recruteur', example: 'jean.martin@hi-ring.com' },
  { key: 'recruiterPhone', label: 'Téléphone du recruteur', example: '+33 6 12 34 56 78' },
  { key: 'interviewDate', label: 'Date de l\'entretien', example: '15 janvier 2025' },
  { key: 'interviewTime', label: 'Heure de l\'entretien', example: '14:00' },
  { key: 'interviewLocation', label: 'Lieu de l\'entretien', example: '123 Rue de Paris' },
  { key: 'interviewLink', label: 'Lien de visioconférence', example: 'https://meet.google.com/...' },
  { key: 'salary', label: 'Salaire proposé', example: '50 000 €' },
  { key: 'startDate', label: 'Date de début', example: '1er février 2025' },
  { key: 'currentDate', label: 'Date du jour', example: '10 janvier 2025' }
]

// Default email templates
export const DEFAULT_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    name: 'Invitation à un entretien - Standard',
    type: EmailTemplateType.INTERVIEW_INVITATION,
    subject: 'Invitation à un entretien - {{position}}',
    body: `Bonjour {{firstName}},

Nous avons bien reçu votre candidature pour le poste de {{position}} chez {{companyName}} et nous souhaitons vous rencontrer pour un entretien.

Détails de l'entretien :
📅 Date : {{interviewDate}}
🕐 Heure : {{interviewTime}}
📍 Lieu : {{interviewLocation}}

Merci de confirmer votre présence en répondant à cet email.

Cordialement,
{{recruiterName}}
{{companyName}}
{{recruiterEmail}}
{{recruiterPhone}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'position', 'companyName', 'interviewDate', 'interviewTime', 'interviewLocation', 'recruiterName', 'recruiterEmail', 'recruiterPhone']
  },
  {
    name: 'Entretien en visioconférence',
    type: EmailTemplateType.INTERVIEW_INVITATION,
    subject: 'Invitation à un entretien vidéo - {{position}}',
    body: `Bonjour {{firstName}},

Nous sommes ravis de vous inviter à un entretien vidéo pour le poste de {{position}}.

Détails de l'entretien :
📅 Date : {{interviewDate}}
🕐 Heure : {{interviewTime}}
🔗 Lien de visioconférence : {{interviewLink}}

Quelques conseils pour l'entretien :
- Testez votre connexion internet et votre caméra avant l'entretien
- Trouvez un endroit calme avec un bon éclairage
- Préparez vos questions sur le poste et l'entreprise

N'hésitez pas à me contacter si vous avez des questions.

Cordialement,
{{recruiterName}}
{{companyName}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'position', 'interviewDate', 'interviewTime', 'interviewLink', 'recruiterName', 'companyName']
  },
  {
    name: 'Offre d\'emploi - Standard',
    type: EmailTemplateType.OFFER_LETTER,
    subject: 'Offre d\'emploi - {{position}}',
    body: `Bonjour {{firstName}},

Nous sommes heureux de vous proposer le poste de {{position}} chez {{companyName}}.

Détails de l'offre :
💼 Poste : {{position}}
💰 Salaire : {{salary}}
📅 Date de début : {{startDate}}

Vous trouverez tous les détails de l'offre dans le document joint.

Nous serions ravis de vous compter parmi notre équipe ! Merci de nous faire part de votre décision d'ici 7 jours.

Cordialement,
{{recruiterName}}
{{companyName}}
{{recruiterEmail}}
{{recruiterPhone}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'position', 'companyName', 'salary', 'startDate', 'recruiterName', 'recruiterEmail', 'recruiterPhone']
  },
  {
    name: 'Refus de candidature - Courtois',
    type: EmailTemplateType.REJECTION_SOFT,
    subject: 'Suite à votre candidature - {{position}}',
    body: `Bonjour {{firstName}},

Nous vous remercions pour l'intérêt que vous portez à {{companyName}} et pour le temps que vous avez consacré à votre candidature pour le poste de {{position}}.

Après avoir examiné attentivement votre profil, nous avons décidé de poursuivre avec d'autres candidats dont les compétences correspondent plus précisément aux besoins actuels du poste.

Nous avons été impressionnés par votre parcours et nous conservons votre candidature dans notre base de données pour de futures opportunités qui pourraient mieux correspondre à votre profil.

Nous vous souhaitons beaucoup de succès dans votre recherche.

Cordialement,
{{recruiterName}}
{{companyName}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'companyName', 'position', 'recruiterName']
  },
  {
    name: 'Premier contact',
    type: EmailTemplateType.INITIAL_CONTACT,
    subject: 'Opportunité professionnelle - {{position}}',
    body: `Bonjour {{firstName}},

J'espère que ce message vous trouve bien.

Je me permets de vous contacter car votre profil a retenu notre attention pour un poste de {{position}} chez {{companyName}}.

Seriez-vous intéressé(e) par un échange téléphonique pour discuter de cette opportunité ?

Je reste à votre disposition pour toute information complémentaire.

Cordialement,
{{recruiterName}}
{{companyName}}
{{recruiterEmail}}
{{recruiterPhone}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'position', 'companyName', 'recruiterName', 'recruiterEmail', 'recruiterPhone']
  },
  {
    name: 'Rappel d\'entretien',
    type: EmailTemplateType.INTERVIEW_REMINDER,
    subject: 'Rappel : Entretien demain - {{position}}',
    body: `Bonjour {{firstName}},

Je me permets de vous rappeler que nous avons rendez-vous demain pour votre entretien.

Détails :
📅 Date : {{interviewDate}}
🕐 Heure : {{interviewTime}}
📍 Lieu : {{interviewLocation}}

À très bientôt !

Cordialement,
{{recruiterName}}
{{companyName}}`,
    isActive: true,
    isDefault: true,
    variables: ['firstName', 'interviewDate', 'interviewTime', 'interviewLocation', 'recruiterName', 'companyName', 'position']
  }
]
