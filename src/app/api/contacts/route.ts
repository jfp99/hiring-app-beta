// app/api/contacts/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Fetching contacts from database...');
    
    const { db } = await connectToDatabase();
    console.log('✅ Database connected:', db.databaseName);
    
    // Récupérer les contacts depuis les collections candidats et entreprises
    const [candidats, entreprises] = await Promise.all([
      db.collection('candidats').find({}).sort({ date: -1 }).toArray(),
      db.collection('entreprises').find({}).sort({ date: -1 }).toArray()
    ]);
    
    console.log(`👤 Found ${candidats.length} candidats`);
    console.log(`🏢 Found ${entreprises.length} entreprises`);
    
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
    
    console.log(`📨 Total contacts: ${contacts.length}`);
    
    return NextResponse.json({ contacts });
    
  } catch (error: unknown) {
    console.error('❌ Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    );
  }
}