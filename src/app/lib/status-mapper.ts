// src/app/lib/status-mapper.ts
// Maps application statuses to MongoDB-compatible statuses

import { CandidateStatus } from '@/app/types/candidates'

// MongoDB only allows these status values in its schema
export const MONGODB_ALLOWED_STATUSES = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  ON_HOLD: 'on-hold'
} as const

// Map our app statuses to MongoDB-compatible statuses
export function toMongoStatus(appStatus: CandidateStatus): string {
  const mapping: Record<CandidateStatus, string> = {
    [CandidateStatus.NEW]: MONGODB_ALLOWED_STATUSES.NEW,
    [CandidateStatus.CONTACTED]: MONGODB_ALLOWED_STATUSES.SCREENING,
    [CandidateStatus.SCREENING]: MONGODB_ALLOWED_STATUSES.SCREENING,
    [CandidateStatus.INTERVIEW_SCHEDULED]: MONGODB_ALLOWED_STATUSES.INTERVIEWING,
    [CandidateStatus.INTERVIEW_COMPLETED]: MONGODB_ALLOWED_STATUSES.INTERVIEWING,
    [CandidateStatus.OFFER_SENT]: MONGODB_ALLOWED_STATUSES.OFFERED,
    [CandidateStatus.OFFER_ACCEPTED]: MONGODB_ALLOWED_STATUSES.OFFERED,
    [CandidateStatus.OFFER_REJECTED]: MONGODB_ALLOWED_STATUSES.REJECTED,
    [CandidateStatus.HIRED]: MONGODB_ALLOWED_STATUSES.HIRED,
    [CandidateStatus.REJECTED]: MONGODB_ALLOWED_STATUSES.REJECTED,
    [CandidateStatus.ON_HOLD]: MONGODB_ALLOWED_STATUSES.ON_HOLD,
    [CandidateStatus.ARCHIVED]: MONGODB_ALLOWED_STATUSES.ON_HOLD
  }

  return mapping[appStatus] || MONGODB_ALLOWED_STATUSES.NEW
}

// Map MongoDB status back to app status (when reading from DB)
// This is optional - we'll store the real status in appStatus field
export function fromMongoStatus(mongoStatus: string): CandidateStatus {
  // This is a reverse mapping - but since multiple app statuses map to one mongo status,
  // we can't reliably reverse it. We'll use a separate field for the real status.
  const mapping: Record<string, CandidateStatus> = {
    [MONGODB_ALLOWED_STATUSES.NEW]: CandidateStatus.NEW,
    [MONGODB_ALLOWED_STATUSES.SCREENING]: CandidateStatus.SCREENING,
    [MONGODB_ALLOWED_STATUSES.INTERVIEWING]: CandidateStatus.INTERVIEW_SCHEDULED,
    [MONGODB_ALLOWED_STATUSES.OFFERED]: CandidateStatus.OFFER_SENT,
    [MONGODB_ALLOWED_STATUSES.HIRED]: CandidateStatus.HIRED,
    [MONGODB_ALLOWED_STATUSES.REJECTED]: CandidateStatus.REJECTED,
    [MONGODB_ALLOWED_STATUSES.ON_HOLD]: CandidateStatus.ON_HOLD
  }

  return mapping[mongoStatus] || CandidateStatus.NEW
}
