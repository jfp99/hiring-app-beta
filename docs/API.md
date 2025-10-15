# Hi-ring API Documentation

## Overview

The Hi-ring API is a RESTful API built with Next.js 15 App Router, providing comprehensive ATS (Applicant Tracking System) and CRM functionality for recruitment management.

## Base URL

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.hi-ring.com`
- **Production**: `https://hi-ring.com`

## Authentication

All API endpoints require authentication via NextAuth.js session cookies. The session cookie is automatically handled by the browser when using the web application.

### Session Cookie

```
Cookie: next-auth.session-token=<token>
```

## Rate Limiting

To prevent abuse, the API implements rate limiting:

- **General endpoints**: 10 requests per minute
- **Authentication endpoints**: 5 requests per minute
- **Heavy operations** (bulk, upload): 5 requests per minute

Rate limit headers are returned in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (1-indexed, default: 1)
- `limit`: Results per page (1-100, default: 20)

Response includes pagination metadata:

```json
{
  "success": true,
  "candidates": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

### Filters

- `search`: Text search across multiple fields
- `status`: Filter by status (comma-separated)
- `experienceLevel`: Filter by experience level (comma-separated)
- `skills`: Filter by skills (comma-separated)
- `assignedTo`: Filter by assigned user ID

### Sorting

- `sortBy`: Field to sort by (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

Example:
```
GET /api/candidates?status=new,contacted&sortBy=createdAt&sortOrder=desc&page=1&limit=20
```

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Status Codes

- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (no session)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `413`: Payload Too Large
- `500`: Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional details or validation errors"
}
```

### Validation Errors

Validation errors include field-specific details:

```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "firstName",
      "message": "First name is required"
    }
  ]
}
```

## Core Endpoints

### Candidates

#### List Candidates
```http
GET /api/candidates
```

Retrieve a paginated list of candidates with optional filtering.

**Query Parameters**:
- `page` (integer): Page number
- `limit` (integer): Results per page
- `search` (string): Text search
- `status` (string): Comma-separated status values
- `experienceLevel` (string): Comma-separated experience levels
- `skills` (string): Comma-separated skills
- `assignedTo` (string): User ID
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort direction

**Response**:
```json
{
  "success": true,
  "candidates": [
    {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "new",
      "experienceLevel": "senior",
      "skills": [
        {"name": "JavaScript", "level": "expert"}
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### Create Candidate
```http
POST /api/candidates
```

Create a new candidate in the system.

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+33612345678",
  "experienceLevel": "senior",
  "source": "LinkedIn",
  "currentPosition": "Frontend Developer",
  "skills": [
    {
      "name": "React",
      "level": "expert",
      "yearsOfExperience": 5
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate created successfully",
  "candidateId": "507f1f77bcf86cd799439011"
}
```

#### Get Candidate
```http
GET /api/candidates/{id}
```

Retrieve detailed information about a specific candidate.

