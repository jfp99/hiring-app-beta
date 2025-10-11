// src/app/api/candidates/[id]/interviews/[interviewId]/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getCalendarService } from '@/app/lib/calendar'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const candidateId = params.id
    const interviewId = params.interviewId

    if (!ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const db = await getDatabase()

    // Find candidate and interview
    const candidate = await db
      .collection('candidates')
      .findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    const interviews = candidate.interviews || []
    const interview = interviews.find((i: any) => i.id === interviewId)

    if (!interview) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 })
    }

    // Generate calendar file
    const calendarService = getCalendarService()
    const interviewEvent = calendarService.createInterviewEvent({
      ...interview,
      candidate: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email
      },
      recruiter: {
        name: session.user.name || session.user.email || 'Hi-Ring',
        email: session.user.email || 'noreply@hi-ring.com'
      }
    })

    const icsContent = await calendarService.generateICS(interviewEvent)

    // Return ICS file for download
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="interview-${interviewId}.ics"`
      }
    })
  } catch (error: any) {
    console.error('Error generating calendar file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du fichier calendrier' },
      { status: 500 }
    )
  }
}
