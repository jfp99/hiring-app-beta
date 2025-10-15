// src/app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { getFile } from '@/app/lib/file-upload'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import { DocumentStatus } from '@/app/types/documents'

// GET: Download or preview a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: documentId } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'download' // 'download' or 'preview'

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    // Find the document
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId)
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canAccess =
      document.isPublic ||
      document.uploadedBy === (session.user as any)?.id || session.user?.email || 'unknown' ||
      document.allowedUsers?.includes((session.user as any)?.id || session.user?.email || 'unknown') ||
      hasPermission(session.user as any, PERMISSIONS.CANDIDATE_VIEW)

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Get file from disk
    const fileBuffer = await getFile(document.filePath)

    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }

    // Log access
    await db.collection('activities').insertOne({
      type: `document_${action}`,
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      documentId: documentId,
      timestamp: new Date().toISOString(),
      metadata: {
        fileName: document.originalName,
        fileType: document.type
      }
    })

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', document.mimeType)
    headers.set('Content-Length', document.fileSize.toString())

    if (action === 'download') {
      headers.set(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`
      )
    } else {
      headers.set(
        'Content-Disposition',
        `inline; filename="${document.originalName}"`
      )
    }

    // Add caching headers for preview
    if (action === 'preview') {
      headers.set('Cache-Control', 'private, max-age=3600')
    }

    console.log(`✅ [DOCUMENTS] Document ${action}:`, {
      id: documentId,
      fileName: document.originalName,
      user: session.user?.email || 'unknown'
    })

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(fileBuffer)

    return new NextResponse(uint8Array, {
      status: 200,
      headers: headers
    })

  } catch (error: unknown) {
    console.error('❌ [DOCUMENTS] Error accessing document:', error)
    return NextResponse.json(
      { error: 'Failed to access document' },
      { status: 500 }
    )
  }
}

// PUT: Update document metadata or status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: documentId } = await params
    const body = await request.json()

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    // Find the document
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId)
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canEdit =
      document.uploadedBy === (session.user as any)?.id || session.user?.email || 'unknown' ||
      hasPermission(session.user as any, PERMISSIONS.CANDIDATE_EDIT)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    // Update allowed fields
    if (body.description !== undefined) {
      updateData.description = body.description
    }

    if (body.type !== undefined) {
      updateData.type = body.type
    }

    if (body.isPublic !== undefined) {
      updateData.isPublic = body.isPublic
    }

    // Status changes require special permissions
    if (body.status !== undefined && hasPermission(session.user as any, PERMISSIONS.CANDIDATE_EDIT)) {
      updateData.status = body.status as DocumentStatus
      updateData.reviewedAt = new Date().toISOString()
      updateData.reviewedBy = (session.user as any)?.id || session.user?.email || 'unknown'
    }

    // Update document
    await db.collection('documents').updateOne(
      { _id: new ObjectId(documentId) },
      { $set: updateData }
    )

    // Log activity
    await db.collection('activities').insertOne({
      type: 'document_updated',
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      documentId: documentId,
      timestamp: new Date().toISOString(),
      metadata: {
        updates: Object.keys(updateData).filter(k => k !== 'updatedAt')
      }
    })

    console.log('✅ [DOCUMENTS] Document updated:', documentId)

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully'
    })

  } catch (error: unknown) {
    console.error('❌ [DOCUMENTS] Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a specific document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: documentId } = await params

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    // Find the document
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(documentId)
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canDelete =
      document.uploadedBy === (session.user as any)?.id || session.user?.email || 'unknown' ||
      hasPermission(session.user as any, PERMISSIONS.CANDIDATE_DELETE)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete file from disk
    const { deleteFile } = await import('@/app/lib/file-upload')
    const fileDeleted = await deleteFile(document.filePath)

    if (!fileDeleted) {
      console.warn('⚠️ [DOCUMENTS] File not found on disk:', document.filePath)
    }

    // Delete from database
    await db.collection('documents').deleteOne({
      _id: new ObjectId(documentId)
    })

    // Log activity
    await db.collection('activities').insertOne({
      type: 'document_deleted',
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      documentId: documentId,
      timestamp: new Date().toISOString(),
      metadata: {
        fileName: document.originalName,
        fileType: document.type
      }
    })

    console.log('✅ [DOCUMENTS] Document deleted:', documentId)

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error: unknown) {
    console.error('❌ [DOCUMENTS] Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}