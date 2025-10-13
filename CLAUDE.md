# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hi-ring is a Next.js 15 recruitment platform built with TypeScript, MongoDB, and NextAuth.js. The application connects job seekers (candidats) with companies (entreprises) through job postings (offres), contact forms, and newsletter subscriptions. It includes advanced ATS/CRM features like candidate pipeline management, interview scheduling, bulk operations, custom fields, and workflow automation.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string (validated as URL)
- `MONGODB_DB` - MongoDB database name (non-empty string)
- `NEXTAUTH_SECRET` - NextAuth secret for JWT signing (minimum 32 characters)
- `NEXTAUTH_URL` - Base URL for NextAuth callbacks (validated as URL)
- `NODE_ENV` - Environment: development, test, or production

Optional:
- `SENDGRID_API_KEY` - For email functionality
- `AZURE_STORAGE_CONNECTION_STRING` - For file uploads

**CRITICAL**: All environment variables must be validated on startup using Zod schemas. See `src/app/lib/env.ts` for the validation pattern.

---

## Architecture Overview

### Database Schema (MongoDB Collections)

**candidates** - Main candidate records with comprehensive tracking
- Personal info: `firstName`, `lastName`, `email`, `phone`, `linkedinUrl`, `portfolioUrl`
- Status tracking: `status`/`appStatus` (dual system for MongoDB compatibility), `assignedTo`, `tags`
- Experience: `currentPosition`, `experienceLevel`, `yearsOfExperience`, `desiredSalary`
- Skills: `skills` (array of objects with name and level), `primarySkills`, `secondarySkills`
- Ratings: `technicalRating`, `culturalRating`, `overallRating`
- Resume: `resumeUrl`, `resumeParsedData`
- Metadata: `source`, `createdBy`, `createdAt`, `updatedAt`, `lastActivityAt`
- Activity: `activityLog` (array of activities with user, action, details, timestamp)

**interviews** - Interview scheduling and feedback
- Fields: `candidateId`, `title`, `scheduledDate`, `interviewers`, `location`, `meetingLink`, `status`, `type`, `feedback`
- Linked to candidates collection

**tasks** - Task management for candidate follow-ups
- Fields: `candidateId`, `title`, `description`, `dueDate`, `assignedTo`, `status`, `priority`

**comments** - Threaded comments on candidates
- Fields: `candidateId`, `userId`, `content`, `mentions`, `parentId`, `createdAt`

**notifications** - User notifications
- Fields: `userId`, `type`, `title`, `message`, `relatedId`, `isRead`, `createdAt`

**workflows** - Automated workflow definitions
- Fields: `name`, `trigger`, `conditions`, `actions`, `isActive`

**customFields** - Custom field definitions
- Fields: `name`, `type`, `options`, `isRequired`, `entityType`

**offres** - Job postings with filtering
- Fields: `titre`, `entreprise`, `lieu`, `typeContrat`, `description`, `competences`, `salaire`, `emailContact`, `statut` (active/inactive), `categorie`, `datePublication`
- Only `statut: 'active'` jobs are displayed on the public site
- Supports filtering by search term, categorie, lieu, and typeContrat

**contacts** - Dual-purpose contact forms
- Two types: `'Candidat'` and `'Entreprise'`
- Candidat-specific fields: `prenom`, `cv` (file path)
- Entreprise-specific fields: `entreprise`, `poste`, `besoins`
- Common fields: `nom`, `email`, `telephone`, `message`

**newsletters** - Email subscriptions
- Fields: `email`, `createdAt`

### Database Indexes (CRITICAL for Performance)

Always ensure these indexes exist:

```typescript
// Candidates collection
db.collection('candidates').createIndexes([
  { key: { email: 1 }, unique: true },
  { key: { status: 1, createdAt: -1 } },
  { key: { firstName: 'text', lastName: 'text', email: 'text' } },
  { key: { 'skills.name': 1 } },
  { key: { assignedTo: 1 } },
  { key: { tags: 1 } },
  { key: { overallRating: 1 } }
])

// Interviews collection
db.collection('interviews').createIndexes([
  { key: { candidateId: 1, scheduledDate: -1 } },
  { key: { interviewers: 1 } }
])

// Tasks collection
db.collection('tasks').createIndexes([
  { key: { candidateId: 1 } },
  { key: { assignedTo: 1, status: 1, dueDate: 1 } }
])
```

---

## Security Best Practices (CRITICAL)

### Authentication & Authorization

**NEVER**:
- Store hardcoded credentials in source code
- Use plain text passwords
- Skip password hashing (always use bcrypt with salt rounds >= 12)
- Commit `.env` files to version control

**ALWAYS**:
- Validate user sessions on every protected route
- Implement rate limiting on authentication endpoints (max 5 attempts per 15 minutes)
- Use secure, httpOnly cookies for session tokens
- Implement CSRF protection
- Hash passwords with bcrypt before storage
- Use environment variables for all secrets
- Validate ObjectId format before database queries
- Implement proper role-based access control (RBAC)

### Input Validation & Sanitization

**ALWAYS**:
- Validate ALL user inputs with Zod schemas before processing
- Sanitize strings to remove HTML/JavaScript
- Escape special regex characters before MongoDB regex queries
- Validate file uploads (type, size, content)
- Limit request body sizes (1MB for JSON, 10MB for file uploads)
- Use TypeScript strict mode and avoid `any` types

Example input sanitization:
```typescript
// src/app/lib/sanitizer.ts
export function sanitizeString(input: string): string {
  return input
    .trim()
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

- [ ] All endpoints validate authentication
- [ ] Rate limiting implemented (10 requests/minute for most endpoints, 5/minute for auth)
- [ ] Input validation with Zod schemas
- [ ] SQL/NoSQL injection prevention (escape regex patterns)
- [ ] XSS prevention (sanitize all user inputs)
- [ ] CSRF tokens on state-changing operations
- [ ] Request body size limits enforced
- [ ] File upload validation (type, size, virus scanning)
- [ ] Proper error messages (don't expose internal details)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] MongoDB ObjectId validation before queries
- [ ] Audit logging for sensitive operations

---

## API Development Best Practices

### Unified Error Handling Pattern

**ALWAYS** use consistent error responses across all API routes:

```typescript
// src/app/lib/apiResponse.ts
import { NextResponse } from 'next/server'

export interface ApiSuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Array<{ field: string; message: string }>
  timestamp: string
}

export function successResponse<T>(
  data?: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(meta && { meta })
  })
}

export function errorResponse(
  error: unknown,
  fallbackMessage = 'An error occurred'
): NextResponse<ApiErrorResponse> {
  // Implementation with proper error handling
}
```

### API Route Structure

**Standard Pattern**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/mongodb'
import { successResponse, errorResponse } from '@/app/lib/apiResponse'
import { auth } from '@/app/lib/auth'
import { rateLimit } from '@/app/lib/rateLimiter'
import { sanitizeObject } from '@/app/lib/sanitizer'

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResponse = await rateLimit({
      windowMs: 60000,
      maxRequests: 10
    })(request)
    if (rateLimitResponse) return rateLimitResponse

    // 2. Authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. Authorization
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 4. Input validation
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // 5. Database query
    const { db } = await connectToDatabase()
    const data = await db.collection('items')
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection('items').countDocuments({})

    // 6. Response
    return successResponse(data, 'Items fetched successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    return errorResponse(error, 'Failed to fetch items')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit({
      windowMs: 60000,
      maxRequests: 5
    })(request)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
    const sanitizedBody = sanitizeObject(body, ['field1', 'field2'])
    const validatedData = schema.parse(sanitizedBody)

    // Database operation
    const { db } = await connectToDatabase()
    const result = await db.collection('items').insertOne({
      ...validatedData,
      createdBy: session.user.id,
      createdAt: new Date().toISOString()
    })

    return successResponse(
      { id: result.insertedId.toString() },
      'Item created successfully'
    )
  } catch (error) {
    return errorResponse(error, 'Failed to create item')
  }
}
```

