// app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorie = searchParams.get('categorie') || '';
    const lieu = searchParams.get('lieu') || '';
    const typeContrat = searchParams.get('typeContrat') || '';
    
    console.log('🔍 [JOBS] Fetching jobs with filters:', { search, categorie, lieu, typeContrat });
    
    const { db } = await connectToDatabase();
    
    // Vérifier si la collection offres existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('offres')) {
      console.log('📭 [JOBS] No offres collection found');
      return NextResponse.json({ 
        success: true,
        offres: [] 
      });
    }
    
    const offresCollection = db.collection('offres');
    
    // Construire la requête de filtrage - seulement les offres actives
    const query: any = { statut: 'active' };
    
    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { entreprise: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { competences: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (categorie && categorie !== 'toutes') {
      query.categorie = categorie;
    }
    
    if (lieu && lieu !== 'tous') {
      query.lieu = { $regex: lieu, $options: 'i' };
    }
    
    if (typeContrat && typeContrat !== 'tous') {
      query.typeContrat = typeContrat;
    }
    
    console.log('📋 [JOBS] MongoDB query:', JSON.stringify(query, null, 2));
    
    const offres = await offresCollection
      .find(query)
      .sort({ datePublication: -1 })
      .toArray();
    
    console.log(`📋 [JOBS] Found ${offres.length} job offers matching filters`);
    
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
    console.error('❌ [JOBS] Error fetching jobs:', error);
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