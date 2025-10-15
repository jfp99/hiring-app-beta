// src/app/api/candidates/[id]/interviews/[interviewId]/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { HiringRecommendation } from '@/app/types/candidates'

const feedbackSchema = z.object({
  interviewerId: z.string(),
  interviewerName: z.string(),
  submittedAt: z.string(),
  recommendation: z.nativeEnum(HiringRecommendation),
  summary: z.string().min(10, 'Le résumé doit contenir au moins 10 caractères'),
  ratings: z.object({
    technical: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    problemSolving: z.number().min(1).max(5),
    cultureFit: z.number().min(1).max(5),
    motivation: z.number().min(1).max(5),
    leadership: z.number().min(1).max(5).optional(),
    teamwork: z.number().min(1).max(5)
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  technicalSkillsAssessment: z
    .array(
      z.object({
        skill: z.string(),
        rating: z.number().min(1).max(5),
        notes: z.string().optional()
      })
    )
    .optional(),
  questionResponses: z
    .array(
      z.object({
        question: z.string(),
        response: z.string(),
        rating: z.number().min(1).max(5).optional()
      })
    )
    .optional(),
  redFlags: z.array(z.string()).optional(),
  standoutMoments: z.array(z.string()).optional(),
  additionalComments: z.string().optional(),
  wouldHireAgain: z.boolean(),
  confidenceLevel: z.number().min(1).max(5)
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Await params in Next.js 15
    const resolvedParams = await params
    const candidateId = resolvedParams.id
    const interviewId = resolvedParams.interviewId

    if (!ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const feedbackData = feedbackSchema.parse(body)

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

    const interview = interviews[interviewIndex]

    // Check if this interviewer has already submitted feedback
    const existingFeedback = interview.feedback || []
    const existingIndex = existingFeedback.findIndex(
      (f: any) => f.interviewerId === feedbackData.interviewerId
    )

    // Add or update feedback
    if (existingIndex >= 0) {
      existingFeedback[existingIndex] = feedbackData
    } else {
      existingFeedback.push(feedbackData)
    }

    // Calculate aggregated scores
    const aggregatedRating = calculateAggregatedRating(existingFeedback)
    const aggregatedRecommendation = calculateAggregatedRecommendation(existingFeedback)

    // Update interview
    interviews[interviewIndex] = {
      ...interview,
      feedback: existingFeedback,
      aggregatedRating,
      aggregatedRecommendation,
      status: interview.status === 'scheduled' ? 'completed' : interview.status,
      updatedAt: new Date().toISOString()
    }

    // Add activity
    const activity = {
      id: new Date().getTime().toString(),
      type: 'interview_feedback_submitted',
      description: `Feedback d'entretien soumis par ${feedbackData.interviewerName}`,
      userId: feedbackData.interviewerId,
      userName: feedbackData.interviewerName,
      timestamp: new Date().toISOString(),
      metadata: {
        interviewId,
        recommendation: feedbackData.recommendation,
        rating: aggregatedRating
      }
    }

    // Update candidate
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

    return NextResponse.json({
      message: 'Feedback soumis avec succès',
      interview: interviews[interviewIndex],
      aggregatedRating,
      aggregatedRecommendation
    })
  } catch (error: any) {
    console.error('Error submitting feedback:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la soumission du feedback' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Await params in Next.js 15
    const resolvedParams = await params
    const candidateId = resolvedParams.id
    const interviewId = resolvedParams.interviewId

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

    const interviews = candidate.interviews || []
    const interview = interviews.find((i: any) => i.id === interviewId)

    if (!interview) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      feedback: interview.feedback || [],
      aggregatedRating: interview.aggregatedRating,
      aggregatedRecommendation: interview.aggregatedRecommendation
    })
  } catch (error: any) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du feedback' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateAggregatedRating(feedbacks: any[]): number {
  if (feedbacks.length === 0) return 0

  const totalRatings = feedbacks.map((f) => {
    const ratings = f.ratings
    const ratingValues = [
      ratings.technical,
      ratings.communication,
      ratings.problemSolving,
      ratings.cultureFit,
      ratings.motivation,
      ratings.teamwork
    ]
    if (ratings.leadership) ratingValues.push(ratings.leadership)

    return ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
  })

  const avgRating = totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length
  return Math.round(avgRating * 10) / 10 // Round to 1 decimal
}

function calculateAggregatedRecommendation(feedbacks: any[]): HiringRecommendation {
  if (feedbacks.length === 0) return HiringRecommendation.MAYBE

  // Count recommendations
  const counts: Record<string, number> = {}
  feedbacks.forEach((f) => {
    counts[f.recommendation] = (counts[f.recommendation] || 0) + 1
  })

  // Find most common recommendation
  let maxCount = 0
  let mostCommon = HiringRecommendation.MAYBE

  Object.entries(counts).forEach(([rec, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommon = rec as HiringRecommendation
    }
  })

  // If there's a tie, be conservative
  const tieExists = Object.values(counts).filter((c) => c === maxCount).length > 1
  if (tieExists) {
    // Check if there are any no_hire votes
    if (counts[HiringRecommendation.NO_HIRE] || counts[HiringRecommendation.STRONG_NO_HIRE]) {
      return HiringRecommendation.MAYBE
    }
  }

  return mostCommon
}
