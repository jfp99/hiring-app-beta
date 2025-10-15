// src/app/api/email-templates/[id]/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getEmailService } from '@/app/lib/email'

const sendEmailSchema = z.object({
  candidateId: z.string(),
  variables: z.record(z.string(), z.string()).optional(),
  ccEmails: z.array(z.string().email()).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: templateId } = await params

    if (!ObjectId.isValid(templateId)) {
      return NextResponse.json({ error: 'ID de template invalide' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

    if (!ObjectId.isValid(validatedData.candidateId)) {
      return NextResponse.json({ error: 'ID de candidat invalide' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get template
    const template = await db
      .collection('email_templates')
      .findOne({ _id: new ObjectId(templateId) })

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    // Get candidate
    const candidate = await db
      .collection('candidates')
      .findOne({ _id: new ObjectId(validatedData.candidateId) })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    // Prepare default variables from candidate
    const defaultVariables: Record<string, string> = {
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      fullName: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      email: candidate.email || '',
      position: candidate.currentPosition || 'Non spécifié',
      companyName: 'Hi-Ring',
      recruiterName: session.user?.name || session.user?.email || 'unknown' || '',
      recruiterEmail: session.user.email || '',
      recruiterPhone: '+33 1 23 45 67 89', // Default phone
      currentDate: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Merge with provided variables (provided variables override defaults)
    const allVariables = { ...defaultVariables, ...validatedData.variables }

    // Replace variables in subject and body
    const subject = replaceVariables(template.subject, allVariables)
    const bodyText = replaceVariables(template.body, allVariables)

    // Convert plain text to HTML if needed
    const bodyHtml = bodyText.replace(/\n/g, '<br>')

    // Send email using the email service
    const emailService = getEmailService()
    const emailResult = await emailService.sendEmailWithRetry({
      to: candidate.email,
      subject,
      text: bodyText,
      html: bodyHtml,
      cc: validatedData.ccEmails
    })

    // Determine email status based on result
    const emailStatus = emailResult.success ? 'sent' : 'failed'

    // Save email log
    const emailLog: any = {
      candidateId: validatedData.candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      templateId: templateId,
      templateName: template.name,
      subject,
      body: bodyText,
      sentBy: (session.user as any)?.id || session.user?.email || 'unknown',
      sentByName: session.user?.name || session.user?.email || 'unknown',
      sentAt: new Date().toISOString(),
      status: emailStatus,
      ccEmails: validatedData.ccEmails || [],
      messageId: emailResult.messageId
    }

    // Add error if email failed
    if (!emailResult.success && emailResult.error) {
      emailLog.error = emailResult.error
    }

    const logResult = await db.collection('email_logs').insertOne(emailLog)

    // Add activity to candidate
    const activity = {
      type: 'email_sent',
      description: `Email envoyé: ${template.name}`,
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      userName: session.user?.name || session.user?.email || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: {
        templateId,
        templateName: template.name,
        subject
      }
    }

    await db.collection('candidates').updateOne(
      { _id: new ObjectId(validatedData.candidateId) },
      { $push: { activities: activity as any } }
    )

    // Return appropriate response based on email status
    if (emailResult.success) {
      return NextResponse.json({
        message: 'Email envoyé avec succès',
        emailLog: {
          ...emailLog,
          id: logResult.insertedId.toString()
        }
      })
    } else {
      return NextResponse.json({
        message: 'Email logged but sending failed',
        error: emailResult.error,
        emailLog: {
          ...emailLog,
          id: logResult.insertedId.toString()
        }
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('Error sending email:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données de validation invalides' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email: ' + (error instanceof Error ? error.message : 'Erreur inconnue') },
      { status: 500 }
    )
  }
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}
