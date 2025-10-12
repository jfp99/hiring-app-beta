// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import { connectToDatabase } from '@/app/lib/mongodb'
import { PERMISSIONS, hasPermission } from '@/app/types/auth'
import {
  CreateCandidateDTO,
  CandidateSearchFilters,
  CandidateStatus,
  ExperienceLevel,
  AvailabilityStatus,
  ContractPreference
} from '@/app/types/candidates'
import { toMongoStatus } from '@/app/lib/status-mapper'
import { z } from 'zod'

// Validation schema
const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  currentPosition: z.string().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string(),
    yearsOfExperience: z.number().optional(),
    lastUsed: z.string().optional(),
    certified: z.boolean().optional()
  })).optional(),
  source: z.string(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  contractPreference: z.array(z.nativeEnum(ContractPreference)).optional(),
  status: z.nativeEnum(CandidateStatus).optional(),
  assignedTo: z.string().optional()
})

// GET: List/Search candidates with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_VIEW)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters: CandidateSearchFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status')?.split(',') as CandidateStatus[] || undefined,
      experienceLevel: searchParams.get('experienceLevel')?.split(',') as ExperienceLevel[] || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      availability: searchParams.get('availability')?.split(',') as AvailabilityStatus[] || undefined,
      location: searchParams.get('location') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      source: searchParams.get('source')?.split(',') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      isActive: searchParams.get('isActive') === 'true',
      isArchived: searchParams.get('isArchived') === 'true',
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20
    }

    const { db } = await connectToDatabase()

    // Build query
    const query: any = {}

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

    // Filters
    if (filters.status && filters.status.length > 0) {
      // Check both appStatus (new field) and status (legacy MongoDB field)
      query.$or = [
        { appStatus: { $in: filters.status } },
        { status: { $in: filters.status }, appStatus: { $exists: false } }
      ]
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      query.experienceLevel = { $in: filters.experienceLevel }
    }

    if (filters.skills && filters.skills.length > 0) {
      query['skills.name'] = { $in: filters.skills.map(s => new RegExp(s, 'i')) }
    }

    if (filters.availability && filters.availability.length > 0) {
      query.availability = { $in: filters.availability }
    }

    if (filters.location) {
      query.$or = [
        { 'address.city': { $regex: filters.location, $options: 'i' } },
        { 'address.country': { $regex: filters.location, $options: 'i' } }
      ]
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo
    }

    if (filters.source && filters.source.length > 0) {
      query.source = { $in: filters.source }
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags }
    }

    if (filters.minRating) {
      query.overallRating = { $gte: filters.minRating }
    }

    query.isActive = filters.isActive !== false
    query.isArchived = filters.isArchived === true

    // Pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20)
    const limit = filters.limit || 20

    // Sorting
    const sortField = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
    const sort: any = { [sortField]: sortOrder }

    // Execute query
    const [candidates, total] = await Promise.all([
      db.collection('candidates')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('candidates').countDocuments(query)
    ])

    const formattedCandidates = candidates.map(candidate => ({
      id: candidate._id.toString(),
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      currentPosition: candidate.currentPosition,
      currentCompany: candidate.currentCompany,
      experienceLevel: candidate.experienceLevel,
      status: candidate.appStatus || candidate.status, // Use appStatus if available
      skills: candidate.skills || [],
      primarySkills: candidate.primarySkills || [],
      availability: candidate.availability,
      contractPreference: candidate.contractPreference || [],
      source: candidate.source,
      overallRating: candidate.overallRating,
      assignedTo: candidate.assignedTo,
      assignedToName: candidate.assignedToName,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      lastContactedAt: candidate.lastContactedAt,
      tags: candidate.tags || [],
      profilePictureUrl: candidate.profilePictureUrl,
      quickScores: candidate.quickScores || []
    }))

    console.log(`✅ [CANDIDATES] Found ${total} candidates`)

    return NextResponse.json({
      success: true,
      candidates: formattedCandidates,
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: Math.ceil(total / (filters.limit || 20))
    })

  } catch (error) {
    console.error('❌ [CANDIDATES] Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

// POST: Create a new candidate
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.CANDIDATE_CREATE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCandidateSchema.parse(body) as CreateCandidateDTO

    const { db } = await connectToDatabase()

    // Check if candidate with same email already exists
    const existingCandidate = await db.collection('candidates').findOne({
      email: validatedData.email.toLowerCase()
    })

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate with this email already exists' },
        { status: 409 }
      )
    }

    // Prepare candidate data
    const appStatus = validatedData.status || CandidateStatus.NEW
    const candidateData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email.toLowerCase(),
      phone: validatedData.phone,
      currentPosition: validatedData.currentPosition,
      currentCompany: undefined,
      experienceLevel: validatedData.experienceLevel,
      totalExperience: undefined,

      appStatus: appStatus, // Real application status
      status: toMongoStatus(appStatus), // MongoDB-compatible status
      source: validatedData.source,
      referredBy: undefined,

      skills: validatedData.skills || [],
      primarySkills: validatedData.skills?.slice(0, 5).map(s => s.name) || [],
      languages: [],

      workExperience: [],
      education: [],
      certifications: [],

      desiredPosition: [],
      contractPreference: validatedData.contractPreference || [ContractPreference.ANY],
      availability: validatedData.availability || AvailabilityStatus.NEGOTIABLE,
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
      activities: [{
        id: new Date().getTime().toString(),
        type: 'profile_updated',
        description: 'Candidate profile created',
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        metadata: {}
      }],
      tags: [],

      overallRating: undefined,
      technicalRating: undefined,
      culturalFitRating: undefined,
      communicationRating: undefined,

      assignedTo: validatedData.assignedTo,
      assignedToName: undefined,
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactedAt: undefined,

      gdprConsent: true,
      marketingConsent: false,
      isActive: true,
      isArchived: false,

      customFields: {}
    }

    // If assigned to someone, get their name
    if (candidateData.assignedTo) {
      const { ObjectId } = await import('mongodb')
      const assignedUser = await db.collection('users').findOne({
        _id: new ObjectId(candidateData.assignedTo)
      })
      if (assignedUser) {
        candidateData.assignedToName = `${assignedUser.firstName} ${assignedUser.lastName}`
      }
    }

    const result = await db.collection('candidates').insertOne(candidateData)

    // Log activity
    await db.collection('activities').insertOne({
      type: 'candidate_created',
      userId: session.user.id,
      candidateId: result.insertedId.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${validatedData.firstName} ${validatedData.lastName}`,
        candidateEmail: validatedData.email
      }
    })

    console.log('✅ [CANDIDATES] Candidate created:', result.insertedId)

    return NextResponse.json({
      success: true,
      message: 'Candidate created successfully',
      candidateId: result.insertedId.toString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ [CANDIDATES] Error creating candidate:', error)
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    )
  }
}
