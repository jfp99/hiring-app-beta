// src/app/api/workflows/templates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { DEFAULT_WORKFLOW_TEMPLATES } from '@/app/types/workflows'

// GET /api/workflows/templates - Get workflow templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let templates = DEFAULT_WORKFLOW_TEMPLATES

    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    return NextResponse.json({ templates })
  } catch (error: unknown) {
    console.error('❌ Error fetching workflow templates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    )
  }
}
