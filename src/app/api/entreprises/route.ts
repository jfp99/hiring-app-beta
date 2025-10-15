// app/api/entreprises/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function POST(request: Request) {
  try {
    console.log('🏢 [ENTREPRISES] Creating new company contact...');
    
    const body = await request.json();
    console.log('📦 [ENTREPRISES] Request body:', body);
    
    // Validation des champs requis pour les entreprises
    const requiredFields = ['nom', 'email', 'sujet', 'message'];
    const missingFields = requiredFields.filter(field => !body[field] || body[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ [ENTREPRISES] Missing required fields:', missingFields);
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
    
    const nouvelleEntreprise = {
      nom: body.nom.trim(),
      email: body.email.trim(),
      telephone: body.telephone?.trim() || '',
      sujet: body.sujet.trim(),
      message: body.message.trim(),
      type: 'entreprise',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      statut: 'nouveau'
    };
    
    console.log('💾 [ENTREPRISES] Saving company to database:', nouvelleEntreprise);
    
    const result = await db.collection('entreprises').insertOne(nouvelleEntreprise);
    
    console.log('✅ [ENTREPRISES] Company created with id:', result.insertedId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Votre demande a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.',
      id: result.insertedId.toString()
    });
    
  } catch (error: unknown) {
    console.error('❌ [ENTREPRISES] Error creating company:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'envoi de votre demande' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 [ENTREPRISES] Fetching companies...');
    
    const { db } = await connectToDatabase();
    
    const entreprises = await db.collection('entreprises')
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    console.log(`📋 [ENTREPRISES] Found ${entreprises.length} companies`);
    
    const formattedEntreprises = entreprises.map(entreprise => ({
      id: entreprise._id.toString(),
      nom: entreprise.nom,
      email: entreprise.email,
      telephone: entreprise.telephone,
      sujet: entreprise.sujet,
      message: entreprise.message,
      date: entreprise.date,
      statut: entreprise.statut
    }));
    
    return NextResponse.json({ 
      success: true,
      entreprises: formattedEntreprises 
    });
    
  } catch (error: unknown) {
    console.error('❌ [ENTREPRISES] Error fetching companies:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch companies' 
      }, 
      { status: 500 }
    );
  }
}