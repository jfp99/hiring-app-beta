# Quick Scorecard Feature Guide

## Overview

The Quick Scorecard system allows recruiters to evaluate candidates in 30 seconds or less, providing a fast alternative to the comprehensive interview feedback process. Multiple team members can score the same candidate, and ratings are automatically aggregated.

**Status**: ✅ Fully Implemented (January 2025)

## Why Quick Scorecards?

**Problem**: The full interview feedback form is comprehensive but takes 5+ minutes to complete. Sometimes you need a quick "yes/no" decision or want to capture first impressions.

**Solution**: Quick Scorecards provide:
- ⚡ **30-second evaluation** - Just select stars and click save
- 🎯 **Binary recommendations** - Thumbs up/down for quick decisions
- 📊 **Team consensus** - Multiple evaluators, automatic averaging
- 📈 **Visible on cards** - Ratings appear on Kanban board cards

## Features

### 1. Simple Star Rating (Required)
- Overall rating from 1-5 stars
- Click to select, visual feedback
- Required field - can't submit without it

### 2. Binary Recommendation
- 👍 **Recommandé** - Yes, move forward
- 🤔 **Peut-être** - Neutral/unsure
- 👎 **Non recommandé** - Pass on this candidate

### 3. Optional Category Ratings
Expandable section for detailed scoring:
- 💻 **Technique** - Technical skills (1-5 stars)
- 🎯 **Culture Fit** - Company culture alignment (1-5 stars)
- 💬 **Communication** - Communication skills (1-5 stars)

### 4. Quick Notes
- Text field for brief impressions
- 200 character limit
- Optional but recommended

### 5. Quick Tags
Pre-defined tags for fast categorization:
- "Strong technical"
- "Culture fit"
- "Great communication"
- "Motivated"
- "Team player"
- "Leadership potential"
- "Needs improvement"
- "Overqualified"
- "Underqualified"
- "Good fit"

## How to Use

### Adding a Quick Score

1. **Navigate to Candidate Profile**
   - Click on any candidate card in the Kanban board
   - OR use the direct URL: `/candidates/[id]`

2. **Open Quick Score Form**
   - Click the **"⚡ Évaluation Rapide"** button in the top-right header
   - OR switch to the **"Évaluations"** tab and click **"+ Nouvelle Évaluation"**

3. **Fill Out the Form (30 seconds)**
   ```
   Required:
   ✓ Overall rating (1-5 stars)

   Optional:
   - Binary recommendation (thumbs)
   - Category ratings (technical, culture fit, communication)
   - Quick notes (max 200 chars)
   - Quick tags (select multiple)
   ```

4. **Submit**
   - Click **"✓ Enregistrer l'Évaluation"**
   - Form closes automatically
   - Ratings recalculate immediately
   - Activity log updated

### Viewing Quick Scores

#### On Candidate Cards (Kanban Board)
```
┌─────────────────────────────┐
│ John Doe                 ★ 4.2│
│ Senior Developer      3 évals│
│ ...                          │
└─────────────────────────────┘
```

#### On Candidate Profile - "Évaluations" Tab

**Summary Card**:
- Average overall rating (aggregated from all evaluations)
- Average category ratings (if any evaluations included them)
- Thumbs up/down/neutral counts
- Total number of evaluations

**Individual Evaluations**:
- Evaluator name and date
- Star ratings
- Thumbs recommendation
- Quick notes
- Tags
- Sorted newest first

## Technical Implementation

### Architecture

```
User Action → QuickScoreForm (Client)
              ↓
         POST /api/candidates/[id]/quick-scores
              ↓
         MongoDB Update:
         1. Add quickScore to candidate.quickScores[]
         2. Add activity log entry
         3. Recalculate average ratings
         4. Update candidate.overallRating
              ↓
         Return to Client → Refresh UI
```

### Database Schema

#### QuickScore Object
```typescript
{
  id: string                    // Generated: timestamp + random
  scoredBy: string              // User ID/email
  scoredByName: string          // Display name
  scoredAt: string              // ISO timestamp
  overallRating: 1 | 2 | 3 | 4 | 5
  technicalRating?: 1 | 2 | 3 | 4 | 5
  cultureFitRating?: 1 | 2 | 3 | 4 | 5
  communicationRating?: 1 | 2 | 3 | 4 | 5
  quickNotes?: string           // Max 200 chars
  tags?: string[]
  thumbs?: 'up' | 'down' | 'neutral'
}
```

#### Candidate Document (MongoDB)
```javascript
{
  // ... other fields
  quickScores: [QuickScore],    // Array of all evaluations
  overallRating: 3.8,           // Auto-calculated average
  technicalRating: 4.2,         // Average of all technicalRatings
  culturalFitRating: 3.5,       // Average of all cultureFitRatings
  communicationRating: 4.0      // Average of all communicationRatings
}
```

