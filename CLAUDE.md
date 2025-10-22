# CLAUDE.md - S-Tier Development Principles

> This file provides comprehensive guidance to Claude Code for building production-ready applications with professional standards.

---

## 🎯 Core Philosophy

**Build production-ready applications from day one** - No prototypes, no "we'll fix it later". Every line of code must be secure, performant, accessible, and maintainable.

---

## 📋 Project Checklist

### Pre-Development
- [ ] Define clear security boundaries (auth, data access, API)
- [ ] Set up proper environment variable validation (Zod schemas)
- [ ] Configure ESLint with strict rules (no `any`, no unused vars)
- [ ] Set up TypeScript strict mode
- [ ] Create `.gitignore` with proper exclusions
- [ ] Document architecture decisions

### During Development
- [ ] Write types for everything (no `any`)
- [ ] Validate all inputs with Zod
- [ ] Sanitize user inputs (XSS, SQL injection prevention)
- [ ] Rate limit all API endpoints
- [ ] Add proper error handling (try-catch, fallbacks)
- [ ] Test responsiveness (mobile, tablet, desktop)
- [ ] Verify accessibility (WCAG AA compliance)
- [ ] Keep bundle size minimal (code splitting)

### Pre-Deployment
- [ ] Run full type check (`npx tsc --noEmit`)
- [ ] Run linter (`npm run lint`)
- [ ] Test all critical user flows
- [ ] Verify security headers
- [ ] Check performance (LCP < 2.5s, FID < 100ms)
- [ ] Test with real data volumes
- [ ] Verify error monitoring is active

---

## 🔒 Security (CRITICAL)

### Authentication & Authorization

**NEVER**:
- Hardcode credentials or secrets
- Use plain text passwords
- Skip authentication on protected routes
- Trust client-side validation alone
- Expose sensitive data in error messages

**ALWAYS**:
- Validate sessions server-side on every protected route
- Hash passwords with bcrypt (salt rounds >= 12)
- Use httpOnly cookies for session tokens
- Implement CSRF protection
- Rate limit authentication endpoints (5 attempts/15min)
- Use RBAC (Role-Based Access Control)
- Validate ObjectIds before MongoDB queries
- Log security events (failed logins, permission denials)

```typescript
// Example: Server-side auth check
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Proceed with authenticated logic
}
```

### Input Validation

**ALWAYS**:
- Validate with Zod schemas (never trust input)
- Sanitize strings (remove HTML/JS)
- Escape regex characters for database queries
- Validate file uploads (type, size, content)
- Limit request body sizes (1MB JSON, 10MB files)

```typescript
// Sanitization utilities
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

### Security Headers

```typescript
// next.config.ts - Essential headers
headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ]
  }]
}
```

### API Security Checklist

- [ ] Authentication validation
- [ ] Rate limiting (10 req/min general, 5/min auth)
- [ ] Zod input validation
- [ ] NoSQL injection prevention (no string concatenation in queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] CSRF protection
- [ ] Request body size limits
- [ ] File upload validation
- [ ] Safe error messages (no stack traces to client)
- [ ] CORS configuration
- [ ] ObjectId validation before queries
- [ ] Audit logging for sensitive operations

---

## 💾 Database Best Practices

### MongoDB Connection

```typescript
// ALWAYS use cached connection
import { connectToDatabase } from '@/lib/mongodb'

export async function handler() {
  const { db } = await connectToDatabase()
  // Use db for queries
}
```

### Query Optimization

```typescript
// Use projection to limit returned fields
const candidates = await db.collection('candidates')
  .find(query)
  .project({ firstName: 1, lastName: 1, email: 1 })
  .limit(100)
  .toArray()

// ALWAYS validate ObjectId
import { ObjectId } from 'mongodb'