### Service Layer Pattern

**ALWAYS** separate business logic from API routes:

```typescript
// src/app/services/candidateService.ts
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'

export class CandidateService {
  async create(data: CreateCandidateDTO, userId: string) {
    const { db } = await connectToDatabase()

    // Business logic here
    const existing = await db.collection('candidates').findOne({
      email: data.email.toLowerCase()
    })

    if (existing) {
      throw new Error('Candidate with this email already exists')
    }

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

export const candidateService = new CandidateService()
```

---

## TypeScript Best Practices

### Strict Type Safety

**NEVER** use `any` type. **ALWAYS** define proper types:

```typescript
// ❌ BAD
const query: any = {}
const user = data as any

// ✅ GOOD
interface CandidateQuery {
  status?: { $in: CandidateStatus[] }
  email?: { $regex: string; $options: string }
}
const query: CandidateQuery = {}

type UserWithRole = User & { role: string }
const user = data as UserWithRole
```

### Type Guards

```typescript
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export function isCandidateContact(
  contact: ContactForm
): contact is CandidateContact {
  return contact.type === 'Candidat'
}
```

### Discriminated Unions

```typescript
interface BaseContact {
  _id: string
  nom: string
  email: string
}

interface CandidateContact extends BaseContact {
  type: 'Candidat'
  prenom: string
  cv?: string
}

interface EntrepriseContact extends BaseContact {
  type: 'Entreprise'
  entreprise: string
  poste: string
}

export type ContactForm = CandidateContact | EntrepriseContact
```

---

## Frontend Development Best Practices

### Component Patterns

**Server Components** (default):
```typescript
// app/page.tsx
import { auth } from '@/app/lib/auth'

export default async function Page() {
  const session = await auth()
  // Can directly fetch data here
  return <div>...</div>
}
```

**Client Components** (only when needed):
```typescript
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session } = useSession()
  const [state, setState] = useState()
  return <div>...</div>
}
```

### Data Fetching Hook Pattern

```typescript
// src/app/hooks/useApi.ts usage
const { loading, error, callApi } = useApi()

const handleSubmit = async () => {
  const response = await callApi('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (response.success) {
    // Handle success
  }
}
```

---

## UI Design Guidelines (S-Tier Standards)

### Design Philosophy

Follow the principles from `context/saas-dashboard-design-checklist.md`:
- **Users First**: Every design decision prioritizes user needs
- **Speed & Performance**: Fast load times, snappy interactions
- **Simplicity & Clarity**: Clean, uncluttered interfaces
- **Consistency**: Uniform design language throughout
- **Accessibility**: WCAG AA compliance minimum

### Design System Tokens

**Colors**:
```typescript
// Tailwind config or CSS variables
Primary: User-specified brand color
Neutrals: gray-50 through gray-900 (7 steps)
Success: green-500
Error: red-500
Warning: amber-500
Info: blue-500
```

**Typography**:
```typescript
Font: Inter or system-ui
Scale:
- H1: 32px (text-3xl) - Page titles
- H2: 24px (text-2xl) - Section headings
- H3: 20px (text-xl) - Subsection headings
- Body: 16px (text-base) - Default text
- Small: 14px (text-sm) - Helper text
- Caption: 12px (text-xs) - Labels

Line Height: 1.5-1.7 for body text
Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
```

**Spacing**:
```typescript
Base unit: 8px
Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
Use Tailwind: p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16
```

**Border Radius**:
```typescript
Small: 6px (rounded-md) - inputs, buttons
Medium: 8px (rounded-lg) - cards, modals
Large: 12px (rounded-xl) - containers
```

### Component States