### Automatic Rating Calculation

When a new quick score is submitted, the API automatically:

1. **Adds the score** to `candidate.quickScores[]`
2. **Calculates overall average**:
   ```javascript
   avgOverall = sum(quickScores.map(s => s.overallRating)) / quickScores.length
   ```
3. **Calculates category averages** (only if that category has scores):
   ```javascript
   technicalScores = quickScores.filter(s => s.technicalRating)
   avgTechnical = sum(technicalScores) / technicalScores.length
   ```
4. **Updates candidate document** with new averages
5. **Adds activity log** entry

### Files Modified/Created

**New Files**:
- `src/app/components/QuickScoreForm.tsx` (290 lines)
- `src/app/components/QuickScoreDisplay.tsx` (230 lines)
- `src/app/api/candidates/[id]/quick-scores/route.ts` (168 lines)

**Modified Files**:
- `src/app/types/candidates.ts` - Added QuickScore interface
- `src/app/candidates/[id]/page.tsx` - Integrated form and display
- `src/app/components/CandidateCard.tsx` - Show rating count

## API Endpoints

### POST /api/candidates/[id]/quick-scores
Add a quick score evaluation.

**Request Body**:
```json
{
  "overallRating": 4,
  "technicalRating": 5,
  "cultureFitRating": 4,
  "communicationRating": 3,
  "quickNotes": "Strong technical skills, great culture fit",
  "tags": ["Strong technical", "Culture fit", "Motivated"],
  "thumbs": "up"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "quickScore": {
    "id": "1704123456789abc",
    "scoredBy": "user@example.com",
    "scoredByName": "John Recruiter",
    "scoredAt": "2025-01-11T10:30:00.000Z",
    "overallRating": 4,
    "technicalRating": 5,
    "cultureFitRating": 4,
    "communicationRating": 3,
    "quickNotes": "Strong technical skills, great culture fit",
    "tags": ["Strong technical", "Culture fit", "Motivated"],
    "thumbs": "up"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Overall rating (1-5) is required"
}
```

**Authentication**: Requires valid NextAuth session (401 if not authenticated)

### GET /api/candidates/[id]/quick-scores
Retrieve all quick scores for a candidate.

**Response** (200 OK):
```json
{
  "quickScores": [
    {
      "id": "1704123456789abc",
      "scoredBy": "user@example.com",
      "scoredByName": "John Recruiter",
      "scoredAt": "2025-01-11T10:30:00.000Z",
      "overallRating": 4,
      "thumbs": "up"
    }
  ]
}
```

## UI Components

### QuickScoreForm
**Props**:
```typescript
{
  candidateId: string
  candidateName: string
  currentUserId: string
  currentUserName: string
  onSubmit: (score: Omit<QuickScore, 'id' | 'scoredAt'>) => Promise<void>
  onClose: () => void
}
```

**Features**:
- Modal overlay (fixed positioning, backdrop blur)
- Star rating component (interactive, visual feedback)
- Thumbs buttons (toggle on/off)
- Expandable details section
- Character counter for notes
- Tag selection (multi-select)
- Form validation (requires overall rating)
- Loading states during submission

### QuickScoreDisplay
**Props**:
```typescript
{
  quickScores: QuickScore[]
}
```

**Features**:
- Summary card with aggregated statistics
- Individual score cards (expandable)
- Star display component (visual stars + numeric)
- Thumbs count display
- Empty state (no scores yet)
- Responsive grid layout

## Use Cases

### 1. Phone Screen Follow-up
**Scenario**: You just finished a 15-minute phone screen.

**Action**:
1. Click "⚡ Évaluation Rapide"
2. Select overall rating (e.g., 4 stars)
3. Add quick note: "Great communication, motivated, salary aligned"
4. Select tags: "Great communication", "Motivated"
5. Thumbs up 👍
6. Save (total time: 25 seconds)

### 2. Resume Review
**Scenario**: You're quickly scanning resumes.

**Action**:
1. Open candidate profile
2. Quick score: 3 stars
3. Note: "Good experience but lacks leadership"
4. Tags: "Strong technical", "Needs improvement"
5. Thumbs neutral 🤔
6. Save

### 3. Team Consensus
**Scenario**: 3 team members interview the same candidate.

**Result**:
```
Recruiter A: ⭐⭐⭐⭐⭐ (5 stars) 👍
Recruiter B: ⭐⭐⭐⭐ (4 stars) 👍
Recruiter C: ⭐⭐⭐ (3 stars) 🤔

Average: 4.0 stars (shown on card)
Team consensus: 2 thumbs up, 1 neutral
```

