// src/app/api/email-templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { getDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { EmailTemplateType } from '@/app/types/emails'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(EmailTemplateType).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const templateId = params.id

    if (!ObjectId.isValid(templateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const db = await getDatabase()
    const template = await db
      .collection('email_templates')
      .findOne({ _id: new ObjectId(templateId) })

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      template: {
        ...template,
        id: template._id.toString(),
        _id: undefined
      }
    })
  } catch (error: any) {
    console.error('Error fetching email template:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const templateId = params.id

    if (!ObjectId.isValid(templateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    const db = await getDatabase()

    // Check if template exists
    const existingTemplate = await db
      .collection('email_templates')
      .findOne({ _id: new ObjectId(templateId) })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    // Update variables if subject or body changed
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date().toISOString()
    }

    if (validatedData.subject || validatedData.body) {
      const subject = validatedData.subject || existingTemplate.subject
      const bodyText = validatedData.body || existingTemplate.body
      const subjectVars = extractVariables(subject)
      const bodyVars = extractVariables(bodyText)
      updateData.variables = Array.from(new Set([...subjectVars, ...bodyVars]))
    }

    const result = await db
      .collection('email_templates')
      .findOneAndUpdate(
        { _id: new ObjectId(templateId) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    return NextResponse.json({
      template: {
        ...result,
        id: result._id.toString(),
        _id: undefined
      }
    })
  } catch (error: any) {
    console.error('Error updating email template:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const templateId = params.id

    if (!ObjectId.isValid(templateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if template is default (cannot delete default templates)
    const template = await db
      .collection('email_templates')
      .findOne({ _id: new ObjectId(templateId) })

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    if (template.isDefault) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un template par défaut' },
        { status: 400 }
      )
    }

    await db.collection('email_templates').deleteOne({ _id: new ObjectId(templateId) })

    return NextResponse.json({ message: 'Template supprimé avec succès' })
  } catch (error: any) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    )
  }
}

function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(text)) !== null) {
    variables.push(match[1])
  }

  return variables
}
