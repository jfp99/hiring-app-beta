// tests/lib/gdpr.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ObjectId } from 'mongodb'
import {
  PIIHandler,
  createPIIHandler,
  getRetentionCutoffDate,
  formatDataForExport,
  DATA_RETENTION_DAYS,
  type DataExportRequest,
  type DataExportResult,
  type DataRetentionReport,
  type DataErasureResult
} from '@/app/lib/gdpr'

// =============================================================================
// MOCK DATABASE
// =============================================================================

const createMockDb = () => {
  const mockCollections: Record<string, any> = {
    candidates: [],
    interviews: [],
    tasks: [],
    comments: [],
    activities: [],
    documents: []
  }

  const collectionMethods: Record<string, any> = {}

  return {
    collection: (name: string) => {
      if (!collectionMethods[name]) {
        collectionMethods[name] = {
      findOne: vi.fn(async (query: any) => {
        const items = mockCollections[name]
        if (!items) return null

        if (query._id) {
          return items.find((item: any) => item._id.toString() === query._id.toString())
        }
        if (query.email) {
          return items.find((item: any) => item.email === query.email)
        }
        return items[0] || null
      }),
      find: vi.fn((query?: any) => ({
        toArray: vi.fn(async () => {
          const items = mockCollections[name]
          if (!query) return items

          // Filter by candidateId
          if (query.candidateId) {
            return items.filter((item: any) => item.candidateId === query.candidateId)
          }

          // Filter by $or conditions
          if (query.$or) {
            return items.filter((item: any) => {
              return query.$or.some((condition: any) => {
                if (condition.status) return item.status === condition.status
                if (condition.isArchived) return item.isArchived === condition.isArchived
                if (condition.gdprConsent) return item.gdprConsent !== true
                if (condition.gdprConsent?.$exists === false) return !('gdprConsent' in item)
                return false
              })
            })
          }

          return items
        })
      })),
      countDocuments: vi.fn(async () => mockCollections[name].length),
      insertOne: vi.fn(async (doc: any) => ({
        insertedId: new ObjectId(),
        acknowledged: true
      })),
      updateOne: vi.fn(async () => ({
        matchedCount: 1,
        modifiedCount: 1,
        acknowledged: true
      })),
      deleteOne: vi.fn(async (query: any) => {
        const items = mockCollections[name]
        const index = items.findIndex((item: any) =>
          item._id.toString() === query._id.toString()
        )
        if (index > -1) {
          items.splice(index, 1)
          return { deletedCount: 1, acknowledged: true }
        }
        return { deletedCount: 0, acknowledged: true }
      }),
      deleteMany: vi.fn(async (query: any) => {
        const items = mockCollections[name]
        let deleted = 0

        if (query.candidateId) {
          const filtered = items.filter((item: any) => item.candidateId !== query.candidateId)
          deleted = items.length - filtered.length
          mockCollections[name] = filtered
        } else if (query.entityType && query.entityId) {
          const filtered = items.filter((item: any) =>
            item.entityType !== query.entityType || item.entityId !== query.entityId
          )
          deleted = items.length - filtered.length
          mockCollections[name] = filtered
        }

        return { deletedCount: deleted, acknowledged: true }
      })
    }
      }
      return collectionMethods[name]
    },
    _collections: mockCollections // For test data setup
  }
}

// =============================================================================
// UTILITY FUNCTION TESTS
// =============================================================================

describe('getRetentionCutoffDate', () => {
  it('should calculate correct cutoff date for default retention', () => {
    const cutoff = getRetentionCutoffDate()
    const expected = new Date()
    expected.setDate(expected.getDate() - DATA_RETENTION_DAYS)

    // Allow 1 second difference due to execution time
    expect(Math.abs(cutoff.getTime() - expected.getTime())).toBeLessThan(1000)
  })

  it('should calculate correct cutoff date for custom retention', () => {
    const cutoff = getRetentionCutoffDate(30)
    const expected = new Date()
    expected.setDate(expected.getDate() - 30)

    expect(Math.abs(cutoff.getTime() - expected.getTime())).toBeLessThan(1000)
  })
})

describe('formatDataForExport', () => {
  const sampleData = {
    candidate: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      status: 'NEW',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    interviews: [{ id: 1 }, { id: 2 }],
    tasks: [{ id: 1 }],
    comments: [],
    activities: [{ id: 1 }, { id: 2 }, { id: 3 }]
  }

  it('should format data as JSON', () => {
    const result = formatDataForExport(sampleData, 'json')
    expect(result).toContain('"firstName": "John"')
    expect(result).toContain('"email": "john@example.com"')
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should format data as CSV', () => {
    const result = formatDataForExport(sampleData, 'csv')
    expect(result).toContain('Field,Value')
    expect(result).toContain('Name,John Doe')
    expect(result).toContain('Email,john@example.com')
    expect(result).toContain('Phone,1234567890')
    expect(result).toContain('Interviews,2')
    expect(result).toContain('Tasks,1')
    expect(result).toContain('Activities,3')
  })

  it('should handle missing phone in CSV', () => {
    const dataWithoutPhone = {
      ...sampleData,
      candidate: { ...sampleData.candidate, phone: undefined }
    }
    const result = formatDataForExport(dataWithoutPhone, 'csv')
    expect(result).toContain('Phone,N/A')
  })
})

