// src/app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import { UpdateCandidateDTO, CandidateStatus } from '@/app/types/candidates'
import { z } from 'zod'

// GET: Get single candidate by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_VIEW)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const candidateId = params.id

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

    // Log activity
    await db.collection('activities').insertOne({
      type: 'candidate_viewed',
      userId: session.user.id,
      candidateId: candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${candidate.firstName} ${candidate.lastName}`
      }
    })

    const formattedCandidate = {
      id: candidate._id.toString(),
      ...candidate,
      _id: undefined
    }

    console.log(`✅ [CANDIDATES] Candidate viewed: ${candidateId}`)

    return NextResponse.json({
      success: true,
      candidate: formattedCandidate
    })

  } catch (error) {
    console.error('❌ [CANDIDATES] Error fetching candidate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    )
  }
}

// PUT: Update candidate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_EDIT)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const candidateId = params.id
    const body = await request.json() as UpdateCandidateDTO

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    // Find existing candidate
    const existingCandidate = await db.collection('candidates').findOne({
      _id: new ObjectId(candidateId)
    })

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Track status changes
    const statusChanged = body.status && body.status !== existingCandidate.status
    if (statusChanged) {
      // Add activity for status change
      const newActivity = {
        id: new Date().getTime().toString(),
        type: 'status_change',
        description: `Status changed from ${existingCandidate.status} to ${body.status}`,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        metadata: {
          oldStatus: existingCandidate.status,
          newStatus: body.status
        }
      }

      updateData.activities = [...(existingCandidate.activities || []), newActivity]

      // Update lastContactedAt if moving to contacted or beyond
      if (body.status !== CandidateStatus.NEW && body.status !== CandidateStatus.ARCHIVED) {
        updateData.lastContactedAt = new Date().toISOString()
      }
    }

    // If assigned to someone changes, get their name
    if (body.assignedTo && body.assignedTo !== existingCandidate.assignedTo) {
      const assignedUser = await db.collection('users').findOne({
        _id: new ObjectId(body.assignedTo)
      })
      if (assignedUser) {
        updateData.assignedToName = `${assignedUser.firstName} ${assignedUser.lastName}`
      }

      // Add activity for assignment
      const assignmentActivity = {
        id: new Date().getTime().toString() + '1',
        type: 'profile_updated',
        description: `Candidate assigned to ${updateData.assignedToName}`,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        metadata: {
          assignedTo: body.assignedTo,
          assignedToName: updateData.assignedToName
        }
      }

      if (!updateData.activities) {
        updateData.activities = existingCandidate.activities || []
      }
      updateData.activities = [...updateData.activities, assignmentActivity]
    }

    // Update candidate
    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      { $set: updateData }
    )

    // Log activity
    await db.collection('activities').insertOne({
      type: 'candidate_updated',
      userId: session.user.id,
      candidateId: candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${existingCandidate.firstName} ${existingCandidate.lastName}`,
        updates: Object.keys(body).filter(k => k !== 'activities')
      }
    })

    console.log('✅ [CANDIDATES] Candidate updated:', candidateId)

    return NextResponse.json({
      success: true,
      message: 'Candidate updated successfully'
    })

  } catch (error) {
    console.error('❌ [CANDIDATES] Error updating candidate:', error)
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}

// DELETE: Delete candidate (soft delete - archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_DELETE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const candidateId = params.id

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

    // Soft delete - archive the candidate
    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          isActive: false,
          isArchived: true,
          status: CandidateStatus.ARCHIVED,
          updatedAt: new Date().toISOString()
        }
      }
    )

    // Log activity
    await db.collection('activities').insertOne({
      type: 'candidate_deleted',
      userId: session.user.id,
      candidateId: candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${candidate.firstName} ${candidate.lastName}`
      }
    })

    console.log('✅ [CANDIDATES] Candidate archived:', candidateId)

    return NextResponse.json({
      success: true,
      message: 'Candidate archived successfully'
    })

  } catch (error) {
    console.error('❌ [CANDIDATES] Error deleting candidate:', error)
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    )
  }
}
