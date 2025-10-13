// src/app/api/custom-fields/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { CreateCustomFieldInput, CustomFieldDefinition } from '@/app/types/customFields'

// GET /api/custom-fields - List all custom field definitions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const category = searchParams.get('category')

    const { db } = await connectToDatabase()
    const customFieldsCollection = db.collection('customFields')

    // Build query
    const query: any = {}
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    if (category) {
      query.category = category
    }

    // Fetch fields, sorted by order
    const fields = await customFieldsCollection
      .find(query)
      .sort({ order: 1, createdAt: 1 })
      .toArray()

    // Convert MongoDB _id to id
    const formattedFields = fields.map(field => ({
      ...field,
      id: field.id || field._id.toString(),
      _id: undefined
    }))

    return NextResponse.json({
      success: true,
      fields: formattedFields,
      total: formattedFields.length
    })
  } catch (error: any) {
    console.error('Error fetching custom fields:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/custom-fields - Create a new custom field definition
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = (session.user as any).role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create custom fields' },
        { status: 403 }
      )
    }

    const body: CreateCustomFieldInput = await request.json()
    const {
      name,
      label,
      type,
      description,
      placeholder,
      required,
      options,
      validation,
      showInList,
      showInProfile,
      category,
      order
    } = body

    // Validation
    if (!name || !label || !type) {
      return NextResponse.json(
        { error: 'name, label, and type are required' },
        { status: 400 }
      )
    }

    // Validate field name (must be alphanumeric with underscores)
    const nameRegex = /^[a-z_][a-z0-9_]*$/
    if (!nameRegex.test(name)) {
      return NextResponse.json(
        { error: 'Field name must be lowercase alphanumeric with underscores' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const customFieldsCollection = db.collection('customFields')

    // Check if field with same name already exists
    const existingField = await customFieldsCollection.findOne({ name })
    if (existingField) {
      return NextResponse.json(
        { error: 'A field with this name already exists' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()
    const userId = (session.user as any).id || session.user.email
    const userName = session.user.name || session.user.email || 'Unknown'

    // Create new field definition
    const newField: CustomFieldDefinition = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name,
      label,
      type,
      description,
      placeholder,
      required: required || false,
      isActive: true,
      options,
      validation,
      showInList: showInList !== undefined ? showInList : true,
      showInProfile: showInProfile !== undefined ? showInProfile : true,
      category,
      order: order !== undefined ? order : 999,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
      createdByName: userName
    }

    await customFieldsCollection.insertOne(newField)

    return NextResponse.json({
      success: true,
      field: newField
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating custom field:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
