// src/app/services/candidateService.ts
/**
 * Candidate Service Layer
 *
 * This service encapsulates all business logic related to candidates.
 * Benefits:
 * - Separation of concerns (routes handle HTTP, services handle business logic)
 * - Reusable across different contexts (API, background jobs, etc.)
 * - Easier to test (can mock database)
 * - Consistent error handling
 * - Single source of truth for candidate operations
 */

import { Db, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import {
  Candidate,
  CreateCandidateDTO,
  UpdateCandidateDTO,
  CandidateStatus,
  CandidateSearchFilters,
  AvailabilityStatus,
  ContractPreference
} from '@/app/types/candidates'
import { toMongoStatus } from '@/app/lib/status-mapper'
import { MongoQuery, createActivityLog } from '@/app/types/api'
import { isValidObjectId, sanitizeEmail } from '@/app/lib/security'

// =============================================================================
// TYPES
// =============================================================================

export interface CandidateSearchResult {
  candidates: Candidate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateCandidateResult {
  candidateId: string
  candidate: Candidate
}

// =============================================================================
// CANDIDATE SERVICE
// =============================================================================

export class CandidateService {
  constructor(private db: Db) {}

  /**
   * Find candidate by ID
   */
  async findById(id: string): Promise<Candidate | null> {
    if (!isValidObjectId(id)) {
      return null
    }

    const candidate = await this.db
      .collection('candidates')
      .findOne({ _id: new ObjectId(id) })

    if (!candidate) {
      return null
    }

    return this.mapToCandidate(candidate)
  }

  /**
   * Find candidate by email
   */
  async findByEmail(email: string): Promise<Candidate | null> {
    const sanitized = sanitizeEmail(email)
    const candidate = await this.db
      .collection('candidates')
      .findOne({ email: sanitized })

    if (!candidate) {
      return null
    }

    return this.mapToCandidate(candidate)
  }

  /**
   * Search candidates with filters
   */
  async search(filters: CandidateSearchFilters): Promise<CandidateSearchResult> {
    const query = this.buildSearchQuery(filters)
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20)
    const limit = filters.limit || 20

    // Sorting
    const sortField = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder }

    // Execute query
    const [candidates, total] = await Promise.all([
      this.db
        .collection('candidates')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('candidates').countDocuments(query)
    ])

    return {
      candidates: candidates.map(c => this.mapToCandidate(c)),
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: Math.ceil(total / (filters.limit || 20))
    }
  }

  /**
   * Create a new candidate
   */
  async create(
    data: CreateCandidateDTO,
    userId: string,
    userName: string
  ): Promise<CreateCandidateResult> {
    // Validate email uniqueness
    const existing = await this.findByEmail(data.email)
    if (existing) {
      throw new Error('Candidate with this email already exists')
    }

    // Prepare candidate data
    const appStatus = data.status || CandidateStatus.NEW
    const candidateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: sanitizeEmail(data.email),
      phone: data.phone,
      currentPosition: data.currentPosition,
      currentCompany: undefined,
      experienceLevel: data.experienceLevel,
      totalExperience: undefined,

      appStatus: appStatus,
      status: toMongoStatus(appStatus),
      source: data.source,
      referredBy: undefined,

      skills: data.skills || [],
      primarySkills: data.skills?.slice(0, 5).map(s => s.name) || [],
      languages: [],

      workExperience: [],
      education: [],
      certifications: [],

      desiredPosition: [],
      contractPreference: data.contractPreference || [ContractPreference.ANY],
      availability: data.availability || AvailabilityStatus.NEGOTIABLE,
      willingToRelocate: false,
      remoteWorkPreference: 'flexible',

      salaryExpectation: undefined,

      resumeId: undefined,
      coverLetterId: undefined,
      portfolioUrl: undefined,
      linkedinUrl: undefined,
      githubUrl: undefined,
      websiteUrl: undefined,

      interviews: [],
      applicationIds: [],

      notes: [],
      activities: [
        createActivityLog(
          'profile_updated',
          'Candidate profile created',
          userId,
          userName,
          {}
        )
      ],
      tags: [],

      overallRating: undefined,
      technicalRating: undefined,
      culturalFitRating: undefined,
      communicationRating: undefined,

      assignedTo: data.assignedTo,
      assignedToName: undefined as string | undefined,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactedAt: undefined,

      gdprConsent: true,
      marketingConsent: false,
      isActive: true,
      isArchived: false,

      customFields: {}
    }

    // Get assigned user name if provided
    if (candidateData.assignedTo && isValidObjectId(candidateData.assignedTo)) {
      const assignedUser = await this.db.collection('users').findOne({
        _id: new ObjectId(candidateData.assignedTo)
      })
      if (assignedUser) {
        candidateData.assignedToName = `${assignedUser.firstName} ${assignedUser.lastName}`
      }
    }

    // Insert candidate
    const result = await this.db.collection('candidates').insertOne(candidateData)

    // Log activity
    await this.db.collection('activities').insertOne({
      type: 'candidate_created',
      userId,
      candidateId: result.insertedId.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${data.firstName} ${data.lastName}`,
        candidateEmail: data.email
      }
    })

    const candidate = await this.findById(result.insertedId.toString())

    return {
      candidateId: result.insertedId.toString(),
      candidate: candidate!
    }
  }

  /**
   * Update candidate
   */
  async update(
    id: string,
    data: UpdateCandidateDTO,
    userId: string,
    userName: string
  ): Promise<Candidate> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid candidate ID')
    }

    const candidate = await this.findById(id)
    if (!candidate) {
      throw new Error('Candidate not found')
    }

    // Build update data
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    }

    // Handle status change
    if (data.status && data.status !== candidate.status) {
      updateData.appStatus = data.status
      updateData.status = toMongoStatus(data.status)

      // Add activity log
      const activity = createActivityLog(
        'status_changed',
        `Status changed from ${candidate.status} to ${data.status}`,
        userId,
        userName,
        {
          oldStatus: candidate.status,
          newStatus: data.status
        }
      )

      await this.db.collection('candidates').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData,
          $push: { activities: activity } as any
        }
      )
    } else {
      await this.db.collection('candidates').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
    }

    const updated = await this.findById(id)
    return updated!
  }

  /**
   * Delete candidate (soft delete)
   */
  async delete(id: string, userId: string, userName: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid candidate ID')
    }

    const candidate = await this.findById(id)
    if (!candidate) {
      return false
    }

    // Soft delete
    await this.db.collection('candidates').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          isArchived: true,
          archivedAt: new Date().toISOString(),
          archivedBy: userId,
          updatedAt: new Date().toISOString()
        },
        $push: {
          activities: createActivityLog(
            'candidate_archived',
            'Candidate archived',
            userId,
            userName,
            {}
          )
        } as any
      }
    )

    return true
  }

  /**
   * Hard delete candidate (GDPR right to erasure)
   */
  async hardDelete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid candidate ID')
    }

    const result = await this.db.collection('candidates').deleteOne({
      _id: new ObjectId(id)
    })

    // Also delete related data
    await Promise.all([
      this.db.collection('interviews').deleteMany({ candidateId: id }),
      this.db.collection('tasks').deleteMany({ candidateId: id }),
      this.db.collection('comments').deleteMany({ candidateId: id }),
      this.db.collection('activities').deleteMany({ candidateId: id })
    ])

    return result.deletedCount > 0
  }

  /**
   * Get candidate statistics
   */
  async getStats() {
    const [
      total,
      active,
      archived,
      byStatus,
      byExperienceLevel
    ] = await Promise.all([
      this.db.collection('candidates').countDocuments({}),
      this.db.collection('candidates').countDocuments({ isActive: true }),
      this.db.collection('candidates').countDocuments({ isArchived: true }),
      this.db
        .collection('candidates')
        .aggregate([
          { $group: { _id: '$appStatus', count: { $sum: 1 } } }
        ])
        .toArray(),
      this.db
        .collection('candidates')
        .aggregate([
          { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
        ])
        .toArray()
    ])

    return {
      total,
      active,
      archived,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      byExperienceLevel: Object.fromEntries(byExperienceLevel.map(s => [s._id, s.count]))
    }
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: CandidateSearchFilters): MongoQuery {
    const query: MongoQuery = {}

    // Text search
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { currentPosition: { $regex: filters.search, $options: 'i' } },
        { currentCompany: { $regex: filters.search, $options: 'i' } }
      ]
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      query.$or = [
        { appStatus: { $in: filters.status } },
        { status: { $in: filters.status }, appStatus: { $exists: false } }
      ]
    }

    // Experience level filter
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      query.experienceLevel = { $in: filters.experienceLevel }
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      query['skills.name'] = { $in: filters.skills.map(s => new RegExp(s, 'i')) }
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      query.availability = { $in: filters.availability }
    }

    // Location filter
    if (filters.location) {
      query.$or = [
        { 'address.city': { $regex: filters.location, $options: 'i' } },
        { 'address.country': { $regex: filters.location, $options: 'i' } }
      ]
    }

    // Assigned to filter
    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo
    }

    // Source filter
    if (filters.source && filters.source.length > 0) {
      query.source = { $in: filters.source }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags }
    }

    // Rating filter
    if (filters.minRating) {
      query.overallRating = { $gte: filters.minRating }
    }

    // Active/Archived filter
    query.isActive = filters.isActive !== false
    query.isArchived = filters.isArchived === true

    return query
  }

  /**
   * Map MongoDB document to Candidate type
   */
  private mapToCandidate(doc: any): Candidate {
    return {
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      currentPosition: doc.currentPosition,
      currentCompany: doc.currentCompany,
      experienceLevel: doc.experienceLevel,
      status: doc.appStatus || doc.status,
      skills: doc.skills || [],
      primarySkills: doc.primarySkills || [],
      availability: doc.availability,
      contractPreference: doc.contractPreference || [],
      source: doc.source,
      overallRating: doc.overallRating,
      assignedTo: doc.assignedTo,
      assignedToName: doc.assignedToName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastContactedAt: doc.lastContactedAt,
      tags: doc.tags || [],
      profilePictureUrl: doc.profilePictureUrl,
      quickScores: doc.quickScores || [],
      ...doc
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new instance of CandidateService
 */
export function createCandidateService(db: Db): CandidateService {
  return new CandidateService(db)
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CandidateService
