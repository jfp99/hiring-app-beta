// app/api/newsletters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/lib/auth-helpers';

// Validation schema
const newsletterSchema = z.object({
  email: z.string().email('Format d\'email invalide')
});

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for newsletters GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching newsletters from database');

    const { db } = await connectToDatabase();
    
    // Essayer différents noms de collection pour les newsletters
    const possibleCollections = ['newsletters', 'newsletter', 'abonnements', 'subscribers'];
    let newslettersCollection = null;
    let collectionNameUsed = '';

    for (const collectionName of possibleCollections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (exists) {
        newslettersCollection = db.collection(collectionName);
        collectionNameUsed = collectionName;
        logger.debug('Found newsletter collection', { collection: collectionName });
        break;
      }
    }

    if (!newslettersCollection) {
      logger.debug('No newsletter collection found, returning empty');
      return NextResponse.json({
        success: true,
        newsletters: []
      });
    }

    const newsletters = await newslettersCollection
      .find({})
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .toArray();

    logger.info('Newsletters fetched successfully', {
      count: newsletters.length,
      collection: collectionNameUsed
    });

    // Formater les données
    const formattedNewsletters = newsletters.map(newsletter => ({
      id: newsletter._id ? newsletter._id.toString() : `temp-${Date.now()}`,
      email: newsletter.email || newsletter.Email || '',
      date: newsletter.date || newsletter.createdAt || newsletter.subscribedAt || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      newsletters: formattedNewsletters,
      collectionUsed: collectionNameUsed
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch newsletters', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch newsletters',
        details: (error instanceof Error ? error.message : 'Erreur inconnue')
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (stricter for public signup forms to prevent spam)
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for newsletters POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = newsletterSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Newsletter validation failed', { errors: validation.error.errors });
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const { db } = await connectToDatabase();

    // Utiliser la collection newsletters (la créer si elle n'existe pas)
    const newslettersCollection = db.collection('newsletters');

    const normalizedEmail = email.trim().toLowerCase();

    // Vérifier si l'email existe déjà
    const existingSubscriber = await newslettersCollection.findOne({
      email: normalizedEmail
    });

    if (existingSubscriber) {
      logger.info('Newsletter subscription attempt with existing email', { email: normalizedEmail });
      return NextResponse.json(
        {
          success: false,
          error: 'Cet email est déjà inscrit à notre newsletter'
        },
        { status: 409 }
      );
    }

    const newSubscriber = {
      email: normalizedEmail,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'footer',
      statut: 'active'
    };

    const result = await newslettersCollection.insertOne(newSubscriber);

    logger.info('Newsletter subscription successful', {
      id: result.insertedId.toString(),
      email: normalizedEmail
    });

    return NextResponse.json({
      success: true,
      message: 'Merci ! Vous êtes maintenant inscrit à notre newsletter.',
      id: result.insertedId.toString()
    });

  } catch (error: unknown) {
    logger.error('Failed to subscribe to newsletter', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'inscription à la newsletter'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for newsletters DELETE', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  // Check authentication - only authenticated users can delete newsletter subscribers
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized newsletter deletion attempt', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Authentication required'
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.warn('Newsletter deletion failed: missing ID');
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
      logger.warn('Newsletter deletion failed: invalid ObjectId', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid newsletter ID format'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    logger.debug('Deleting newsletter subscriber', { id });

    const result = await db.collection('newsletters').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      logger.warn('Newsletter subscriber not found for deletion', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Newsletter subscriber not found'
        },
        { status: 404 }
      );
    }

    logger.info('Newsletter subscriber deleted successfully', {
      id,
      deletedBy: session.user.email || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Abonnement supprimé avec succès'
    });

  } catch (error: unknown) {
    logger.error('Failed to delete newsletter subscriber', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete newsletter subscriber'
      },
      { status: 500 }
    );
  }
}