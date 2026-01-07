// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { logger } from '@/app/lib/logger'
import { RateLimiters } from '@/app/lib/security'
import { z } from 'zod'
import crypto from 'crypto'

// Validation schema for alert creation
const alertSchema = z.object({
  email: z.string().email('Email invalide'),
  categories: z.array(z.string()).optional().default([]),
  locations: z.array(z.string()).optional().default([]),
  contractTypes: z.array(z.string()).optional().default([]),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('daily')
})

// Generate unsubscribe token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// POST - Create new alert
export async function POST(request: NextRequest) {
  const rateLimitResponse = await RateLimiters.api(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()

    const validation = alertSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, categories, locations, contractTypes, frequency } = validation.data

    const { db } = await connectToDatabase()
    const now = new Date().toISOString()

    // Check if alert already exists for this email with same criteria
    const existingAlert = await db.collection('job_alerts').findOne({
      email: email.toLowerCase(),
      isActive: true
    })

    if (existingAlert) {
      // Update existing alert
      await db.collection('job_alerts').updateOne(
        { _id: existingAlert._id },
        {
          $set: {
            categories,
            locations,
            contractTypes,
            frequency,
            updatedAt: now
          }
        }
      )

      logger.info('Job alert updated', { email, frequency })

      return NextResponse.json({
        success: true,
        message: 'Alerte mise à jour avec succès',
        alertId: existingAlert._id.toString()
      })
    }

    // Create new alert
    const unsubscribeToken = generateToken()
    const result = await db.collection('job_alerts').insertOne({
      email: email.toLowerCase(),
      categories,
      locations,
      contractTypes,
      frequency,
      isActive: true,
      unsubscribeToken,
      lastSentAt: null,
      createdAt: now,
      updatedAt: now
    })

    logger.info('Job alert created', { email, frequency, alertId: result.insertedId })

    return NextResponse.json({
      success: true,
      message: 'Alerte créée avec succès',
      alertId: result.insertedId.toString()
    }, { status: 201 })

  } catch (error) {
    logger.error('Failed to create job alert', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'alerte' },
      { status: 500 }
    )
  }
}

// GET - Get alert by unsubscribe token (for unsubscribe page)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token requis' },
      { status: 400 }
    )
  }

  try {
    const { db } = await connectToDatabase()

    const alert = await db.collection('job_alerts').findOne({
      unsubscribeToken: token
    })

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alerte non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      alert: {
        email: alert.email,
        categories: alert.categories,
        locations: alert.locations,
        contractTypes: alert.contractTypes,
        frequency: alert.frequency,
        isActive: alert.isActive
      }
    })

  } catch (error) {
    logger.error('Failed to get job alert', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'alerte' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe from alert
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token requis' },
      { status: 400 }
    )
  }

  try {
    const { db } = await connectToDatabase()

    const result = await db.collection('job_alerts').updateOne(
      { unsubscribeToken: token },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Alerte non trouvée' },
        { status: 404 }
      )
    }

    logger.info('Job alert unsubscribed', { token })

    return NextResponse.json({
      success: true,
      message: 'Désabonnement effectué avec succès'
    })

  } catch (error) {
    logger.error('Failed to unsubscribe from job alert', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Erreur lors du désabonnement' },
      { status: 500 }
    )
  }
}
