// src/app/api/processes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    console.log('[GET /api/processes/[id]] Session:', session ? {email: session.user?.email, role: session.user?.role} : 'null')
    const userRole = session?.user?.role as string | undefined
    if (!session || !userRole || !['admin', 'super_admin'].includes(userRole)) {
      console.log('[GET /api/processes/[id]] Authorization failed - session:', !!session, 'userRole:', userRole)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: processId } = await params
    const { db } = await connectToDatabase()

    console.log('[GET /api/processes/[id]] Looking for processId:', processId)

    // Try to find by custom id field first, then by _id
    let process = await db.collection('processes').findOne({
      id: processId,
      isDeleted: { $ne: true }
    })

    // If not found by custom id, try MongoDB _id
    if (!process) {
      try {
        const { ObjectId } = await import('mongodb')
        process = await db.collection('processes').findOne({
          _id: new ObjectId(processId),
          isDeleted: { $ne: true }
        })
        console.log('[GET /api/processes/[id]] Found by _id:', !!process)
      } catch (e) {
        console.log('[GET /api/processes/[id]] Invalid ObjectId:', e)
      }
    } else {
      console.log('[GET /api/processes/[id]] Found by id field:', !!process)
    }

    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Get candidate count and metrics
    const candidates = await db.collection('candidates').find({
      processIds: processId,
      isDeleted: { $ne: true }
    }).toArray()

    // Calculate metrics
    const metrics = {
      totalCandidates: candidates.length,
      byStage: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      avgTimeInStage: {} as Record<string, number>
    }

    // Count by stage and calculate average time
    process.stages.forEach((stage: any) => {
      const candidatesInStage = candidates.filter(c =>
        c.currentProcesses?.some((p: any) => p.processId === processId && p.stageId === stage.id)
      )

      metrics.byStage[stage.id] = candidatesInStage.length

      // Calculate average time in stage
      if (candidatesInStage.length > 0) {
        const totalTime = candidatesInStage.reduce((acc, candidate) => {
          const processInfo = candidate.currentProcesses?.find((p: any) => p.processId === processId)
          if (processInfo?.enteredStageAt) {
            const daysInStage = Math.floor(
              (Date.now() - new Date(processInfo.enteredStageAt).getTime()) / (1000 * 60 * 60 * 24)
            )
            return acc + daysInStage
          }
          return acc
        }, 0)
        metrics.avgTimeInStage[stage.id] = Math.round(totalTime / candidatesInStage.length)
      } else {
        metrics.avgTimeInStage[stage.id] = 0
      }
    })

    // Count by status
    candidates.forEach(candidate => {
      metrics.byStatus[candidate.status] = (metrics.byStatus[candidate.status] || 0) + 1
    })

    // Add metrics to process
    const processWithMetrics = {
      ...process,
      metrics,
      candidateCount: candidates.length
    }

    return NextResponse.json(processWithMetrics)

  } catch (error) {
    console.error('Error fetching process:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string | undefined
    if (!session || !userRole || !['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: processId } = await params
    const updates = await request.json()
    const { db } = await connectToDatabase()

    // Remove fields that shouldn't be updated directly
    delete updates._id
    delete updates.id
    delete updates.createdAt
    delete updates.createdBy

    // Update the process
    const result = await db.collection('processes').updateOne(
      { id: processId, isDeleted: { $ne: true } },
      {
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'No changes made' }, { status: 304 })
    }

    // Get updated process
    const updatedProcess = await db.collection('processes').findOne({
      id: processId
    })

    return NextResponse.json(updatedProcess)

  } catch (error) {
    console.error('Error updating process:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string | undefined
    if (!session || !userRole || !['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: processId } = await params
    const { db } = await connectToDatabase()

    // Soft delete the process
    const result = await db.collection('processes').updateOne(
      { id: processId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user?.email
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Remove process from all candidates
    await db.collection('candidates').updateMany(
      { processIds: processId },
      {
        $pull: {
          processIds: processId,
          currentProcesses: { processId }
        },
        $set: {
          lastUpdated: new Date()
        }
      }
    )

    return NextResponse.json({ success: true, message: 'Process deleted successfully' })

  } catch (error) {
    console.error('Error deleting process:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}