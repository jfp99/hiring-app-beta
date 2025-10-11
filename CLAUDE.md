# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hi-ring is a Next.js 15 recruitment platform built with TypeScript, MongoDB, and NextAuth.js. The application connects job seekers (candidats) with companies (entreprises) through job postings (offres), contact forms, and newsletter subscriptions.

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
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - MongoDB database name
- `NEXTAUTH_SECRET` - NextAuth secret for JWT signing
- `NEXTAUTH_URL` - Base URL for NextAuth callbacks

## Architecture Overview

### Database Schema (MongoDB Collections)

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

### Authentication System

NextAuth.js with credentials provider:
- Hardcoded admin credentials in `src/app/lib/auth.ts` (email: admin@example.com, password: admin123)
- JWT-based sessions with role stored in token
- Protected routes use `middleware.ts` to check authentication
- Admin pages wrapped in `<AdminGuard>` component for client-side protection
- Admin login at `/admin/login`, admin dashboard at `/admin`

### API Route Structure

All API routes follow this pattern:
- Location: `src/app/api/[resource]/route.ts`
- Standard format: Export `GET`, `POST`, `PUT`, `DELETE` as needed
- Use `connectToDatabase()` from `@/app/lib/mongodb`
- Error handling via `handleError()` from `@/app/lib/errorHandler`
- Validation using Zod schemas from `@/app/lib/validation`

Key endpoints:
- `/api/jobs` - GET jobs with query params: `search`, `categorie`, `lieu`, `typeContrat`
- `/api/jobs/[id]` - GET/PUT/DELETE single job
- `/api/contacts` - POST contact form submissions
- `/api/newsletters` - POST newsletter subscriptions
- `/api/offres` - POST new job offers (admin)
- `/api/candidats` - GET candidat contacts
- `/api/entreprises` - GET entreprise contacts

### Frontend Patterns

**Client-side API calls**: Use the `useApi()` hook from `src/app/hooks/useApi.ts`
```typescript
const { loading, error, callApi } = useApi()
const data = await callApi('/jobs', { method: 'GET' })
```

**Session management**: Wrap client components with `'use client'` and use NextAuth hooks
```typescript
import { useSession } from 'next-auth/react'
const { data: session, status } = useSession()
```

**Admin protection**: Wrap admin pages with `<AdminGuard>` component

### Validation Schemas

Located in `src/app/lib/validation.ts`:
- `offreSchema` - Job offer validation (titre, entreprise, lieu, typeContrat, etc.)
- `contactSchema` - Contact form validation
- `newsletterSchema` - Newsletter subscription validation

### Error Handling

Custom error classes in `src/app/lib/errorHandler.ts`:
- `AppError` - Base operational error
- `ValidationError` - Zod validation failures
- `AuthenticationError` - 401 errors
- `AuthorizationError` - 403 errors

Use `handleError()` to convert errors to API responses with proper status codes.

### MongoDB Connection Pattern

Always use the cached connection from `src/app/lib/mongodb.ts`:
```typescript
const { db } = await connectToDatabase()
const collection = db.collection('collectionName')
```

The connection is cached globally to prevent connection exhaustion in serverless environments.

### Type Definitions

Core types in `src/app/types/index.ts`:
- `ContactForm` - Contact submission with discriminated union for type
- `Newsletter` - Email subscription
- `JobOffer` - Full job posting with all fields
- `NewJobOffer` - Job creation payload (without _id, timestamps)

## Important Notes

- This is a Next.js App Router project (not Pages Router)
- All pages use Server Components by default; add `'use client'` only when needed
- Path alias `@/*` maps to `./src/*`
- French language UI (validation messages, content)
- TypeScript strict mode enabled
- Tailwind CSS with custom color palette (check components for color references)
- Console logging uses emoji prefixes for easy debugging (🔍, ✅, ❌, 📋, etc.)
