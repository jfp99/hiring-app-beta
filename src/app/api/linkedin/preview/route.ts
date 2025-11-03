// src/app/api/linkedin/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/lib/auth-helpers'
import ogs from 'open-graph-scraper'
import { connectToDatabase } from '@/app/lib/mongodb'
import {
  LinkedInPreviewRequest,
  LinkedInPreviewResponse,
  LinkedInPreviewData,
  isValidLinkedInUrl
} from '@/app/types/linkedin'

// Cache duration in milliseconds (30 days)
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: LinkedInPreviewRequest = await request.json()
    const { linkedinUrl, candidateId } = body

    // Validate LinkedIn URL
    if (!linkedinUrl) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn URL is required' },
        { status: 400 }
      )
    }

    if (!isValidLinkedInUrl(linkedinUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid LinkedIn URL format' },
        { status: 400 }
      )
    }

    // Check cache if candidateId is provided
    if (candidateId) {
      const { db } = await connectToDatabase()
      const candidate = await db.collection('candidates').findOne({
        _id: candidateId
      })

      if (candidate?.linkedinData?.previewData?.lastFetched) {
        const lastFetched = new Date(candidate.linkedinData.previewData.lastFetched)
        const now = new Date()
        const timeDiff = now.getTime() - lastFetched.getTime()

        // Return cached data if it's still fresh
        if (timeDiff < CACHE_DURATION) {
          return NextResponse.json({
            success: true,
            data: candidate.linkedinData.previewData,
            cached: true
          } as LinkedInPreviewResponse)
        }
      }
    }

    // Fetch OpenGraph data from LinkedIn
    try {
      const { error, html, result } = await ogs({
        url: linkedinUrl,
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      if (error) {
        console.error('OpenGraph scraper error:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch LinkedIn preview. Profile may be private or restricted.'
          },
          { status: 400 }
        )
      }

      // Extract preview data from OpenGraph results
      const previewData: LinkedInPreviewData = {
        name: result.ogTitle || result.twitterTitle || '',
        headline: result.ogDescription || result.twitterDescription || '',
        imageUrl: result.ogImage?.url || result.twitterImage?.url || '',
        location: '', // LinkedIn doesn't always expose this in OG tags
        position: '', // Will be extracted from headline if possible
        company: '', // Will be extracted from headline if possible
        lastFetched: new Date().toISOString()
      }

      // Try to extract position and company from the headline
      // LinkedIn headlines often follow patterns like "Software Engineer at Company"
      if (previewData.headline) {
        const atMatch = previewData.headline.match(/^([^-]+)\s+at\s+(.+)$/i)
        const dashMatch = previewData.headline.match(/^([^-]+)\s+-\s+(.+)$/i)

        if (atMatch) {
          previewData.position = atMatch[1].trim()
          previewData.company = atMatch[2].trim()
        } else if (dashMatch) {
          previewData.position = dashMatch[1].trim()
          previewData.company = dashMatch[2].trim()
        }
      }

      // Clean up the name (remove " | LinkedIn" suffix if present)
      if (previewData.name) {
        previewData.name = previewData.name.replace(/\s*\|\s*LinkedIn$/i, '').trim()
      }

      // Store in database if candidateId is provided
      if (candidateId) {
        const { db } = await connectToDatabase()
        await db.collection('candidates').updateOne(
          { _id: candidateId },
          {
            $set: {
              'linkedinData.url': linkedinUrl,
              'linkedinData.previewData': previewData,
              'updatedAt': new Date()
            }
          }
        )
      }

      return NextResponse.json({
        success: true,
        data: previewData,
        cached: false
      } as LinkedInPreviewResponse)

    } catch (scrapeError) {
      console.error('Error scraping LinkedIn:', scrapeError)

      // Return a more user-friendly error for common issues
      if (scrapeError instanceof Error) {
        if (scrapeError.message.includes('timeout')) {
          return NextResponse.json(
            { success: false, error: 'Request timed out. Please try again.' },
            { status: 408 }
          )
        }
        if (scrapeError.message.includes('404')) {
          return NextResponse.json(
            { success: false, error: 'LinkedIn profile not found.' },
            { status: 404 }
          )
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to fetch LinkedIn profile. The profile may be private or the URL may be incorrect.'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('LinkedIn preview API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({
    message: 'LinkedIn Preview API is running',
    endpoints: {
      POST: '/api/linkedin/preview - Fetch LinkedIn profile preview data'
    }
  })
}