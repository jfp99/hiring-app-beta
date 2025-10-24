// src/app/api/processes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth-helpers'
import { ObjectId } from 'mongodb'
import {
  Process,
  ProcessStatus,
  ProcessType,
  CreateProcessDto,
  ProcessSummary,
  DEFAULT_PROCESS_STAGES,
  ProcessStage
} from '@/app/types/process'

// GET /api/processes - Get all processes with filters
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const searchParams = req.nextUrl.searchParams

    // Build filter query
    const filter: any = { isArchived: false }

    // Filter by status
    const status = searchParams.get('status')
    if (status) {
      filter.status = status
    }

    // Filter by type
    const type = searchParams.get('type')
    if (type) {
      filter.type = type
    }

    // Filter by owner
    const ownerId = searchParams.get('ownerId')
    if (ownerId) {
      filter.ownerId = ownerId
    }

    // Filter by company
    const company = searchParams.get('company')
    if (company) {
      filter.company = new RegExp(company, 'i')
    }

    // Filter by location
    const location = searchParams.get('location')
    if (location) {
      filter.location = new RegExp(location, 'i')
    }

    // Search in name and description
    const search = searchParams.get('search')
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { jobTitle: new RegExp(search, 'i') }
      ]
    }

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Execute query
    const processes = await db.collection('processes')
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await db.collection('processes').countDocuments(filter)

    // Transform to ProcessSummary format with enriched data
    const processesWithSummary = await Promise.all(processes.map(async (process) => {
      // Get first 5 candidate avatars
      const candidateAvatars = []
      if (process.candidateIds && process.candidateIds.length > 0) {
        const candidates = await db.collection('candidates')
          .find({
            _id: { $in: process.candidateIds.slice(0, 5).map((id: string) => new ObjectId(id)) }
          })
          .project({ profilePictureUrl: 1 })
          .toArray()

        candidateAvatars.push(...candidates.map(c => c.profilePictureUrl).filter(Boolean))
      }

      // Calculate metrics from stages
      const metrics = {
        inScreening: 0,
        inInterview: 0,
        offersSent: 0,
        hired: 0
      }

      if (process.stages) {
        process.stages.forEach((stage: ProcessStage) => {
          const count = stage.candidateCount || 0
          if (stage.id === 'screening') metrics.inScreening = count
          else if (stage.id.includes('interview')) metrics.inInterview += count
          else if (stage.id === 'offer') metrics.offersSent = count
          else if (stage.id === 'hired') metrics.hired = count
        })
      }

      // Calculate progress
      const totalCandidates = process.candidateCount || 0
      const completedCandidates = metrics.hired + (process.stages?.find((s: ProcessStage) => s.id === 'rejected')?.candidateCount || 0)
      const progress = totalCandidates > 0 ? Math.round((completedCandidates / totalCandidates) * 100) : 0

      // Calculate days remaining
      let daysRemaining = undefined
      let isOverdue = false
      if (process.deadline) {
        const deadlineDate = new Date(process.deadline)
        const now = new Date()
        const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        daysRemaining = diff
        isOverdue = diff < 0
      }

      const summary: ProcessSummary = {
        id: process._id.toString(),
        name: process.name,
        type: process.type,
        status: process.status,
        location: process.location,
        company: process.company,
        client: process.client,
        deadline: process.deadline,
        candidateCount: totalCandidates,
        candidateAvatars,
        metrics,
        priority: process.priority,
        progress,
        ownerName: process.ownerName,
        lastActivityAt: process.lastActivityAt,
        daysRemaining,
        isOverdue
      }

      return summary
    }))

    return NextResponse.json({
      processes: processesWithSummary,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching processes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des processus' },
      { status: 500 }
    )
  }
}

