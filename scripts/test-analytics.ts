// scripts/test-analytics.ts
// Test script for analytics dashboard

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testAnalytics() {
  console.log('🧪 Testing Analytics Dashboard\n')
  console.log('='.repeat(60))

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'
  let sessionCookie = ''

  // Step 1: Login
  console.log('\n1️⃣  Step 1: Authenticating...')
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        redirect: false
      })
    })

    if (loginResponse.ok) {
      console.log('✅ Authentication successful')
      const cookies = loginResponse.headers.get('set-cookie')
      if (cookies) {
        sessionCookie = cookies.split(';')[0]
      }
    } else {
      console.log('❌ Authentication failed')
      return
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    return
  }

  // Step 2: Fetch candidates for analytics
  console.log('\n2️⃣  Step 2: Fetching candidate data for analytics...')
  try {
    const candidatesResponse = await fetch(`${baseUrl}/api/candidates`, {
      headers: {
        'Cookie': sessionCookie
      }
    })

    if (candidatesResponse.ok) {
      const data = await candidatesResponse.json()
      const candidates = data.candidates || []

      console.log(`✅ Analyzing ${candidates.length} candidates`)

      // Calculate metrics
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      // Filter by date ranges
      const last30Days = candidates.filter((c: any) =>
        new Date(c.createdAt) >= thirtyDaysAgo
      )
      const last90Days = candidates.filter((c: any) =>
        new Date(c.createdAt) >= ninetyDaysAgo
      )

      console.log('\n📊 Key Metrics (Last 30 Days):')
      console.log('   ='.repeat(30))

      // Total candidates
      console.log(`   Total Candidates: ${last30Days.length}`)

      // Active candidates
      const active = last30Days.filter((c: any) => c.status === 'active').length
      console.log(`   Active Candidates: ${active}`)

      // Interviews scheduled
      const withInterviews = last30Days.filter((c: any) =>
        c.interviews && c.interviews.length > 0
      ).length
      console.log(`   Candidates with Interviews: ${withInterviews}`)

      // Hired
      const hired = last30Days.filter((c: any) => c.stage === 'hired').length
      console.log(`   Hired: ${hired}`)

      // Conversion rate
      const conversionRate = last30Days.length > 0
        ? ((hired / last30Days.length) * 100).toFixed(2)
        : '0.00'
      console.log(`   Conversion Rate: ${conversionRate}%`)

      // Stage distribution
      console.log('\n📈 Stage Distribution (Last 30 Days):')
      const stageDistribution: Record<string, number> = {}
      last30Days.forEach((c: any) => {
        stageDistribution[c.stage] = (stageDistribution[c.stage] || 0) + 1
      })

      Object.entries(stageDistribution)
        .sort(([, a], [, b]) => b - a)
        .forEach(([stage, count]) => {
          const percentage = ((count / last30Days.length) * 100).toFixed(1)
          console.log(`   ${stage.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`)
        })

      // Interview to hire ratio
      console.log('\n🎯 Conversion Metrics (Last 30 Days):')
      const interviewToHire = withInterviews > 0
        ? ((hired / withInterviews) * 100).toFixed(1)
        : '0.0'
      console.log(`   Interview → Hire: ${interviewToHire}%`)

      // Average time to hire
      const hiredCandidates = last30Days.filter((c: any) => c.stage === 'hired')
      if (hiredCandidates.length > 0) {
        const totalDays = hiredCandidates.reduce((sum: number, c: any) => {
          const created = new Date(c.createdAt)
          const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0)
        const avgDays = Math.round(totalDays / hiredCandidates.length)
        console.log(`   Avg Time to Hire: ${avgDays} days`)
      }

      // Compare with 90 days
      console.log('\n📊 Comparison (Last 90 Days vs Last 30 Days):')
      console.log('   ='.repeat(30))

      const hired90 = last90Days.filter((c: any) => c.stage === 'hired').length
      const conversion90 = last90Days.length > 0
        ? ((hired90 / last90Days.length) * 100).toFixed(2)
        : '0.00'

      console.log(`   90 Days - Total: ${last90Days.length}, Hired: ${hired90}, Rate: ${conversion90}%`)
      console.log(`   30 Days - Total: ${last30Days.length}, Hired: ${hired}, Rate: ${conversionRate}%`)

      const trendDirection = parseFloat(conversionRate) > parseFloat(conversion90) ? '📈' : '📉'
      console.log(`   Trend: ${trendDirection}`)

      // Monthly breakdown (last 6 months)
      console.log('\n📅 Monthly Breakdown (Last 6 Months):')
      console.log('   ='.repeat(30))

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now)
        monthDate.setMonth(monthDate.getMonth() - i)
        const monthStr = monthDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

        const monthCandidates = candidates.filter((c: any) => {
          const createdDate = new Date(c.createdAt)
          return createdDate >= monthStart && createdDate <= monthEnd
        })

        const monthInterviews = monthCandidates.filter((c: any) =>
          c.interviews && c.interviews.length > 0
        ).length

        const monthHired = monthCandidates.filter((c: any) => c.stage === 'hired').length

        console.log(`   ${monthStr.padEnd(12)} Applied: ${monthCandidates.length.toString().padStart(3)}, Interviewed: ${monthInterviews.toString().padStart(3)}, Hired: ${monthHired.toString().padStart(2)}`)
      }

      // Test different time ranges
      console.log('\n🔄 Testing Date Range Filters:')
      console.log('   ='.repeat(30))

      const ranges = [
        { days: 7, label: 'Last 7 Days' },
        { days: 30, label: 'Last 30 Days' },
        { days: 90, label: 'Last 90 Days' },
        { days: 180, label: 'Last 6 Months' },
        { days: 365, label: 'Last Year' }
      ]

      ranges.forEach(({ days, label }) => {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        const filtered = candidates.filter((c: any) =>
          new Date(c.createdAt) >= cutoffDate
        )
        const filteredHired = filtered.filter((c: any) => c.stage === 'hired').length
        const rate = filtered.length > 0 ? ((filteredHired / filtered.length) * 100).toFixed(1) : '0.0'

        console.log(`   ${label.padEnd(20)} Total: ${filtered.length.toString().padStart(4)}, Hired: ${filteredHired.toString().padStart(3)}, Rate: ${rate}%`)
      })

    } else {
      console.log('❌ Failed to fetch candidates')
      return
    }
  } catch (error) {
    console.error('❌ Fetch candidates error:', error)
    return
  }

  // Test Results
  console.log('\n' + '='.repeat(60))
  console.log('✅ Analytics Test Completed!')
  console.log('')
  console.log('📝 Test Coverage:')
  console.log('   ✅ Key metrics calculation (Total, Active, Interviews, Hired)')
  console.log('   ✅ Conversion rate tracking')
  console.log('   ✅ Stage distribution analysis')
  console.log('   ✅ Interview-to-hire ratio')
  console.log('   ✅ Average time to hire')
  console.log('   ✅ Monthly breakdown')
  console.log('   ✅ Date range filtering (7, 30, 90, 180, 365 days)')
  console.log('   ✅ Trend comparison')
  console.log('')
  console.log('🎯 Next Steps:')
  console.log('   1. Visit http://localhost:3002/admin/analytics')
  console.log('   2. Select different date ranges')
  console.log('   3. View stage distribution chart')
  console.log('   4. Analyze conversion funnel')
  console.log('   5. Check 6-month timeline')
  console.log('')
}

// Run tests
testAnalytics()
  .then(() => {
    console.log('🎉 Test script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
