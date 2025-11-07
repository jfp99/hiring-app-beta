// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth, authWithToken } from '@/app/lib/auth-helpers'
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
import { MongoQuery, getErrorMessage } from '@/app/types/api'
import { z } from 'zod'
import { getCorsHeaders } from '@/app/lib/cors'
import { logger } from '@/app/lib/logger'
import { RateLimiters, createSafeRegex } from '@/app/lib/security'

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
  assignedTo: z.string().optional(),
  // Additional fields from LinkedIn extension
  linkedinUrl: z.string().optional(),
  workExperience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  languages: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
  summary: z.string().optional(),
  profilePictureUrl: z.string().optional()
})

// OPTIONS: Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET: List/Search candidates with filters
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request)
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for candidates GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    return rateLimitResponse
  }

  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.CANDIDATE_VIEW)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse filters
    const sortByParam = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'rating' | 'name' | null
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
      sortBy: sortByParam || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20
    }

    const { db } = await connectToDatabase()

    // Build query
    const query: MongoQuery = {}

    // Text search (using safe regex to prevent injection)
    if (filters.search) {
      const safeSearchRegex = createSafeRegex(filters.search)
      query.$or = [
        { firstName: safeSearchRegex },
        { lastName: safeSearchRegex },
        { email: safeSearchRegex },
        { currentPosition: safeSearchRegex },
        { currentCompany: safeSearchRegex }
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
      query['skills.name'] = { $in: filters.skills.map(s => createSafeRegex(s)) }
    }

    if (filters.availability && filters.availability.length > 0) {
      query.availability = { $in: filters.availability }
    }

    if (filters.location) {
      const safeLocationRegex = createSafeRegex(filters.location)
      query.$or = [
        { 'address.city': safeLocationRegex },
        { 'address.country': safeLocationRegex }
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
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder }

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

    logger.info('Candidates fetched successfully', { total, page: filters.page, limit: filters.limit })

    return NextResponse.json({
      success: true,
      candidates: formattedCandidates,
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: Math.ceil(total / (filters.limit || 20))
    })

  } catch (error: unknown) {
    logger.error('Failed to fetch candidates', { error: getErrorMessage(error) }, error as Error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates', details: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// POST: Create a new candidate
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request)
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for candidates POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    return rateLimitResponse
  }

  try {
    const session = await authWithToken(request)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.CANDIDATE_CREATE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403, headers: corsHeaders }
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
        { status: 409, headers: corsHeaders }
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
      languages: (validatedData as any).languages || [],

      workExperience: (validatedData as any).workExperience || [],
      education: (validatedData as any).education || [],
      certifications: (validatedData as any).certifications || [],

      desiredPosition: [],
      contractPreference: validatedData.contractPreference || [ContractPreference.ANY],
      availability: validatedData.availability || AvailabilityStatus.NEGOTIABLE,
      willingToRelocate: false,
      remoteWorkPreference: 'flexible',

      salaryExpectation: undefined,

      resumeId: undefined,
      coverLetterId: undefined,
      portfolioUrl: undefined,
      linkedinUrl: (validatedData as any).linkedinUrl || undefined,
      githubUrl: undefined,
      websiteUrl: undefined,
      profilePictureUrl: (validatedData as any).profilePictureUrl || undefined,
      summary: (validatedData as any).summary || undefined,

      interviews: [],
      applicationIds: [],

      notes: [],
      activities: [{
        id: new Date().getTime().toString(),
        type: 'profile_updated',
        description: 'Candidate profile created',
        userId: (session.user as any)?.id || session.user?.email || 'unknown',
        userName: session.user?.name || session.user?.email || 'unknown',
        timestamp: new Date().toISOString(),
        metadata: {}
      }],
      tags: [],

      overallRating: undefined,
      technicalRating: undefined,
      culturalFitRating: undefined,
      communicationRating: undefined,

      assignedTo: validatedData.assignedTo,
      assignedToName: undefined as string | undefined,
      createdBy: (session.user as any)?.id || session.user?.email || 'unknown',
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
      userId: (session.user as any)?.id || session.user?.email || 'unknown',
      candidateId: result.insertedId.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        candidateName: `${validatedData.firstName} ${validatedData.lastName}`,
        candidateEmail: validatedData.email
      }
    })

    logger.info('Candidate created successfully', { candidateId: result.insertedId.toString(), email: validatedData.email })

    return NextResponse.json({
      success: true,
      message: 'Candidate created successfully',
      candidateId: result.insertedId.toString()
    }, { headers: corsHeaders })

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('Candidate validation failed', { errors: (error as any).errors })
      return NextResponse.json(
        { error: 'Données de validation invalides', details: (error as any).errors },
        { status: 400, headers: corsHeaders }
      )
    }

    logger.error('Failed to create candidate', { error: getErrorMessage(error) }, error as Error)
    return NextResponse.json(
      { error: 'Failed to create candidate', details: getErrorMessage(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
