// src/app/lib/calendar.ts
import { createEvent, EventAttributes, DateArray } from 'ics'
import { getEmailService } from './email'

export interface CalendarEvent {
  title: string
  description?: string
  location?: string
  url?: string
  start: Date
  end: Date
  attendees?: Array<{
    name?: string
    email: string
    rsvp?: boolean
  }>
  organizer?: {
    name: string
    email: string
  }
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
  busyStatus?: 'FREE' | 'BUSY' | 'TENTATIVE'
}

export interface CalendarInviteOptions {
  sendEmail: boolean
  emailSubject?: string
  emailBody?: string
}

/**
 * Calendar service for creating and managing calendar events
 */
class CalendarService {
  /**
   * Generate .ics calendar file content
   */
  async generateICS(event: CalendarEvent): Promise<string> {
    // Convert Date to DateArray format [year, month, day, hour, minute]
    const startArray: DateArray = [
      event.start.getFullYear(),
      event.start.getMonth() + 1, // ics uses 1-indexed months
      event.start.getDate(),
      event.start.getHours(),
      event.start.getMinutes()
    ]

    const endArray: DateArray = [
      event.end.getFullYear(),
      event.end.getMonth() + 1,
      event.end.getDate(),
      event.end.getHours(),
      event.end.getMinutes()
    ]

    // Prepare event attributes
    const eventAttributes: EventAttributes = {
      start: startArray,
      end: endArray,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      url: event.url || '',
      status: event.status || 'CONFIRMED',
      busyStatus: event.busyStatus || 'BUSY',
      organizer: event.organizer ? {
        name: event.organizer.name,
        email: event.organizer.email
      } : undefined,
      attendees: event.attendees?.map(attendee => ({
        name: attendee.name || attendee.email,
        email: attendee.email,
        rsvp: attendee.rsvp !== false // Default to true
      }))
    }

    return new Promise((resolve, reject) => {
      createEvent(eventAttributes, (error, value) => {
        if (error) {
          console.error('Error generating ICS:', error)
          reject(error)
        } else {
          resolve(value)
        }
      })
    })
  }

  /**
   * Send calendar invite via email
   */
  async sendCalendarInvite(
    event: CalendarEvent,
    options: CalendarInviteOptions = { sendEmail: true }
  ): Promise<{ success: boolean; icsContent?: string; error?: string }> {
    try {
      // Generate ICS content
      const icsContent = await this.generateICS(event)

      // If email sending is disabled, just return the ICS content
      if (!options.sendEmail) {
        return { success: true, icsContent }
      }

      // Send email with ICS attachment to all attendees
      const emailService = getEmailService()

      // Format date for email
      const formattedDate = event.start.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = event.start.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })

      // Default email content
      const defaultSubject = `Invitation: ${event.title} - ${formattedDate}`
      const defaultBody = `
Bonjour,

Vous êtes invité(e) à un entretien :

📅 ${event.title}
🕒 ${formattedDate} à ${formattedTime}
⏱️ Durée: ${Math.round((event.end.getTime() - event.start.getTime()) / 60000)} minutes
${event.location ? `📍 Lieu: ${event.location}` : ''}
${event.url ? `🔗 Lien: ${event.url}` : ''}

${event.description ? `\nDescription:\n${event.description}` : ''}

Cette invitation contient un fichier .ics en pièce jointe que vous pouvez ajouter à votre calendrier.

Cordialement,
${event.organizer?.name || 'Hi-Ring'}
      `.trim()

      // Send to each attendee
      const sendPromises = event.attendees?.map(async (attendee) => {
        return await emailService.sendEmail({
          to: attendee.email,
          subject: options.emailSubject || defaultSubject,
          text: options.emailBody || defaultBody,
          html: (options.emailBody || defaultBody).replace(/\n/g, '<br>'),
          attachments: [
            {
              filename: 'invite.ics',
              content: icsContent
            }
          ]
        })
      }) || []

