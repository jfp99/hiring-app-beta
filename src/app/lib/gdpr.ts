// src/app/lib/gdpr.ts
/**
 * GDPR Compliance Module
 *
 * This module implements GDPR (General Data Protection Regulation) compliance features:
 * - Data retention policies
 * - Right to erasure (right to be forgotten)
 * - Data portability
 * - PII anonymization for logs
 * - Consent management
 *
 * CRITICAL: This is required for legal compliance in the EU
 */

import { Db, ObjectId } from 'mongodb'
import { anonymizePII, PIIFields } from './security'

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Data retention period in days (2 years = 730 days)
 * Per GDPR Article 5(1)(e): Data should not be kept longer than necessary
 */
export const DATA_RETENTION_DAYS = 730

/**
 * Minimum days before automatic deletion
 */
export const MIN_RETENTION_DAYS = 30

// =============================================================================
// TYPES
// =============================================================================

export interface DataExportRequest {
  userId?: string
  candidateEmail?: string
  format: 'json' | 'csv'
}

export interface DataExportResult {
  candidate?: any
  interviews?: any[]
  tasks?: any[]
  comments?: any[]
  activities?: any[]
  exportedAt: string
  format: string
}

export interface DataRetentionReport {
  totalCandidates: number
  retentionCutoffDate: string
  candidatesForDeletion: number
  candidatesDeleted: number
  errors: string[]
}

export interface DataErasureResult {
  success: boolean
  deletedCandidates: number
  deletedInterviews: number
  deletedTasks: number
  deletedComments: number
  deletedActivities: number
  errors: string[]
}

// =============================================================================
// PII HANDLER CLASS
// =============================================================================

export class PIIHandler {
  constructor(private db: Db) {}

  /**
   * Anonymize PII fields for logging
   * Use this before logging any user data
   */
  anonymize(data: PIIFields): PIIFields {
    return anonymizePII(data)
  }

  /**
   * Enforce data retention policy
   * Deletes candidates that have been rejected/inactive for longer than retention period
   *
   * Run this periodically (e.g., monthly via cron job)
   */
  async enforceRetention(
    retentionDays: number = DATA_RETENTION_DAYS,
    dryRun: boolean = true
  ): Promise<DataRetentionReport> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const report: DataRetentionReport = {
      totalCandidates: 0,
      retentionCutoffDate: cutoffDate.toISOString(),
      candidatesForDeletion: 0,
      candidatesDeleted: 0,
      errors: []
    }

