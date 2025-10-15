// src/app/types/api.ts
/**
 * Common API types and interfaces
 * Used across all API routes for consistency and type safety
 */

import { ObjectId } from 'mongodb'

// =============================================================================
// MONGODB QUERY TYPES
// =============================================================================

/**
 * MongoDB filter query type
 * Use this instead of `any` for query objects
 */
export type MongoQuery = Record<string, any>

/**
 * MongoDB update data type
 * Use this instead of `any` for update objects
 */
export interface MongoUpdateData {
  $set?: Record<string, any>
  $unset?: Record<string, any>
  $push?: Record<string, any>
  $pull?: Record<string, any>
  $inc?: Record<string, any>
  $addToSet?: Record<string, any>
  [key: string]: any
}

/**
 * MongoDB document with _id
 */
export interface MongoDocument {
  _id: ObjectId
  [key: string]: any
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

/**
 * API Error type for catch blocks
 * Replace `error: any` with `error: unknown` and use this helper
 */
export interface APIError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

/**
 * Check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

/**
 * Extract error status code safely
 */
export function getErrorStatus(error: unknown): number {
  if (isAPIError(error) && error.statusCode) {
    return error.statusCode
  }
  return 500
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard success response
 */
export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  success: true
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// =============================================================================
// ACTIVITY LOG TYPES
// =============================================================================

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string
  type: string
  description: string
  userId: string
  userName: string
  timestamp: string
  metadata: Record<string, any>
}

/**
 * Create activity log helper
 */
export function createActivityLog(
  type: string,
  description: string,
  userId: string,
  userName: string,
  metadata: Record<string, any> = {}
): ActivityLog {
  return {
    id: Date.now().toString(),
    type,
    description,
    userId,
    userName,
    timestamp: new Date().toISOString(),
    metadata
  }
}

// =============================================================================
// EMAIL LOG TYPES
// =============================================================================

/**
 * Email log entry
 */
export interface EmailLog {
  templateId?: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  sentBy: string
  sentAt: string
  status: 'sent' | 'failed' | 'pending'
  provider: string
  messageId?: string
  error?: string
  metadata?: Record<string, any>
}

/**
 * Create email log helper
 */
export function createEmailLog(
  to: string[],
  subject: string,
  sentBy: string,
  status: 'sent' | 'failed' | 'pending',
  provider: string,
  options: {
    templateId?: string
    cc?: string[]
    bcc?: string[]
    messageId?: string
    error?: string
    metadata?: Record<string, any>
  } = {}
): EmailLog {
  return {
    templateId: options.templateId,
    to,
    cc: options.cc,
    bcc: options.bcc,
    subject,
    sentBy,
    sentAt: new Date().toISOString(),
    status,
    provider,
    messageId: options.messageId,
    error: options.error,
    metadata: options.metadata
  }
}

// =============================================================================
// WORK EXPERIENCE TYPES
// =============================================================================

/**
 * Work experience entry (for resume parsing)
 */
export interface WorkExperience {
  company: string
  position: string
  startDate?: string
  endDate?: string
  description?: string
  current?: boolean
}

/**
 * Education entry (for resume parsing)
 */
export interface EducationEntry {
  institution: string
  degree: string
  field?: string
  startDate?: string
  endDate?: string
  description?: string
}

// =============================================================================
// COLLECTION DATA TYPES
// =============================================================================

/**
 * Collection data (for debug endpoint)
 */
export interface CollectionData {
  [collectionName: string]: {
    count: number
    sample?: any[]
  }
}

// =============================================================================
// UPDATE DATA BUILDER
// =============================================================================

/**
 * Builder for MongoDB update data
 * Ensures type safety for update operations
 */
export class UpdateDataBuilder {
  private data: MongoUpdateData = {}

  set(field: string, value: any): this {
    if (!this.data.$set) this.data.$set = {}
    this.data.$set[field] = value
    return this
  }

  unset(field: string): this {
    if (!this.data.$unset) this.data.$unset = {}
    this.data.$unset[field] = ''
    return this
  }

  push(field: string, value: any): this {
    if (!this.data.$push) this.data.$push = {}
    this.data.$push[field] = value
    return this
  }

  pull(field: string, value: any): this {
    if (!this.data.$pull) this.data.$pull = {}
    this.data.$pull[field] = value
    return this
  }

  inc(field: string, amount: number): this {
    if (!this.data.$inc) this.data.$inc = {}
    this.data.$inc[field] = amount
    return this
  }

  addToSet(field: string, value: any): this {
    if (!this.data.$addToSet) this.data.$addToSet = {}
    this.data.$addToSet[field] = value
    return this
  }

  build(): MongoUpdateData {
    return this.data
  }
}

// =============================================================================
// QUERY BUILDER
// =============================================================================

/**
 * Builder for MongoDB queries
 * Provides type-safe query construction
 */
export class QueryBuilder {
  private query: MongoQuery = {}

  equals(field: string, value: any): this {
    this.query[field] = value
    return this
  }

  in(field: string, values: any[]): this {
    this.query[field] = { $in: values }
    return this
  }

  regex(field: string, pattern: string, options: string = 'i'): this {
    this.query[field] = { $regex: pattern, $options: options }
    return this
  }

  exists(field: string, exists: boolean = true): this {
    this.query[field] = { $exists: exists }
    return this
  }

  gte(field: string, value: any): this {
    if (!this.query[field]) this.query[field] = {}
    this.query[field].$gte = value
    return this
  }

  lte(field: string, value: any): this {
    if (!this.query[field]) this.query[field] = {}
    this.query[field].$lte = value
    return this
  }

  or(queries: MongoQuery[]): this {
    this.query.$or = queries
    return this
  }

  and(queries: MongoQuery[]): this {
    this.query.$and = queries
    return this
  }

  build(): MongoQuery {
    return this.query
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  isAPIError,
  getErrorMessage,
  getErrorStatus,
  createActivityLog,
  createEmailLog,
  UpdateDataBuilder,
  QueryBuilder
}
