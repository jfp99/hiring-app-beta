// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { hashPassword, generateInviteToken } from '@/app/lib/auth-enhanced'
import { auth } from '@/app/lib/auth-helpers'
import { UserRole, PERMISSIONS, hasPermission } from '@/app/types/auth'
import { z } from 'zod'

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
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.USER_VIEW)) {
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
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }

    // Apply company filter for non-admin users
    if (session.user.role === UserRole.CLIENT || session.user.role === UserRole.HIRING_MANAGER) {
      query.companyId = session.user.companyId
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

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error) {
    console.error('❌ [USERS] Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new user or send invite
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.USER_CREATE)) {
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
      invitedBy: session.user.id
    }

    // If sending invite, generate token
    if (validatedData.sendInvite) {
      const { token, expiresAt } = generateInviteToken()
      userData.inviteToken = token
      userData.inviteExpires = expiresAt.toISOString()
      userData.password = '' // No password yet

      // TODO: Send invite email with token
      console.log('📧 [USERS] Invite token generated:', token)
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

    console.log('✅ [USERS] User created:', validatedData.email)

    return NextResponse.json({
      success: true,
      message: validatedData.sendInvite
        ? 'Invite sent successfully'
        : 'User created successfully',
      userId: result.insertedId.toString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ [USERS] Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update user
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const isOwnProfile = userId === session.user.id
    if (!isOwnProfile && !hasPermission(session.user, PERMISSIONS.USER_EDIT)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Restrict what users can update on their own profile
    if (isOwnProfile && !hasPermission(session.user, PERMISSIONS.USER_EDIT)) {
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ [USERS] User updated:', userId)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ [USERS] Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Deactivate user (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check permission
    if (!hasPermission(session.user, PERMISSIONS.USER_DELETE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
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
          deactivatedBy: session.user.id
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ [USERS] User deactivated:', userId)

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('❌ [USERS] Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}