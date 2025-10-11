# Calendar Integration Guide

## Overview

The Hi-Ring recruitment platform now includes comprehensive calendar integration for interview scheduling. Candidates can easily add interviews to their preferred calendar application.

## Features

✅ Generate .ics calendar files (iCal format)
✅ Send calendar invites via email
✅ Support for all major calendar platforms:
  - Google Calendar
  - Microsoft Outlook
  - Office 365
  - Yahoo Calendar
  - Apple Calendar (iCal)
  - Any calendar app that supports .ics files
✅ Automatic timezone handling
✅ Calendar download links for existing interviews
✅ One-click "Add to Calendar" URLs

## How It Works

### 1. When Scheduling a New Interview

When you schedule an interview through the Interview Scheduler:

1. **Fill in interview details** (date, time, type, location/link, notes)
2. **Check the box** "📅 Envoyer une invitation calendrier"
3. **Submit the form**

The system will:
- Create the interview in the database
- Generate a calendar file (.ics)
- Send an email to the candidate with the .ics file attached
- The candidate receives an email they can open and add to their calendar

### 2. For Existing Interviews

For interviews that have already been scheduled:

- **Download Calendar File**: Download a .ics file to manually add to any calendar
- **Direct Calendar Links**: One-click links to add directly to:
  - Google Calendar
  - Outlook
  - Office 365
  - Yahoo Calendar

## Calendar File (.ics) Format

The generated calendar files include:

- **Event Title**: Interview type + Candidate name + Job title
- **Date & Time**: Scheduled date and time with timezone
- **Duration**: Configured interview duration
- **Location**: Physical address (for in-person interviews)
- **Meeting Link**: Video conference URL (for video interviews)
- **Description**: Interview details and notes
- **Attendees**: Candidate email (with RSVP request)
- **Organizer**: Recruiter name and email
- **Status**: CONFIRMED
- **Busy Status**: BUSY (shows as "busy" in calendar)

## API Endpoints

### Send Calendar Invite (New Interview)

```http
POST /api/candidates/[candidateId]/interviews
Content-Type: application/json

{
  "scheduledDate": "2025-10-15T14:00:00Z",
  "duration": 60,
  "type": "video",
  "jobTitle": "Développeur Full Stack",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "notes": "Entretien technique",
  "sendCalendarInvite": true  // Enable calendar invite
}
```

**Response:**
```json
{
  "message": "Entretien créé avec succès",
  "interview": { ... },
  "calendarInvite": {
    "success": true,
    "message": "Invitation calendrier envoyée avec succès"
  }
}
```

### Download Calendar File (Existing Interview)

```http
GET /api/candidates/[candidateId]/interviews/[interviewId]/calendar
```

**Response:**
- Content-Type: `text/calendar; charset=utf-8`
- Content-Disposition: `attachment; filename="interview-[id].ics"`
- Body: iCal formatted calendar file

## Using Calendar Services

### Google Calendar

**Method 1: Email Attachment (Recommended)**
1. Candidate receives email with .ics file
2. Opens email on any device
3. Clicks the .ics attachment
4. Clicks "Add to Google Calendar"

**Method 2: Direct URL**
```javascript
const url = calendarService.generateGoogleCalendarUrl(event)
// Opens Google Calendar with pre-filled event details
```

### Microsoft Outlook / Office 365

**Method 1: Email Attachment**
1. Opens .ics file from email
2. Outlook automatically recognizes it
3. Click "Add to Calendar"

**Method 2: Direct URL**
```javascript
const url = calendarService.generateOutlookCalendarUrl(event)
// or
const url = calendarService.generateOffice365CalendarUrl(event)
```

### Apple Calendar (iCal)

**Email Attachment:**
1. Opens .ics file on iPhone/iPad/Mac
2. iOS/macOS prompts to add to Calendar
3. One tap to confirm

### Yahoo Calendar

**Direct URL:**
```javascript
const url = calendarService.generateYahooCalendarUrl(event)
```

## Technical Implementation

### Calendar Service Module

Located at: `src/app/lib/calendar.ts`

**Main Functions:**

#### Generate ICS File
```typescript
import { getCalendarService } from '@/app/lib/calendar'

const calendarService = getCalendarService()
const icsContent = await calendarService.generateICS(event)
```

#### Send Calendar Invite
```typescript
const result = await calendarService.sendCalendarInvite(event, {
  sendEmail: true,
  emailSubject: 'Interview Invitation',
  emailBody: 'You are invited...'
})
```

#### Generate Calendar URLs
```typescript
// Google Calendar
const googleUrl = calendarService.generateGoogleCalendarUrl(event)

// Outlook
const outlookUrl = calendarService.generateOutlookCalendarUrl(event)

// Office 365
const office365Url = calendarService.generateOffice365CalendarUrl(event)

// Yahoo
const yahooUrl = calendarService.generateYahooCalendarUrl(event)
```

#### Create Interview Event
```typescript
const interviewEvent = calendarService.createInterviewEvent({
  jobTitle: 'Développeur Full Stack',
  scheduledDate: '2025-10-15T14:00:00Z',
  duration: 60,
  type: 'video',
  meetingLink: 'https://meet.google.com/abc',
  notes: 'Technical interview',
  candidate: {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@example.com'
  },
  recruiter: {
    name: 'Jean Dupont',
    email: 'jean.dupont@hi-ring.com'
  }
})
```

## Email Integration

Calendar invites are sent via the email service. Make sure you have configured email sending:

See `EMAIL_CONFIGURATION.md` for email setup instructions.

**Email with Calendar Attachment:**
- Subject: "Invitation: [Interview Type] - [Date]"
- Body: Interview details with date, time, location/link
- Attachment: invite.ics file
- Recipient: Candidate email

