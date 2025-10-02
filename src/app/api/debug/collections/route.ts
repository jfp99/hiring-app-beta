// app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    console.log('🔧 [DEBUG] Starting debug check...');
    
    const { db } = await connectToDatabase();
    console.log('✅ [DEBUG] Database connected:', db.databaseName);
    
    // Vérifier toutes les collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('📋 [DEBUG] Available collections:', collectionNames);
    
    // Vérifier le contenu de chaque collection
    const collectionsData: any = {};
    
    for (const collectionName of collectionNames) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        const sample = await db.collection(collectionName).find({}).limit(2).toArray();
        
        collectionsData[collectionName] = {
          count,
          sample: sample.map(doc => ({
            ...doc,
            _id: doc._id.toString()
          }))
        };
      } catch (error) {
        collectionsData[collectionName] = {
          error: error.message,
          count: 0,
          sample: []
        };
      }
    }
    
    const response = {
      success: true,
      database: db.databaseName,
      collections: collectionNames,
      data: collectionsData,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ [DEBUG] Debug data collected successfully');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}