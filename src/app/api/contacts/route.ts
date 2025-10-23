// app/api/contacts/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

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

export async function DELETE(request: Request) {
  try {
    console.log('🗑️ [CONTACTS] Deleting contact...');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID and type are required'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Déterminer la collection en fonction du type
    const collection = type === 'candidat' ? 'candidats' : 'entreprises';

    console.log(`🗑️ [CONTACTS] Deleting from collection: ${collection}, ID: ${id}`);

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact not found'
        },
        { status: 404 }
      );
    }

    console.log(`✅ [CONTACTS] Contact deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error: unknown) {
    console.error('❌ [CONTACTS] Error deleting contact:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contact'
      },
      { status: 500 }
    );
  }
}