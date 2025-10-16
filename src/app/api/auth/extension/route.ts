// API endpoint for browser extension authentication
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// POST: Authenticate extension user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Connect to database
    const { db } = await connectToDatabase()

    // Find user by email
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user has permission to create candidates (case-insensitive)
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'super_admin', 'admin', 'recruiter']
    const userRole = user.role ? user.role.toUpperCase() : ''
    const normalizedAllowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RECRUITER']

    if (!normalizedAllowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to use this extension' },
        { status: 403 }
      )
    }

    // Generate JWT token for extension
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'default-secret-key',
      { expiresIn: '30d' }
    )

    // Log authentication
    await db.collection('activities').insertOne({
      type: 'extension_login',
      userId: user._id.toString(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        origin: 'browser-extension'
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      },
      expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
    })

  } catch (error) {
    console.error('Extension authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// GET: Verify extension token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'default-secret-key'
    ) as any

    // Connect to database to check if user still exists and is active
    const { db } = await connectToDatabase()
    const { ObjectId } = await import('mongodb')

    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.id)
    })

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Return user info
    return NextResponse.json({
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }

    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}