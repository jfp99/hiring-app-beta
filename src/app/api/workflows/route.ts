// src/app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth'

// GET /api/workflows - List all workflows
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const trigger = searchParams.get('trigger')

    const { db } = await connectToDatabase()
    const collection = db.collection('workflows')

    const query: any = {}

    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }

    if (trigger) {
      query['trigger.type'] = trigger
    }

    const workflows = await collection
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .toArray()

    return NextResponse.json({
      workflows: workflows.map(w => ({ ...w, id: w._id.toString(), _id: undefined }))
    })
  } catch (error: unknown) {
    console.error('❌ Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des workflows' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, trigger, actions, isActive, priority, schedule, maxExecutionsPerDay, maxExecutionsPerCandidate, testMode } = body

    // Validation
    if (!name || !trigger || !actions || actions.length === 0) {
      return NextResponse.json(
        { error: 'Les champs name, trigger et actions sont requis' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('workflows')

    const workflow = {
      name,
      description: description || '',
      trigger,
      actions,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      schedule: schedule || null,
      maxExecutionsPerDay: maxExecutionsPerDay || null,
      maxExecutionsPerCandidate: maxExecutionsPerCandidate || null,
      testMode: testMode || false,
      createdBy: session.user?.email || 'system',
      createdByName: session.user?.name || 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collection.insertOne(workflow)

    console.log('✅ Workflow created:', result.insertedId)

    return NextResponse.json({
      workflow: { ...workflow, id: result.insertedId.toString() },
      message: 'Workflow créé avec succès'
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('❌ Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du workflow' },
      { status: 500 }
    )
  }
}
