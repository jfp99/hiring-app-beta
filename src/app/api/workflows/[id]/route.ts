// src/app/api/workflows/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/workflows/[id] - Get a single workflow
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('workflows')

    const workflow = await collection.findOne({ _id: new ObjectId(params.id) })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      workflow: { ...workflow, id: workflow._id.toString(), _id: undefined }
    })
  } catch (error: any) {
    console.error('❌ Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du workflow' },
      { status: 500 }
    )
  }
}

// PUT /api/workflows/[id] - Update a workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, trigger, actions, isActive, priority, schedule, maxExecutionsPerDay, maxExecutionsPerCandidate, testMode } = body

    const { db } = await connectToDatabase()
    const collection = db.collection('workflows')

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (trigger !== undefined) updateData.trigger = trigger
    if (actions !== undefined) updateData.actions = actions
    if (isActive !== undefined) updateData.isActive = isActive
    if (priority !== undefined) updateData.priority = priority
    if (schedule !== undefined) updateData.schedule = schedule
    if (maxExecutionsPerDay !== undefined) updateData.maxExecutionsPerDay = maxExecutionsPerDay
    if (maxExecutionsPerCandidate !== undefined) updateData.maxExecutionsPerCandidate = maxExecutionsPerCandidate
    if (testMode !== undefined) updateData.testMode = testMode

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Workflow introuvable' }, { status: 404 })
    }

    console.log('✅ Workflow updated:', params.id)

    return NextResponse.json({
      workflow: { ...result, id: result._id.toString(), _id: undefined },
      message: 'Workflow mis à jour avec succès'
    })
  } catch (error: any) {
    console.error('❌ Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du workflow' },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('workflows')

    const result = await collection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Workflow introuvable' }, { status: 404 })
    }

    console.log('✅ Workflow deleted:', params.id)

    return NextResponse.json({
      message: 'Workflow supprimé avec succès'
    })
  } catch (error: any) {
    console.error('❌ Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du workflow' },
      { status: 500 }
    )
  }
}
