// app/api/offres/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 [OFFRES] Fetching job offers from database...');
    
    const { db } = await connectToDatabase();
    
    // Vérifier si la collection offres existe
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('offres')) {
      console.log('📭 [OFFRES] offres collection does not exist');
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
    
    console.log(`📋 [OFFRES] Found ${offres.length} job offers total`);
    
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
    
  } catch (error) {
    console.error('❌ [OFFRES] Error fetching job offers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch job offers'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 [OFFRES] Creating new job offer...');
    
    // Lire le corps de la requête
    const text = await request.text();
    console.log('📦 [OFFRES] Raw request body:', text);
    
    let body;
    try {
      body = JSON.parse(text);
      console.log('📦 [OFFRES] Parsed request body:', body);
    } catch (parseError) {
      console.error('❌ [OFFRES] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON format' 
        }, 
        { status: 400 }
      );
    }
    
    // DEBUG: Afficher chaque champ individuellement
    console.log('🔍 [OFFRES] Field check:');
    console.log('  - titre:', body.titre);
    console.log('  - entreprise:', body.entreprise);
    console.log('  - lieu:', body.lieu);
    console.log('  - typeContrat:', body.typeContrat);
    console.log('  - description:', body.description);
    console.log('  - emailContact:', body.emailContact);
    
    // Validation des champs requis
    const requiredFields = ['titre', 'entreprise', 'lieu', 'typeContrat', 'description', 'emailContact'];
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      const value = body[field];
      console.log(`🔍 [OFFRES] Checking field "${field}":`, value, 'Type:', typeof value);
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    });
    
    console.log('🔍 [OFFRES] Missing fields found:', missingFields);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: `Champs manquants: ${missingFields.join(', ')}` 
        }, 
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Créer la nouvelle offre
    const nouvelleOffre = {
      titre: body.titre.trim(),
      entreprise: body.entreprise.trim(),
      lieu: body.lieu.trim(),
      typeContrat: body.typeContrat.trim(),
      salaire: body.salaire?.trim() || 'À négocier',
      description: body.description.trim(),
      competences: body.competences?.trim() || '',
      emailContact: body.emailContact.trim(),
      categorie: body.categorie?.trim() || 'Technologie',
      statut: 'active',
      datePublication: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 [OFFRES] Saving offer to database:', nouvelleOffre);
    
    const result = await db.collection('offres').insertOne(nouvelleOffre);
    
    console.log('✅ [OFFRES] Job offer created with id:', result.insertedId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Offre créée avec succès',
      id: result.insertedId.toString()
    });
    
  } catch (error) {
    console.error('❌ [OFFRES] Error creating job offer:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create job offer'
      }, 
      { status: 500 }
    );
  }
}