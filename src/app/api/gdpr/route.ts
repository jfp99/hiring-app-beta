// src/app/api/gdpr/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { createPIIHandler, formatDataForExport } from '@/app/lib/gdpr'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import { getErrorMessage } from '@/app/types/api'
import { z } from 'zod'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const dataExportSchema = z.object({
  candidateEmail: z.string().email(),
  format: z.enum(['json', 'csv']).default('json')
})

const dataErasureSchema = z.object({
  candidateEmail: z.string().email(),
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm data erasure' })
  })
})

const retentionSchema = z.object({
  retentionDays: z.number().min(30).max(3650).default(730),
  dryRun: z.boolean().default(true)
})

// =============================================================================
// POST: Handle GDPR requests
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can perform GDPR operations
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_DELETE)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    const { db } = await connectToDatabase()
    const piiHandler = createPIIHandler(db)

    switch (action) {
      case 'export':
        return await handleDataExport(piiHandler, body)

      case 'erasure':
        return await handleDataErasure(piiHandler, body, session.user.email)

      case 'retention':
        return await handleRetentionEnforcement(piiHandler, body)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: unknown) {
    console.error('❌ [GDPR] Error:', error)
    return NextResponse.json(
      { error: 'GDPR operation failed', details: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// =============================================================================
// HANDLERS
// =============================================================================

/**
 * Handle data export request (GDPR Article 20)
 */
async function handleDataExport(piiHandler: any, body: any) {
  try {
    const validated = dataExportSchema.parse(body)

    const exportData = await piiHandler.exportUserData({
      candidateEmail: validated.candidateEmail,
      format: validated.format
    })

    const formattedData = formatDataForExport(exportData, validated.format)

    // Return as downloadable file
    const filename = `gdpr-export-${validated.candidateEmail}-${Date.now()}.${validated.format}`

    return new NextResponse(formattedData, {
      headers: {
        'Content-Type': validated.format === 'json' ? 'application/json' : 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}

/**
 * Handle data erasure request (GDPR Article 17)
 */
async function handleDataErasure(piiHandler: any, body: any, adminEmail: string) {
  try {
    const validated = dataErasureSchema.parse(body)

    const result = await piiHandler.deleteUserData(validated.candidateEmail)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Data erasure failed', details: result.errors },
        { status: 500 }
      )
    }

    console.log(`✅ [GDPR] Data erasure completed by ${adminEmail}:`, result)

    return NextResponse.json({
      success: true,
      message: 'All personal data has been permanently deleted',
      result: {
        deletedCandidates: result.deletedCandidates,
        deletedInterviews: result.deletedInterviews,
        deletedTasks: result.deletedTasks,
        deletedComments: result.deletedComments,
        deletedActivities: result.deletedActivities
      }
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}

/**
 * Handle data retention enforcement
 */
async function handleRetentionEnforcement(piiHandler: any, body: any) {
  try {
    const validated = retentionSchema.parse(body)

    const report = await piiHandler.enforceRetention(
      validated.retentionDays,
      validated.dryRun
    )

    return NextResponse.json({
      success: true,
      dryRun: validated.dryRun,
      report
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}

// =============================================================================
// GET: Get GDPR compliance status
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view GDPR status
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_VIEW)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    const piiHandler = createPIIHandler(db)

    // Get candidates without consent
    const candidatesWithoutConsent = await piiHandler.getCandidatesWithoutConsent()

    // Get retention report (dry run)
    const retentionReport = await piiHandler.enforceRetention(730, true)

    return NextResponse.json({
      success: true,
      compliance: {
        candidatesWithoutConsent: candidatesWithoutConsent.length,
        retentionReport
      }
    })
  } catch (error: unknown) {
    console.error('❌ [GDPR] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get GDPR status', details: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