if (!ObjectId.isValid(id)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
}
```

### Required Indexes

```typescript
// Create indexes for performance
db.collection('users').createIndexes([
  { key: { email: 1 }, unique: true },
  { key: { createdAt: -1 } },
  { key: { firstName: 'text', lastName: 'text' } }
])
```

---

## 🎨 UI/UX Design (S-Tier)

### Design System

**Colors**:
- Primary: Brand color
- Neutrals: gray-50 to gray-900
- Success: green-500
- Error: red-500
- Warning: amber-500

**Typography**:
- H1: 32px (page titles)
- H2: 24px (sections)
- H3: 20px (subsections)
- Body: 16px
- Small: 14px
- Caption: 12px
- Font: Inter, system-ui

**Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Border Radius**: 6px (inputs), 8px (cards), 12px (containers)

### Component States

Implement for ALL interactive elements:
- Default
- Hover (subtle visual feedback)
- Active (pressed state)
- Focus (ring-2 ring-blue-500 for keyboard nav)
- Disabled (opacity-50, cursor-not-allowed)
- Loading (spinner or skeleton)
- Error (border-red-500, error message)

### Accessibility (WCAG AA)

**Required**:
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Heading hierarchy (H1 → H2 → H3, no skipping)
- Skip navigation links
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Focus indicators (visible ring on all focusable elements)
- Color contrast 4.5:1 (normal text), 3:1 (large text)
- ARIA labels on icons and icon-only buttons
- Alt text on all images
- Form labels with `htmlFor` attribute
- Error announcements with `role="alert"`
- Touch targets 44x44px minimum

```typescript
// Accessibility example
<button
  type="button"
  aria-label="Close modal"
  onClick={onClose}
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  <XIcon className="w-6 h-6" />
</button>
```

### Responsive Design (Mobile-First)

```typescript
// Breakpoints
Mobile: < 768px (default styles)
Tablet: >= 768px (md:)
Desktop: >= 1024px (lg:)

// Example
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

---

## ⚡ Performance

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Image Optimization

```typescript
import Image from 'next/image'

// ALWAYS use next/image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // For above-fold images
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Rendering Strategies

- **SSG** (Static Site Generation): For static pages (marketing, blog)
- **ISR** (Incremental Static Regeneration): For semi-static content (`export const revalidate = 3600`)
- **SSR** (Server-Side Rendering): For dynamic content (`export const dynamic = 'force-dynamic'`)
- **RSC** (React Server Components): Default, reduces JS bundle
- **Client Components**: Only when interactivity needed (`'use client'`)

---

## 🧪 Testing (TDD)

### Coverage Targets
- Overall: 80%
- Business logic: 100%
- API routes: 90%
- Components: 70%

### Test Structure

```typescript
// Unit test example
describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
  })
})

// Integration test example
describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const response = await POST(createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com', name: 'Test User' }
    }))
    expect(response.status).toBe(201)
  })
})
```

---

## 📝 TypeScript Best Practices

### NEVER use `any`

```typescript
// ❌ BAD
const data: any = await fetchData()

// ✅ GOOD
interface UserData {
  id: string
  name: string
  email: string
}
const data: UserData = await fetchData()
```

### Define Explicit Types

```typescript
// ✅ GOOD - Explicit types
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fetchUser(id: string): Promise<APIResponse<User>> {
  // Implementation
}
```

### Use Zod for Runtime Validation

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(18)
})

type User = z.infer<typeof userSchema>

// Validate at runtime
const result = userSchema.safeParse(input)
if (!result.success) {
  return { error: result.error.issues }
}
```

---

## 🏗️ Code Architecture

### File Structure

```
src/
├── app/               # Next.js App Router
│   ├── api/          # API routes
│   ├── (auth)/       # Auth route group
│   ├── (dashboard)/  # Dashboard route group
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── features/    # Feature-specific components
├── lib/             # Utilities and configs
│   ├── auth.ts      # Authentication
│   ├── mongodb.ts   # Database connection
│   └── validation.ts # Zod schemas
├── services/        # Business logic layer
├── types/           # TypeScript types
└── hooks/           # Custom React hooks
```

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

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Service Layer Pattern

```typescript
// services/userService.ts
export class UserService {
  async create(data: CreateUserDTO): Promise<User> {
    const { db } = await connectToDatabase()

    // Validate
    const existing = await db.collection('users')
      .findOne({ email: data.email })
    if (existing) throw new Error('Email exists')

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Insert
    const result = await db.collection('users').insertOne({
      ...data,
      password: hashedPassword,
      createdAt: new Date()
    })

    return { id: result.insertedId.toString(), ...data }
  }
}
```

---

## 🔄 Git Workflow

### Commit Messages

Format: `<type>: <description>`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `chore:` Maintenance (dependencies, configs)
- `refactor:` Code restructuring (no behavior change)
- `docs:` Documentation
- `test:` Adding tests
- `perf:` Performance improvement
- `style:` Code formatting

