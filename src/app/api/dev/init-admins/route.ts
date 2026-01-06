// src/app/api/dev/init-admins/route.ts
// Secure endpoint to initialize authorized admin users
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/app/types/auth'

export async function POST(request: NextRequest) {
  // In production, require a secret key
  if (process.env.NODE_ENV !== 'development') {
    const { secret } = await request.json().catch(() => ({ secret: null }))
    const initSecret = process.env.INIT_ADMIN_SECRET || process.env.NEXTAUTH_SECRET

    if (!secret || secret !== initSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const { db } = await connectToDatabase()

    // Get passwords from environment variables or use secure defaults
    const hugoPassword = process.env.HUGO_ADMIN_PASSWORD || 'HugoAdmin2025!@#'
    const iziaPassword = process.env.IZIA_ADMIN_PASSWORD || 'IziaAdmin2025!@#'

    // Hash the passwords
    const hugoHashedPassword = await bcrypt.hash(hugoPassword, 12)
    const iziaHashedPassword = await bcrypt.hash(iziaPassword, 12)

    // Admin users configuration
    const adminUsers = [
      {
        email: 'hugo@hi-ring.fr',
        password: hugoHashedPassword,
        firstName: 'Hugo',
        lastName: 'Administrator',
        role: UserRole.SUPER_ADMIN,
        plainPassword: hugoPassword
      },
      {
        email: 'izia@hi-ring.fr',
        password: iziaHashedPassword,
        firstName: 'Izia',
        lastName: 'Administrator',
        role: UserRole.SUPER_ADMIN,
        plainPassword: iziaPassword
      }
    ]

    const results = []

    // Create or update each admin user
    for (const admin of adminUsers) {
      const result = await db.collection('users').updateOne(
        { email: admin.email },
        {
          $set: {
            email: admin.email,
            password: admin.password,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            isActive: true,
            emailVerified: true,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      )

      results.push({
        email: admin.email,
        password: admin.plainPassword,
        created: result.upsertedCount > 0,
        updated: result.modifiedCount > 0
      })

      console.log(`✅ [INIT] Admin user ${result.upsertedCount > 0 ? 'created' : 'updated'}: ${admin.email}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Admin users initialized successfully',
      admins: results
    })
  } catch (error) {
    console.error('❌ [INIT] Error initializing admin users:', error)
    return NextResponse.json(
      { error: 'Failed to initialize admin users' },
      { status: 500 }
    )
  }
}
