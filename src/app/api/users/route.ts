// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { hashPassword, generateInviteToken } from '@/app/lib/auth-enhanced'
import { auth } from '@/app/lib/auth-helpers'
import { UserRole, PERMISSIONS, hasPermission } from '@/app/types/auth'
import { z } from 'zod'
import { logger } from '@/app/lib/logger'
import { RateLimiters, createSafeRegex, isValidObjectId } from '@/app/lib/security'

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(UserRole),
  companyId: z.string().optional(),
  sendInvite: z.boolean().optional()
})

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  companyId: z.string().optional()
})

// GET: List all users (with filters)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for users GET', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      logger.warn('Unauthorized access attempt to users GET');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.USER_VIEW)) {
      logger.warn('Forbidden access attempt to users GET', {
        userId: (session.user as any)?.id || session.user?.email
      });
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const { db } = await connectToDatabase()

    // Build query
    const query: any = {}

    if (role) {
      query.role = role
    }

    if (companyId) {
      query.companyId = companyId
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }

    if (search) {
      const safeSearchRegex = createSafeRegex(search);
      query.$or = [
        { email: safeSearchRegex },
        { firstName: safeSearchRegex },
        { lastName: safeSearchRegex }
      ]
    }

    // Apply company filter for non-admin users
    if ((session.user as any).role === UserRole.CLIENT || (session.user as any).role === UserRole.HIRING_MANAGER) {
      query.companyId = (session.user as any).companyId
    }

    const users = await db
      .collection('users')
      .find(query)
      .project({
        password: 0,
        resetPasswordToken: 0,
        twoFactorSecret: 0
      })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      companyId: user.companyId,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }))

    logger.info('Users fetched successfully', { count: formattedUsers.length, userId: (session.user as any)?.id });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error: unknown) {
    logger.error('Failed to fetch users', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new user or send invite
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for users POST', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      logger.warn('Unauthorized access attempt to users POST');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.USER_CREATE)) {
      logger.warn('Forbidden access attempt to users POST', {
        userId: (session.user as any)?.id || session.user?.email
      });
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: validatedData.email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Prepare user data
    const userData: any = {
      email: validatedData.email.toLowerCase(),
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      isActive: true,
      emailVerified: false,
      companyId: validatedData.companyId,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      invitedBy: (session.user as any)?.id || session.user?.email || 'unknown'
    }

    // If sending invite, generate token
    if (validatedData.sendInvite) {
      const { token, expiresAt } = generateInviteToken()
      userData.inviteToken = token
      userData.inviteExpires = expiresAt.toISOString()
      userData.password = '' // No password yet

      // TODO: Send invite email with token
      logger.debug('Invite token generated', { email: validatedData.email })
    } else {
      // Create user with password
      if (!validatedData.password) {
        return NextResponse.json(
          { error: 'Password is required when not sending invite' },
          { status: 400 }
        )
      }
      userData.password = await hashPassword(validatedData.password)
      userData.emailVerified = true // Consider them verified if admin creates with password
    }

    // Insert user
    const result = await db.collection('users').insertOne(userData)

    logger.info('User created successfully', {
      email: validatedData.email,
      userId: result.insertedId.toString(),
      sendInvite: validatedData.sendInvite
    });

    return NextResponse.json({
      success: true,
      message: validatedData.sendInvite
        ? 'Invite sent successfully'
        : 'User created successfully',
      userId: result.insertedId.toString()
    })

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('User creation validation failed', { errors: error.issues });
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Failed to create user', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update user
export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for users PUT', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      logger.warn('Unauthorized access attempt to users PUT');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      logger.warn('User update failed: missing ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      logger.warn('User update failed: invalid ObjectId', { userId });
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Check permission
    const isOwnProfile = userId === (session.user as any)?.id || session.user?.email || 'unknown'
    if (!isOwnProfile && !hasPermission(session.user as any, PERMISSIONS.USER_EDIT)) {
      logger.warn('Forbidden access attempt to users PUT', {
        userId: (session.user as any)?.id || session.user?.email,
        targetUserId: userId
      });
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Restrict what users can update on their own profile
    if (isOwnProfile && !hasPermission(session.user as any, PERMISSIONS.USER_EDIT)) {
      // Users can only update their own name
      const allowedFields = ['firstName', 'lastName']
      Object.keys(validatedData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete validatedData[key as keyof typeof validatedData]
        }
      })
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString()
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      logger.warn('User not found for update', { userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    logger.info('User updated successfully', { userId });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('User update validation failed', { errors: error.issues });
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Failed to update user', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Deactivate user (soft delete)
export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RateLimiters.api(request);
  if (rateLimitResponse) {
    logger.warn('Rate limit exceeded for users DELETE', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    return rateLimitResponse;
  }

  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      logger.warn('Unauthorized access attempt to users DELETE');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user as any, PERMISSIONS.USER_DELETE)) {
      logger.warn('Forbidden access attempt to users DELETE', {
        userId: (session.user as any)?.id || session.user?.email
      });
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      logger.warn('User deletion failed: missing ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      logger.warn('User deletion failed: invalid ObjectId', { userId });
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (userId === (session.user as any)?.id || session.user?.email || 'unknown') {
      logger.warn('Attempted self-deletion', { userId });
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    // Soft delete - just deactivate the user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date().toISOString(),
          deactivatedAt: new Date().toISOString(),
          deactivatedBy: (session.user as any)?.id || session.user?.email || 'unknown'
        }
      }
    )

    if (result.matchedCount === 0) {
      logger.warn('User not found for deletion', { userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    logger.info('User deactivated successfully', { userId });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error: unknown) {
    logger.error('Failed to delete user', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}