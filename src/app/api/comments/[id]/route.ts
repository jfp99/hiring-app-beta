// src/app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { UpdateCommentInput, extractMentions } from '@/app/types/comments'

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: commentId } = await params
    const body: UpdateCommentInput = await request.json()
    const { content, mentions } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const commentsCollection = db.collection('comments')
    const candidatesCollection = db.collection('candidates')

    // Find the comment
    const comment = await commentsCollection.findOne({ id: commentId })
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    const userId = (session.user as any)?.id || session.user?.email || 'unknown'
    if (comment.authorId !== userId && comment.authorEmail !== session.user?.email || 'unknown') {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    const timestamp = new Date().toISOString()
    const userName = session.user?.name || session.user?.email || 'unknown' || 'Unknown'

    // Extract mentions from content if not provided
    const extractedMentions = mentions || extractMentions(content)

    // Update comment
    const updateData: any = {
      content: content.trim(),
      updatedAt: timestamp,
      isEdited: true,
      mentions: extractedMentions.length > 0 ? extractedMentions : undefined
    }

    // Add to edit history
    const editHistory = comment.metadata?.editHistory || []
    editHistory.push({
      editedAt: timestamp,
      editedBy: userName
    })
    updateData['metadata.editHistory'] = editHistory

    await commentsCollection.updateOne(
      { id: commentId },
      { $set: updateData }
    )

    // Add activity to candidate
    await candidatesCollection.updateOne(
      { id: comment.candidateId },
      {
        $push: {
          activities: {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            type: 'comment_updated',
            description: `Commentaire modifié par ${userName}`,
            userId,
            userName,
            timestamp,
            metadata: {
              commentId,
              commentPreview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
            }
          }
        } as any,
        $set: {
          updatedAt: timestamp
        }
      }
    )

    // Fetch updated comment
    const updatedComment = await commentsCollection.findOne({ id: commentId })

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...updatedComment,
        id: updatedComment.id || updatedComment._id.toString(),
        _id: undefined
      }
    })
  } catch (error: unknown) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: commentId } = await params

    const { db } = await connectToDatabase()
    const commentsCollection = db.collection('comments')
    const candidatesCollection = db.collection('candidates')

    // Find the comment
    const comment = await commentsCollection.findOne({ id: commentId })
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or admin
    const userId = (session.user as any)?.id || session.user?.email || 'unknown'
    const isAuthor = comment.authorId === userId || comment.authorEmail === session.user?.email || 'unknown'
    const isAdmin = (session.user as any).role === 'admin'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete the comment
    await commentsCollection.deleteOne({ id: commentId })

    // Add activity to candidate
    const timestamp = new Date().toISOString()
    const userName = session.user?.name || session.user?.email || 'unknown' || 'Unknown'

    await candidatesCollection.updateOne(
      { id: comment.candidateId },
      {
        $push: {
          activities: {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            type: 'comment_deleted',
            description: `Commentaire supprimé par ${userName}`,
            userId,
            userName,
            timestamp,
            metadata: {
              commentId,
              deletedBy: userName
            }
          }
        } as any,
        $set: {
          updatedAt: timestamp
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error: unknown) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}