      const results = await Promise.all(sendPromises)
      const allSuccess = results.every(r => r.success)

      if (allSuccess) {
        return { success: true, icsContent }
      } else {
        const errors = results.filter(r => !r.success).map(r => r.error).join(', ')
        return { success: false, error: `Some emails failed: ${errors}` }
      }
    } catch (error: any) {
      console.error('Error sending calendar invite:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Generate Google Calendar URL
   * Opens in browser and allows user to add event to their Google Calendar
   */
  generateGoogleCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: this.formatGoogleCalendarDates(event.start, event.end),
      details: event.description || '',
      location: event.location || ''
    })

    if (event.attendees && event.attendees.length > 0) {
      params.append('add', event.attendees.map(a => a.email).join(','))
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  /**
   * Generate Outlook Calendar URL
   * Opens in browser and allows user to add event to Outlook Calendar
   */
  generateOutlookCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description || '',
      location: event.location || ''
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  /**
   * Generate Office 365 Calendar URL
   */
  generateOffice365CalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description || '',
      location: event.location || ''
    })

    return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  /**
   * Generate Yahoo Calendar URL
   */
  generateYahooCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      st: this.formatYahooDate(event.start),
      et: this.formatYahooDate(event.end),
      desc: event.description || '',
      in_loc: event.location || ''
    })

    return `https://calendar.yahoo.com/?${params.toString()}`
  }

  /**
   * Format dates for Google Calendar (YYYYMMDDTHHMMSSZ format)
   */
  private formatGoogleCalendarDates(start: Date, end: Date): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    return `${formatDate(start)}/${formatDate(end)}`
  }

  /**
   * Format date for Yahoo Calendar (YYYYMMDDTHHMMSSZ format)
   */
  private formatYahooDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  /**
   * Calculate duration in minutes
   */
  getDuration(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000)
  }

  /**
   * Add minutes to a date
   */
  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000)
  }

  /**
   * Create interview calendar event from interview data
   */
  createInterviewEvent(interview: {
    jobTitle?: string
    scheduledDate: string
    duration: number
    type: string
    location?: string
    meetingLink?: string
    notes?: string
    candidate: {
      firstName: string
      lastName: string
      email: string
    }
    recruiter?: {
      name: string
      email: string
    }
  }): CalendarEvent {
    const start = new Date(interview.scheduledDate)
    const end = this.addMinutes(start, interview.duration)

    // Generate title based on interview type
    const typeLabels: Record<string, string> = {
      phone: 'Entretien Téléphonique',
      video: 'Entretien Visioconférence',
      in_person: 'Entretien en Présentiel',
      technical: 'Entretien Technique',
      hr: 'Entretien RH'
    }

    const title = `${typeLabels[interview.type] || 'Entretien'} - ${interview.candidate.firstName} ${interview.candidate.lastName}${interview.jobTitle ? ` (${interview.jobTitle})` : ''}`

    let description = `Entretien avec ${interview.candidate.firstName} ${interview.candidate.lastName}`
    if (interview.jobTitle) {
      description += `\nPoste: ${interview.jobTitle}`
    }
    if (interview.notes) {
      description += `\n\nNotes:\n${interview.notes}`
    }

    return {
      title,
      description,
      location: interview.location || '',
      url: interview.meetingLink || '',
      start,
      end,
      attendees: [
        {
          name: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
          email: interview.candidate.email,
          rsvp: true
        }
      ],
      organizer: interview.recruiter ? {
        name: interview.recruiter.name,
        email: interview.recruiter.email
      } : undefined,
      status: 'CONFIRMED',
      busyStatus: 'BUSY'
    }
  }
}

// Singleton instance
let calendarServiceInstance: CalendarService | null = null

export function getCalendarService(): CalendarService {
  if (!calendarServiceInstance) {
    calendarServiceInstance = new CalendarService()
  }
  return calendarServiceInstance
}

// Export default instance
export default getCalendarService()
