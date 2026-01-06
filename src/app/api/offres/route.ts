// app/api/offres/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/lib/auth-helpers';
import type { OffreStatut } from '@/app/types/offres';

// Extended validation schemas
const schedulingSchema = z.object({
  scheduledPublishDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  autoArchive: z.boolean().optional()
}).optional();

const mediaSchema = z.object({
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional()
}).optional();

const seoSchema = z.object({
  slug: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional()
}).optional();

const offreSchema = z.object({
  // Required fields
  titre: z.string().min(1, 'Le titre est requis'),
  entreprise: z.string().min(1, 'L\'entreprise est requise'),
  lieu: z.string().min(1, 'Le lieu est requis'),
  typeContrat: z.string().min(1, 'Le type de contrat est requis'),
  emailContact: z.string().email('Email invalide'),

  // Optional basic fields
  salaire: z.string().optional(),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  competences: z.string().optional(),
  categorie: z.string().optional(),

  // Rich content arrays
  responsabilites: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  avantages: z.array(z.string()).optional(),

  // Status and workflow
  statut: z.enum(['draft', 'review', 'scheduled', 'active', 'expired', 'archived']).optional(),

  // Template system
  isTemplate: z.boolean().optional(),
  templateName: z.string().optional(),
  sourceTemplateId: z.string().optional(),

  // Scheduling
  scheduling: schedulingSchema,

  // Media
  media: mediaSchema,

  // SEO
  seo: seoSchema
});

