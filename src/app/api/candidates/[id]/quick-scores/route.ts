// src/app/api/candidates/[id]/quick-scores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { QuickScore } from '@/app/types/candidates'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: candidateId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.overallRating || body.overallRating < 1 || body.overallRating > 5) {
      return NextResponse.json(
        { error: 'Overall rating (1-5) is required' },
        { status: 400 }
      )
    }

    // Create quick score
    const quickScore: QuickScore = {
      id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
      scoredBy: body.scoredBy || session.user.email,
      scoredByName: body.scoredByName || session.user?.name || session.user?.email || 'unknown',
      scoredAt: new Date().toISOString(),
      overallRating: body.overallRating,
      technicalRating: body.technicalRating,
      cultureFitRating: body.cultureFitRating,
      communicationRating: body.communicationRating,
      quickNotes: body.quickNotes,
      tags: body.tags,
      thumbs: body.thumbs
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')
    const candidatesCollection = db.collection('candidates')

    // Add quick score to candidate
    const result = await candidatesCollection.updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $push: { quickScores: quickScore as any },
        $set: { updatedAt: new Date().toISOString() }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Add activity
    await candidatesCollection.updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $push: {
          activities: {
            id: new Date().getTime().toString(),
            type: 'quick_score_added',
            description: `Évaluation rapide ajoutée: ${quickScore.overallRating}/5 étoiles`,
            userId: quickScore.scoredBy,
            userName: quickScore.scoredByName,
            timestamp: new Date().toISOString(),
            metadata: {
              rating: quickScore.overallRating,
              thumbs: quickScore.thumbs
            }
          }
        } as any
      }
    )

    // Recalculate average ratings
    const candidate = await candidatesCollection.findOne({ _id: new ObjectId(candidateId) })
    if (candidate && candidate.quickScores) {
      const quickScores = candidate.quickScores as QuickScore[]
      const avgOverall = quickScores.reduce((sum, s) => sum + s.overallRating, 0) / quickScores.length

      const technicalScores = quickScores.filter(s => s.technicalRating)
      const avgTechnical = technicalScores.length > 0
        ? technicalScores.reduce((sum, s) => sum + (s.technicalRating || 0), 0) / technicalScores.length
        : null

      const cultureFitScores = quickScores.filter(s => s.cultureFitRating)
      const avgCultureFit = cultureFitScores.length > 0
        ? cultureFitScores.reduce((sum, s) => sum + (s.cultureFitRating || 0), 0) / cultureFitScores.length
        : null

      const communicationScores = quickScores.filter(s => s.communicationRating)
      const avgCommunication = communicationScores.length > 0
        ? communicationScores.reduce((sum, s) => sum + (s.communicationRating || 0), 0) / communicationScores.length
        : null

      // Update candidate ratings
      await candidatesCollection.updateOne(
        { _id: new ObjectId(candidateId) },
        {
          $set: {
            overallRating: avgOverall,
            technicalRating: avgTechnical,
            culturalFitRating: avgCultureFit,
            communicationRating: avgCommunication
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      quickScore
    })
  } catch (error: unknown) {
    console.error('Error adding quick score:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')
    const candidatesCollection = db.collection('candidates')

    const candidate = await candidatesCollection.findOne(
      { _id: new ObjectId(candidateId) },
      { projection: { quickScores: 1 } }
    )

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      quickScores: candidate.quickScores || []
    })
  } catch (error: unknown) {
    console.error('Error fetching quick scores:', error)
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Erreur inconnue') || 'Internal server error' },
      { status: 500 }
    )
  }
}
