// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import {
  saveFile,
  deleteFile,
  getFile,
  validateFile,
  getFileMetadata,
  scanFile,
  getFileType
} from '@/app/lib/file-upload'
import { DocumentType, DocumentStatus } from '@/app/types/documents'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'

// GET: List documents with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const documentType = searchParams.get('type')
    const status = searchParams.get('status')

    const { db } = await connectToDatabase()

    // Build query
    const query: any = {}

    // Apply filters
    if (entityType) query.entityType = entityType
    if (entityId) query.entityId = entityId
    if (documentType) query.type = documentType
    if (status) query.status = status

    // Apply permission-based filtering
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_VIEW)) {
      // If user can't view all candidates, only show their own documents
      query.$or = [
        { uploadedBy: session.user.id },
        { allowedUsers: session.user.id },
        { isPublic: true }
      ]
    }

    const documents = await db
      .collection('documents')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray()

    const formattedDocs = documents.map(doc => ({
      id: doc._id.toString(),
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      type: doc.type,
      status: doc.status,
      description: doc.description,
      entityType: doc.entityType,
      entityId: doc.entityId,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      isPublic: doc.isPublic
    }))

    // Log access
    await db.collection('activities').insertOne({
      type: 'documents_viewed',
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      metadata: { count: formattedDocs.length }
    })

    return NextResponse.json({
      success: true,
      documents: formattedDocs,
      total: formattedDocs.length
    })

  } catch (error) {
    console.error('❌ [DOCUMENTS] Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as DocumentType
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Detect file type
    const detectedFileType = getFileType(file.type)
    if (!detectedFileType) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(
      {
        mimetype: file.type,
        size: buffer.length,
        originalname: file.name
      },
      detectedFileType
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Scan file for viruses
    const isSafe = await scanFile(buffer)
    if (!isSafe) {
      return NextResponse.json(
        { error: 'File failed security scan' },
        { status: 400 }
      )
    }

    // Save file to disk
    const filePath = await saveFile(buffer, file.name, detectedFileType)

    // Get file metadata
    const metadata = getFileMetadata(file.name, file.type, buffer.length)

    // Save document record to database
    const { db } = await connectToDatabase()

    const documentData = {
      fileName: metadata.sanitizedName,
      originalName: metadata.originalName,
      filePath: filePath,
      fileSize: metadata.size,
      mimeType: metadata.mimeType,
      extension: metadata.extension,
      type: type || DocumentType.OTHER,
      status: DocumentStatus.PENDING_REVIEW,
      description: description || '',
      uploadedBy: session.user.id,
      entityType: entityType,
      entityId: entityId,
      isPublic: false,
      uploadedAt: new Date().toISOString(),
      metadata: {
        sizeFormatted: metadata.sizeFormatted
      }
    }

    const result = await db.collection('documents').insertOne(documentData)

    console.log('✅ [DOCUMENTS] Document uploaded:', {
      id: result.insertedId,
      fileName: file.name,
      size: metadata.sizeFormatted,
      type: type
    })

    // Log activity
    await db.collection('activities').insertOne({
      type: 'document_uploaded',
      userId: session.user.id,
      documentId: result.insertedId.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        fileName: file.name,
        fileType: type,
        entityType: entityType,
        entityId: entityId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: result.insertedId.toString(),
        fileName: metadata.sanitizedName,
        originalName: metadata.originalName,
        size: metadata.sizeFormatted,
        type: type,
        status: DocumentStatus.PENDING_REVIEW,
        uploadedAt: documentData.uploadedAt
      }
    })

  } catch (error) {
    console.error('❌ [DOCUMENTS] Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

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
      document.uploadedBy === session.user.id ||
      hasPermission(session.user, PERMISSIONS.CANDIDATE_DELETE)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete file from disk
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
      userId: session.user.id,
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

  } catch (error) {
    console.error('❌ [DOCUMENTS] Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}