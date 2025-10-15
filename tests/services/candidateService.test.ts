// tests/services/candidateService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ObjectId } from 'mongodb'
import {
  CandidateService,
  createCandidateService,
  type CandidateSearchResult,
  type CreateCandidateResult
} from '@/app/services/candidateService'
import {
  CandidateStatus,
  ExperienceLevel,
  AvailabilityStatus,
  ContractPreference,
  type CreateCandidateDTO,
  type UpdateCandidateDTO,
  type CandidateSearchFilters
} from '@/app/types/candidates'

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
    users: []
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
              return items.find((item: any) =>
                item._id.toString() === query._id.toString()
              )
            }
            if (query.email) {
              return items.find((item: any) => item.email === query.email)
            }
            return items[0] || null
          }),
          find: vi.fn((query?: any) => ({
            sort: vi.fn(() => ({
              skip: vi.fn(() => ({
                limit: vi.fn(() => ({
                  toArray: vi.fn(async () => {
                    let items = mockCollections[name]

                    if (query?.$or) {
                      items = items.filter((item: any) => {
                        return query.$or.some((condition: any) => {
                          if (condition.firstName) {
                            const regex = new RegExp(condition.firstName.$regex, condition.firstName.$options)
                            return regex.test(item.firstName || '')
                          }
                          return false
                        })
                      })
                    }

                    if (query?.appStatus?.$in) {
                      items = items.filter((item: any) =>
                        query.appStatus.$in.includes(item.appStatus)
                      )
                    }

                    return items
                  })
                }))
              }))
            }))
          })),
          countDocuments: vi.fn(async (query?: any) => {
            let items = mockCollections[name]

            if (query && Object.keys(query).length > 0) {
              if (query.isActive !== undefined) {
                items = items.filter((item: any) => item.isActive === query.isActive)
              }
              if (query.isArchived !== undefined) {
                items = items.filter((item: any) => item.isArchived === query.isArchived)
              }
            }

            return items.length
          }),
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
              const filtered = items.filter((item: any) =>
                item.candidateId !== query.candidateId
              )
              deleted = items.length - filtered.length
              mockCollections[name] = filtered
            }

            return { deletedCount: deleted, acknowledged: true }
          }),
          aggregate: vi.fn((pipeline: any[]) => ({
            toArray: vi.fn(async () => {
              // Mock aggregation results
              const groupStage = pipeline.find(stage => stage.$group)
              if (groupStage) {
                return [
                  { _id: CandidateStatus.NEW, count: 10 },
                  { _id: CandidateStatus.SCREENING, count: 5 }
                ]
              }
              return []
            })
          }))
        }
      }
      return collectionMethods[name]
    },
    _collections: mockCollections
  }
}

// =============================================================================
// TEST DATA
// =============================================================================