    try {
      // Count total candidates
      report.totalCandidates = await this.db
        .collection('candidates')
        .countDocuments({})

      // Find candidates eligible for deletion
      // Criteria: Rejected/Archived AND last updated before cutoff date
      const eligibleCandidates = await this.db
        .collection('candidates')
        .find({
          $or: [
            { status: 'REJECTED' },
            { isArchived: true }
          ],
          updatedAt: { $lt: cutoffDate.toISOString() }
        })
        .toArray()

      report.candidatesForDeletion = eligibleCandidates.length

      if (!dryRun && eligibleCandidates.length > 0) {
        // Delete candidates and related data
        for (const candidate of eligibleCandidates) {
          try {
            await this.deleteUserData(candidate.email)
            report.candidatesDeleted++
          } catch (error) {
            report.errors.push(
              `Failed to delete candidate ${candidate.email}: ${(error as Error).message}`
            )
          }
        }
      }

      // Log retention enforcement
      await this.db.collection('activities').insertOne({
        type: 'gdpr_retention_enforced',
        timestamp: new Date().toISOString(),
        metadata: {
          dryRun,
          retentionDays,
          cutoffDate: cutoffDate.toISOString(),
          candidatesForDeletion: report.candidatesForDeletion,
          candidatesDeleted: report.candidatesDeleted,
          errors: report.errors.length
        }
      })

      return report
    } catch (error) {
      report.errors.push(`Retention enforcement failed: ${(error as Error).message}`)
      return report
    }
  }

  /**
   * Right to erasure (GDPR Article 17)
   * Permanently delete all data related to a user/candidate
   *
   * WARNING: This is irreversible!
   */
  async deleteUserData(email: string): Promise<DataErasureResult> {
    const result: DataErasureResult = {
      success: false,
      deletedCandidates: 0,
      deletedInterviews: 0,
      deletedTasks: 0,
      deletedComments: 0,
      deletedActivities: 0,
      errors: []
    }

    try {
      // Find candidate by email
      const candidate = await this.db
        .collection('candidates')
        .findOne({ email: email.toLowerCase() })

      if (!candidate) {
        result.errors.push('Candidate not found')
        return result
      }

      const candidateId = candidate._id.toString()

      // Delete candidate
      const candidateResult = await this.db
        .collection('candidates')
        .deleteOne({ _id: new ObjectId(candidateId) })
      result.deletedCandidates = candidateResult.deletedCount || 0

      // Delete interviews
      const interviewResult = await this.db
        .collection('interviews')
        .deleteMany({ candidateId })
      result.deletedInterviews = interviewResult.deletedCount || 0

      // Delete tasks
      const taskResult = await this.db
        .collection('tasks')
        .deleteMany({ candidateId })
      result.deletedTasks = taskResult.deletedCount || 0

      // Delete comments
      const commentResult = await this.db
        .collection('comments')
        .deleteMany({ candidateId })
      result.deletedComments = commentResult.deletedCount || 0

      // Delete activities
      const activityResult = await this.db
        .collection('activities')
        .deleteMany({ candidateId })
      result.deletedActivities = activityResult.deletedCount || 0

      // Delete documents
      await this.db.collection('documents').deleteMany({
        entityType: 'candidate',
        entityId: candidateId
      })

      // Log erasure (anonymized)
      await this.db.collection('activities').insertOne({
        type: 'gdpr_data_erasure',
        timestamp: new Date().toISOString(),
        metadata: {
          candidateEmail: anonymizePII({ email }).email,
          deletedRecords: {
            candidates: result.deletedCandidates,
            interviews: result.deletedInterviews,
            tasks: result.deletedTasks,
            comments: result.deletedComments,
            activities: result.deletedActivities
          }
        }
      })

      result.success = true
      return result
    } catch (error) {
      result.errors.push(`Data erasure failed: ${(error as Error).message}`)
      return result
    }
  }

  /**
   * Right to data portability (GDPR Article 20)
   * Export all data related to a user in a structured format
   */
  async exportUserData(request: DataExportRequest): Promise<DataExportResult> {
    let candidate: any = null

    // Find candidate
    if (request.userId) {
      candidate = await this.db
        .collection('candidates')
        .findOne({ _id: new ObjectId(request.userId) })
    } else if (request.candidateEmail) {
      candidate = await this.db
        .collection('candidates')
        .findOne({ email: request.candidateEmail.toLowerCase() })
    }

    if (!candidate) {
      throw new Error('Candidate not found')
    }

    const candidateId = candidate._id.toString()

    // Fetch all related data
    const [interviews, tasks, comments, activities] = await Promise.all([
      this.db.collection('interviews').find({ candidateId }).toArray(),
      this.db.collection('tasks').find({ candidateId }).toArray(),
      this.db.collection('comments').find({ candidateId }).toArray(),
      this.db.collection('activities').find({ candidateId }).toArray()
    ])

    // Log export request
    await this.db.collection('activities').insertOne({
      type: 'gdpr_data_export',
      candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        format: request.format,
        recordsExported: {
          interviews: interviews.length,
          tasks: tasks.length,
          comments: comments.length,
          activities: activities.length
        }
      }
    })

    return {
      candidate,
      interviews,
      tasks,
      comments,
      activities,
      exportedAt: new Date().toISOString(),
      format: request.format
    }
  }

  /**
   * Update consent settings
   */
  async updateConsent(
    candidateId: string,
    gdprConsent: boolean,
    marketingConsent: boolean
  ): Promise<void> {
    await this.db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          gdprConsent,
          marketingConsent,
          consentUpdatedAt: new Date().toISOString()
        }
      }
    )

    // Log consent change
    await this.db.collection('activities').insertOne({
      type: 'consent_updated',
      candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        gdprConsent,
        marketingConsent
      }
    })
  }

  /**
   * Get candidates without valid consent
   */
  async getCandidatesWithoutConsent(): Promise<any[]> {
    return this.db
      .collection('candidates')
      .find({
        $or: [
          { gdprConsent: { $ne: true } },
          { gdprConsent: { $exists: false } }
        ]
      })
      .toArray()
  }

  /**
   * Anonymize candidate data (alternative to deletion)
   * Keeps statistical data but removes PII
   */
  async anonymizeCandidate(candidateId: string): Promise<void> {
    const randomId = new ObjectId().toString()

    await this.db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          firstName: 'Anonymized',
          lastName: 'User',
          email: `anonymized-${randomId}@example.com`,
          phone: '',
          linkedinUrl: '',
          portfolioUrl: '',
          githubUrl: '',
          websiteUrl: '',
          address: {},
          gdprAnonymized: true,
          gdprAnonymizedAt: new Date().toISOString()
        },
        $unset: {
          resumeId: '',
          coverLetterId: '',
          notes: ''
        }
      }
    )

    // Log anonymization
    await this.db.collection('activities').insertOne({
      type: 'gdpr_anonymization',
      candidateId,
      timestamp: new Date().toISOString(),
      metadata: {
        anonymizedId: randomId
      }
    })
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new PIIHandler instance
 */
export function createPIIHandler(db: Db): PIIHandler {
  return new PIIHandler(db)
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate retention cutoff date
 */
export function getRetentionCutoffDate(retentionDays: number = DATA_RETENTION_DAYS): Date {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  return cutoffDate
}

/**
 * Format data for CSV export
 */
export function formatDataForExport(data: any, format: 'json' | 'csv'): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }

  // CSV format (simplified)
  // In production, use a proper CSV library
  const candidate = data.candidate
  const csv = [
    'Field,Value',
    `Name,${candidate.firstName} ${candidate.lastName}`,
    `Email,${candidate.email}`,
    `Phone,${candidate.phone || 'N/A'}`,
    `Status,${candidate.status}`,
    `Created,${candidate.createdAt}`,
    `Updated,${candidate.updatedAt}`,
    ``,
    `Interviews,${data.interviews?.length || 0}`,
    `Tasks,${data.tasks?.length || 0}`,
    `Comments,${data.comments?.length || 0}`,
    `Activities,${data.activities?.length || 0}`
  ].join('\n')

  return csv
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  PIIHandler,
  createPIIHandler,
  getRetentionCutoffDate,
  formatDataForExport,
  DATA_RETENTION_DAYS,
  MIN_RETENTION_DAYS
}
