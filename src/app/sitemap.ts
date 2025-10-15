// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { connectToDatabase } from './lib/mongodb'

/**
 * Generate dynamic sitemap for SEO
 * Automatically includes all active job postings
 *
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    // Fetch active job postings from database
    const { db } = await connectToDatabase()
    const jobs = await db
      .collection('offres')
      .find({ statut: 'active' })
      .sort({ datePublication: -1 })
      .limit(1000) // Limit to prevent sitemap from being too large
      .toArray()

    // Generate job URLs
    const jobUrls: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/offres-emploi/${job._id.toString()}`,
      lastModified: job.datePublication ? new Date(job.datePublication) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }))

    // Static pages (high priority)
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/offres-emploi`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/vision`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      }
    ]

    // Combine all URLs
    return [...staticPages, ...jobUrls]
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)

    // Fallback to static pages only if database connection fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/offres-emploi`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/vision`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      }
    ]
  }
}
