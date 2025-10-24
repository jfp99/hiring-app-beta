// src/app/api/dev/init-admins/route.ts
// Development-only endpoint to initialize authorized admin users
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/app/types/auth'

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
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