Examples:
```
feat: Add user authentication with JWT
fix: Resolve memory leak in data fetching
chore: Update dependencies to latest versions
```

### What to Commit

**NEVER commit**:
- `.env` files (credentials)
- `node_modules/`
- Build artifacts (`.next/`, `dist/`)
- Logs and temporary files
- IDE-specific files (except shared configs)
- Documentation folders (docs/, docs-dev/)
- Test folders (tests/, e2e-tests/)
- Personal notes or drafts
- Sensitive business documents

**ALWAYS commit**:
- Source code (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, `next.config.ts`)
- Public assets (`public/`)
- README.md
- `.gitignore`
- CI/CD configs (`.github/workflows/`)

### .gitignore Template

```gitignore
# Dependencies
/node_modules
/.pnp

# Next.js
/.next/
/out/

# Production
/build

# Environment variables
.env*

# Debug
npm-debug.log*

# IDE
.vscode/*
!.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Documentation (local only)
docs/
docs-dev/
context/

# Tests (local only)
tests/
e2e-tests/
coverage/

# Sensitive files
*.pdf
*.docx
!public/**/*.pdf
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Security headers active
- [ ] Rate limiting configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Analytics configured (if needed)
- [ ] Performance tested (Lighthouse score > 90)

### Environment Variables

```typescript
// lib/env.ts - Validate all env vars
import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  MONGODB_DB: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production'])
})

export const env = envSchema.parse(process.env)
```

---

## 📚 Error Handling

### Client-Side

```typescript
try {
  const response = await fetch('/api/users')
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
} catch (error) {
  console.error('Failed to fetch users:', error)
  toast.error('Failed to load users')
  return null
}
```

### Server-Side

```typescript
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await db.collection('users').find().toArray()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API] GET /api/users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Code Quality Standards

### Linting Rules

```javascript
// eslint.config.js
export default {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error'
  }
}
```

### Code Review Checklist

- [ ] No `any` types
- [ ] All inputs validated
- [ ] Error handling present
- [ ] No hardcoded values (use constants)
- [ ] Proper TypeScript types
- [ ] Accessible UI (WCAG AA)
- [ ] Responsive design
- [ ] Performance optimized
- [ ] Security considerations addressed
- [ ] Tests included (if applicable)

---

## 📖 Documentation

### Component Documentation

```typescript
/**
 * UserCard - Displays user information in a card format
 *
 * @param user - User object with name, email, and avatar
 * @param onEdit - Callback when edit button is clicked
 * @param editable - Whether the card is editable (default: true)
 *
 * @example
 * <UserCard
 *   user={{ name: 'John', email: 'john@example.com' }}
 *   onEdit={(user) => console.log('Edit', user)}
 * />
 */
export function UserCard({ user, onEdit, editable = true }: UserCardProps) {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * GET /api/users
 *
 * Retrieves a paginated list of users
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (optional)
 *
 * Returns:
 * - 200: { success: true, data: User[], total: number }
 * - 401: { error: 'Unauthorized' }
 * - 500: { error: 'Internal server error' }
 */
```

---

## 🎓 Key Principles Summary

1. **Security First** - Never compromise on security
2. **Type Safety** - No `any`, validate everything
3. **Performance Matters** - Optimize from day one
4. **Accessibility is Mandatory** - WCAG AA compliance
5. **Mobile-First** - Design for mobile, enhance for desktop
6. **Test Critical Paths** - 80%+ coverage goal
7. **Clean Code** - Readable, maintainable, documented
8. **Error Resilience** - Handle all failure cases
9. **Production Ready** - Every commit is deployable
10. **Git Hygiene** - Only commit application code

---

## 🔗 Quick Reference

**Environment Setup**:
```bash
npm install
cp .env.example .env.local
npm run dev
```

**Pre-Commit**:
```bash
npm run lint
npx tsc --noEmit
```

**Security Check**:
```bash
git ls-files | grep -i "\.env\|password\|secret"  # Should return nothing
```

**Build**:
```bash
npm run build
npm start
```

---

## 📌 Remember

> "Code is read more often than it is written. Write code for humans first, computers second."

> "Security is not a feature to be added later. It's a foundation to build upon."

> "Performance is not an optimization task. It's a design constraint."

---

**Last Updated**: 2024-10-16
**Version**: 2.0
**Status**: Production-Ready Standards
