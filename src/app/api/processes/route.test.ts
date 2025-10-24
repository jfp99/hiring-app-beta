// src/app/api/processes/route.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import * as authHelpers from '@/app/lib/auth-helpers'
import * as mongodb from '@/app/lib/mongodb'

// Mock modules
vi.mock('@/app/lib/auth-helpers')
vi.mock('@/app/lib/mongodb')

describe('/api/processes', () => {
  const mockDb = {
    collection: vi.fn()
  }

  const mockCollection = {
    find: vi.fn(),
    findOne: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
    countDocuments: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.collection.mockReturnValue(mockCollection)
    ;(mongodb.connectToDatabase as Mock).mockResolvedValue({ db: mockDb })
  })

  describe('GET /api/processes', () => {
    it('should return 401 when not authenticated', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/processes')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: 'Non autorisé' })
    })

    it('should return processes for authenticated users', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          role: 'admin'
        }
      })

      const request = new NextRequest('http://localhost:3000/api/processes')
      const response = await GET(request)

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data).toEqual({ error: 'Admin access required' })
    })

    it('should return processes for authenticated users', async () => {
      const mockProcesses = [
        {
          _id: 'process-1',
          id: 'PROC-001',
          title: 'Senior Developer',
          client: 'Tech Corp',
          status: 'active',
          stages: []
        },
        {
          _id: 'process-2',
          id: 'PROC-002',
          title: 'Product Manager',
          client: 'Startup Inc',
          status: 'completed',
          stages: []
        }
      ]

      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockCollection.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockProcesses)
      })

      const request = new NextRequest('http://localhost:3000/api/processes')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(mockProcesses)
      expect(mockCollection.find).toHaveBeenCalledWith({ isArchived: false })
    })

    it('should filter processes by status', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'super_admin'
        }
      })

      mockCollection.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([])
      })

      const request = new NextRequest('http://localhost:3000/api/processes?status=active')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockCollection.find).toHaveBeenCalledWith({ status: 'active', isArchived: false })
    })

    it('should handle database errors', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      mockCollection.find.mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/processes')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toEqual({ error: 'Failed to fetch processes' })
    })
  })

  describe('POST /api/processes', () => {
    it('should create a new process when valid data is provided', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      const newProcess = {
        title: 'New Position',
        client: 'New Client',
        status: 'active',
        stages: [
          { name: 'Screening', type: 'screening', candidates: [] }
        ]
      }

      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new-process-id',
        acknowledged: true
      })

      const request = new NextRequest('http://localhost:3000/api/processes', {
        method: 'POST',
        body: JSON.stringify(newProcess)
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          title: newProcess.title,
          client: newProcess.client,
          status: newProcess.status,
          stages: newProcess.stages,
          id: expect.stringMatching(/^PROC-\d{6}$/),
          createdBy: 'admin-1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
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

      const invalidProcess = {
        title: 'Missing Client'
        // missing client field
      }

      const request = new NextRequest('http://localhost:3000/api/processes', {
        method: 'POST',
        body: JSON.stringify(invalidProcess)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('required')
    })

    it('should generate unique process ID', async () => {
      ;(authHelpers.auth as Mock).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })

      const process1 = {
        title: 'Position 1',
        client: 'Client 1',
        status: 'active'
      }

      const process2 = {
        title: 'Position 2',
        client: 'Client 2',
        status: 'active'
      }

      let capturedProcess1: any
      let capturedProcess2: any

      mockCollection.insertOne
        .mockImplementationOnce((doc) => {
          capturedProcess1 = doc
          return Promise.resolve({ insertedId: 'id-1', acknowledged: true })
        })
        .mockImplementationOnce((doc) => {
          capturedProcess2 = doc
          return Promise.resolve({ insertedId: 'id-2', acknowledged: true })
        })

      const request1 = new NextRequest('http://localhost:3000/api/processes', {
        method: 'POST',
        body: JSON.stringify(process1)
      })

      const request2 = new NextRequest('http://localhost:3000/api/processes', {
        method: 'POST',
        body: JSON.stringify(process2)
      })

      await POST(request1)
      await POST(request2)

      expect(capturedProcess1.id).toMatch(/^PROC-\d{6}$/)
      expect(capturedProcess2.id).toMatch(/^PROC-\d{6}$/)
      expect(capturedProcess1.id).not.toBe(capturedProcess2.id)
    })
  })
})