// POST /api/processes - Create a new process
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body: CreateProcessDto = await req.json()
    const { db } = await connectToDatabase()

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Le nom et le type sont requis' },
        { status: 400 }
      )
    }

    // Prepare stages (use default if not provided)
    let stages: ProcessStage[] = []
    if (body.stages && body.stages.length > 0) {
      stages = body.stages.map((stage, index) => ({
        ...stage,
        id: stage.id || `stage_${index}`,
        order: stage.order || index + 1,
        candidateIds: [],
        candidateCount: 0
      }))
    } else {
      stages = DEFAULT_PROCESS_STAGES.map(stage => ({
        ...stage,
        candidateIds: [],
        candidateCount: 0
      }))
    }

    // Create process document
    const process: Process = {
      id: new ObjectId().toString(),
      name: body.name,
      type: body.type,
      status: ProcessStatus.ACTIVE,
      description: body.description,
      location: body.location,
      company: body.company,
      client: body.client,
      department: body.department,
      jobId: body.jobId,
      startDate: body.startDate || new Date().toISOString(),
      deadline: body.deadline,
      stages,
      defaultStageId: stages[0]?.id,
      candidateIds: body.candidateIds || [],
      candidateCount: body.candidateIds?.length || 0,
      ownerId: session.user.id,
      ownerName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
      teamMemberIds: body.teamMemberIds || [],
      requiredSkills: body.requiredSkills,
      experienceLevel: body.experienceLevel,
      contractType: body.contractType,
      salaryRange: body.salaryRange,
      tags: body.tags || [],
      priority: body.priority || 'medium',
      activities: [{
        id: new ObjectId().toString(),
        type: 'status_changed',
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
        details: { action: 'Process created' }
      }],
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
      createdByName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
      updatedAt: new Date().toISOString(),
      isArchived: false,
      notifications: {
        onCandidateAdded: true,
        onStageChange: true,
        onDeadlineApproaching: true,
        onSlaBreached: true
      }
    }

    // Insert process
    const result = await db.collection('processes').insertOne(process)

    // If candidates were provided, update them to include this process
    if (body.candidateIds && body.candidateIds.length > 0) {
      await db.collection('candidates').updateMany(
        { _id: { $in: body.candidateIds.map(id => new ObjectId(id)) } },
        {
          $addToSet: { processIds: process.id },
          $push: {
            currentProcesses: {
              processId: process.id,
              processName: process.name,
              stageId: stages[0].id,
              stageName: stages[0].name,
              enteredStageAt: new Date().toISOString()
            },
            activities: {
              id: new ObjectId().toString(),
              type: 'process_added',
              description: `Ajouté au processus: ${process.name}`,
              userId: session.user.id,
              userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
              timestamp: new Date().toISOString(),
              processId: process.id,
              processName: process.name
            }
          },
          $set: { updatedAt: new Date().toISOString() }
        }
      )
    }

    return NextResponse.json({
      success: true,
      process: { ...process, _id: result.insertedId }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du processus' },
      { status: 500 }
    )
  }
}

// PUT /api/processes - Update a process
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const processId = searchParams.get('id')

    if (!processId) {
      return NextResponse.json(
        { error: 'ID du processus requis' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { db } = await connectToDatabase()

    // Check if process exists
    const existingProcess = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    if (!existingProcess) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    // Prepare update
    const updateData: any = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id,
      updatedByName: session.user.name || `${session.user.firstName} ${session.user.lastName}`
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id
    delete updateData.id
    delete updateData.createdAt
    delete updateData.createdBy
    delete updateData.createdByName

    // Add activity log for status change
    if (body.status && body.status !== existingProcess.status) {
      updateData.$push = {
        activities: {
          id: new ObjectId().toString(),
          type: 'status_changed',
          timestamp: new Date().toISOString(),
          userId: session.user.id,
          userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
          details: {
            from: existingProcess.status,
            to: body.status
          }
        }
      }
    }

    // Update process
    const result = await db.collection('processes').updateOne(
      { _id: new ObjectId(processId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Aucune modification effectuée' },
        { status: 400 }
      )
    }

    // Get updated process
    const updatedProcess = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    return NextResponse.json({
      success: true,
      process: updatedProcess
    })

  } catch (error) {
    console.error('Error updating process:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du processus' },
      { status: 500 }
    )
  }
}

// DELETE /api/processes - Archive a process
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const processId = searchParams.get('id')

    if (!processId) {
      return NextResponse.json(
        { error: 'ID du processus requis' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Archive instead of delete
    const result = await db.collection('processes').updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date().toISOString(),
          archivedBy: session.user.id,
          status: ProcessStatus.ARCHIVED
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    // Remove process from candidates
    await db.collection('candidates').updateMany(
      { processIds: processId },
      {
        $pull: {
          processIds: processId,
          currentProcesses: { processId }
        },
        $push: {
          processHistory: {
            processId,
            processName: 'Process Archived',
            action: 'removed',
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            notes: 'Process was archived'
          }
        },
        $set: { updatedAt: new Date().toISOString() }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Processus archivé avec succès'
    })

  } catch (error) {
    console.error('Error archiving process:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'archivage du processus' },
      { status: 500 }
    )
  }
}