// app/api/candidats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters } from '@/app/lib/security';
import { z } from 'zod';

// Validation schema
const candidatSchema = z.object({
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
    logger.warn('Rate limit exceeded for candidats POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = candidatSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Candidate validation failed', { errors: validation.error.issues });
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

    const nouveauCandidat = {
      nom: validatedData.nom.trim(),
      email: validatedData.email.toLowerCase().trim(),
      telephone: validatedData.telephone?.trim() || '',
      sujet: validatedData.sujet.trim(),
      message: validatedData.message.trim(),
      type: 'candidat',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      statut: 'nouveau'
    };

    const result = await db.collection('candidats').insertOne(nouveauCandidat);

    logger.info('Candidate contact created successfully', {
      id: result.insertedId.toString(),
      email: validatedData.email
    });

    return NextResponse.json({
      success: true,
      message: 'Votre candidature a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.',
      id: result.insertedId.toString()
    });

  } catch (error: unknown) {
    logger.error('Failed to create candidate contact', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de votre candidature'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for candidats GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching candidate contacts');

    const { db } = await connectToDatabase();

    const candidats = await db.collection('candidats')
      .find({})
      .sort({ date: -1 })
      .toArray();

    logger.info('Candidate contacts fetched successfully', { count: candidats.length });

    const formattedCandidats = candidats.map(candidat => ({
      id: candidat._id.toString(),
      nom: candidat.nom,
      email: candidat.email,
      telephone: candidat.telephone,
      sujet: candidat.sujet,
      message: candidat.message,
      date: candidat.date,
      statut: candidat.statut
    }));

    return NextResponse.json({
      success: true,
      candidats: formattedCandidats
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch candidate contacts', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch candidates'
      },
      { status: 500 }
    );
  }
}
