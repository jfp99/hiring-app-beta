# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Hi-ring is a Next.js 15 recruitment platform (TypeScript, MongoDB, NextAuth.js) connecting job seekers with companies. Features: ATS/CRM pipeline management, interview scheduling, bulk operations, custom fields, workflow automation.

## Development Commands

```bash
npm run dev        # Development server (localhost:3000)
npm run build      # Production build
npm start          # Start production
npm run lint       # Lint code
npx tsc --noEmit   # Type check
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection (URL)
- `MONGODB_DB` - Database name
- `NEXTAUTH_SECRET` - JWT secret (32+ chars)
- `NEXTAUTH_URL` - Base URL
- `NODE_ENV` - development|test|production

Optional: `SENDGRID_API_KEY`, `AZURE_STORAGE_CONNECTION_STRING`

**CRITICAL**: Validate all env vars with Zod schemas (see `src/app/lib/env.ts`)

---

## Database Schema (MongoDB)

**candidates** - Main records
- Personal: `firstName`, `lastName`, `email`, `phone`, `linkedinUrl`, `portfolioUrl`
- Status: `status`/`appStatus` (dual system), `assignedTo`, `tags`
- Experience: `currentPosition`, `experienceLevel`, `yearsOfExperience`, `desiredSalary`
- Skills: `skills` (array), `primarySkills`, `secondarySkills`
- Ratings: `technicalRating`, `culturalRating`, `overallRating`
- Resume: `resumeUrl`, `resumeParsedData`
- Metadata: `source`, `createdBy`, `createdAt`, `updatedAt`, `lastActivityAt`
- Activity: `activityLog` (array)

**interviews** - Scheduling & feedback
- `candidateId`, `title`, `scheduledDate`, `interviewers`, `location`, `meetingLink`, `status`, `type`, `feedback`

**tasks** - Follow-ups
- `candidateId`, `title`, `description`, `dueDate`, `assignedTo`, `status`, `priority`

**comments** - Threaded comments
- `candidateId`, `userId`, `content`, `mentions`, `parentId`, `createdAt`

**notifications** - User notifications
- `userId`, `type`, `title`, `message`, `relatedId`, `isRead`, `createdAt`

**workflows** - Automation
- `name`, `trigger`, `conditions`, `actions`, `isActive`

**customFields** - Custom definitions
- `name`, `type`, `options`, `isRequired`, `entityType`

**offres** - Job postings
- `titre`, `entreprise`, `lieu`, `typeContrat`, `description`, `competences`, `salaire`, `emailContact`, `statut`, `categorie`, `datePublication`
- Only `statut: 'active'` displayed publicly

**contacts** - Forms (Candidat/Entreprise)
- Candidat: `prenom`, `cv`
- Entreprise: `entreprise`, `poste`, `besoins`
- Common: `nom`, `email`, `telephone`, `message`

**newsletters** - Subscriptions
- `email`, `createdAt`

### Database Indexes (CRITICAL)

```typescript
// Candidates
db.collection('candidates').createIndexes([
  { key: { email: 1 }, unique: true },
  { key: { status: 1, createdAt: -1 } },
  { key: { firstName: 'text', lastName: 'text', email: 'text' } },
  { key: { 'skills.name': 1 } },
  { key: { assignedTo: 1 } },
  { key: { tags: 1 } },
  { key: { overallRating: 1 } }
])

// Interviews
db.collection('interviews').createIndexes([
  { key: { candidateId: 1, scheduledDate: -1 } },
  { key: { interviewers: 1 } }
])

// Tasks
db.collection('tasks').createIndexes([
  { key: { candidateId: 1 } },
  { key: { assignedTo: 1, status: 1, dueDate: 1 } }
])
```

---

## Security Best Practices (CRITICAL)

### Authentication & Authorization

**NEVER**:
- Hardcode credentials
- Use plain text passwords
- Skip bcrypt hashing (salt rounds >= 12)
- Commit `.env` files

**ALWAYS**:
- Validate sessions on protected routes
- Rate limit auth endpoints (5 attempts/15min)
- Use httpOnly cookies
- CSRF protection
- Hash passwords with bcrypt
- Validate ObjectId before queries
- RBAC implementation

### Input Validation

**ALWAYS**:
- Validate with Zod schemas
- Sanitize strings (remove HTML/JS)
- Escape regex chars for MongoDB
- Validate file uploads
- Limit body sizes (1MB JSON, 10MB files)
- Avoid `any` types

```typescript
// Sanitization example
export function sanitizeString(input: string): string {
  return input.trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 10000)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