const createTestCandidate = (overrides: any = {}) => ({
  _id: new ObjectId(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  currentPosition: 'Software Engineer',
  currentCompany: 'Tech Corp',
  experienceLevel: ExperienceLevel.SENIOR,
  appStatus: CandidateStatus.NEW,
  status: CandidateStatus.NEW,
  skills: [{ name: 'JavaScript', level: 'expert' }],
  primarySkills: ['JavaScript'],
  availability: AvailabilityStatus.IMMEDIATELY,
  contractPreference: [ContractPreference.CDI],
  source: 'LinkedIn',
  isActive: true,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  activities: [],
  tags: [],
  ...overrides
})

const createTestCandidateDTO = (overrides: any = {}): CreateCandidateDTO => ({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567890',
  currentPosition: 'Frontend Developer',
  experienceLevel: ExperienceLevel.INTERMEDIATE,
  status: CandidateStatus.NEW,
  skills: [{ name: 'React', level: 'advanced' }],
  availability: AvailabilityStatus.TWO_WEEKS,
  contractPreference: [ContractPreference.CDI],
  source: 'Website',
  ...overrides
})

// =============================================================================
// FACTORY FUNCTION TEST
// =============================================================================

describe('createCandidateService', () => {
  it('should create a CandidateService instance', () => {
    const mockDb = createMockDb() as any
    const service = createCandidateService(mockDb)
    expect(service).toBeInstanceOf(CandidateService)
  })
})

// =============================================================================
// CANDIDATESERVICE CLASS TESTS
// =============================================================================

describe('CandidateService', () => {
  let mockDb: any
  let candidateService: CandidateService

  beforeEach(() => {
    mockDb = createMockDb()
    candidateService = new CandidateService(mockDb as any)
  })

  // ===========================================================================
  // FIND BY ID
  // ===========================================================================

  describe('findById', () => {
    it('should return candidate by valid ID', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.findById(testCandidate._id.toString())

      expect(result).toBeDefined()
      expect(result?.id).toBe(testCandidate._id.toString())
      expect(result?.firstName).toBe('John')
      expect(result?.lastName).toBe('Doe')
    })

    it('should return null for invalid ObjectId', async () => {
      const result = await candidateService.findById('invalid-id')
      expect(result).toBeNull()
    })

    it('should return null for non-existent candidate', async () => {
      mockDb._collections.candidates = []
      const result = await candidateService.findById(new ObjectId().toString())
      expect(result).toBeNull()
    })
  })

  // ===========================================================================
  // FIND BY EMAIL
  // ===========================================================================

  describe('findByEmail', () => {
    it('should return candidate by email', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.findByEmail('john.doe@example.com')

      expect(result).toBeDefined()
      expect(result?.email).toBe('john.doe@example.com')
    })

    it('should sanitize email before searching', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.findByEmail('  JOHN.DOE@EXAMPLE.COM  ')

      expect(result).toBeDefined()
      expect(mockDb.collection('candidates').findOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john.doe@example.com' })
      )
    })

    it('should return null for non-existent email', async () => {
      mockDb._collections.candidates = []
      const result = await candidateService.findByEmail('nonexistent@example.com')
      expect(result).toBeNull()
    })
  })

  // ===========================================================================
  // SEARCH
  // ===========================================================================

  describe('search', () => {
    beforeEach(() => {
      mockDb._collections.candidates = [
        createTestCandidate({ firstName: 'John', appStatus: CandidateStatus.NEW }),
        createTestCandidate({ firstName: 'Jane', appStatus: CandidateStatus.SCREENING }),
        createTestCandidate({ firstName: 'Bob', appStatus: CandidateStatus.NEW })
      ]
    })

    it('should return paginated search results', async () => {
      const filters: CandidateSearchFilters = {
        page: 1,
        limit: 20
      }

      const result = await candidateService.search(filters)

      expect(result).toBeDefined()
      expect(result.candidates).toBeInstanceOf(Array)
      expect(result.total).toBeGreaterThanOrEqual(0)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBeGreaterThanOrEqual(0)
    })

    it('should filter by status', async () => {
      const filters: CandidateSearchFilters = {
        status: [CandidateStatus.NEW],
        page: 1,
        limit: 20
      }

      const result = await candidateService.search(filters)

      expect(result.candidates).toBeInstanceOf(Array)
    })

    it('should handle text search', async () => {
      const filters: CandidateSearchFilters = {
        search: 'John',
        page: 1,
        limit: 20
      }

      const result = await candidateService.search(filters)

      expect(result.candidates).toBeInstanceOf(Array)
    })

    it('should use default pagination values', async () => {
      const result = await candidateService.search({})

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })
  })

  // ===========================================================================
  // CREATE
  // ===========================================================================

  describe('create', () => {
    it('should create a new candidate', async () => {
      mockDb._collections.candidates = []
      const dto = createTestCandidateDTO()

      const result = await candidateService.create(dto, 'user123', 'Admin User')

      expect(result).toBeDefined()
      expect(result.candidateId).toBeDefined()
      expect(mockDb.collection('candidates').insertOne).toHaveBeenCalled()
      expect(mockDb.collection('activities').insertOne).toHaveBeenCalled()
    })

    it('should throw error if email already exists', async () => {
      const existing = createTestCandidate({ email: 'duplicate@example.com' })
      mockDb._collections.candidates = [existing]

      const dto = createTestCandidateDTO({ email: 'duplicate@example.com' })

      await expect(
        candidateService.create(dto, 'user123', 'Admin User')
      ).rejects.toThrow('Candidate with this email already exists')
    })

    it('should sanitize email before creating', async () => {
      mockDb._collections.candidates = []
      const dto = createTestCandidateDTO({ email: '  TEST@EXAMPLE.COM  ' })

      await candidateService.create(dto, 'user123', 'Admin User')

      expect(mockDb.collection('candidates').insertOne).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      )
    })

    it('should set default values correctly', async () => {
      mockDb._collections.candidates = []
      const dto = createTestCandidateDTO()

      await candidateService.create(dto, 'user123', 'Admin User')

      expect(mockDb.collection('candidates').insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          isArchived: false,
          gdprConsent: true,
          marketingConsent: false
        })
      )
    })
  })

  // ===========================================================================
  // UPDATE
  // ===========================================================================

  describe('update', () => {
    it('should update existing candidate', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const updateData: UpdateCandidateDTO = {
        firstName: 'Updated',
        lastName: 'Name'
      }

      const result = await candidateService.update(
        testCandidate._id.toString(),
        updateData,
        'user123',
        'Admin User'
      )

      expect(mockDb.collection('candidates').updateOne).toHaveBeenCalled()
    })

    it('should throw error for invalid ObjectId', async () => {
      const updateData: UpdateCandidateDTO = { firstName: 'Updated' }

      await expect(
        candidateService.update('invalid-id', updateData, 'user123', 'Admin User')
      ).rejects.toThrow('Invalid candidate ID')
    })

    it('should throw error if candidate not found', async () => {
      mockDb._collections.candidates = []
      const updateData: UpdateCandidateDTO = { firstName: 'Updated' }

      await expect(
        candidateService.update(new ObjectId().toString(), updateData, 'user123', 'Admin User')
      ).rejects.toThrow('Candidate not found')
    })

    it('should log activity when status changes', async () => {
      const testCandidate = createTestCandidate({ appStatus: CandidateStatus.NEW })
      mockDb._collections.candidates = [testCandidate]

      const updateData: UpdateCandidateDTO = {
        status: CandidateStatus.SCREENING
      }

      await candidateService.update(
        testCandidate._id.toString(),
        updateData,
        'user123',
        'Admin User'
      )

      expect(mockDb.collection('candidates').updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $push: expect.objectContaining({
            activities: expect.objectContaining({
              type: 'status_changed'
            })
          })
        })
      )
    })
  })

  // ===========================================================================
  // DELETE (SOFT DELETE)
  // ===========================================================================

  describe('delete', () => {
    it('should soft delete candidate', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.delete(
        testCandidate._id.toString(),
        'user123',
        'Admin User'
      )

      expect(result).toBe(true)
      expect(mockDb.collection('candidates').updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            isActive: false,
            isArchived: true
          })
        })
      )
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        candidateService.delete('invalid-id', 'user123', 'Admin User')
      ).rejects.toThrow('Invalid candidate ID')
    })

    it('should return false if candidate not found', async () => {
      mockDb._collections.candidates = []

      const result = await candidateService.delete(
        new ObjectId().toString(),
        'user123',
        'Admin User'
      )

      expect(result).toBe(false)
    })
  })

  // ===========================================================================
  // HARD DELETE
  // ===========================================================================

  describe('hardDelete', () => {
    it('should permanently delete candidate and related data', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.hardDelete(testCandidate._id.toString())

      expect(mockDb.collection('candidates').deleteOne).toHaveBeenCalled()
      expect(mockDb.collection('interviews').deleteMany).toHaveBeenCalled()
      expect(mockDb.collection('tasks').deleteMany).toHaveBeenCalled()
      expect(mockDb.collection('comments').deleteMany).toHaveBeenCalled()
      expect(mockDb.collection('activities').deleteMany).toHaveBeenCalled()
    })

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        candidateService.hardDelete('invalid-id')
      ).rejects.toThrow('Invalid candidate ID')
    })

    it('should return true if deletion successful', async () => {
      const testCandidate = createTestCandidate()
      mockDb._collections.candidates = [testCandidate]

      const result = await candidateService.hardDelete(testCandidate._id.toString())

      expect(result).toBe(true)
    })
  })

  // ===========================================================================
  // GET STATS
  // ===========================================================================

  describe('getStats', () => {
    beforeEach(() => {
      mockDb._collections.candidates = [
        createTestCandidate({ isActive: true, isArchived: false }),
        createTestCandidate({ isActive: true, isArchived: false }),
        createTestCandidate({ isActive: false, isArchived: true })
      ]
    })

    it('should return candidate statistics', async () => {
      const stats = await candidateService.getStats()

      expect(stats).toBeDefined()
      expect(stats.total).toBeGreaterThanOrEqual(0)
      expect(stats.active).toBeGreaterThanOrEqual(0)
      expect(stats.archived).toBeGreaterThanOrEqual(0)
      expect(stats.byStatus).toBeDefined()
      expect(stats.byExperienceLevel).toBeDefined()
    })

    it('should count total candidates correctly', async () => {
      const stats = await candidateService.getStats()

      expect(stats.total).toBe(3)
    })

    it('should count active candidates correctly', async () => {
      const stats = await candidateService.getStats()

      expect(stats.active).toBe(2)
    })

    it('should count archived candidates correctly', async () => {
      const stats = await candidateService.getStats()

      expect(stats.archived).toBe(1)
    })

    it('should group by status', async () => {
      const stats = await candidateService.getStats()

      expect(stats.byStatus).toBeInstanceOf(Object)
    })

    it('should group by experience level', async () => {
      const stats = await candidateService.getStats()

      expect(stats.byExperienceLevel).toBeInstanceOf(Object)
    })
  })
})
