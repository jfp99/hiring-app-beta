// app/api/entreprises/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters } from '@/app/lib/security';
import { z } from 'zod';

// Validation schema
const entrepriseSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  sujet: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(1, 'Le message est requis')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for entreprises POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.info('Creating new company contact');

    const body = await request.json();

    // Validate input
    const validation = entrepriseSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Company validation failed', { errors: validation.error.issues });
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const { db } = await connectToDatabase();

    const nouvelleEntreprise = {
      nom: validatedData.nom.trim(),
      email: validatedData.email.toLowerCase().trim(),
      telephone: validatedData.telephone?.trim() || '',
      sujet: validatedData.sujet.trim(),
      message: validatedData.message.trim(),
      type: 'entreprise',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      statut: 'nouveau'
    };

    const result = await db.collection('entreprises').insertOne(nouvelleEntreprise);

    logger.info('Company contact created successfully', {
      id: result.insertedId.toString(),
      email: validatedData.email
    });

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.',
      id: result.insertedId.toString()
    });

  } catch (error: unknown) {
    logger.error('Failed to create company contact', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de votre demande'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for entreprises GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching companies');

    const { db } = await connectToDatabase();

    const entreprises = await db.collection('entreprises')
      .find({})
      .sort({ date: -1 })
      .toArray();

    logger.info('Companies fetched successfully', { count: entreprises.length });

    const formattedEntreprises = entreprises.map(entreprise => ({
      id: entreprise._id.toString(),
      nom: entreprise.nom,
      email: entreprise.email,
      telephone: entreprise.telephone,
      sujet: entreprise.sujet,
      message: entreprise.message,
      date: entreprise.date,
      statut: entreprise.statut
    }));

    return NextResponse.json({
      success: true,
      entreprises: formattedEntreprises
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch companies', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch companies' 
      }, 
      { status: 500 }
    );
  }
}