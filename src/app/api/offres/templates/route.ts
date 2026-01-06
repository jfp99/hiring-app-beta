// app/api/offres/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, isValidObjectId } from '@/app/lib/security';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/lib/auth-helpers';

// Validation schema for creating template
const templateSchema = z.object({
  templateName: z.string().min(1, 'Le nom du template est requis'),
  titre: z.string().min(1, 'Le titre est requis'),
  entreprise: z.string().optional(),
  lieu: z.string().optional(),
  typeContrat: z.string().min(1, 'Le type de contrat est requis'),
  salaire: z.string().optional(),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  competences: z.string().optional(),
  emailContact: z.string().email().optional(),
  categorie: z.string().optional(),
  responsabilites: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  avantages: z.array(z.string()).optional()
});

// GET - List all templates
export async function GET(request: NextRequest) {
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get('categorie');
    const typeContrat = searchParams.get('typeContrat');
    const search = searchParams.get('search');

    const { db } = await connectToDatabase();

    // Build query for templates only
    const query: Record<string, unknown> = { isTemplate: true };

    if (categorie) {
      query.categorie = categorie;
    }
    if (typeContrat) {
      query.typeContrat = typeContrat;
    }
    if (search) {
      query.$or = [
        { templateName: { $regex: search, $options: 'i' } },
        { titre: { $regex: search, $options: 'i' } }
      ];
    }

    const templates = await db.collection('offres')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedTemplates = templates.map(t => ({
      id: t._id.toString(),
      templateName: t.templateName,
      titre: t.titre,
      entreprise: t.entreprise || '',
      lieu: t.lieu || '',
      typeContrat: t.typeContrat,
      salaire: t.salaire || '',
      description: t.description || '',
      descriptionHtml: t.descriptionHtml || '',
      competences: t.competences || '',
      emailContact: t.emailContact || '',
      categorie: t.categorie || 'Technologie',
      responsabilites: t.responsabilites || [],
      qualifications: t.qualifications || [],
      avantages: t.avantages || [],
      createdAt: t.createdAt,
      createdBy: t.createdBy
    }));

    logger.info('Templates fetched', { count: formattedTemplates.length });

    return NextResponse.json({
      success: true,
      templates: formattedTemplates
    });

  } catch (error) {
    logger.error('Failed to fetch templates', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const validation = templateSchema.safeParse(body);
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

    const data = validation.data;
    const now = new Date().toISOString();

    const { db } = await connectToDatabase();

    // Check if template name already exists
    const existingTemplate = await db.collection('offres').findOne({
      isTemplate: true,
      templateName: data.templateName
    });

    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Un template avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const newTemplate = {
      isTemplate: true,
      templateName: data.templateName.trim(),
      titre: data.titre.trim(),
      entreprise: data.entreprise?.trim() || '',
      lieu: data.lieu?.trim() || '',
      typeContrat: data.typeContrat.trim(),
      salaire: data.salaire?.trim() || '',
      description: data.description?.trim() || '',
      descriptionHtml: data.descriptionHtml?.trim() || '',
      competences: data.competences?.trim() || '',
      emailContact: data.emailContact?.toLowerCase().trim() || '',
      categorie: data.categorie?.trim() || 'Technologie',
      responsabilites: data.responsabilites || [],
      qualifications: data.qualifications || [],
      avantages: data.avantages || [],
      statut: 'draft',
      createdBy: session.user.email || 'unknown',
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('offres').insertOne(newTemplate);

    logger.info('Template created', {
      id: result.insertedId.toString(),
      name: data.templateName,
      createdBy: session.user.email
    });

    return NextResponse.json({
      success: true,
      message: 'Template créé avec succès',
      id: result.insertedId.toString()
    });

  } catch (error) {
    logger.error('Failed to create template', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT - Update a template
export async function PUT(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    // Check if template exists
    const existingTemplate = await db.collection('offres').findOne({
      _id: new ObjectId(id),
      isTemplate: true
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    // Check if new templateName conflicts with another template
    if (body.templateName && body.templateName !== existingTemplate.templateName) {
      const nameConflict = await db.collection('offres').findOne({
        isTemplate: true,
        templateName: body.templateName,
        _id: { $ne: new ObjectId(id) }
      });
      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Un template avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      lastEditedBy: session.user.email || 'unknown'
    };

    // Only update fields that are provided
    const allowedFields = [
      'templateName', 'titre', 'entreprise', 'lieu', 'typeContrat',
      'salaire', 'description', 'descriptionHtml', 'competences',
      'emailContact', 'categorie', 'responsabilites', 'qualifications', 'avantages'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    }

    await db.collection('offres').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    logger.info('Template updated', { id, updatedBy: session.user.email });

    return NextResponse.json({
      success: true,
      message: 'Template mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Failed to update template', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('offres').deleteOne({
      _id: new ObjectId(id),
      isTemplate: true
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    logger.info('Template deleted', { id, deletedBy: session.user.email });

    return NextResponse.json({
      success: true,
      message: 'Template supprimé avec succès'
    });

  } catch (error) {
    logger.error('Failed to delete template', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
