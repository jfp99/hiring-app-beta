// app/api/offres/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/lib/auth-helpers';
import type { OffreStatut } from '@/app/types/offres';

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const params = await context.params;
    const { id } = params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    // Find the original offer
    const originalOffre = await db.collection('offres').findOne({
      _id: new ObjectId(id)
    });

    if (!originalOffre) {
      return NextResponse.json(
        { success: false, error: 'Offre non trouvée' },
        { status: 404 }
      );
    }

    // Generate unique slug for duplicate
    const baseSlug = generateSlug(originalOffre.titre) + '-copie';
    let slug = baseSlug;
    let slugCounter = 1;
    while (await db.collection('offres').findOne({ 'seo.slug': slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create the duplicate
    const duplicate = {
      ...originalOffre,
      _id: new ObjectId(),
      titre: `${originalOffre.titre} (copie)`,
      statut: 'draft' as OffreStatut,
      isTemplate: false,
      sourceTemplateId: originalOffre._id,
      seo: {
        ...originalOffre.seo,
        slug
      },
      analytics: {
        views: 0,
        applications: 0,
        clickThroughRate: 0
      },
      datePublication: null,
      createdAt: now,
      updatedAt: now,
      createdBy: session.user.email || 'unknown',
      lastEditedBy: session.user.email || 'unknown'
    };

    const result = await db.collection('offres').insertOne(duplicate);

    logger.info('Offer duplicated', {
      originalId: id,
      newId: result.insertedId.toString(),
      by: session.user.email
    });

    return NextResponse.json({
      success: true,
      message: 'Offre dupliquée avec succès',
      id: result.insertedId.toString(),
      slug
    });

  } catch (error) {
    logger.error('Failed to duplicate offer', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate offer' },
      { status: 500 }
    );
  }
}