const offreUpdateSchema = z.object({
  // Basic fields
  titre: z.string().min(1).optional(),
  entreprise: z.string().min(1).optional(),
  lieu: z.string().min(1).optional(),
  typeContrat: z.string().min(1).optional(),
  salaire: z.string().optional(),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  competences: z.string().optional(),
  emailContact: z.string().email().optional(),
  categorie: z.string().optional(),

  // Rich content arrays
  responsabilites: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  avantages: z.array(z.string()).optional(),

  // Status
  statut: z.enum(['draft', 'review', 'scheduled', 'active', 'expired', 'archived']).optional(),

  // Template system
  isTemplate: z.boolean().optional(),
  templateName: z.string().optional(),

  // Scheduling
  scheduling: schedulingSchema,

  // Media
  media: mediaSchema,

  // SEO
  seo: seoSchema
});

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim();
}

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

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut') as OffreStatut | null;
    const categorie = searchParams.get('categorie');
    const typeContrat = searchParams.get('typeContrat');
    const isTemplate = searchParams.get('isTemplate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { db } = await connectToDatabase();

    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes('offres')) {
      logger.debug('Job offers collection does not exist, returning empty');
      return NextResponse.json({
        success: true,
        offres: [],
        total: 0
      });
    }

    const offresCollection = db.collection('offres');

    // Build query
    const query: Record<string, unknown> = {};

    if (statut) {
      query.statut = statut;
    }
    if (categorie) {
      query.categorie = categorie;
    }
    if (typeContrat) {
      query.typeContrat = typeContrat;
    }
    if (isTemplate === 'true') {
      query.isTemplate = true;
    } else if (isTemplate === 'false') {
      query.isTemplate = { $ne: true };
    }
    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { entreprise: { $regex: search, $options: 'i' } },
        { lieu: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await offresCollection.countDocuments(query);

    // Fetch with pagination
    const offres = await offresCollection
      .find(query)
      .sort({ datePublication: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    logger.info('Job offers fetched successfully', { count: offres.length, total });

    // Format data with all enhanced fields
    const formattedOffres = offres.map(offre => ({
      id: offre._id.toString(),
      titre: offre.titre || 'Sans titre',
      entreprise: offre.entreprise || 'Non spécifiée',
      lieu: offre.lieu || 'Non spécifié',
      typeContrat: offre.typeContrat || 'CDI',
      salaire: offre.salaire || 'Non spécifié',
      description: offre.description || '',
      descriptionHtml: offre.descriptionHtml || offre.description || '',
      competences: offre.competences || '',
      emailContact: offre.emailContact || '',
      datePublication: offre.datePublication || offre.createdAt || new Date().toISOString(),
      categorie: offre.categorie || 'Technologie',
      statut: offre.statut || 'active',

      // Rich content
      responsabilites: offre.responsabilites || [],
      qualifications: offre.qualifications || [],
      avantages: offre.avantages || [],

      // Template system
      isTemplate: offre.isTemplate || false,
      templateName: offre.templateName || null,
      sourceTemplateId: offre.sourceTemplateId || null,

      // Scheduling
      scheduling: offre.scheduling || null,

      // Media
      media: offre.media || null,

      // SEO
      seo: offre.seo || {
        slug: generateSlug(offre.titre || ''),
        metaTitle: offre.titre || '',
        metaDescription: '',
        keywords: []
      },

      // Analytics
      analytics: offre.analytics || {
        views: 0,
        applications: 0,
        clickThroughRate: 0
      },

      // Timestamps
      createdAt: offre.createdAt || new Date().toISOString(),
      updatedAt: offre.updatedAt || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      offres: formattedOffres,
      total,
      limit,
      offset
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

  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized job offer creation attempt', {
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
    const body = await request.json();

    // Validate input
    const validation = offreSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Job offer validation failed', { errors: validation.error.issues });
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const now = new Date().toISOString();

    const { db } = await connectToDatabase();

    // Generate SEO slug
    const baseSlug = data.seo?.slug || generateSlug(data.titre);

    // Check for slug uniqueness and append number if needed
    let slug = baseSlug;
    let slugCounter = 1;
    while (await db.collection('offres').findOne({ 'seo.slug': slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create the new offer with all fields
    const nouvelleOffre = {
      // Basic fields
      titre: data.titre.trim(),
      entreprise: data.entreprise.trim(),
      lieu: data.lieu.trim(),
      typeContrat: data.typeContrat.trim(),
      salaire: data.salaire?.trim() || 'À négocier',
      description: data.description?.trim() || '',
      descriptionHtml: data.descriptionHtml?.trim() || data.description?.trim() || '',
      competences: data.competences?.trim() || '',
      emailContact: data.emailContact.toLowerCase().trim(),
      categorie: data.categorie?.trim() || 'Technologie',

      // Status - default to draft for new offers
      statut: data.statut || 'draft',

      // Rich content
      responsabilites: data.responsabilites || [],
      qualifications: data.qualifications || [],
      avantages: data.avantages || [],

      // Template system
      isTemplate: data.isTemplate || false,
      templateName: data.templateName?.trim() || null,
      sourceTemplateId: data.sourceTemplateId ? new ObjectId(data.sourceTemplateId) : null,

      // Scheduling
      scheduling: data.scheduling || null,

      // Media
      media: data.media || null,

      // SEO
      seo: {
        slug,
        metaTitle: data.seo?.metaTitle?.trim() || data.titre.trim(),
        metaDescription: data.seo?.metaDescription?.trim() || '',
        keywords: data.seo?.keywords || []
      },

      // Analytics (initialize)
      analytics: {
        views: 0,
        applications: 0,
        clickThroughRate: 0
      },

      // Audit trail
      createdBy: session.user.email || 'unknown',
      lastEditedBy: session.user.email || 'unknown',

      // Timestamps
      datePublication: data.statut === 'active' ? now : null,
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('offres').insertOne(nouvelleOffre);

    logger.info('Job offer created successfully', {
      id: result.insertedId.toString(),
      titre: data.titre,
      statut: nouvelleOffre.statut,
      isTemplate: nouvelleOffre.isTemplate,
      createdBy: session.user.email || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Offre créée avec succès',
      id: result.insertedId.toString(),
      slug
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

  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized job offer update attempt', {
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
      logger.warn('Job offer update validation failed', { errors: validation.error.issues });
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    // Get current offer to check for changes
    const currentOffre = await db.collection('offres').findOne({ _id: new ObjectId(id) });
    if (!currentOffre) {
      logger.warn('Job offer not found for update', { id });
      return NextResponse.json(
        {
          success: false,
          error: 'Job offer not found'
        },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: now,
      lastEditedBy: session.user.email || 'unknown'
    };

    // Basic fields
    if (data.titre !== undefined) updateData.titre = data.titre.trim();
    if (data.entreprise !== undefined) updateData.entreprise = data.entreprise.trim();
    if (data.lieu !== undefined) updateData.lieu = data.lieu.trim();
    if (data.typeContrat !== undefined) updateData.typeContrat = data.typeContrat.trim();
    if (data.salaire !== undefined) updateData.salaire = data.salaire?.trim() || 'À négocier';
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.descriptionHtml !== undefined) updateData.descriptionHtml = data.descriptionHtml.trim();
    if (data.competences !== undefined) updateData.competences = data.competences?.trim() || '';
    if (data.emailContact !== undefined) updateData.emailContact = data.emailContact.toLowerCase().trim();
    if (data.categorie !== undefined) updateData.categorie = data.categorie.trim();

    // Status changes
    if (data.statut !== undefined) {
      updateData.statut = data.statut;
      // Set datePublication when going active
      if (data.statut === 'active' && currentOffre.statut !== 'active') {
        updateData.datePublication = now;
      }
    }

    // Rich content
    if (data.responsabilites !== undefined) updateData.responsabilites = data.responsabilites;
    if (data.qualifications !== undefined) updateData.qualifications = data.qualifications;
    if (data.avantages !== undefined) updateData.avantages = data.avantages;

    // Template system
    if (data.isTemplate !== undefined) updateData.isTemplate = data.isTemplate;
    if (data.templateName !== undefined) updateData.templateName = data.templateName?.trim() || null;

    // Scheduling
    if (data.scheduling !== undefined) updateData.scheduling = data.scheduling;

    // Media
    if (data.media !== undefined) updateData.media = data.media;

    // SEO
    if (data.seo !== undefined) {
      const newSeo = { ...currentOffre.seo };
      if (data.seo.slug !== undefined) {
        // Check slug uniqueness
        const slugExists = await db.collection('offres').findOne({
          'seo.slug': data.seo.slug,
          _id: { $ne: new ObjectId(id) }
        });
        if (slugExists) {
          return NextResponse.json(
            {
              success: false,
              error: 'Ce slug est déjà utilisé'
            },
            { status: 400 }
          );
        }
        newSeo.slug = data.seo.slug;
      }
      if (data.seo.metaTitle !== undefined) newSeo.metaTitle = data.seo.metaTitle.trim();
      if (data.seo.metaDescription !== undefined) newSeo.metaDescription = data.seo.metaDescription.trim();
      if (data.seo.keywords !== undefined) newSeo.keywords = data.seo.keywords;
      updateData.seo = newSeo;
    }

    logger.debug('Updating job offer', { id, fields: Object.keys(updateData) });

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

    logger.info('Job offer updated successfully', {
      id,
      updatedBy: session.user.email || 'unknown'
    });

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

  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    logger.warn('Unauthorized job offer deletion attempt', {
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

    logger.info('Job offer deleted successfully', {
      id,
      deletedBy: session.user.email || 'unknown'
    });

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
