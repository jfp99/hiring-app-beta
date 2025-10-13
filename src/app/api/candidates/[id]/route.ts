// src/app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import { UpdateCandidateDTO, CandidateStatus } from '@/app/types/candidates'
import { toMongoStatus } from '@/app/lib/status-mapper'
import { z } from 'zod'

// GET: Get single candidate by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: candidateId } = await params

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
      // Use appStatus if available, otherwise fall back to status
      status: candidate.appStatus || candidate.status,
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id: candidateId } = await params
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

    // Prepare update data - only include fields that are actually in the body
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    // Only add fields that are present in the body
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'alternatePhone',
      'address', 'currentPosition', 'currentCompany', 'experienceLevel',
      'totalExperience', 'skills', 'primarySkills', 'languages',
      'workExperience', 'education', 'certifications', 'desiredPosition',
      'contractPreference', 'availability', 'willingToRelocate',
      'remoteWorkPreference', 'salaryExpectation', 'portfolioUrl',
      'linkedinUrl', 'githubUrl', 'websiteUrl', 'tags', 'overallRating',
      'technicalRating', 'culturalFitRating', 'communicationRating',
      'assignedTo', 'gdprConsent', 'marketingConsent', 'isActive', 'customFields',
      'profilePictureUrl'
      // Note: 'status' is handled separately in the status change logic below
    ]

    for (const field of allowedFields) {
      if (body[field as keyof UpdateCandidateDTO] !== undefined) {
        updateData[field] = body[field as keyof UpdateCandidateDTO]
      }
    }

    // Track status changes
    const oldAppStatus = existingCandidate.appStatus || existingCandidate.status
    const statusChanged = body.status && body.status !== oldAppStatus
    if (statusChanged) {
      // Store both the real app status and MongoDB-compatible status
      updateData.appStatus = body.status // Real application status
      updateData.status = toMongoStatus(body.status) // MongoDB-compatible status

      // Add activity for status change
      const newActivity = {
        id: new Date().getTime().toString(),
        type: 'status_change',
        description: `Status changed from ${oldAppStatus} to ${body.status}`,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        metadata: {
          oldStatus: oldAppStatus,
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

    // Log what we're about to update for debugging
    console.log('📝 [CANDIDATES] Update data:', JSON.stringify(updateData, null, 2))

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

    // Trigger workflows if status changed
    if (statusChanged && body.status) {
      try {
        const { WorkflowEngine } = await import('@/app/lib/workflowEngine')
        await WorkflowEngine.triggerOnStatusChange(
          candidateId,
          oldAppStatus as CandidateStatus,
          body.status
        )
        console.log('🔄 [WORKFLOW] Triggered workflows for status change')
      } catch (error) {
        console.error('❌ [WORKFLOW] Error triggering workflows:', error)
        // Don't fail the update if workflows fail
      }
    }

    // Trigger workflows if tags changed
    if (body.tags && existingCandidate.tags) {
      const oldTags = new Set(existingCandidate.tags)
      const newTags = new Set(body.tags)

      // Find added tags
      const addedTags = body.tags.filter((tag: string) => !oldTags.has(tag))

      if (addedTags.length > 0) {
        try {
          const { WorkflowEngine } = await import('@/app/lib/workflowEngine')
          for (const tag of addedTags) {
            await WorkflowEngine.triggerOnTagAdded(candidateId, tag)
          }
          console.log('🔄 [WORKFLOW] Triggered workflows for tag additions')
        } catch (error) {
          console.error('❌ [WORKFLOW] Error triggering tag workflows:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate updated successfully'
    })

  } catch (error: any) {
    console.error('❌ [CANDIDATES] Error updating candidate:', error)
    // Log MongoDB validation error details
    if (error.code === 121 && error.errInfo) {
      console.error('📋 [CANDIDATES] MongoDB Validation Error Details:', JSON.stringify(error.errInfo, null, 2))
    }
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}

// DELETE: Delete candidate (soft delete - archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: candidateId } = await params

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
          appStatus: CandidateStatus.ARCHIVED, // Real app status
          status: toMongoStatus(CandidateStatus.ARCHIVED), // MongoDB-compatible status
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
