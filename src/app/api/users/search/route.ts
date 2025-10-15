// src/app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth'

// GET /api/users/search?q=query - Search users for @mentions autocomplete
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('users')

    // Search by name or email
    const users = await collection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(10)
      .project({ name: 1, email: 1, _id: 1 })
      .toArray()

    return NextResponse.json({
      users: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email
      }))
    })
  } catch (error: unknown) {
    console.error('❌ Error searching users:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche d\'utilisateurs' },
      { status: 500 }
    )
  }
}
