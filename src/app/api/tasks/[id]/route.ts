// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth'
import { ObjectId } from 'mongodb'

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    const { id } = await params
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes, priority, dueDate } = body

    const { db } = await connectToDatabase()
    const collection = db.collection('tasks')

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (status !== undefined) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString()
      }
    }
    if (notes !== undefined) updateData.notes = notes
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
    }

    console.log('✅ Task updated:', id)

    return NextResponse.json({
      task: { ...result, id: result._id.toString(), _id: undefined },
      message: 'Tâche mise à jour avec succès'
    })
  } catch (error: unknown) {
    console.error('❌ Error updating task:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    const { id } = await params
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('tasks')

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
    }

    console.log('✅ Task deleted:', id)

    return NextResponse.json({
      message: 'Tâche supprimée avec succès'
    })
  } catch (error: unknown) {
    console.error('❌ Error deleting task:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    )
  }
}
