// src/app/api/email-templates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { EmailTemplateType } from '@/app/types/emails'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  type: z.nativeEnum(EmailTemplateType),
  subject: z.string().min(1, 'Le sujet est obligatoire'),
  body: z.string().min(1, 'Le corps du message est obligatoire'),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false)
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const { db } = await connectToDatabase()
    const query: any = {}

    if (type) {
      query.type = type
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }

    const templates = await db
      .collection('email_templates')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      templates: templates.map(template => ({
        ...template,
        id: template._id.toString(),
        _id: undefined
      }))
    })
  } catch (error: unknown) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    // Extract variables from subject and body
    const subjectVars = extractVariables(validatedData.subject)
    const bodyVars = extractVariables(validatedData.body)
    const variables = Array.from(new Set([...subjectVars, ...bodyVars]))

    const { db } = await connectToDatabase()

    const template = {
      name: validatedData.name,
      type: validatedData.type,
      subject: validatedData.subject,
      body: validatedData.body,
      isActive: validatedData.isActive,
      isDefault: validatedData.isDefault,
      variables,
      createdBy: (session.user as any)?.id || session.user?.email || 'unknown',
      createdByName: session.user?.name || session.user?.email || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('email_templates').insertOne(template)

    return NextResponse.json({
      template: {
        ...template,
        id: result.insertedId.toString()
      }
    })
  } catch (error: unknown) {
    console.error('Error creating email template:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données de validation invalides' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
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
