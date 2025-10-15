// src/app/api/candidates/[id]/interviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getCalendarService } from '@/app/lib/calendar'

const createInterviewSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z.string().optional(),
  scheduledDate: z.string(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  type: z.enum(['phone', 'video', 'in_person', 'technical', 'hr']),
  interviewers: z.array(z.string()).optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  sendCalendarInvite: z.boolean().optional() // Option to send calendar invite
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: candidateId } = await params

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

    return NextResponse.json({
      interviews: candidate.interviews || []
    })
  } catch (error: unknown) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entretiens' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: candidateId } = await params

    if (!ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = createInterviewSchema.parse(body)

    const { db } = await connectToDatabase()

    // Check if candidate exists
    const candidate = await db
      .collection('candidates')
      .findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    // Create new interview
    const newInterview = {
      id: new Date().getTime().toString(),
      ...validatedData,
      status: 'scheduled' as const,
      feedback: [], // Initialize empty feedback array
      createdAt: new Date().toISOString(),
      createdBy: (session.user as any)?.id || session.user?.email || 'unknown',
      createdByName: session.user?.name || session.user?.email || 'unknown'
    }

    // Add activity
    const activity = {
      id: new Date().getTime().toString() + '_act',
      type: 'interview_scheduled',
      description: `Entretien ${getInterviewTypeLabel(validatedData.type)} planifié le ${new Date(validatedData.scheduledDate).toLocaleDateString('fr-FR')}`,
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      userName: session.user?.name || session.user?.email || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: {
        interviewId: newInterview.id,
        interviewType: validatedData.type,
        scheduledDate: validatedData.scheduledDate
      }
    }

    // Update candidate
    await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $push: {
          interviews: newInterview as any,
          activities: activity as any
        },
        $set: {
          updatedAt: new Date().toISOString(),
          lastContactedAt: new Date().toISOString()
        }
      }
    )

    // Send calendar invite if requested
    let calendarInviteStatus: { success: boolean; message?: string } | null = null

    if (validatedData.sendCalendarInvite) {
      try {
        const calendarService = getCalendarService()
        const interviewEvent = calendarService.createInterviewEvent({
          ...validatedData,
          candidate: {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email
          },
          recruiter: {
            name: session.user?.name || session.user?.email || 'Hi-Ring',
            email: session.user?.email || 'noreply@hi-ring.com'
          }
        })

        const result = await calendarService.sendCalendarInvite(interviewEvent, {
          sendEmail: true
        })

        calendarInviteStatus = {
          success: result.success,
          message: result.success
            ? 'Invitation calendrier envoyée avec succès'
            : `Erreur lors de l'envoi de l'invitation: ${result.error}`
        }

        console.log('Calendar invite status:', calendarInviteStatus)
      } catch (error: unknown) {
        console.error('Error sending calendar invite:', error)
        calendarInviteStatus = {
          success: false,
          message: `Erreur lors de l'envoi de l'invitation: ${(error instanceof Error ? error.message : 'Erreur inconnue')}`
        }
      }
    }

    return NextResponse.json({
      message: 'Entretien créé avec succès',
      interview: newInterview,
      calendarInvite: calendarInviteStatus
    })
  } catch (error: unknown) {
    console.error('Error creating interview:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données de validation invalides' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entretien' },
      { status: 500 }
    )
  }
}

function getInterviewTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    phone: 'téléphonique',
    video: 'en visioconférence',
    in_person: 'en présentiel',
    technical: 'technique',
    hr: 'RH'
  }
  return labels[type] || type
}