**ALWAYS** implement these states:
- Default
- Hover (opacity-80 or bg-hover)
- Active/Pressed
- Focus (ring-2 ring-blue-500)
- Disabled (opacity-50 cursor-not-allowed)
- Loading (spinner or skeleton)
- Error (border-red-500)

### Accessibility Requirements

**MUST HAVE**:
- Keyboard navigation (Tab order)
- Focus indicators (visible ring)
- ARIA labels on interactive elements
- Alt text on images
- Color contrast 4.5:1 minimum
- Form labels associated with inputs
- Screen reader support

### Responsive Design

**Breakpoints**:
```typescript
Mobile: < 768px (default)
Tablet: >= 768px (md:)
Desktop: >= 1024px (lg:)
Large: >= 1280px (xl:)
```

**Mobile-First Approach**:
```typescript
// ❌ BAD
<div className="w-full lg:w-1/2">

// ✅ GOOD
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Data Tables

**Best Practices**:
- Zebra striping for readability
- Sticky headers for long tables
- Sortable columns with indicators
- Filterable columns
- Pagination (20-50 items per page)
- Loading states (skeleton rows)
- Empty states with helpful messages
- Bulk selection with checkboxes
- Row actions (edit, delete, view)

### Forms

**Best Practices**:
- Clear labels above inputs
- Placeholder text as hints
- Helper text below inputs
- Inline error messages
- Required field indicators
- Disabled state for submissions
- Success feedback after submit
- Progressive disclosure for complex forms

---

## MongoDB Best Practices

### Connection Pattern

**ALWAYS** use the cached connection:
```typescript
const { db } = await connectToDatabase()
const collection = db.collection('collectionName')
```

**NEVER** create new connections in API routes.

### Query Optimization

```typescript
// ✅ GOOD - Use projection to limit fields
const candidates = await db.collection('candidates')
  .find(query)
  .project({
    firstName: 1,
    lastName: 1,
    email: 1,
    status: 1
  })
  .limit(100)
  .toArray()

// ❌ BAD - Fetching all fields for 1000+ records
const candidates = await db.collection('candidates')
  .find({})
  .toArray()
```

### ObjectId Validation

```typescript
import { ObjectId } from 'mongodb'

// ALWAYS validate before queries
if (!ObjectId.isValid(id)) {
  return NextResponse.json(
    { error: 'Invalid ID format' },
    { status: 400 }
  )
}

const candidate = await db.collection('candidates')
  .findOne({ _id: new ObjectId(id) })
```

---

## Error Handling & Logging

### Structured Logging

```typescript
// src/app/lib/logger.ts
class Logger {
  info(message: string, context?: any) {
    console.log(`✅ [INFO] ${message}`, context || '')
  }

  error(message: string, context?: any) {
    console.error(`❌ [ERROR] ${message}`, context || '')
  }

