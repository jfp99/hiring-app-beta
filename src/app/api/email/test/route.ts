// src/app/api/email/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { EmailService } from '@/app/lib/emailService'

// POST /api/email/test - Test email configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email de test requis' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EmailService.isValidEmail(testEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    console.log(`🧪 [EMAIL-TEST] Testing email configuration for: ${testEmail}`)

    // Send test email
    const result = await EmailService.testConfiguration(testEmail)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès!',
        provider: result.provider,
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Échec de l\'envoi de l\'email de test',
        provider: result.provider
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('❌ [EMAIL-TEST] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test d\'email' },
      { status: 500 }
    )
  }
}

// GET /api/email/test - Get email configuration status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const hasSendGrid = !!process.env.SENDGRID_API_KEY
    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

    let status: 'configured' | 'mock' | 'not_configured'
    let provider: string | null = null

    if (hasSendGrid) {
      status = 'configured'
      provider = 'SendGrid'
    } else if (hasSmtp) {
      status = 'configured'
      provider = 'SMTP'
    } else {
      status = 'mock'
      provider = 'Mock (Testing Mode)'
    }

    return NextResponse.json({
      status,
      provider,
      details: {
        sendgrid: hasSendGrid,
        smtp: hasSmtp,
        from: process.env.EMAIL_FROM || 'Not configured',
        fromName: process.env.EMAIL_FROM_NAME || 'Not configured'
      }
    })
  } catch (error: unknown) {
    console.error('❌ [EMAIL-TEST] Error getting status:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la configuration' },
      { status: 500 }
    )
  }
}
