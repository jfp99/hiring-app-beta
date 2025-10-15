# Hi-Ring Application Architecture

**Project**: Hi-Ring - Recruitment Platform (ATS/CRM)
**Framework**: Next.js 15.5.4 (App Router)
**Language**: TypeScript
**Database**: MongoDB
**Authentication**: NextAuth.js
**Styling**: Tailwind CSS v4

---

## Table of Contents

- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Core Architecture](#core-architecture)
- [File Organization](#file-organization)
- [Key Components](#key-components)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Configuration Files](#configuration-files)
- [Development Workflow](#development-workflow)

---

## Project Overview

Hi-Ring is a comprehensive recruitment platform combining Applicant Tracking System (ATS) and Customer Relationship Management (CRM) features. The application enables:

- **Candidate Management**: Full lifecycle tracking from application to hire
- **Pipeline Visualization**: Kanban-style candidate pipeline
- **Interview Scheduling**: Calendar integration and feedback management
- **Email Integration**: Template-based communication system
- **Document Management**: Resume parsing and document storage
- **Workflow Automation**: Custom workflow triggers and actions
- **Analytics Dashboard**: Recruitment metrics and insights

---

## Directory Structure

```
hiring-app/
├── .claude/                    # Claude Code configuration
│   └── agents/                # Custom agent definitions
├── .github/                    # GitHub configuration
│   └── workflows/             # CI/CD workflows
├── .husky/                     # Git hooks
├── .playwright-mcp/           # Playwright test artifacts
├── context/                    # AI context files
├── coverage/                   # Test coverage reports
├── docs/                       # User-facing documentation
├── docs-dev/                   # Development documentation (reports, audits)
├── node_modules/              # Dependencies (ignored)
├── public/                     # Static assets
│   ├── logo-hiring.png        # Application logo
│   └── assets/                # Images, icons
├── scripts/                    # Build and utility scripts
├── src/                        # Source code
│   └── app/                   # Next.js App Router
│       ├── admin/             # Admin dashboard pages
│       ├── api/               # API routes
│       ├── auth/              # Authentication pages
│       ├── candidate/         # Candidate portal
│       ├── candidates/        # Candidate management pages
│       ├── components/        # React components
│       ├── contact/           # Contact page
│       ├── contexts/          # React contexts
│       ├── dashboard/         # Main dashboard
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utility libraries
│       ├── offres-emploi/     # Job listings
│       ├── services/          # Business logic services
│       ├── types/             # TypeScript type definitions
│       ├── vision/            # Vision page
│       ├── globals.css        # Global styles
│       ├── layout.tsx         # Root layout
│       ├── page.tsx           # Homepage
│       └── providers.tsx      # Context providers
├── test-resumes/              # Sample resume files for testing
├── tests/                      # Test files
│   ├── api/                   # API tests
│   ├── lib/                   # Library tests
│   └── services/              # Service tests
├── uploads/                    # User-uploaded files
│   ├── avatars/               # User avatars
│   ├── documents/             # General documents
│   ├── resumes/               # Candidate resumes
│   └── temp/                  # Temporary uploads
├── .env.local                  # Environment variables (not committed)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── ARCHITECTURE.md             # This file
├── CLAUDE.md                   # Project instructions for Claude Code
├── README.md                   # Project readme
├── eslint.config.mjs           # ESLint configuration
├── middleware.ts               # Next.js middleware
├── next.config.ts              # Next.js configuration
├── openapi.yaml                # OpenAPI specification
├── package.json                # Dependencies and scripts
├── postcss.config.cjs          # PostCSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Core Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────┐
│           Next.js App Router                │
├─────────────────────────────────────────────┤
│  Pages (Server Components by default)       │
│    ├── Public Pages (/, /vision, /contact)  │
│    ├── Auth Pages (/auth/login)             │
│    ├── Admin Dashboard (/admin/*)           │
│    └── Candidate Management (/candidates/*) │
├─────────────────────────────────────────────┤
│  Client Components ('use client')           │
│    ├── Interactive Forms                    │
│    ├── Kanban Board                         │
│    ├── Modal Dialogs                        │
│    └── Real-time Notifications              │
├─────────────────────────────────────────────┤
│  Contexts (Global State)                    │
│    ├── ThemeContext (Dark/Light mode)       │
│    └── NotificationContext                  │
├─────────────────────────────────────────────┤
│  Custom Hooks                                │
│    ├── useApi (API calls)                   │
│    ├── useDebouncedValue                    │
│    └── useLocalStorage                      │
└─────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────┐
│         API Routes (/api/*)                 │
├─────────────────────────────────────────────┤
│  Route Handlers                              │
│    ├── GET /api/candidates                  │
│    ├── POST /api/candidates                 │
│    ├── PUT /api/candidates/[id]             │
│    └── DELETE /api/candidates/[id]          │
├─────────────────────────────────────────────┤
│  Middleware Layer                            │
│    ├── Authentication (NextAuth.js)         │
│    ├── Rate Limiting                        │
│    └── Validation (Zod)                     │
├─────────────────────────────────────────────┤
│  Service Layer                               │
│    ├── CandidateService                     │
│    ├── InterviewService                     │
│    ├── EmailService                         │
│    └── WorkflowService                      │
├─────────────────────────────────────────────┤
│  Data Access Layer                           │
│    ├── MongoDB Connection Pool              │
│    └── Collection Queries                   │
└─────────────────────────────────────────────┘
```

### Database Architecture

```
MongoDB Database
├── candidates        # Main candidate records
├── interviews        # Interview schedules & feedback
├── tasks             # To-do items and reminders
├── comments          # Threaded comments on candidates
├── notifications     # User notifications
├── workflows         # Automation rules
├── customFields      # Custom field definitions
├── offres            # Job postings
├── contacts          # Contact form submissions
├── newsletters       # Newsletter subscriptions
├── users             # Admin users
└── emailTemplates    # Email templates
```

---

## File Organization

### `/src/app/` Structure

#### Pages

| Path | Purpose | Type |
|------|---------|------|
| `/` | Homepage (public) | Server Component |
| `/vision` | Company vision page | Server Component |
| `/contact` | Contact form | Client Component |
| `/offres-emploi` | Job listings | Server Component |
| `/admin` | Admin dashboard | Protected |
| `/admin/analytics` | Analytics dashboard | Protected |
| `/admin/workflows` | Workflow management | Protected |
| `/candidates` | Candidate list | Protected |
| `/candidates/[id]` | Candidate detail | Protected |
| `/candidates/pipeline` | Kanban pipeline | Protected |

#### API Routes Structure

```
/api/
├── auth/
│   └── [...nextauth]/route.ts      # NextAuth.js handlers
├── candidates/
│   ├── route.ts                    # List/Create candidates
│   ├── bulk/route.ts               # Bulk operations
│   ├── parse-resume/route.ts       # Resume parsing
│   └── [id]/
│       ├── route.ts                # Get/Update/Delete
│       ├── notes/route.ts          # Candidate notes
│       ├── quick-scores/route.ts   # Quick evaluation
│       └── interviews/
│           ├── route.ts            # List/Create interviews
│           └── [interviewId]/
│               ├── route.ts        # Get/Update/Delete
│               ├── feedback/route.ts # Interview feedback
│               └── calendar/route.ts # Calendar integration
├── comments/
│   ├── route.ts                    # Create comment
│   └── [id]/route.ts               # Update/Delete comment
├── contacts/route.ts                # Contact form submissions
├── custom-fields/
│   ├── route.ts                    # List/Create custom fields
│   └── [id]/route.ts               # Update/Delete custom field
├── documents/
│   ├── route.ts                    # Upload documents
│   └── [id]/route.ts               # Download/Delete document
├── email-templates/
│   ├── route.ts                    # List/Create templates
│   └── [id]/
│       ├── route.ts                # Get/Update/Delete
│       └── send/route.ts           # Send email from template
├── jobs/
│   ├── route.ts                    # List/Create jobs
│   └── [id]/route.ts               # Get/Update/Delete job
├── newsletters/route.ts             # Newsletter subscriptions
├── notifications/
│   ├── route.ts                    # List/Create notifications
│   └── [id]/route.ts               # Mark as read/Delete
├── tasks/
│   ├── route.ts                    # List/Create tasks
│   └── [id]/route.ts               # Update/Delete task
├── upload/route.ts                  # File upload handler
├── users/
│   ├── route.ts                    # List/Create users
│   └── search/route.ts             # Search users
└── workflows/
    ├── route.ts                    # List/Create workflows
    ├── templates/route.ts          # Workflow templates
    └── [id]/route.ts               # Get/Update/Delete workflow
```

---

## Key Components

### UI Components (`/src/app/components/`)

#### Core Components

- **Header.tsx**: Navigation bar with dark mode toggle
- **Footer.tsx**: Site footer with newsletter subscription
- **ThemeToggle.tsx**: Dark/light mode switcher
- **AdminHeader.tsx**: Admin dashboard navigation
- **AdminGuard.tsx**: Protected route wrapper

#### Candidate Management

- **CandidateCard.tsx**: Candidate summary card
- **KanbanColumn.tsx**: Pipeline column component
- **BulkActionsToolbar.tsx**: Bulk operation controls
- **QuickScoreForm.tsx**: Quick evaluation form
- **QuickScoreDisplay.tsx**: Score visualization
- **CustomFieldDisplay.tsx**: Dynamic field display
- **CustomFieldInput.tsx**: Dynamic field input

#### Interview Management

- **InterviewScheduler.tsx**: Interview scheduling UI
- **InterviewFeedbackForm.tsx**: Feedback collection
- **InterviewFeedbackDisplay.tsx**: Feedback visualization

#### Communication

- **CommentForm.tsx**: Add comments
- **CommentThread.tsx**: Threaded comment display
- **EmailComposer.tsx**: Email composition UI
- **NotificationBell.tsx**: Notification dropdown

#### Document Management

- **FileUpload.tsx**: Generic file uploader
- **ResumeUploader.tsx**: Resume-specific uploader
- **DocumentManager.tsx**: Document list and actions

#### Utilities

- **Modal.tsx**: Reusable modal dialog
- **SearchBar.tsx**: Search with filters
- **SavedFiltersDropdown.tsx**: Saved filter management
- **TagInput.tsx**: Tag creation and management
- **Loading.tsx**: Loading states
- **Error.tsx**: Error states

#### UI Primitives (`/components/ui/`)

- **Button.tsx**: Styled button component
- **Badge.tsx**: Status badges
- **Card.tsx**: Container cards
- **Input.tsx**: Form inputs
- **EmptyState.tsx**: Empty state messages
- **CandidateListSkeleton.tsx**: Loading skeletons

---

## API Routes

### Authentication

```typescript
// NextAuth.js configuration
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
GET  /api/auth/providers
```

### Candidates

```typescript
GET    /api/candidates              # List candidates (with filters)
POST   /api/candidates              # Create candidate
GET    /api/candidates/[id]         # Get candidate details
PUT    /api/candidates/[id]         # Update candidate
DELETE /api/candidates/[id]         # Delete candidate
POST   /api/candidates/bulk         # Bulk operations
POST   /api/candidates/parse-resume # Parse resume file
```

### Interviews

```typescript
GET    /api/candidates/[id]/interviews                    # List interviews
POST   /api/candidates/[id]/interviews                    # Schedule interview
GET    /api/candidates/[id]/interviews/[interviewId]      # Get interview
PUT    /api/candidates/[id]/interviews/[interviewId]      # Update interview
DELETE /api/candidates/[id]/interviews/[interviewId]      # Cancel interview
POST   /api/candidates/[id]/interviews/[interviewId]/feedback # Add feedback
GET    /api/candidates/[id]/interviews/[interviewId]/calendar # iCal export
```

### Comments

```typescript
GET    /api/comments           # List comments
POST   /api/comments           # Create comment
PUT    /api/comments/[id]      # Update comment
DELETE /api/comments/[id]      # Delete comment
```

### Tasks

```typescript
GET    /api/tasks              # List tasks
POST   /api/tasks              # Create task
PUT    /api/tasks/[id]         # Update task
DELETE /api/tasks/[id]         # Delete task
```

### Workflows

```typescript
GET    /api/workflows              # List workflows
POST   /api/workflows              # Create workflow
GET    /api/workflows/templates    # Get workflow templates
GET    /api/workflows/[id]         # Get workflow
PUT    /api/workflows/[id]         # Update workflow
DELETE /api/workflows/[id]         # Delete workflow
```

---

## Database Schema

### Collections Overview

#### candidates

Primary candidate data structure:

```typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,                  // Unique index
  phone?: string,
  linkedinUrl?: string,
  portfolioUrl?: string,
  status: CandidateStatus,        // Indexed
  appStatus?: ApplicationStatus,
  currentPosition?: string,
  experienceLevel?: string,
  yearsOfExperience?: number,
  desiredSalary?: number,
  skills: Skill[],
  tags: string[],                 // Indexed
  assignedTo?: string,            // Indexed
  source?: string,
  resumeUrl?: string,
  resumeParsedData?: object,
  technicalRating?: number,
  culturalRating?: number,
  overallRating?: number,         // Indexed
  customFields?: object,
  activityLog: Activity[],
  createdBy: string,
  createdAt: string,              // Indexed
  updatedAt: string,
  lastActivityAt?: string
}
```

#### interviews

Interview scheduling and feedback:

```typescript
{
  _id: ObjectId,
  candidateId: string,            // Indexed with scheduledDate
  title: string,
  scheduledDate: Date,
  interviewers: string[],         // Indexed
  location?: string,
  meetingLink?: string,
  status: 'scheduled' | 'completed' | 'cancelled',
  type: 'phone' | 'video' | 'onsite' | 'technical',
  feedback?: {
    rating: number,
    technicalSkills: number,
    communication: number,
    culturalFit: number,
    comments: string,
    recommendation: 'hire' | 'maybe' | 'pass',
    submittedBy: string,
    submittedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

```javascript
// candidates
db.candidates.createIndexes([
  { email: 1 },                           // Unique
  { status: 1, createdAt: -1 },
  { firstName: 'text', lastName: 'text', email: 'text' },
  { 'skills.name': 1 },
  { assignedTo: 1 },
  { tags: 1 },
  { overallRating: 1 }
])

// interviews
db.interviews.createIndexes([
  { candidateId: 1, scheduledDate: -1 },
  { interviewers: 1 }
])

// tasks
db.tasks.createIndexes([
  { candidateId: 1 },
  { assignedTo: 1, status: 1, dueDate: 1 }
])
```

---

## Configuration Files

### Next.js Configuration (`next.config.ts`)

```typescript
{
  images: {
    remotePatterns: ['https://images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85, 90, 95, 100]
  },
  headers: [
    // Security headers (HSTS, CSP, etc.)
  ]
}
```

### PostCSS Configuration (`postcss.config.cjs`)

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}  // Tailwind v4
  }
}
```

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Environment Variables (`.env.local`)

Required variables:

```bash
# Database
MONGODB_URI=mongodb://...
MONGODB_DB=hiring-app

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Optional
SENDGRID_API_KEY=...
AZURE_STORAGE_CONNECTION_STRING=...
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev         # localhost:3000

# Build for production
npm run build

# Run tests
npm test
npm run test:coverage

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Git Hooks (Husky)

- **pre-commit**: Runs linting and type checking
- **commit-msg**: Validates commit message format

### Testing Strategy

```
tests/
├── api/           # API endpoint tests
├── lib/           # Utility function tests
└── services/      # Business logic tests
```

Coverage target: 80% overall

---

## Security Practices

### Authentication

- NextAuth.js with JWT sessions
- Role-based access control (RBAC)
- Admin guard middleware

### Input Validation

- Zod schemas for all API inputs
- String sanitization (HTML/JS stripping)
- Regex escaping for MongoDB queries

### Rate Limiting

- 10 requests/minute (general)
- 5 requests/minute (auth endpoints)

### Security Headers

- HSTS, CSP, X-Frame-Options
- NoSniff, XSS Protection

---

## Performance Optimizations

### Image Optimization

- Next.js Image component with AVIF/WebP
- Lazy loading for below-fold images
- Responsive sizes attributes

### Font Optimization

- next/font for Google Fonts
- Font display: swap
- Preconnect hints

### LCP Optimization

- fetchPriority="high" on hero images
- Resource hints (preconnect, dns-prefetch)
- Optimized image formats and quality

### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting (automatic)

---

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment

- **Recommended**: Vercel (Next.js optimizations)
- **Alternative**: Docker + Node.js server
- **Database**: MongoDB Atlas (recommended)

### Environment Variables

Set all required variables in production:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

---

## Documentation

### User Documentation

Location: `/docs/`

- API.md - API reference
- DEMO-GUIDE.md - User guide
- TESTING-GUIDE.md - Testing documentation

### Development Documentation

Location: `/docs-dev/`

- AUDIT_REPORT.md - Security audit
- LCP_OPTIMIZATION_REPORT.md - Performance optimization
- FINAL_TEST_REPORT.md - Test results
- TECHNICAL_AUDIT_REPORT.md - Technical review

### Code Documentation

- CLAUDE.md - AI assistant instructions
- README.md - Project overview
- ARCHITECTURE.md - This file

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.5.4 |
| Language | TypeScript | Latest |
| Database | MongoDB | 8.x |
| Auth | NextAuth.js | Latest |
| Styling | Tailwind CSS | v4 |
| Validation | Zod | Latest |
| Testing | Vitest + Playwright | Latest |
| Deployment | Vercel | N/A |

---

**Last Updated**: 2025-10-15
**Maintained By**: Development Team
**Version**: 1.0.0
