// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { Task } from '@/app/types/workflows'

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const priority = searchParams.get('priority')

    const { db } = await connectToDatabase()
    const collection = db.collection('tasks')

    const query: any = {}

    if (candidateId) query.candidateId = candidateId
    if (status) query.status = status
    if (assignedTo) query.assignedTo = assignedTo
    if (priority) query.priority = priority

    const tasks = await collection
      .find(query)
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .toArray()

    return NextResponse.json({
      tasks: tasks.map(t => ({ ...t, id: t._id.toString(), _id: undefined }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      candidateId,
      candidateName,
      title,
      description,
      type,
      assignedTo,
      assignedToName,
      priority,
      dueDate
    } = body

    // Validation
    if (!title || !assignedTo || !dueDate) {
      return NextResponse.json(
        { error: 'Les champs title, assignedTo et dueDate sont requis' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('tasks')

    const task = {
      candidateId: candidateId || null,
      candidateName: candidateName || null,
      workflowId: null,
      title,
      description: description || '',
      type: type || 'custom',
      assignedTo,
      assignedToName: assignedToName || assignedTo,
      status: 'pending',
      priority: priority || 'medium',
      dueDate,
      createdBy: session.user?.email || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await collection.insertOne(task)

    console.log('✅ Task created:', result.insertedId)

    return NextResponse.json({
      task: { ...task, id: result.insertedId.toString() },
      message: 'Tâche créée avec succès'
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error creating task:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    )
  }
}
