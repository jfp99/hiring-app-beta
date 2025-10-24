// src/app/api/processes/[id]/candidates/route.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import * as authHelpers from '@/app/lib/auth-helpers'
import * as mongodb from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'

// Mock modules
vi.mock('@/app/lib/auth-helpers')
vi.mock('@/app/lib/mongodb')

describe('/api/processes/[id]/candidates', () => {
  const mockDb = {
    collection: vi.fn()
  }

  const mockProcessesCollection = {
    findOne: vi.fn(),
    updateOne: vi.fn()
  }

  const mockCandidatesCollection = {
    find: vi.fn(),
    updateMany: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.collection.mockImplementation((name: string) => {
      if (name === 'processes') return mockProcessesCollection
      if (name === 'candidates') return mockCandidatesCollection
      return {}
    })
    ;(mongodb.connectToDatabase as Mock).mockResolvedValue({ db: mockDb })
  })

  describe('GET /api/processes/[id]/candidates', () => {
    it('should return 401 when not authenticated', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates')
      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await GET(request, { params })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return candidates for a process', async () => {
      const mockProcess = {
        _id: new ObjectId(),
        id: 'PROC-001',
        title: 'Senior Developer',
        stages: [
          {
            name: 'Screening',
            type: 'screening',
            candidates: ['cand-1', 'cand-2']
          },
          {
            name: 'Interview',
            type: 'interview',
            candidates: ['cand-3']
          }
        ]
      }

      const mockCandidates = [
        { _id: 'cand-1', name: 'John Doe', email: 'john@example.com' },
        { _id: 'cand-2', name: 'Jane Smith', email: 'jane@example.com' },
        { _id: 'cand-3', name: 'Bob Wilson', email: 'bob@example.com' }
      ]

      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue(mockProcess)
      mockCandidatesCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockCandidates)
      })

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates')
      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await GET(request, { params })

      expect(response.status).toBe(200)
      const data = await response.json()

      // Should return flat array of candidates
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual(mockCandidates)

      expect(mockCandidatesCollection.find).toHaveBeenCalledWith({
        _id: { $in: ['cand-1', 'cand-2', 'cand-3'] }
      })
    })

    it('should handle process lookup by MongoDB _id', async () => {
      const processId = new ObjectId()

      ;(authHelpers.verifyAuth as Mock).mockResolvedValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'super_admin'
      })

      mockProcessesCollection.findOne
        .mockResolvedValueOnce(null) // First try with custom id
        .mockResolvedValueOnce({ // Second try with MongoDB _id
          _id: processId,
          id: 'PROC-001',
          stages: []
        })

      const request = new NextRequest(`http://localhost:3000/api/processes/${processId.toString()}/candidates`)
      const params = Promise.resolve({ id: processId.toString() })
      const response = await GET(request, { params })

      expect(response.status).toBe(200)
      expect(mockProcessesCollection.findOne).toHaveBeenCalledTimes(2)
      expect(mockProcessesCollection.findOne).toHaveBeenNthCalledWith(1, { id: processId.toString() })
      expect(mockProcessesCollection.findOne).toHaveBeenNthCalledWith(2, { _id: processId })
    })

    it('should return 404 when process not found', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/processes/non-existent/candidates')
      const params = Promise.resolve({ id: 'non-existent' })
      const response = await GET(request, { params })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Process not found' })
    })

    it('should return empty array when process has no candidates', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue({
        _id: new ObjectId(),
        id: 'PROC-001',
        stages: [
          { name: 'Screening', type: 'screening', candidates: [] }
        ]
      })

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates')
      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await GET(request, { params })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual([])
    })
  })

  describe('POST /api/processes/[id]/candidates', () => {
    it('should add candidates to a process', async () => {
      const processId = new ObjectId()
      const mockProcess = {
        _id: processId,
        id: 'PROC-001',
        title: 'Senior Developer',
        stages: [
          {
            name: 'Screening',
            type: 'screening',
            candidates: []
          }
        ]
      }

      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue(mockProcess)
      mockProcessesCollection.updateOne.mockResolvedValue({ modifiedCount: 1 })
      mockCandidatesCollection.updateMany.mockResolvedValue({ modifiedCount: 2 })

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates', {
        method: 'POST',
        body: JSON.stringify({
          candidateIds: ['cand-1', 'cand-2'],
          stage: 'Screening'
        })
      })

      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await POST(request, { params })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ success: true })

      // Should update process with new candidates
      expect(mockProcessesCollection.updateOne).toHaveBeenCalledWith(
        { _id: processId },
        {
          $push: {
            'stages.0.candidates': {
              $each: ['cand-1', 'cand-2']
            }
          }
        }
      )

      // Should update candidates with process ID
      expect(mockCandidatesCollection.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ['cand-1', 'cand-2'] } },
        { $set: { currentProcessId: 'PROC-001' } }
      )
    })

    it('should return 400 when required fields are missing', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates', {
        method: 'POST',
        body: JSON.stringify({
          candidateIds: ['cand-1']
          // missing stage
        })
      })

      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await POST(request, { params })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toEqual({ error: 'Missing required fields' })
    })

    it('should return 404 when process not found', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/processes/non-existent/candidates', {
        method: 'POST',
        body: JSON.stringify({
          candidateIds: ['cand-1'],
          stage: 'Screening'
        })
      })

      const params = Promise.resolve({ id: 'non-existent' })
      const response = await POST(request, { params })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data).toEqual({ error: 'Process not found' })
    })

    it('should return 400 when stage not found', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockResolvedValue({
        _id: new ObjectId(),
        id: 'PROC-001',
        stages: [
          { name: 'Screening', type: 'screening', candidates: [] }
        ]
      })

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates', {
        method: 'POST',
        body: JSON.stringify({
          candidateIds: ['cand-1'],
          stage: 'NonExistentStage'
        })
      })

      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await POST(request, { params })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toEqual({ error: 'Stage not found in process' })
    })

    it('should handle database errors gracefully', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockProcessesCollection.findOne.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/processes/PROC-001/candidates', {
        method: 'POST',
        body: JSON.stringify({
          candidateIds: ['cand-1'],
          stage: 'Screening'
        })
      })

      const params = Promise.resolve({ id: 'PROC-001' })
      const response = await POST(request, { params })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toEqual({ error: 'Failed to add candidates to process' })
    })
  })
})