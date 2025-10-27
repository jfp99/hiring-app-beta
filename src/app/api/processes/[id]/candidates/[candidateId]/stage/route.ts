// src/app/api/processes/[id]/candidates/[candidateId]/stage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const session = await auth()
    const userRole = session?.user?.role as string | undefined
    if (!session || !userRole || !['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stageId } = await request.json()
    const { id: processId, candidateId } = await params

    const { db } = await connectToDatabase()

    // Get the process to validate stage exists
    // Try custom id field first, then MongoDB _id
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
      } catch (e) {
        console.error('Invalid ObjectId:', e)
      }
    }

    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Validate stage exists in process
    const stage = process.stages.find((s: any) => s.id === stageId)
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found in process' }, { status: 400 })
    }

    // Update candidate's process information
    // Try custom id field first, then MongoDB _id
    let candidate = await db.collection('candidates').findOne({
      id: candidateId,
      isDeleted: { $ne: true }
    })

    // If not found by custom id, try MongoDB _id
    if (!candidate) {
      try {
        const { ObjectId } = await import('mongodb')
        candidate = await db.collection('candidates').findOne({
          _id: new ObjectId(candidateId),
          isDeleted: { $ne: true }
        })
      } catch (e) {
        console.error('Invalid candidate ObjectId:', e)
      }
    }

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Update or add process info for the candidate
    const currentProcesses = candidate.currentProcesses || []
    const processIndex = currentProcesses.findIndex((p: any) => p.processId === processId)

    const updatedProcessInfo = {
      processId,
      processName: process.name,
      stageId,
      stageName: stage.name,
      enteredStageAt: new Date().toISOString()
    }

    if (processIndex >= 0) {
      // Update existing process info
      currentProcesses[processIndex] = updatedProcessInfo
    } else {
      // Add new process info
      currentProcesses.push(updatedProcessInfo)
    }

    // Add to processIds if not already there
    const processIds = candidate.processIds || []
    if (!processIds.includes(processId)) {
      processIds.push(processId)
    }

    // Update candidate status based on stage
    let newStatus = candidate.status

    // Map stage names to candidate statuses (customizable per process)
    const stageNameLower = stage.name.toLowerCase()
    if (stageNameLower.includes('new') || stageNameLower.includes('sourced')) {
      newStatus = 'new'
    } else if (stageNameLower.includes('screening') || stageNameLower.includes('review')) {
      newStatus = 'screening'
    } else if (stageNameLower.includes('interview')) {
      if (stageNameLower.includes('scheduled')) {
        newStatus = 'interview_scheduled'
      } else if (stageNameLower.includes('completed')) {
        newStatus = 'interview_completed'
      }
    } else if (stageNameLower.includes('offer')) {
      if (stageNameLower.includes('sent')) {
        newStatus = 'offer_sent'
      } else if (stageNameLower.includes('accepted')) {
        newStatus = 'offer_accepted'
      } else if (stageNameLower.includes('rejected')) {
        newStatus = 'offer_rejected'
      }
    } else if (stageNameLower.includes('hired') || stageNameLower.includes('onboard')) {
      newStatus = 'hired'
    } else if (stageNameLower.includes('reject')) {
      newStatus = 'rejected'
    } else if (stageNameLower.includes('hold')) {
      newStatus = 'on_hold'
    }

    // Update the candidate using the identifier we found it with
    const candidateQuery = candidate.id ? { id: candidate.id } : { _id: candidate._id }
    const result = await db.collection('candidates').updateOne(
      candidateQuery,
      {
        $set: {
          currentProcesses,
          processIds,
          status: newStatus,
          lastUpdated: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
    }

    // Add activity log entry
    await db.collection('activityLogs').insertOne({
      type: 'candidate_stage_moved',
      processId,
      candidateId,
      fromStageId: processIndex >= 0 ? candidate.currentProcesses[processIndex].stageId : null,
      toStageId: stageId,
      userId: session.user?.email,
      timestamp: new Date(),
      details: {
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        processName: process.name,
        fromStageName: processIndex >= 0 ? candidate.currentProcesses[processIndex].stageName : null,
        toStageName: stage.name
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Candidate stage updated successfully'
    })

  } catch (error) {
    console.error('Error updating candidate stage:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}