// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Test de connexion et comptage des documents
    const contactsCount = await db.collection('contacts').countDocuments();
    const newslettersCount = await db.collection('newsletters').countDocuments();
    const offresCount = await db.collection('offres').countDocuments();
    
    return NextResponse.json({
      success: true,
      counts: {
        contacts: contactsCount,
        newsletters: newslettersCount,
        offres: offresCount
      }
    });
  } catch (error: unknown) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error }, 
      { status: 500 }
    );
  }
}