## User Interface

### Interview Scheduler Component

Located at: `src/app/components/InterviewScheduler.tsx`

**New Feature: Calendar Invite Checkbox**

When creating a new interview, you'll see:

```
☑ 📅 Envoyer une invitation calendrier
   Le candidat recevra un email avec un fichier .ics à
   ajouter à son calendrier (Google Calendar, Outlook, etc.)
```

**Features:**
- Only shows for new interviews (not when editing)
- Checked by default can be changed in the component
- Sends email with .ics attachment when enabled

### Upcoming Interviews Widget

Shows scheduled interviews with:
- Interview date and time
- Meeting link (if video interview)
- Location (if in-person)
- Quick access to edit/view

## Testing

### Test Calendar Invite Sending

1. Navigate to a candidate profile
2. Click "📅 Planifier Entretien"
3. Fill in interview details:
   - Type: Visioconférence
   - Date: Future date/time
   - Duration: 60 minutes
   - Meeting Link: https://meet.google.com/test
   - Check "Envoyer une invitation calendrier"
4. Submit
5. Check candidate's email inbox
6. Open the .ics attachment
7. Add to calendar

### Test Calendar File Download

1. Navigate to a candidate profile with scheduled interviews
2. View interview details
3. Click "Download Calendar File" (if implemented in UI)
4. Open downloaded .ics file
5. Verify it opens in your calendar app

### Test Calendar URLs

```javascript
// In browser console or API test
const event = {
  title: 'Test Interview',
  start: new Date('2025-10-15T14:00:00Z'),
  end: new Date('2025-10-15T15:00:00Z'),
  description: 'Test interview description',
  location: 'https://meet.google.com/test',
  attendees: [{ email: 'test@example.com', name: 'Test User' }]
}

// Test URLs
console.log(calendarService.generateGoogleCalendarUrl(event))
console.log(calendarService.generateOutlookCalendarUrl(event))
```

## Timezone Handling

### Current Implementation

- All dates stored in ISO 8601 format (UTC)
- Calendar files use UTC timezone
- User's browser/calendar app handles timezone conversion
- Displayed times adjusted to user's local timezone

### Best Practices

1. **Always use ISO format** for scheduledDate
2. **Store in UTC** in the database
3. **Display in local time** in the UI
4. **Calendar apps handle conversion** automatically

Example:
```javascript
const scheduledDate = new Date('2025-10-15T14:00:00Z') // UTC
const localTime = scheduledDate.toLocaleString('fr-FR') // Local display
```

## Troubleshooting

### Calendar invite not received

**Possible causes:**
- Email service not configured (check EMAIL_CONFIGURATION.md)
- Email in spam folder
- Invalid candidate email address
- "sendCalendarInvite" checkbox not checked

**Solution:**
- Configure email service
- Check email logs in MongoDB (`email_logs` collection)
- Verify candidate email is correct
- Download .ics file manually via API

### .ics file won't open

**Possible causes:**
- No calendar app installed
- File association not set
- Corrupted file

**Solution:**
- Install a calendar app (Google Calendar, Outlook, Apple Calendar)
- Right-click → Open With → Select calendar app
- Download file again

### Meeting not showing in calendar

**Possible causes:**
- Wrong timezone
- Event in past
- Calendar sync disabled

**Solution:**
- Check date/time in .ics file
- Ensure event is in the future
- Refresh calendar sync

### Duplicate events

**Possible causes:**
- Opening .ics file multiple times
- Multiple calendar invites sent

**Solution:**
- Delete duplicates manually
- Track invitation sends in database

## Future Enhancements

### Planned Features

- [ ] **Two-way sync** with Google Calendar API
- [ ] **Automatic reminders** before interviews
- [ ] **Calendar availability checking** before scheduling
- [ ] **Recurring interviews** support
- [ ] **Multiple attendees** (panel interviews)
- [ ] **Interview rescheduling** with automatic updates
- [ ] **Calendar conflict detection**
- [ ] **Meeting room booking** integration
- [ ] **Video conference auto-generation** (Zoom, Teams)
- [ ] **Interview status sync** (attended/no-show)

### Google Calendar API Integration

For full two-way sync, you would need to:

1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Install Google API client library
4. Implement OAuth flow
5. Create/update/delete events via API

See Google Calendar API documentation for details.

## Security Considerations

### Data Privacy

- Calendar invites contain candidate personal information
- Only send to verified candidate email
- Use secure email transport (TLS/SSL)
- Don't include sensitive notes in calendar description

### Access Control

- Only authenticated recruiters can create interviews
- API endpoints require valid session
- Calendar file downloads require authentication
- Validate all input data

## Production Recommendations

### Email Configuration

- Configure production email service (see EMAIL_CONFIGURATION.md)
- Use professional sender email (@your-company.com)
- Enable email delivery monitoring
- Set up bounce handling

### Monitoring

- Log all calendar invite sends
- Track delivery success/failure rates
- Monitor .ics file downloads
- Alert on failed calendar invites

### Performance

- Generate .ics files asynchronously for bulk operations
- Cache generated calendar files
- Use queue system for high volume
- Optimize calendar URL generation

## Support

For issues or questions:
- Check console logs for errors
- Verify email configuration (EMAIL_CONFIGURATION.md)
- Test with demo mode first
- Check candidate's spam folder
- Try manual .ics download

## Further Reading

- [iCalendar RFC 5545](https://tools.ietf.org/html/rfc5545)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph Calendar](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [ics Package Documentation](https://www.npmjs.com/package/ics)

---

**Last Updated:** 2025-10-11
**Version:** 1.0.0
