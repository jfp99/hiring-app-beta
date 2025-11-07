// app/api/offres/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Validation schemas
const offreSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  entreprise: z.string().min(1, 'L\'entreprise est requise'),
  lieu: z.string().min(1, 'Le lieu est requis'),
  typeContrat: z.string().min(1, 'Le type de contrat est requis'),
  salaire: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  competences: z.string().optional(),
  emailContact: z.string().email('Email invalide'),
  categorie: z.string().optional()
});

const offreUpdateSchema = z.object({
  titre: z.string().min(1).optional(),
  entreprise: z.string().min(1).optional(),
  lieu: z.string().min(1).optional(),
  typeContrat: z.string().min(1).optional(),
  salaire: z.string().optional(),
  description: z.string().min(1).optional(),
  competences: z.string().optional(),
  emailContact: z.string().email().optional(),
  categorie: z.string().optional(),
  statut: z.enum(['active', 'inactive', 'archived']).optional()
});

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for offres GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching job offers from database');

    const { db } = await connectToDatabase();

    // Vérifier si la collection offres existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes('offres')) {
      logger.debug('Job offers collection does not exist, returning empty');
      return NextResponse.json({
        success: true,
        offres: []
      });
    }

    const offresCollection = db.collection('offres');

    const offres = await offresCollection
      .find({})
      .sort({ datePublication: -1, createdAt: -1 })
      .toArray();

    logger.info('Job offers fetched successfully', { count: offres.length });

    // Formater les données
    const formattedOffres = offres.map(offre => ({
      id: offre._id.toString(),
      titre: offre.titre || 'Sans titre',
      entreprise: offre.entreprise || 'Non spécifiée',
      lieu: offre.lieu || 'Non spécifié',
      typeContrat: offre.typeContrat || 'CDI',
      salaire: offre.salaire || 'Non spécifié',
      description: offre.description || '',
      competences: offre.competences || '',
      emailContact: offre.emailContact || '',
      datePublication: offre.datePublication || offre.createdAt || new Date().toISOString(),
      categorie: offre.categorie || 'Technologie',
      statut: offre.statut || 'active'
    }));

    return NextResponse.json({
      success: true,
      offres: formattedOffres
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch job offers', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job offers'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for offres POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = offreSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Job offer validation failed', { errors: validation.error.errors });
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const { db } = await connectToDatabase();

    // Créer la nouvelle offre
    const nouvelleOffre = {
      titre: validatedData.titre.trim(),
      entreprise: validatedData.entreprise.trim(),
      lieu: validatedData.lieu.trim(),
      typeContrat: validatedData.typeContrat.trim(),
      salaire: validatedData.salaire?.trim() || 'À négocier',
      description: validatedData.description.trim(),
      competences: validatedData.competences?.trim() || '',
      emailContact: validatedData.emailContact.toLowerCase().trim(),
      categorie: validatedData.categorie?.trim() || 'Technologie',
      statut: 'active' as const,
      datePublication: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('offres').insertOne(nouvelleOffre);

    logger.info('Job offer created successfully', {
      id: result.insertedId.toString(),
      titre: validatedData.titre
    });

    return NextResponse.json({
      success: true,
      message: 'Offre créée avec succès',
      id: result.insertedId.toString()
    });

  } catch (error: unknown) {
    logger.error('Failed to create job offer', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job offer'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for offres PUT', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.warn('Job offer update failed: missing ID');
      return NextResponse.json(
        {
          success: false,
          error: 'ID is required'
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      logger.warn('Job offer update failed: invalid ObjectId', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job offer ID format'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = offreUpdateSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Job offer update validation failed', { errors: validation.error.errors });
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    const { db } = await connectToDatabase();

    // Préparer les données à mettre à jour
    const updateData: Record<string, string> = {
      updatedAt: new Date().toISOString()
    };

    if (validatedData.titre) updateData.titre = validatedData.titre.trim();
    if (validatedData.entreprise) updateData.entreprise = validatedData.entreprise.trim();
    if (validatedData.lieu) updateData.lieu = validatedData.lieu.trim();
    if (validatedData.typeContrat) updateData.typeContrat = validatedData.typeContrat.trim();
    if (validatedData.salaire !== undefined) updateData.salaire = validatedData.salaire?.trim() || 'À négocier';
    if (validatedData.description) updateData.description = validatedData.description.trim();
    if (validatedData.competences !== undefined) updateData.competences = validatedData.competences?.trim() || '';
    if (validatedData.emailContact) updateData.emailContact = validatedData.emailContact.toLowerCase().trim();
    if (validatedData.categorie) updateData.categorie = validatedData.categorie.trim();
    if (validatedData.statut) updateData.statut = validatedData.statut;

    logger.debug('Updating job offer', { id });

    const result = await db.collection('offres').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      logger.warn('Job offer not found for update', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Job offer not found'
        },
        { status: 404 }
      );
    }

    logger.info('Job offer updated successfully', { id });

    return NextResponse.json({
      success: true,
      message: 'Offre mise à jour avec succès'
    });

  } catch (error: unknown) {
    logger.error('Failed to update job offer', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job offer'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for offres DELETE', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.warn('Job offer deletion failed: missing ID');
      return NextResponse.json(
        {
          success: false,
          error: 'ID is required'
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      logger.warn('Job offer deletion failed: invalid ObjectId', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job offer ID format'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    logger.debug('Deleting job offer', { id });

    const result = await db.collection('offres').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      logger.warn('Job offer not found for deletion', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Job offer not found'
        },
        { status: 404 }
      );
    }

    logger.info('Job offer deleted successfully', { id });

    return NextResponse.json({
      success: true,
      message: 'Offre supprimée avec succès'
    });

  } catch (error: unknown) {
    logger.error('Failed to delete job offer', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete job offer'
      },
      { status: 500 }
    );
  }
}