  warn(message: string, context?: any) {
    console.warn(`⚠️ [WARN] ${message}`, context || '')
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [DEBUG] ${message}`, context || '')
    }
  }
}

export const logger = new Logger()
```

### Error Handling Pattern

```typescript
try {
  // Operation
} catch (error: unknown) {
  if (error instanceof AppError) {
    logger.error('Application error', { error: error.message })
    return errorResponse(error)
  }

  if (error instanceof Error) {
    logger.error('Unexpected error', { error: error.message, stack: error.stack })
    return errorResponse(error, 'An unexpected error occurred')
  }

  logger.error('Unknown error', { error })
  return errorResponse(new Error('Unknown error'), 'An unexpected error occurred')
}
```

---

## Testing Guidelines

### Unit Tests

```typescript
// tests/services/candidateService.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { candidateService } from '@/app/services/candidateService'

describe('CandidateService', () => {
  it('should create a new candidate', async () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }

    const id = await candidateService.create(data, 'user123')
    expect(id).toBeDefined()
  })

  it('should prevent duplicate emails', async () => {
    await expect(
      candidateService.create(duplicateData, 'user123')
    ).rejects.toThrow('Candidate with this email already exists')
  })
})
```

### Integration Tests

Test API routes end-to-end with actual database calls.

---

## Performance Optimization

### Frontend

- Use React.memo for expensive components
- Implement virtual scrolling for large lists (react-virtual)
- Lazy load components with next/dynamic
- Optimize images with next/image
- Implement proper loading states
- Use React Query or SWR for data caching

### Backend

- Add database indexes on frequently queried fields
- Use projection to limit returned fields
- Implement pagination on all list endpoints
- Cache expensive computations
- Optimize MongoDB aggregation pipelines
- Use connection pooling (built into mongodb driver)

---

## Validation Schemas

Located in `src/app/lib/validation.ts`:

```typescript
import { z } from 'zod'

export const candidateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  phone: z.string().optional(),
  experienceLevel: z.enum(['JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT']),
  currentPosition: z.string().max(200),
  status: z.enum(['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'])
})

export type CandidateInput = z.infer<typeof candidateSchema>
```

---

## Important Project-Specific Notes

### Dual Status System

The project uses a workaround for MongoDB validation:
- `appStatus`: Application-level status (what we use in code)
- `status`: MongoDB-level status (mapped for compatibility)

Use `toMongoStatus()` helper when saving to database.

### Resume Parsing

Supports multiple formats: PDF, DOCX, TXT, MD, RTF, ODT, images (with OCR)

Location: `src/app/api/candidates/parse-resume/route.ts`

### Kanban Board

Drag-and-drop functionality with optimistic updates.

**Important**: Kanban fetches large datasets; consider implementing pagination or virtual scrolling.

### Bulk Operations

Bulk actions toolbar in candidate list view supports:
- Bulk status updates
- Bulk assignments
- Bulk tagging
- Bulk deletion

---

## Development Workflow

1. **Before Starting**:
   - Pull latest changes
   - Run `npm install`
   - Check `.env.local` variables
   - Run `npm run dev` to start dev server

2. **While Developing**:
   - Follow TypeScript strict mode (no `any` types)
   - Write Zod schemas for all inputs
   - Implement proper error handling
   - Add loading states
   - Test responsiveness (mobile, tablet, desktop)
   - Check accessibility (keyboard nav, contrast)

3. **Before Committing**:
   - Run `npm run lint`
   - Run `npx tsc --noEmit`
   - Test in browser
   - Review security checklist
   - Update documentation if needed

4. **Security Checklist** (every commit):
   - [ ] No hardcoded credentials
   - [ ] All inputs validated with Zod
   - [ ] All inputs sanitized
   - [ ] No `any` types added
   - [ ] ObjectId validation where needed
   - [ ] Proper error handling
   - [ ] No sensitive data in logs

---

## Key Files Reference

**Authentication**: `src/app/lib/auth.ts`
**Database**: `src/app/lib/mongodb.ts`
**Error Handling**: `src/app/lib/errorHandler.ts`
**Validation**: `src/app/lib/validation.ts`
**Types**: `src/app/types/` (index.ts, candidates.ts, auth.ts, etc.)
**API Routes**: `src/app/api/`
**Components**: `src/app/components/`
**Hooks**: `src/app/hooks/`
**Services**: `src/app/services/` (business logic layer)

---

## Additional Resources

- **Design Checklist**: `context/saas-dashboard-design-checklist.md`
- **Next.js 15 Docs**: https://nextjs.org/docs
- **NextAuth.js Docs**: https://next-auth.js.org
- **MongoDB Node Driver**: https://www.mongodb.com/docs/drivers/node
- **Zod Validation**: https://zod.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## Quick Reference

**Path Alias**: `@/*` → `./src/*`

**UI Language**: French (for user-facing content)

**Code Language**: English (for code, comments, documentation)

**TypeScript**: Strict mode enabled

**CSS Framework**: Tailwind CSS

**State Management**: React hooks + Context API

**Forms**: React Hook Form + Zod validation

**Date Handling**: Native JavaScript Date + Intl.DateTimeFormat
