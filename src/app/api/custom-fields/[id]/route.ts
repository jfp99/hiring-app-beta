// src/app/api/custom-fields/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/app/lib/mongodb'
import { UpdateCustomFieldInput } from '@/app/types/customFields'

// PUT /api/custom-fields/[id] - Update a custom field definition
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only admins can update custom fields' },
        { status: 403 }
      )
    }

    const fieldId = params.id
    const body: UpdateCustomFieldInput = await request.json()

    const { db } = await connectToDatabase()
    const customFieldsCollection = db.collection('customFields')

    // Find the field
    const field = await customFieldsCollection.findOne({ id: fieldId })
    if (!field) {
      return NextResponse.json(
        { error: 'Custom field not found' },
        { status: 404 }
      )
    }

    // If name is being changed, check for duplicates
    if (body.name && body.name !== field.name) {
      const existingField = await customFieldsCollection.findOne({ name: body.name })
      if (existingField) {
        return NextResponse.json(
          { error: 'A field with this name already exists' },
          { status: 400 }
        )
      }
    }

    const timestamp = new Date().toISOString()

    // Update field
    const updateData: any = {
      ...body,
      updatedAt: timestamp
    }

    await customFieldsCollection.updateOne(
      { id: fieldId },
      { $set: updateData }
    )

    // Fetch updated field
    const updatedField = await customFieldsCollection.findOne({ id: fieldId })

    return NextResponse.json({
      success: true,
      field: {
        ...updatedField,
        id: updatedField.id || updatedField._id.toString(),
        _id: undefined
      }
    })
  } catch (error: any) {
    console.error('Error updating custom field:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/custom-fields/[id] - Delete a custom field definition
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only admins can delete custom fields' },
        { status: 403 }
      )
    }

    const fieldId = params.id

    const { db } = await connectToDatabase()
    const customFieldsCollection = db.collection('customFields')
    const candidatesCollection = db.collection('candidates')

    // Find the field
    const field = await customFieldsCollection.findOne({ id: fieldId })
    if (!field) {
      return NextResponse.json(
        { error: 'Custom field not found' },
        { status: 404 }
      )
    }

    // Check if field is being used by candidates
    const candidatesUsingField = await candidatesCollection.countDocuments({
      [`customFields.${field.name}`]: { $exists: true }
    })

    if (candidatesUsingField > 0) {
      // Instead of hard delete, mark as inactive
      await customFieldsCollection.updateOne(
        { id: fieldId },
        {
          $set: {
            isActive: false,
            updatedAt: new Date().toISOString()
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: `Field deactivated (${candidatesUsingField} candidates using this field). Data preserved.`,
        deactivated: true
      })
    } else {
      // Hard delete if not used
      await customFieldsCollection.deleteOne({ id: fieldId })

      return NextResponse.json({
        success: true,
        message: 'Field deleted successfully',
        deleted: true
      })
    }
  } catch (error: any) {
    console.error('Error deleting custom field:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
