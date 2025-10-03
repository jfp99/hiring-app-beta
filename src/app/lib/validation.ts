// lib/validation.ts
import { z } from 'zod'

export const offreSchema = z.object({
  titre: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  entreprise: z.string()
    .min(2, 'Le nom de l\'entreprise est requis')
    .max(50, 'Le nom de l\'entreprise est trop long'),
  lieu: z.string()
    .min(2, 'Le lieu est requis')
    .max(50, 'Le lieu est trop long'),
  typeContrat: z.enum(['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance', 'Intérim']),
  salaire: z.string().max(20, 'Le salaire est trop long').optional(),
  description: z.string()
    .min(50, 'La description doit contenir au moins 50 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  competences: z.string().max(500, 'Les compétences sont trop longues').optional(),
  emailContact: z.string().email('Format d\'email invalide'),
  categorie: z.string().min(1, 'La catégorie est requise')
})

export const contactSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  email: z.string().email('Format d\'email invalide'),
  telephone: z.string()
    .regex(/^\+?[0-9\s\-\(\)]{10,}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  sujet: z.string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(100, 'Le sujet est trop long'),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  type: z.enum(['candidat', 'entreprise'])
})

export const newsletterSchema = z.object({
  email: z.string().email('Format d\'email invalide')
})