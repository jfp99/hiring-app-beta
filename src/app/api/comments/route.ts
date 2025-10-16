// src/app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { Comment, CreateCommentInput, extractMentions } from '@/app/types/comments'

// GET /api/comments?candidateId=xxx - List all comments for a candidate
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const commentsCollection = db.collection('comments')

    // Fetch comments for the candidate, sorted by creation date (newest first)
    const comments = await commentsCollection
      .find({ candidateId })
      .sort({ createdAt: -1 })
      .toArray()

    // Convert MongoDB _id to id
    const formattedComments = comments.map(comment => ({
      ...comment,
      id: comment.id || comment._id.toString(),
      _id: undefined
    }))

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      total: formattedComments.length
    })
  } catch (error: unknown) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateCommentInput = await request.json()
    const { candidateId, content, parentCommentId, mentions } = body

    if (!candidateId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'candidateId and content are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const commentsCollection = db.collection('comments')
    const candidatesCollection = db.collection('candidates')

    // Verify candidate exists
    const candidate = await candidatesCollection.findOne({ id: candidateId })
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    const timestamp = new Date().toISOString()
    const userId = (session.user as any)?.id || session.user?.email || 'unknown'
    const userName = session.user?.name || session.user?.email || 'unknown' || 'Unknown'

    // Extract mentions from content if not provided
    const extractedMentions = mentions || extractMentions(content)

    // Create new comment
    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      candidateId,
      content: content.trim(),
      authorId: userId,
      authorName: userName,
      authorEmail: session.user?.email || 'unknown'!,
      createdAt: timestamp,
      isEdited: false,
      parentCommentId: parentCommentId || null,
      mentions: extractedMentions.length > 0 ? extractedMentions : undefined,
      metadata: {}
    }

    await commentsCollection.insertOne(newComment)

    // Add activity to candidate
    await candidatesCollection.updateOne(
      { id: candidateId },
      {
        $push: {
          activities: {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            type: 'comment_added',
            description: `Commentaire ajouté par ${userName}`,
            userId,
            userName,
            timestamp,
            metadata: {
              commentId: newComment.id,
              commentPreview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
            }
          }
        } as any,
        $set: {
          updatedAt: timestamp
        }
      }
    )

    // Create notifications for mentioned users
    if (extractedMentions && extractedMentions.length > 0) {
      const notificationsCollection = db.collection('notifications')
      const usersCollection = db.collection('users')

      for (const mention of extractedMentions) {
        // Find user by email or name
        const mentionedUser = await usersCollection.findOne({
          $or: [
            { email: mention },
            { name: mention }
          ]
        })

        if (mentionedUser && mentionedUser.email !== (session.user?.email || 'unknown')) {
          // Don't notify yourself
          const notification = {
            userId: mentionedUser.email!,
            type: 'mention',
            title: `${userName} vous a mentionné`,
            message: `Dans un commentaire sur ${candidate.firstName} ${candidate.lastName}`,
            candidateId,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            commentId: newComment.id,
            mentionedBy: userId,
            mentionedByName: userName,
            link: `/candidates/${candidateId}`,
            metadata: {
              commentPreview: content.substring(0, 100)
            },
            isRead: false,
            isArchived: false,
            createdAt: timestamp
          }

          await notificationsCollection.insertOne(notification)
          console.log(`🔔 Notification created for mention: ${mention}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      comment: newComment
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}