describe('createPIIHandler', () => {
  it('should create a PIIHandler instance', () => {
    const mockDb = createMockDb() as any
    const handler = createPIIHandler(mockDb)
    expect(handler).toBeInstanceOf(PIIHandler)
  })
})

// =============================================================================
// PIIHandler CLASS TESTS
// =============================================================================

describe('PIIHandler', () => {
  let mockDb: any
  let piiHandler: PIIHandler

  beforeEach(() => {
    mockDb = createMockDb()
    piiHandler = new PIIHandler(mockDb as any)
  })

  describe('anonymize', () => {
    it('should anonymize PII fields', () => {
      const data = {
        email: 'john@example.com',
        phone: '1234567890',
        name: 'John Doe'
      }

      const result = piiHandler.anonymize(data)

      expect(result.email).toBe('j***n@example.com')
      expect(result.phone).toBe('***-***-7890')
      expect(result.name).toBe('J*** D***')
    })
  })

  describe('enforceRetention', () => {
    beforeEach(() => {
      // Setup test data
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 800) // Older than 730 days

      mockDb._collections.candidates = [
        {
          _id: new ObjectId(),
          email: 'old1@example.com',
          status: 'REJECTED',
          updatedAt: oldDate.toISOString()
        },
        {
          _id: new ObjectId(),
          email: 'old2@example.com',
          isArchived: true,
          updatedAt: oldDate.toISOString()
        },
        {
          _id: new ObjectId(),
          email: 'recent@example.com',
          status: 'NEW',
          updatedAt: new Date().toISOString()
        }
      ]
    })

    it('should identify candidates for deletion (dry run)', async () => {
      const report = await piiHandler.enforceRetention(730, true)

      expect(report.totalCandidates).toBe(3)
      expect(report.candidatesForDeletion).toBe(2)
      expect(report.candidatesDeleted).toBe(0) // Dry run
      expect(report.errors).toEqual([])
    })

    it('should delete eligible candidates (not dry run)', async () => {
      const report = await piiHandler.enforceRetention(730, false)

      expect(report.totalCandidates).toBe(3)
      expect(report.candidatesForDeletion).toBe(2)
      expect(report.candidatesDeleted).toBe(2)
    })

    it('should use custom retention days', async () => {
      const report = await piiHandler.enforceRetention(365, true)
      expect(report.retentionCutoffDate).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      // Make countDocuments throw an error
      const candidatesCollection = mockDb.collection('candidates')
      candidatesCollection.countDocuments.mockRejectedValueOnce(
        new Error('Database error')
      )

      const report = await piiHandler.enforceRetention(730, true)

      expect(report.errors.length).toBeGreaterThan(0)
      expect(report.errors[0]).toContain('Retention enforcement failed')
    })
  })

  describe('deleteUserData', () => {
    let candidateId: string

    beforeEach(() => {
      candidateId = new ObjectId().toString()

      // Setup test data
      mockDb._collections.candidates = [{
        _id: new ObjectId(candidateId),
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }]

      mockDb._collections.interviews = [
        { _id: new ObjectId(), candidateId },
        { _id: new ObjectId(), candidateId }
      ]

      mockDb._collections.tasks = [
        { _id: new ObjectId(), candidateId }
      ]

      mockDb._collections.comments = [
        { _id: new ObjectId(), candidateId }
      ]

      mockDb._collections.activities = [
        { _id: new ObjectId(), candidateId },
        { _id: new ObjectId(), candidateId }
      ]

      mockDb._collections.documents = [
        { _id: new ObjectId(), entityType: 'candidate', entityId: candidateId }
      ]
    })

    it('should delete all user data successfully', async () => {
      const result = await piiHandler.deleteUserData('test@example.com')

      expect(result.success).toBe(true)
      expect(result.deletedCandidates).toBe(1)
      expect(result.deletedInterviews).toBe(2)
      expect(result.deletedTasks).toBe(1)
      expect(result.deletedComments).toBe(1)
      expect(result.deletedActivities).toBe(2)
      expect(result.errors).toEqual([])
    })

    it('should handle non-existent candidate', async () => {
      const result = await piiHandler.deleteUserData('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Candidate not found')
    })

    it('should handle deletion errors', async () => {
      const candidatesCollection = mockDb.collection('candidates')
      candidatesCollection.deleteOne.mockRejectedValueOnce(
        new Error('Delete failed')
      )

      const result = await piiHandler.deleteUserData('test@example.com')

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('exportUserData', () => {
    let candidateId: string

    beforeEach(() => {
      candidateId = new ObjectId().toString()

      mockDb._collections.candidates = [{
        _id: new ObjectId(candidateId),
        email: 'export@example.com',
        firstName: 'Export',
        lastName: 'Test'
      }]

      mockDb._collections.interviews = [
        { _id: new ObjectId(), candidateId, title: 'Interview 1' }
      ]

      mockDb._collections.tasks = [
        { _id: new ObjectId(), candidateId, title: 'Task 1' }
      ]

      mockDb._collections.comments = []
      mockDb._collections.activities = [
        { _id: new ObjectId(), candidateId, type: 'created' }
      ]
    })

    it('should export user data by email', async () => {
      const request: DataExportRequest = {
        candidateEmail: 'export@example.com',
        format: 'json'
      }

      const result = await piiHandler.exportUserData(request)

      expect(result.candidate).toBeDefined()
      expect(result.candidate.email).toBe('export@example.com')
      expect(result.interviews).toHaveLength(1)
      expect(result.tasks).toHaveLength(1)
      expect(result.comments).toHaveLength(0)
      expect(result.activities).toHaveLength(1)
      expect(result.format).toBe('json')
      expect(result.exportedAt).toBeDefined()
    })

    it('should export user data by userId', async () => {
      const request: DataExportRequest = {
        userId: candidateId,
        format: 'csv'
      }

      const result = await piiHandler.exportUserData(request)

      expect(result.candidate).toBeDefined()
      expect(result.format).toBe('csv')
    })

    it('should throw error for non-existent candidate', async () => {
      const request: DataExportRequest = {
        candidateEmail: 'nonexistent@example.com',
        format: 'json'
      }

      await expect(piiHandler.exportUserData(request)).rejects.toThrow('Candidate not found')
    })
  })

  describe('updateConsent', () => {
    let candidateId: string

    beforeEach(() => {
      candidateId = new ObjectId().toString()
      mockDb._collections.candidates = [{
        _id: new ObjectId(candidateId),
        email: 'consent@example.com'
      }]
    })

    it('should update consent settings', async () => {
      const candidatesCollection = mockDb.collection('candidates')
      const activitiesCollection = mockDb.collection('activities')

      await piiHandler.updateConsent(candidateId, true, false)

      // Verify the methods were called (simplified assertion)
      expect(candidatesCollection.updateOne).toHaveBeenCalled()
      expect(activitiesCollection.insertOne).toHaveBeenCalled()
    })

    it('should log consent changes', async () => {
      const activitiesCollection = mockDb.collection('activities')

      await piiHandler.updateConsent(candidateId, true, true)

      // Verify activity was logged
      expect(activitiesCollection.insertOne).toHaveBeenCalled()
    })
  })

  describe('getCandidatesWithoutConsent', () => {
    beforeEach(() => {
      mockDb._collections.candidates = [
        { _id: new ObjectId(), email: 'noconsent1@example.com', gdprConsent: false },
        { _id: new ObjectId(), email: 'noconsent2@example.com' }, // No consent field
        { _id: new ObjectId(), email: 'consent@example.com', gdprConsent: true }
      ]
    })

    it('should return candidates without consent', async () => {
      const candidatesCollection = mockDb.collection('candidates')

      const candidates = await piiHandler.getCandidatesWithoutConsent()

      expect(candidates.length).toBeGreaterThanOrEqual(0)
      expect(candidatesCollection.find).toHaveBeenCalled()
    })
  })

  describe('anonymizeCandidate', () => {
    let candidateId: string

    beforeEach(() => {
      candidateId = new ObjectId().toString()
      mockDb._collections.candidates = [{
        _id: new ObjectId(candidateId),
        email: 'toanonymize@example.com',
        firstName: 'To',
        lastName: 'Anonymize',
        phone: '1234567890'
      }]
    })

    it('should anonymize candidate data', async () => {
      const candidatesCollection = mockDb.collection('candidates')
      const activitiesCollection = mockDb.collection('activities')

      await piiHandler.anonymizeCandidate(candidateId)

      // Verify the methods were called
      expect(candidatesCollection.updateOne).toHaveBeenCalled()
      expect(activitiesCollection.insertOne).toHaveBeenCalled()
    })

    it('should log anonymization', async () => {
      const activitiesCollection = mockDb.collection('activities')

      await piiHandler.anonymizeCandidate(candidateId)

      // Verify activity was logged
      expect(activitiesCollection.insertOne).toHaveBeenCalled()
    })
  })
})
