// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth'
import { CreateNotificationDTO } from '@/app/types/notifications'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const { db } = await connectToDatabase()
    const collection = db.collection('notifications')

    const query: any = {
      userId: session.user?.email || session.user?.id
    }

    if (unreadOnly) {
      query.isRead = false
    }

    // Don't show archived notifications by default
    query.isArchived = { $ne: true }

    const notifications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    // Get unread count
    const unreadCount = await collection.countDocuments({
      userId: session.user?.email || session.user?.id,
      isRead: false,
      isArchived: { $ne: true }
    })

    return NextResponse.json({
      notifications: notifications.map(n => ({ ...n, id: n._id.toString(), _id: undefined })),
      unreadCount
    })
  } catch (error: unknown) {
    console.error('❌ Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body: CreateNotificationDTO = await request.json()

    const { db } = await connectToDatabase()
    const collection = db.collection('notifications')

    const notification = {
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      candidateId: body.candidateId || null,
      candidateName: body.candidateName || null,
      commentId: body.commentId || null,
      taskId: body.taskId || null,
      workflowId: body.workflowId || null,
      mentionedBy: body.mentionedBy || null,
      mentionedByName: body.mentionedByName || null,
      link: body.link || null,
      metadata: body.metadata || {},
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString()
    }

    const result = await collection.insertOne(notification)

    console.log(`✅ Notification created for user: ${body.userId}`)

    return NextResponse.json({
      notification: { ...notification, id: result.insertedId.toString() },
      message: 'Notification créée avec succès'
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('❌ Error creating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/mark-all-read - Mark all as read
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('notifications')

    const result = await collection.updateMany(
      {
        userId: session.user?.email || session.user?.id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date().toISOString()
        }
      }
    )

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`)

    return NextResponse.json({
      message: 'Notifications marquées comme lues',
      count: result.modifiedCount
    })
  } catch (error: unknown) {
    console.error('❌ Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    )
  }
}
