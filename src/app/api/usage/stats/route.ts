// src/app/api/usage/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const usageCollection = db.collection('api_usage')

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get current month range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Count today's calls
    const callsToday = await usageCollection.countDocuments({
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    })

    // Count this month's calls
    const callsThisMonth = await usageCollection.countDocuments({
      timestamp: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    })

    // Define limits (can be moved to environment variables or database)
    const dailyLimit = parseInt(process.env.API_DAILY_LIMIT || '100')
    const monthlyLimit = parseInt(process.env.API_MONTHLY_LIMIT || '1000')

    // Calculate reset date (first day of next month)
    const resetDate = startOfNextMonth.toISOString()

    return NextResponse.json({
      callsToday,
      callsThisMonth,
      dailyLimit,
      monthlyLimit,
      resetDate,
      remainingToday: Math.max(0, dailyLimit - callsToday),
      remainingThisMonth: Math.max(0, monthlyLimit - callsThisMonth)
    })
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
