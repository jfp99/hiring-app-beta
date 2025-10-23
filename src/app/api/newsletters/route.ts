// app/api/newsletters/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('📧 [NEWSLETTERS] Fetching newsletters from database...');
    
    const { db } = await connectToDatabase();
    console.log('✅ [NEWSLETTERS] Database connected:', db.databaseName);
    
    // Essayer différents noms de collection pour les newsletters
    const possibleCollections = ['newsletters', 'newsletter', 'abonnements', 'subscribers'];
    let newslettersCollection = null;
    let collectionNameUsed = '';
    
    for (const collectionName of possibleCollections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (exists) {
        newslettersCollection = db.collection(collectionName);
        collectionNameUsed = collectionName;
        console.log(`📋 [NEWSLETTERS] Using collection: ${collectionName}`);
        break;
      }
    }
    
    if (!newslettersCollection) {
      console.log('📭 [NEWSLETTERS] No newsletter collection found');
      return NextResponse.json({ 
        success: true,
        newsletters: [] 
      });
    }
    
    const newsletters = await newslettersCollection
      .find({})
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .toArray();
    
    console.log(`📨 [NEWSLETTERS] Found ${newsletters.length} newsletter subscriptions`);
    
    // Formater les données
    const formattedNewsletters = newsletters.map(newsletter => ({
      id: newsletter._id ? newsletter._id.toString() : `temp-${Date.now()}`,
      email: newsletter.email || newsletter.Email || '',
      date: newsletter.date || newsletter.createdAt || newsletter.subscribedAt || new Date().toISOString()
    }));
    
    return NextResponse.json({ 
      success: true,
      newsletters: formattedNewsletters,
      collectionUsed: collectionNameUsed
    });
    
  } catch (error: unknown) {
    console.error('❌ [NEWSLETTERS] Error fetching newsletters:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch newsletters', 
        details: (error instanceof Error ? error.message : 'Erreur inconnue') 
      }, 
      { status: 500 }
    );
  }
}

// app/api/newsletters/route.ts - Ajoutez cette fonction
export async function POST(request: Request) {
  try {
    console.log('📧 [NEWSLETTERS] Subscribing to newsletter...');

    const body = await request.json();
    console.log('📦 [NEWSLETTERS] Request body:', body);

    // Validation de l'email
    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'L\'email est requis'
        },
        { status: 400 }
      );
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format d\'email invalide'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Utiliser la collection newsletters (la créer si elle n'existe pas)
    const newslettersCollection = db.collection('newsletters');

    // Vérifier si l'email existe déjà
    const existingSubscriber = await newslettersCollection.findOne({
      email: body.email.trim().toLowerCase()
    });

    if (existingSubscriber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cet email est déjà inscrit à notre newsletter'
        },
        { status: 409 }
      );
    }

    const newSubscriber = {
      email: body.email.trim().toLowerCase(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'footer', // Vous pouvez tracker d'où vient l'inscription
      statut: 'active'
    };

    console.log('💾 [NEWSLETTERS] Saving subscriber to database:', newSubscriber);

    const result = await newslettersCollection.insertOne(newSubscriber);

    console.log('✅ [NEWSLETTERS] Subscriber created with id:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Merci ! Vous êtes maintenant inscrit à notre newsletter.',
      id: result.insertedId.toString()
    });

  } catch (error: unknown) {
    console.error('❌ [NEWSLETTERS] Error subscribing to newsletter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'inscription à la newsletter'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('🗑️ [NEWSLETTERS] Deleting newsletter subscriber...');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID is required'
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');

    console.log(`🗑️ [NEWSLETTERS] Deleting ID: ${id}`);

    const result = await db.collection('newsletters').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Newsletter subscriber not found'
        },
        { status: 404 }
      );
    }

    console.log(`✅ [NEWSLETTERS] Newsletter subscriber deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement supprimé avec succès'
    });

  } catch (error: unknown) {
    console.error('❌ [NEWSLETTERS] Error deleting newsletter subscriber:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete newsletter subscriber'
      },
      { status: 500 }
    );
  }
}