**Response**:
```json
{
  "success": true,
  "candidate": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+33612345678",
    "experienceLevel": "senior",
    "status": "interview_scheduled",
    "skills": [...],
    "workExperience": [...],
    "education": [...],
    "interviews": [...],
    "notes": [...],
    "activities": [...],
    "tags": ["javascript", "senior-developer"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

#### Update Candidate
```http
PUT /api/candidates/{id}
```

Update an existing candidate's information.

**Request Body**:
```json
{
  "status": "interview_completed",
  "overallRating": 4.5,
  "tags": ["javascript", "senior-developer", "strong-communicator"]
}
```

#### Delete Candidate
```http
DELETE /api/candidates/{id}?permanent=false
```

Soft delete (default) or permanently delete a candidate.

**Query Parameters**:
- `permanent` (boolean): If true, permanently delete candidate and related data

#### Bulk Update Candidates
```http
POST /api/candidates/bulk
```

Perform bulk operations on multiple candidates.

**Request Body**:
```json
{
  "candidateIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "action": "updateStatus",
  "data": {
    "status": "contacted"
  }
}
```

**Actions**:
- `updateStatus`: Update status for all candidates
- `assignTo`: Assign candidates to a user
- `addTags`: Add tags to candidates
- `delete`: Soft delete candidates

### Interviews

#### List Candidate Interviews
```http
GET /api/candidates/{id}/interviews
```

Retrieve all interviews for a specific candidate.

#### Schedule Interview
```http
POST /api/candidates/{id}/interviews
```

Schedule a new interview for a candidate.

**Request Body**:
```json
{
  "title": "Technical Interview - Full Stack",
  "scheduledDate": "2024-02-15T14:00:00Z",
  "duration": 90,
  "type": "technical",
  "interviewers": ["507f1f77bcf86cd799439013"],
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

#### Submit Interview Feedback
```http
POST /api/candidates/{candidateId}/interviews/{interviewId}/feedback
```

Submit feedback after completing an interview.

**Request Body**:
```json
{
  "recommendation": "hire",
  "summary": "Strong technical skills, good cultural fit",
  "ratings": {
    "technical": 5,
    "communication": 4,
    "problemSolving": 5,
    "cultureFit": 4,
    "motivation": 5,
    "teamwork": 4
  },
  "strengths": [
    "Excellent React and TypeScript knowledge",
    "Strong problem-solving approach"
  ],
  "weaknesses": [
    "Limited backend experience"
  ]
}
```

### Documents

#### Upload Document
```http
POST /api/documents
Content-Type: multipart/form-data
```

Upload a document (resume, cover letter, etc.).

**Form Data**:
- `file`: File to upload (max 10MB)
- `entityType`: `candidate`, `interview`, or `task`
- `entityId`: ID of the related entity
- `type`: `resume`, `cover_letter`, `portfolio`, `certificate`, or `other`

**Response**:
```json
{
  "success": true,
  "documentId": "507f1f77bcf86cd799439014",
  "url": "https://storage.hi-ring.com/documents/resume-123.pdf"
}
```

### Workflows

#### List Workflows
```http
GET /api/workflows
```

Retrieve all workflow automations.

#### Create Workflow
```http
POST /api/workflows
```

Create a new workflow automation.

**Request Body**:
```json
{
  "name": "Auto-assign new candidates",
  "trigger": {
    "event": "candidate_created",
    "conditions": [
      {
        "field": "experienceLevel",
        "operator": "equals",
        "value": "senior"
      }
    ]
  },
  "actions": [
    {
      "type": "assign_to",
      "config": {
        "userId": "507f1f77bcf86cd799439013"
      }
    },
    {
      "type": "send_email",
      "config": {
        "templateId": "new-candidate-notification"
      }
    }
  ],
  "isActive": true
}
```

## Data Types

### Candidate Status

```typescript
enum CandidateStatus {
  NEW = 'new'
  CONTACTED = 'contacted'
  SCREENING = 'screening'
  INTERVIEW_SCHEDULED = 'interview_scheduled'
  INTERVIEW_COMPLETED = 'interview_completed'
  OFFER_SENT = 'offer_sent'
  OFFER_ACCEPTED = 'offer_accepted'
  OFFER_REJECTED = 'offer_rejected'
  HIRED = 'hired'
  REJECTED = 'rejected'
  ON_HOLD = 'on_hold'
  ARCHIVED = 'archived'
}
```

### Experience Level

```typescript
enum ExperienceLevel {
  ENTRY = 'entry'
  JUNIOR = 'junior'
  MID = 'mid'
  SENIOR = 'senior'
  LEAD = 'lead'
  EXECUTIVE = 'executive'
}
```

### Skill Level

```typescript
enum SkillLevel {
  BEGINNER = 'beginner'
  INTERMEDIATE = 'intermediate'
  ADVANCED = 'advanced'
  EXPERT = 'expert'
}
```

### Interview Type

```typescript
enum InterviewType {
  PHONE = 'phone'
  VIDEO = 'video'
  IN_PERSON = 'in_person'
  TECHNICAL = 'technical'
  HR = 'hr'
}
```

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:

- **File**: `openapi.yaml`
- **Interactive docs**: Available at `/api/docs` (coming soon)

You can use the OpenAPI spec with tools like:
- **Swagger UI**: Interactive API documentation
- **Postman**: Import the spec to generate a collection
- **Code generators**: Generate client SDKs

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const response = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidateData)
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('API Error:', error)
    // Handle error
  }

  const data = await response.json()
  // Handle success
} catch (error) {
  console.error('Network error:', error)
  // Handle network error
}
```

### 2. Use Pagination for Large Lists

```typescript
// Fetch all candidates in pages
async function fetchAllCandidates() {
  const allCandidates = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetch(
      `/api/candidates?page=${page}&limit=100`
    )
    const data = await response.json()

    allCandidates.push(...data.candidates)
    hasMore = page < data.totalPages
    page++
  }

  return allCandidates
}
```

### 3. Implement Retry Logic

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error
    }

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
  }
}
```

### 4. Optimize Requests

```typescript
// Bad: Multiple sequential requests
const candidate = await fetchCandidate(id)
const interviews = await fetchInterviews(id)
const documents = await fetchDocuments(id)

// Good: Parallel requests
const [candidate, interviews, documents] = await Promise.all([
  fetchCandidate(id),
  fetchInterviews(id),
  fetchDocuments(id)
])
```

## Rate Limiting Best Practices

### 1. Check Rate Limit Headers

```typescript
const response = await fetch('/api/candidates')
const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0')

if (remaining < 10) {
  console.warn('Approaching rate limit')
}
```

### 2. Handle Rate Limit Errors

```typescript
const response = await fetch('/api/candidates')

if (response.status === 429) {
  const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0')
  const waitTime = reset - Date.now()

  console.log(`Rate limited. Retry after ${waitTime}ms`)
  await new Promise(resolve => setTimeout(resolve, waitTime))

  // Retry request
  return fetch('/api/candidates')
}
```

## Security Considerations

### 1. HTTPS Only

Always use HTTPS in production to protect session cookies and sensitive data.

### 2. CORS

The API implements CORS with strict origin checking. Cross-origin requests are only allowed from whitelisted domains.

### 3. Input Validation

All inputs are validated using Zod schemas. Never trust client-side validation alone.

### 4. SQL/NoSQL Injection Prevention

All database queries use parameterized queries to prevent injection attacks.

### 5. Rate Limiting

Rate limiting prevents abuse and DoS attacks. Implement exponential backoff when retrying.

### 6. GDPR Compliance

The API provides endpoints for:
- Data export (`GET /api/gdpr/export`)
- Data deletion (`DELETE /api/gdpr/delete`)
- Consent management

## Support

For API support and questions:
- **Email**: dev@hi-ring.com
- **Documentation**: https://docs.hi-ring.com
- **GitHub Issues**: https://github.com/hi-ring/api/issues
