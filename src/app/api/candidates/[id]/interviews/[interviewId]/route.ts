// src/app/api/candidates/[id]/interviews/[interviewId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

const updateInterviewSchema = z.object({
  scheduledDate: z.string().optional(),
  duration: z.number().min(15).max(480).optional(),
  type: z.enum(['phone', 'video', 'in_person', 'technical', 'hr']).optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const candidateId = params.id
    const interviewId = params.interviewId

    if (!ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateInterviewSchema.parse(body)

    const { db } = await connectToDatabase()

    // Find candidate and interview
    const candidate = await db
      .collection('candidates')
      .findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    const interviews = candidate.interviews || []
    const interviewIndex = interviews.findIndex((i: any) => i.id === interviewId)

    if (interviewIndex === -1) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 })
    }

    // Update interview
    const updatedInterview = {
      ...interviews[interviewIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: (session.user as any).id || session.user.email
    }

    interviews[interviewIndex] = updatedInterview

    // Add activity if status changed
    let activity = null
    if (validatedData.status && validatedData.status !== interviews[interviewIndex].status) {
      activity = {
        id: new Date().getTime().toString(),
        type: 'profile_updated',
        description: `Statut d'entretien mis à jour: ${getStatusLabel(validatedData.status)}`,
        userId: (session.user as any).id || session.user.email,
        userName: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        metadata: {
          interviewId,
          oldStatus: interviews[interviewIndex].status,
          newStatus: validatedData.status
        }
      }
    }

    // Update in database
    const updateData: any = {
      interviews,
      updatedAt: new Date().toISOString()
    }

    if (activity) {
      updateData.activities = [...(candidate.activities || []), activity]
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      { $set: updateData }
    )

    return NextResponse.json({
      message: 'Entretien mis à jour avec succès',
      interview: updatedInterview
    })
  } catch (error: any) {
    console.error('Error updating interview:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entretien' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const candidateId = params.id
    const interviewId = params.interviewId

    if (!ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const candidate = await db
      .collection('candidates')
      .findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    // Remove interview
    const interviews = (candidate.interviews || []).filter((i: any) => i.id !== interviewId)

    // Add activity
    const activity = {
      id: new Date().getTime().toString(),
      type: 'profile_updated',
      description: 'Entretien supprimé',
      userId: (session.user as any).id || session.user.email,
      userName: session.user.name || session.user.email,
      timestamp: new Date().toISOString(),
      metadata: { interviewId }
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          interviews,
          activities: [...(candidate.activities || []), activity],
          updatedAt: new Date().toISOString()
        }
      }
    )

    return NextResponse.json({ message: 'Entretien supprimé avec succès' })
  } catch (error: any) {
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entretien' },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Planifié',
    completed: 'Terminé',
    cancelled: 'Annulé',
    rescheduled: 'Reprogrammé'
  }
  return labels[status] || status
}
