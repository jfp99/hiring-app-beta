// app/api/debug/route.ts
// Protected debug endpoint - requires admin authentication
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { auth } from '@/app/lib/auth-helpers';
import { UserRole } from '@/app/types/auth';

export async function GET() {
  // Block in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_API !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  // Require admin authentication
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userRole = (session.user as Record<string, unknown>)?.role;
  if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { db } = await connectToDatabase();

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Only return counts, no sample data
    const collectionsData: Record<string, { count: number }> = {};

    for (const collectionName of collectionNames) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        collectionsData[collectionName] = { count };
      } catch {
        collectionsData[collectionName] = { count: 0 };
      }
    }

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      collections: collectionNames,
      data: collectionsData,
      timestamp: new Date().toISOString()
    });

  } catch {
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    );
  }
}
