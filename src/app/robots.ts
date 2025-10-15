// src/app/robots.ts
import { MetadataRoute } from 'next'

/**
 * Generate robots.txt for SEO
 * Controls which pages search engines can crawl
 *
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/offres-emploi',
          '/offres-emploi/*',
          '/vision',
          '/contact'
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/auth',
          '/auth/*',
          '/api',
          '/api/*',
          '/candidates',
          '/candidates/*',
          '/recruiter',
          '/recruiter/*',
          '/client',
          '/client/*',
          '/hiring-manager',
          '/hiring-manager/*',
          '/dashboard',
          '/dashboard/*'
        ],
        crawlDelay: 1 // Be respectful to search engine crawlers
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/offres-emploi',
          '/offres-emploi/*',
          '/vision',
          '/contact'
        ],
        disallow: [
          '/admin',
          '/auth',
          '/api',
          '/candidates',
          '/recruiter',
          '/client',
          '/hiring-manager',
          '/dashboard'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
