// src/app/api/processes/[id]/candidates/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth-helpers'
import { ObjectId } from 'mongodb'
import { ProcessStage } from '@/app/types/process'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/processes/[id]/candidates - Get all candidates in a process
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: processId } = await params
    const { db } = await connectToDatabase()

    // Get process
    const process = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    if (!process) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    // Get all candidates in the process
    const allCandidateIds: string[] = []

    for (const stage of process.stages) {
      if (stage.candidateIds && stage.candidateIds.length > 0) {
        allCandidateIds.push(...stage.candidateIds)
      }
    }

    // Fetch all candidates
    const candidates = allCandidateIds.length > 0
      ? await db.collection('candidates')
          .find({
            _id: { $in: allCandidateIds.map((id: string) => new ObjectId(id)) }
          })
          .toArray()
      : []

    // Convert MongoDB _id to string id for consistency
    const formattedCandidates = candidates.map(candidate => ({
      ...candidate,
      id: candidate._id.toString(),
      _id: candidate._id.toString()
    }))

    return NextResponse.json(formattedCandidates)

  } catch (error) {
    console.error('Error fetching process candidates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des candidats' },
      { status: 500 }
    )
  }
}

// POST /api/processes/[id]/candidates - Add candidates to a process
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: processId } = await params
    const body = await req.json()
    const { candidateIds, stageId } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste de candidats requise' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get process
    const process = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    if (!process) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    // Determine target stage (use provided stageId or default)
    const targetStageId = stageId || process.defaultStageId || process.stages[0].id
    const targetStage = process.stages.find((s: ProcessStage) => s.id === targetStageId)

    if (!targetStage) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 400 }
      )
    }

    // Update process: add candidates to the stage
    const updatedStages = process.stages.map((stage: ProcessStage) => {
      if (stage.id === targetStageId) {
        return {
          ...stage,
          candidateIds: [...(stage.candidateIds || []), ...candidateIds],
          candidateCount: (stage.candidateCount || 0) + candidateIds.length
        }
      }
      return stage
    })

    await db.collection('processes').updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          stages: updatedStages,
          candidateIds: [...new Set([...(process.candidateIds || []), ...candidateIds])],
          candidateCount: new Set([...(process.candidateIds || []), ...candidateIds]).size,
          updatedAt: new Date().toISOString()
        },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'candidate_added',
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            details: {
              count: candidateIds.length,
              stageId: targetStageId,
              stageName: targetStage.name
            }
          }
        }
      }
    )

    // Update candidates
    await db.collection('candidates').updateMany(
      { _id: { $in: candidateIds.map((id: string) => new ObjectId(id)) } },
      {
        $addToSet: { processIds: processId },
        $push: {
          currentProcesses: {
            processId,
            processName: process.name,
            stageId: targetStageId,
            stageName: targetStage.name,
            enteredStageAt: new Date().toISOString()
          },
          activities: {
            id: new ObjectId().toString(),
            type: 'process_added',
            description: `Ajouté au processus: ${process.name} - ${targetStage.name}`,
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            timestamp: new Date().toISOString(),
            processId,
            processName: process.name
          },
          processHistory: {
            processId,
            processName: process.name,
            action: 'added',
            stageId: targetStageId,
            stageName: targetStage.name,
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`
          }
        },
        $set: { updatedAt: new Date().toISOString() }
      }
    )

    return NextResponse.json({
      success: true,
      message: `${candidateIds.length} candidat(s) ajouté(s) au processus`,
      stageId: targetStageId,
      stageName: targetStage.name
    })

  } catch (error) {
    console.error('Error adding candidates to process:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des candidats' },
      { status: 500 }
    )
  }
}

// PUT /api/processes/[id]/candidates - Move candidates between stages
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: processId } = await params
    const body = await req.json()
    const { candidateId, fromStageId, toStageId } = body

    if (!candidateId || !fromStageId || !toStageId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get process
    const process = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    if (!process) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    const fromStage = process.stages.find((s: ProcessStage) => s.id === fromStageId)
    const toStage = process.stages.find((s: ProcessStage) => s.id === toStageId)

    if (!fromStage || !toStage) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 400 }
      )
    }

    // Update process stages
    const updatedStages = process.stages.map((stage: ProcessStage) => {
      if (stage.id === fromStageId) {
        return {
          ...stage,
          candidateIds: (stage.candidateIds || []).filter((id: string) => id !== candidateId),
          candidateCount: Math.max(0, (stage.candidateCount || 0) - 1)
        }
      }
      if (stage.id === toStageId) {
        return {
          ...stage,
          candidateIds: [...(stage.candidateIds || []), candidateId],
          candidateCount: (stage.candidateCount || 0) + 1
        }
      }
      return stage
    })

    await db.collection('processes').updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          stages: updatedStages,
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString()
        },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'stage_changed',
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            candidateId,
            fromStage: fromStage.name,
            toStage: toStage.name,
            details: {
              fromStageId,
              toStageId
            }
          }
        }
      }
    )

    // Update candidate
    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          'currentProcesses.$[elem].stageId': toStageId,
          'currentProcesses.$[elem].stageName': toStage.name,
          'currentProcesses.$[elem].enteredStageAt': new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'process_stage_changed',
            description: `Déplacé de ${fromStage.name} vers ${toStage.name} dans ${process.name}`,
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            timestamp: new Date().toISOString(),
            processId,
            processName: process.name,
            fromStage: fromStage.name,
            toStage: toStage.name
          },
          processHistory: {
            processId,
            processName: process.name,
            action: 'stage_changed',
            stageId: toStageId,
            stageName: toStage.name,
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            notes: `De ${fromStage.name} vers ${toStage.name}`
          }
        }
      },
      {
        arrayFilters: [{ 'elem.processId': processId }]
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Candidat déplacé avec succès',
      fromStage: fromStage.name,
      toStage: toStage.name
    })

  } catch (error) {
    console.error('Error moving candidate:', error)
    return NextResponse.json(
      { error: 'Erreur lors du déplacement du candidat' },
      { status: 500 }
    )
  }
}

// DELETE /api/processes/[id]/candidates - Remove candidates from process
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: processId } = await params
    const searchParams = req.nextUrl.searchParams
    const candidateId = searchParams.get('candidateId')
    const stageId = searchParams.get('stageId')

    if (!candidateId || !stageId) {
      return NextResponse.json(
        { error: 'ID du candidat et de l\'étape requis' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get process
    const process = await db.collection('processes').findOne({
      _id: new ObjectId(processId)
    })

    if (!process) {
      return NextResponse.json(
        { error: 'Processus non trouvé' },
        { status: 404 }
      )
    }

    const stage = process.stages.find((s: ProcessStage) => s.id === stageId)
    if (!stage) {
      return NextResponse.json(
        { error: 'Étape non trouvée' },
        { status: 400 }
      )
    }

    // Update process
    const updatedStages = process.stages.map((s: ProcessStage) => {
      if (s.id === stageId) {
        return {
          ...s,
          candidateIds: (s.candidateIds || []).filter((id: string) => id !== candidateId),
          candidateCount: Math.max(0, (s.candidateCount || 0) - 1)
        }
      }
      return s
    })

    const updatedCandidateIds = (process.candidateIds || []).filter((id: string) => id !== candidateId)

    await db.collection('processes').updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          stages: updatedStages,
          candidateIds: updatedCandidateIds,
          candidateCount: updatedCandidateIds.length,
          updatedAt: new Date().toISOString()
        },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'candidate_removed',
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            candidateId,
            details: {
              stageId,
              stageName: stage.name
            }
          }
        }
      }
    )

    // Update candidate
    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $pull: {
          processIds: processId,
          currentProcesses: { processId }
        },
        $push: {
          activities: {
            id: new ObjectId().toString(),
            type: 'process_removed',
            description: `Retiré du processus: ${process.name}`,
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            timestamp: new Date().toISOString(),
            processId,
            processName: process.name
          },
          processHistory: {
            processId,
            processName: process.name,
            action: 'removed',
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userName: session.user.name || `${session.user.firstName} ${session.user.lastName}`,
            notes: `Retiré de l'étape ${stage.name}`
          }
        },
        $set: { updatedAt: new Date().toISOString() }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Candidat retiré du processus'
    })

  } catch (error) {
    console.error('Error removing candidate from process:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du candidat' },
      { status: 500 }
    )
  }
}