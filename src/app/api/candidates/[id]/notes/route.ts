// src/app/api/candidates/[id]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import { z } from 'zod'

const addNoteSchema = z.object({
  content: z.string().min(1),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// POST: Add a note to candidate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.CANDIDATE_EDIT)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { id: candidateId } = await params
    const body = await request.json()
    const validatedData = addNoteSchema.parse(body)

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    const candidate = await db.collection('candidates').findOne({
      _id: new ObjectId(candidateId)
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    const newNote = {
      id: new Date().getTime().toString(),
      authorId: (session.user as any)?.id || session.user?.email || 'unknown',
      authorName: session.user?.name || session.user?.email || 'unknown',
      content: validatedData.content,
      createdAt: new Date().toISOString(),
      isPrivate: validatedData.isPrivate || false,
      tags: validatedData.tags || []
    }

    const newActivity = {
      id: new Date().getTime().toString() + '1',
      type: 'note_added',
      description: 'Note added to candidate profile',
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      userName: session.user?.name || session.user?.email || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: {
        notePreview: validatedData.content.substring(0, 50) + (validatedData.content.length > 50 ? '...' : '')
      }
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $push: {
          notes: newNote as any,
          activities: newActivity as any
        },
        $set: {
          updatedAt: new Date().toISOString()
        }
      }
    )

    console.log(`✅ [CANDIDATES] Note added to candidate: ${candidateId}`)

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
      note: newNote
    })

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: (error as {issues?: unknown[]})?.issues || [] },
        { status: 400 }
      )
    }

    console.error('❌ [CANDIDATES] Error adding note:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
