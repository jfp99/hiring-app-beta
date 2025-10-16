// src/app/api/dev/reset-admin/route.ts
// Development-only endpoint to reset admin password
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

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12)

    // Update or insert admin user
    const result = await db.collection('users').updateOne(
      { email: 'admin@hi-ring.com' },
      {
        $set: {
          email: 'admin@hi-ring.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: UserRole.SUPER_ADMIN,
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

    return NextResponse.json({
      success: true,
      message: 'Admin user reset successfully',
      email: 'admin@hi-ring.com',
      password: 'Admin123!@#',
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    })
  } catch (error) {
    console.error('Error resetting admin:', error)
    return NextResponse.json(
      { error: 'Failed to reset admin user' },
      { status: 500 }
    )
  }
}
