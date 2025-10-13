// src/app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { ObjectId } from 'mongodb'

// PUT /api/notifications/[id] - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('notifications')

    const result = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(params.id),
        userId: session.user?.email || session.user?.id
      },
      {
        $set: {
          isRead: true,
          readAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      notification: { ...result, id: result._id.toString(), _id: undefined },
      message: 'Notification marquée comme lue'
    })
  } catch (error: any) {
    console.error('❌ Error updating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('notifications')

    const result = await collection.deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user?.email || session.user?.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Notification supprimée avec succès'
    })
  } catch (error: any) {
    console.error('❌ Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
}
