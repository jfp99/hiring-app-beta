// src/app/lib/file-upload.ts
import { writeFile, mkdir, unlink, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// File upload configuration
export const UPLOAD_CONFIG = {
  // Maximum file sizes (in bytes)
  MAX_FILE_SIZE: {
    resume: 5 * 1024 * 1024,      // 5MB for resumes/CVs
    image: 2 * 1024 * 1024,        // 2MB for images
    document: 10 * 1024 * 1024,    // 10MB for other documents
  },

  // Allowed file types
  ALLOWED_TYPES: {
    resume: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  },

  // File extensions
  ALLOWED_EXTENSIONS: {
    resume: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
  },

  // Upload directories (relative to project root)
  UPLOAD_DIRS: {
    resumes: 'uploads/resumes',
    avatars: 'uploads/avatars',
    documents: 'uploads/documents',
    temp: 'uploads/temp'
  }
}

// File type detection
export function getFileType(mimetype: string): 'resume' | 'image' | 'document' | null {
  if (UPLOAD_CONFIG.ALLOWED_TYPES.resume.includes(mimetype)) return 'resume'
  if (UPLOAD_CONFIG.ALLOWED_TYPES.image.includes(mimetype)) return 'image'
  if (UPLOAD_CONFIG.ALLOWED_TYPES.document.includes(mimetype)) return 'document'
  return null
}

// Validate file
export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(
  file: {
    mimetype: string
    size: number
    originalname: string
  },
  fileType: 'resume' | 'image' | 'document'
): FileValidationResult {
  // Check file size
  const maxSize = UPLOAD_CONFIG.MAX_FILE_SIZE[fileType]
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  const allowedTypes = UPLOAD_CONFIG.ALLOWED_TYPES[fileType]
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed`
    }
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExtensions = UPLOAD_CONFIG.ALLOWED_EXTENSIONS[fileType]
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension ${ext} is not allowed`
    }
  }

  return { valid: true }
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const sanitizedName = path.basename(originalName, ext)
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50)

  return `${sanitizedName}_${timestamp}_${randomString}${ext}`
}

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), dirPath)
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true })
  }
}

// Save file to disk
export async function saveFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: 'resume' | 'image' | 'document'
): Promise<string> {
  try {
    // Determine upload directory
    let uploadDir: string
    switch (fileType) {
      case 'resume':
        uploadDir = UPLOAD_CONFIG.UPLOAD_DIRS.resumes
        break
      case 'image':
        uploadDir = UPLOAD_CONFIG.UPLOAD_DIRS.avatars
        break
      default:
        uploadDir = UPLOAD_CONFIG.UPLOAD_DIRS.documents
    }

    // Ensure directory exists
    await ensureDirectoryExists(uploadDir)

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(fileName)
    const filePath = path.join(uploadDir, uniqueFilename)
    const fullPath = path.join(process.cwd(), filePath)

    // Save file
    await writeFile(fullPath, fileBuffer)

    // Return relative path for storage in database
    return filePath
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error('Failed to save file')
  }
}

// Delete file from disk
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Get file from disk
export async function getFile(filePath: string): Promise<Buffer | null> {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    if (existsSync(fullPath)) {
      return await readFile(fullPath)
    }
    return null
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

// Sanitize filename for security
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255)
}

// Get file metadata
export interface FileMetadata {
  originalName: string
  sanitizedName: string
  extension: string
  mimeType: string
  size: number
  sizeFormatted: string
  uploadedAt: Date
}

export function getFileMetadata(
  originalName: string,
  mimeType: string,
  size: number
): FileMetadata {
  const extension = path.extname(originalName).toLowerCase()
  const sanitizedName = sanitizeFilename(originalName)

  // Format file size
  let sizeFormatted: string
  if (size < 1024) {
    sizeFormatted = `${size} B`
  } else if (size < 1024 * 1024) {
    sizeFormatted = `${(size / 1024).toFixed(2)} KB`
  } else {
    sizeFormatted = `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  return {
    originalName,
    sanitizedName,
    extension,
    mimeType,
    size,
    sizeFormatted,
    uploadedAt: new Date()
  }
}

// Virus scanning placeholder (implement with actual service in production)
export async function scanFile(fileBuffer: Buffer): Promise<boolean> {
  // TODO: Integrate with virus scanning service (ClamAV, etc.)
  // For now, return true (safe)
  console.log('⚠️ Virus scanning not implemented - skipping')
  return true
}

// File type icons mapping
export const FILE_ICONS: Record<string, string> = {
  '.pdf': '📄',
  '.doc': '📝',
  '.docx': '📝',
  '.xls': '📊',
  '.xlsx': '📊',
  '.txt': '📃',
  '.rtf': '📃',
  '.jpg': '🖼️',
  '.jpeg': '🖼️',
  '.png': '🖼️',
  '.gif': '🖼️',
  '.webp': '🖼️',
  default: '📎'
}

export function getFileIcon(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}