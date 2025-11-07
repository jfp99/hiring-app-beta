// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logger } from '@/app/lib/logger';
import { RateLimiters, createSafeRegex } from '@/app/lib/security';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for jobs GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorie = searchParams.get('categorie') || '';
    const lieu = searchParams.get('lieu') || '';
    const typeContrat = searchParams.get('typeContrat') || '';

    logger.debug('Fetching jobs with filters', { search, categorie, lieu, typeContrat });
    
    const { db } = await connectToDatabase();
    
    // Vérifier si la collection offres existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes('offres')) {
      logger.debug('No job offers collection found, returning empty');
      return NextResponse.json({
        success: true,
        offres: []
      });
    }
    
    const offresCollection = db.collection('offres');
    
    // Construire la requête de filtrage - seulement les offres actives
    const query: any = { statut: 'active' };

    if (search) {
      const safeSearchRegex = createSafeRegex(search);
      query.$or = [
        { titre: safeSearchRegex },
        { entreprise: safeSearchRegex },
        { description: safeSearchRegex },
        { competences: safeSearchRegex }
      ];
    }

    if (categorie && categorie !== 'toutes') {
      query.categorie = categorie;
    }

    if (lieu && lieu !== 'tous') {
      query.lieu = createSafeRegex(lieu);
    }

    if (typeContrat && typeContrat !== 'tous') {
      query.typeContrat = typeContrat;
    }

    logger.debug('MongoDB query for jobs', { query });
    
    const offres = await offresCollection
      .find(query)
      .sort({ datePublication: -1 })
      .toArray();

    logger.info('Job offers fetched successfully', { count: offres.length, filters: { search, categorie, lieu, typeContrat } });
    
    // Formater les données pour la page offres-emploi
    const formattedOffres = offres.map(offre => ({
      id: offre._id.toString(),
      titre: offre.titre || '',
      entreprise: offre.entreprise || '',
      lieu: offre.lieu || '',
      typeContrat: offre.typeContrat || '',
      salaire: offre.salaire || '',
      description: offre.description || '',
      datePublication: offre.datePublication || offre.createdAt || new Date().toISOString(),
      categorie: offre.categorie || 'Technologie'
    }));
    
    return NextResponse.json({
      success: true,
      offres: formattedOffres
    });

  } catch (error: unknown) {
    logger.error('Failed to fetch jobs', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        offres: [] // Retourner un tableau vide en cas d'erreur
      },
      { status: 500 }
    );
  }
}