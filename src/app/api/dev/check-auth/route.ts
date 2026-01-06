// src/app/api/dev/check-auth/route.ts
// Debug endpoint to check authentication setup
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, secret } = await request.json()

    // Require secret in production
    if (process.env.NODE_ENV !== 'development') {
      const initSecret = process.env.INIT_ADMIN_SECRET || process.env.NEXTAUTH_SECRET
      if (!secret || secret !== initSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { db } = await connectToDatabase()

    // Check environment variables
    const adminWhitelist = process.env.ADMIN_EMAIL_WHITELIST || 'NOT SET'
    const whitelistArray = adminWhitelist.split(',').map(e => e.trim().toLowerCase())

    // Check if user exists
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    })

    let passwordMatch = false
    if (user && password) {
      passwordMatch = await bcrypt.compare(password, user.password)
    }

    // Get all users for debugging
    const allUsers = await db.collection('users').find({}).project({
      email: 1,
      firstName: 1,
      lastName: 1,
      role: 1,
      isActive: 1,
      emailVerified: 1
    }).toArray()

    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        adminWhitelist: adminWhitelist,
        whitelistArray: whitelistArray,
        emailInWhitelist: whitelistArray.includes(email?.toLowerCase()),
        nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET'
      },
      userCheck: {
        emailSearched: email,
        userFound: !!user,
        userActive: user?.isActive,
        userRole: user?.role,
        passwordMatch: passwordMatch
      },
      allUsers: allUsers.map(u => ({
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        isActive: u.isActive
      }))
    })
  } catch (error) {
    console.error('Check auth error:', error)
    return NextResponse.json(
      { error: 'Failed to check auth', details: (error as Error).message },
      { status: 500 }
    )
  }
}