```

### API Security Checklist

- [ ] Auth validation on all endpoints
- [ ] Rate limiting (10 req/min general, 5/min auth)
- [ ] Zod validation
- [ ] NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Body size limits
- [ ] File upload validation
- [ ] Safe error messages
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] ObjectId validation
- [ ] Audit logging
- [ ] CORS configured
- [ ] Dependency audits
- [ ] Data encryption
- [ ] GDPR compliance

### Security Headers

```typescript
// next.config.ts - Essential headers
headers: [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
]
```

### GDPR Compliance

```typescript
// PII anonymization for logs
export class PIIHandler {
  static anonymize(data: PIIFields): PIIFields {
    return {
      ...data,
      email: data.email ? maskEmail(data.email) : undefined,
      phone: data.phone ? `***-***-${data.phone.slice(-4)}` : undefined
    }
  }

  // Data retention (2 years)
  static async enforceRetention(db: any) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 730)
    await db.collection('candidates').deleteMany({
      status: 'REJECTED',
      updatedAt: { $lt: cutoffDate.toISOString() }
    })
  }

  // Right to erasure
  static async deleteUserData(db: any, email: string) {
    await db.collection('candidates').deleteMany({ email })
    await db.collection('interviews').deleteMany({ candidateEmail: email })
    // Log audit trail
  }
}
```

---

## API Development

### Standard Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { auth } from '@/app/lib/auth'
import { rateLimit } from '@/app/lib/rateLimiter'

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limit
    const rateLimitResponse = await rateLimit({ windowMs: 60000, maxRequests: 10 })(request)
    if (rateLimitResponse) return rateLimitResponse

    // 2. Auth
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 3. Validation
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // 4. Query
    const { db } = await connectToDatabase()
    const data = await db.collection('items')
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Service Layer

```typescript
// src/app/services/candidateService.ts
export class CandidateService {
  async create(data: CreateCandidateDTO, userId: string) {
    const { db } = await connectToDatabase()
    const existing = await db.collection('candidates').findOne({ email: data.email.toLowerCase() })
    if (existing) throw new Error('Email exists')

    const result = await db.collection('candidates').insertOne({
      ...data,
      createdBy: userId,
      createdAt: new Date().toISOString()
    })
    return result.insertedId.toString()
  }

  async findById(id: string) {
    if (!ObjectId.isValid(id)) return null
    const { db } = await connectToDatabase()
    return db.collection('candidates').findOne({ _id: new ObjectId(id) })
  }
}
```

---

## TypeScript

**NEVER** use `any`. **ALWAYS** define types:

```typescript
// ✅ GOOD
interface CandidateQuery {
  status?: { $in: CandidateStatus[] }
  email?: { $regex: string; $options: string }
}

// ❌ BAD
const query: any = {}
```

### Type Guards

```typescript
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
```

---

## Frontend

### Component Patterns

**Server Components** (default):
```typescript
export default async function Page() {
  const session = await auth()
  const data = await fetchData()
  return <div>{data}</div>
}
```

**Client Components** (use sparingly):
```typescript
'use client'
import { useState } from 'react'

export default function ClientComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(x => x + 1)}>{state}</button>
}
```

---

## UI Design (S-Tier Standards)

### Design System

**Colors**: Primary (brand), Neutrals (gray-50 to gray-900), Success (green-500), Error (red-500), Warning (amber-500)

**Typography**:
- H1: 32px (page titles)
- H2: 24px (sections)
- H3: 20px (subsections)
- Body: 16px
- Small: 14px
- Caption: 12px
- Font: Inter/system-ui

**Spacing**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Border Radius**: 6px (inputs), 8px (cards), 12px (containers)

### Component States

Implement: Default, Hover, Active, Focus (ring-2 ring-blue-500), Disabled (opacity-50), Loading, Error (border-red-500)

### Accessibility (WCAG AA)

**Required**:
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Heading hierarchy (H1 → H2 → H3)
- Skip navigation links
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Focus indicators (visible ring)
- Color contrast 4.5:1 (normal), 3:1 (large text)
- ARIA labels on icons
- Alt text on images
- Form labels with `htmlFor`
- Error announcements with `role="alert"`
- Touch targets 44x44px minimum

```typescript
// Focus trap example
const modalRef = useRef<HTMLDivElement>(null)
const previousFocusRef = useRef<HTMLElement | null>(null)

useEffect(() => {
  if (isOpen) {
    previousFocusRef.current = document.activeElement as HTMLElement
    modalRef.current?.querySelector('button')?.focus()
  } else {
    previousFocusRef.current?.focus()
  }
}, [isOpen])
```

### Responsive Design

```typescript
// Mobile-first breakpoints
Mobile: < 768px (default)
Tablet: >= 768px (md:)
Desktop: >= 1024px (lg:)

// Example
<div className="w-full md:w-1/2 lg:w-1/3">
```

---

## Performance

### Core Web Vitals Targets

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB: < 600ms

### Image Optimization

```typescript
import Image from 'next/image'

// Always use next/image
<Image
  src="/hero.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority  // For above-fold
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

### Caching

