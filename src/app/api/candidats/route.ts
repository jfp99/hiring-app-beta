// app/api/candidats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function POST(request: Request) {
  try {
    console.log('👤 [CANDIDATS] Creating new candidate contact...');
    
    const body = await request.json();
    console.log('📦 [CANDIDATS] Request body:', body);
    
    // Validation des champs requis pour les candidats
    const requiredFields = ['nom', 'email', 'sujet', 'message'];
    const missingFields = requiredFields.filter(field => !body[field] || body[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ [CANDIDATS] Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false,
          error: 'Tous les champs obligatoires doivent être remplis',
          missingFields 
        }, 
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const nouveauCandidat = {
      nom: body.nom.trim(),
      email: body.email.trim(),
      telephone: body.telephone?.trim() || '',
      sujet: body.sujet.trim(),
      message: body.message.trim(),
      type: 'candidat',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      statut: 'nouveau'
    };
    
    console.log('💾 [CANDIDATS] Saving candidate to database:', nouveauCandidat);
    
    const result = await db.collection('candidats').insertOne(nouveauCandidat);
    
    console.log('✅ [CANDIDATS] Candidate created with id:', result.insertedId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Votre candidature a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.',
      id: result.insertedId.toString()
    });
    
  } catch (error) {
    console.error('❌ [CANDIDATS] Error creating candidate:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'envoi de votre candidature' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 [CANDIDATS] Fetching candidates...');
    
    const { db } = await connectToDatabase();
    
    const candidats = await db.collection('candidats')
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    console.log(`📋 [CANDIDATS] Found ${candidats.length} candidates`);
    
    const formattedCandidats = candidats.map(candidat => ({
      id: candidat._id.toString(),
      nom: candidat.nom,
      email: candidat.email,
      telephone: candidat.telephone,
      sujet: candidat.sujet,
      message: candidat.message,
      date: candidat.date,
      statut: candidat.statut
    }));
    
    return NextResponse.json({ 
      success: true,
      candidats: formattedCandidats 
    });
    
  } catch (error) {
    console.error('❌ [CANDIDATS] Error fetching candidates:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch candidates' 
      }, 
      { status: 500 }
    );
  }
}