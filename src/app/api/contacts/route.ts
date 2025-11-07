// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { auth } from '@/app/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for contacts GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    logger.debug('Fetching contacts from database');

    const { db } = await connectToDatabase();

    // Récupérer les contacts depuis les collections candidats et entreprises
    const [candidats, entreprises] = await Promise.all([
      db.collection('candidats').find({}).sort({ date: -1 }).toArray(),
      db.collection('entreprises').find({}).sort({ date: -1 }).toArray()
    ]);

    // Combiner et formater les données
    const contacts = [
      ...candidats.map(c => ({
        id: c._id.toString(),
        nom: c.nom || '',
        email: c.email || '',
        telephone: c.telephone || '',
        message: c.message || '',
        type: 'candidat' as const,
        date: c.date || c.createdAt || new Date().toISOString()
      })),
      ...entreprises.map(e => ({
        id: e._id.toString(),
        nom: e.nom || e.entreprise || '',
        email: e.email || '',
        telephone: e.telephone || '',
        message: e.message || e.besoins || '',
        type: 'entreprise' as const,
        date: e.date || e.createdAt || new Date().toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    logger.info('Contacts fetched successfully', {
      candidats: candidats.length,
      entreprises: entreprises.length,
      total: contacts.length
    });

    return NextResponse.json({ contacts });

  } catch (error: unknown) {
    logger.error('Failed to fetch contacts', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for contacts DELETE', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  // Check authentication - only authenticated users can delete contacts
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized contact deletion attempt', {
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
    const type = searchParams.get('type');

    if (!id || !type) {
      logger.warn('Contact deletion failed: missing ID or type');
      return NextResponse.json(
        {
          success: false,
          error: 'ID and type are required'
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      logger.warn('Contact deletion failed: invalid ObjectId', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contact ID format'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Déterminer la collection en fonction du type
    const collection = type === 'candidat' ? 'candidats' : 'entreprises';

    logger.debug('Deleting contact', { collection, id });

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      logger.warn('Contact not found for deletion', { id, collection });
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        { status: 404 }
      );
    }

    logger.info('Contact deleted successfully', {
      id,
      collection,
      type,
      deletedBy: session.user.email || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error: unknown) {
    logger.error('Failed to delete contact', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contact'
      },
      { status: 500 }
    );
  }
}