// app/api/offres/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/lib/auth-helpers';
import type { OffreStatut } from '@/app/types/offres';

// Validation schema for bulk actions
const bulkActionSchema = z.object({
  offreIds: z.array(z.string()).min(1, 'Au moins une offre doit être sélectionnée'),
  action: z.enum(['changeStatus', 'archive', 'delete', 'duplicate']),
  targetStatus: z.enum(['draft', 'review', 'scheduled', 'active', 'expired', 'archived']).optional()
});

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

export async function POST(request: NextRequest) {
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for bulk action', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userEmail = session.user.email || 'unknown';

  try {
    const body = await request.json();

    const validation = bulkActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { offreIds, action, targetStatus } = validation.data;

    // Validate all IDs
    const invalidIds = offreIds.filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'IDs invalides', invalidIds },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();
    const objectIds = offreIds.map(id => new ObjectId(id));

    let result: { modifiedCount?: number; deletedCount?: number; insertedCount?: number } = {};

    switch (action) {
      case 'changeStatus': {
        if (!targetStatus) {
          return NextResponse.json(
            { success: false, error: 'targetStatus est requis pour changeStatus' },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = {
          statut: targetStatus,
          updatedAt: now,
          lastEditedBy: session.user.email || 'unknown'
        };

        // Set datePublication when going active
        if (targetStatus === 'active') {
          updateData.datePublication = now;
        }

        result = await db.collection('offres').updateMany(
          { _id: { $in: objectIds }, isTemplate: { $ne: true } },
          { $set: updateData }
        );

        logger.info('Bulk status change', {
          action,
          targetStatus,
          count: result.modifiedCount,
          by: session.user.email
        });
        break;
      }

      case 'archive': {
        result = await db.collection('offres').updateMany(
          { _id: { $in: objectIds }, isTemplate: { $ne: true } },
          {
            $set: {
              statut: 'archived' as OffreStatut,
              updatedAt: now,
              lastEditedBy: session.user.email || 'unknown'
            }
          }
        );

        logger.info('Bulk archive', {
          count: result.modifiedCount,
          by: session.user.email
        });
        break;
      }

      case 'delete': {
        // Don't delete templates accidentally
        result = await db.collection('offres').deleteMany({
          _id: { $in: objectIds },
          isTemplate: { $ne: true }
        });

        logger.info('Bulk delete', {
          count: result.deletedCount,
          by: session.user.email
        });
        break;
      }

      case 'duplicate': {
        // Fetch all offers to duplicate
        const offresToDuplicate = await db.collection('offres')
          .find({ _id: { $in: objectIds } })
          .toArray();

        if (offresToDuplicate.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Aucune offre trouvée' },
            { status: 404 }
          );
        }

        const duplicates = await Promise.all(
          offresToDuplicate.map(async (offre) => {
            // Generate unique slug for duplicate
            const baseSlug = generateSlug(offre.titre) + '-copie';
            let slug = baseSlug;
            let slugCounter = 1;
            while (await db.collection('offres').findOne({ 'seo.slug': slug })) {
              slug = `${baseSlug}-${slugCounter}`;
              slugCounter++;
            }

            return {
              ...offre,
              _id: new ObjectId(),
              titre: `${offre.titre} (copie)`,
              statut: 'draft' as OffreStatut,
              isTemplate: false,
              sourceTemplateId: offre._id,
              seo: {
                ...offre.seo,
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
              createdBy: userEmail,
              lastEditedBy: userEmail
            };
          })
        );

        const insertResult = await db.collection('offres').insertMany(duplicates);
        result = { insertedCount: insertResult.insertedCount };

        logger.info('Bulk duplicate', {
          count: insertResult.insertedCount,
          by: session.user.email
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action "${action}" effectuée avec succès`,
      result: {
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        insertedCount: result.insertedCount
      }
    });

  } catch (error) {
    logger.error('Bulk action failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Bulk action failed' },
      { status: 500 }
    );
  }
}