### 4. Quick Screening at Job Fair
**Scenario**: Meeting candidates at a job fair, need quick notes.

**Action**:
1. Create candidate profile (if doesn't exist)
2. Quick score: 4 stars
3. Note: "Met at TechConf 2025, interested in backend role"
4. Tags: "Motivated", "Good fit"
5. Thumbs up 👍

## Best Practices

### When to Use Quick Scores vs Full Interview Feedback

**Use Quick Scores for**:
- ✅ Phone screens
- ✅ Resume reviews
- ✅ First impressions
- ✅ Job fair meetings
- ✅ Quick team consensus
- ✅ Informal chats

**Use Full Interview Feedback for**:
- 📋 Technical interviews
- 📋 Panel interviews
- 📋 Final round interviews
- 📋 Detailed competency assessment
- 📋 Hiring decision documentation

### Quick Score Guidelines

1. **Be Consistent**
   - Define what 3 stars means for your team
   - Use the same criteria across candidates
   - Example: "3 stars = meets requirements, 4 stars = exceeds"

2. **Use Notes**
   - Even 10 words help
   - Future you will thank present you
   - Example: "Strong React skills, weak on testing"

3. **Tag Generously**
   - Tags help with filtering later
   - Use both positive and improvement tags
   - Be specific: "Strong technical" + "Needs improvement" = technical skills present but rough around edges

4. **Thumbs are for Quick Decisions**
   - 👍 = "Move to next stage"
   - 🤔 = "Need more information"
   - 👎 = "Pass on this candidate"

5. **Multiple Evaluators**
   - Encourage team members to add their scores
   - Don't just rely on one person's opinion
   - Average of 3+ scores is more reliable

## Activity Tracking

Every quick score creates an activity log entry:

```javascript
{
  type: 'quick_score_added',
  description: 'Évaluation rapide ajoutée: 4/5 étoiles',
  userId: 'user@example.com',
  userName: 'John Recruiter',
  timestamp: '2025-01-11T10:30:00.000Z',
  metadata: {
    rating: 4,
    thumbs: 'up'
  }
}
```

This appears in the candidate's Activity tab, creating a complete audit trail.

## Future Enhancements (Not Yet Implemented)

### Potential Additions:
1. **Edit/Delete Quick Scores**
   - Allow evaluators to modify their scores
   - Soft delete with history

2. **Score Comparison View**
   - Side-by-side comparison of multiple candidates
   - Sort by average rating

3. **Rating Analytics**
   - Which evaluators are most/least strict?
   - Rating distribution charts
   - Correlation between quick scores and hires

4. **Quick Score Templates**
   - Pre-filled tags/notes for common roles
   - "Phone screen template", "Resume review template"

5. **Score Weighting**
   - Senior recruiters' scores count more
   - Technical interviewer's technical rating weighted higher

6. **Notifications**
   - Notify candidate owner when team adds scores
   - Alert when consensus is reached

## Troubleshooting

### "Overall rating (1-5) is required" error
**Solution**: Make sure you've clicked on at least one star in the "Note Globale" section before submitting.

### Ratings not updating on Kanban board
**Solution**: Refresh the page or navigate away and back. The ratings update in the database immediately but the Kanban board might need a refresh.

### Can't see other team members' scores
**Solution**: Click on the candidate card to view the profile, then go to the "Évaluations" tab. All scores are visible there.

### Quick Score button not showing
**Solution**: Make sure you're logged in with a valid session. The button only appears for authenticated users.

## Integration with Other Features

### Tags System
- Quick Score tags are separate from candidate profile tags
- Use profile tags for permanent categorization
- Use Quick Score tags for evaluation impressions

### Interview Feedback
- Both systems work independently
- A candidate can have multiple quick scores AND detailed interview feedback
- Use quick scores for screening, detailed feedback for final rounds

### Activity Log
- Every quick score creates an activity entry
- Full audit trail of who scored when
- Visible in the Activity tab

## Summary

The Quick Scorecard system provides a fast, team-friendly way to evaluate candidates:

- ⚡ **Speed**: 30 seconds vs 5+ minutes
- 👥 **Collaboration**: Multiple evaluators, automatic averaging
- 📊 **Visibility**: Ratings visible on Kanban cards
- 🎯 **Simplicity**: Required field (overall rating) + optional details
- 📈 **Automatic**: Ratings recalculate instantly

**Getting Started**:
1. Navigate to any candidate profile
2. Click "⚡ Évaluation Rapide"
3. Rate 1-5 stars
4. Add optional details
5. Submit

That's it! The system handles the rest.

---

**Implementation Date**: January 2025
**Version**: 1.0
**Maintainer**: Hi-Ring Team