```typescript
// API response caching
export async function GET(request: NextRequest) {
  const data = await getData()
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}

// Static regeneration
export const revalidate = 3600  // 1 hour
```

### Rendering Strategies

- **SSG** (default): Static pages (blog, marketing)
- **ISR**: Static with periodic updates (`export const revalidate = 3600`)
- **SSR**: Dynamic per request (`export const dynamic = 'force-dynamic'`)
- **RSC**: Server components (default, reduces JS)
- **Client**: Only for interactivity (`'use client'`)

---

## SEO

### Metadata API

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'Hi-ring', template: '%s | Hi-ring' },
  description: 'ATS/CRM recruitment platform',
  keywords: ['recrutement', 'ATS', 'CRM'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  }
}

// Dynamic page
export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await getJob(params.id)
  return {
    title: `${job.titre} - ${job.entreprise}`,
    description: job.description.substring(0, 160)
  }
}
```

### Structured Data

```typescript
const jobSchema = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: job.titre,
  description: job.description,
  datePosted: job.datePublication,
  hiringOrganization: { '@type': 'Organization', name: job.entreprise }
}

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />
```

### Sitemap

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getActiveJobs()
  return [
    { url: 'https://hi-ring.com', priority: 1.0 },
    ...jobs.map(job => ({
      url: `https://hi-ring.com/offres/${job._id}`,
      lastModified: new Date(job.datePublication),
      priority: 0.8
    }))
  ]
}
```

---

## Testing (TDD)

### Coverage Targets
- Overall: 80%
- Business logic: 100%
- API routes: 90%
- Components: 70%

### Unit Tests

```typescript
describe('candidateSchema', () => {
  it('should validate valid candidate', () => {
    const valid = { firstName: 'John', lastName: 'Doe', email: 'john@ex.com', status: 'NEW' }
    expect(candidateSchema.safeParse(valid).success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalid = { ...valid, email: 'not-email' }
    expect(candidateSchema.safeParse(invalid).success).toBe(false)
  })
})
```

### Integration Tests

```typescript
describe('POST /api/candidates', () => {
  it('should create candidate', async () => {
    const response = await POST(new NextRequest('http://localhost/api/candidates', {
      method: 'POST',
      body: JSON.stringify(validData)
    }))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### E2E Tests (Playwright)

```typescript
test('should create candidate', async ({ page }) => {
  await page.goto('/admin/candidates')
  await page.click('text=New Candidate')
  await page.fill('[name="firstName"]', 'John')
  await page.fill('[name="email"]', 'john@test.com')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Success')).toBeVisible()
})
```

---

## MongoDB Best Practices

### Connection

```typescript
// ALWAYS use cached connection
const { db } = await connectToDatabase()
const collection = db.collection('name')
```

### Query Optimization

```typescript
// ✅ Use projection
const candidates = await db.collection('candidates')
  .find(query)
  .project({ firstName: 1, lastName: 1, email: 1 })
  .limit(100)
  .toArray()

// ALWAYS validate ObjectId
if (!ObjectId.isValid(id)) return null
const doc = await db.collection('candidates').findOne({ _id: new ObjectId(id) })
```

---

## Project-Specific Notes

### Dual Status System
- `appStatus`: Application level
- `status`: MongoDB level
Use `toMongoStatus()` when saving

### Resume Parsing
Supports: PDF, DOCX, TXT, MD, RTF, ODT, images (OCR)
Location: `src/app/api/candidates/parse-resume/route.ts`

### Kanban Board
Drag-and-drop with optimistic updates. Consider pagination for large datasets.

### Bulk Operations
Toolbar supports: status updates, assignments, tagging, deletion

---

## Development Workflow

**Before starting**: Pull latest, `npm install`, check `.env.local`, `npm run dev`

**While developing**:
- Strict TypeScript (no `any`)
- Zod schemas for inputs
- Error handling + loading states
- Test responsiveness + accessibility

**Before committing**:
- `npm run lint`
- `npx tsc --noEmit`
- Browser testing
- Security checklist review

**Security checklist**:
- [ ] No hardcoded credentials
- [ ] Zod validation
- [ ] Input sanitization
- [ ] No `any` types
- [ ] ObjectId validation
- [ ] Error handling
- [ ] No sensitive logs

---

## Key Files

- **Auth**: `src/app/lib/auth.ts`
- **Database**: `src/app/lib/mongodb.ts`
- **Validation**: `src/app/lib/validation.ts`
- **Types**: `src/app/types/`
- **API**: `src/app/api/`
- **Components**: `src/app/components/`
- **Services**: `src/app/services/`

---

## Quick Reference

**Path alias**: `@/*` → `./src/*`
**UI language**: French (user-facing)
**Code language**: English
**TypeScript**: Strict mode
**CSS**: Tailwind
**Forms**: React Hook Form + Zod
