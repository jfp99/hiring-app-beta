// src/app/lib/emailService.ts
import sgMail from '@sendgrid/mail'

/**
 * Email Service
 * Handles email sending via SendGrid with fallback support
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: {
    email: string
    name: string
  }
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: {
    content: string
    filename: string
    type: string
    disposition: 'attachment' | 'inline'
  }[]
  templateId?: string
  templateVariables?: Record<string, any>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider: 'sendgrid' | 'mock' | 'failed'
}

export class EmailService {
  private static isConfigured = false
  private static useMockMode = false

  /**
   * Initialize email service
   */
  static initialize() {
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
      console.warn('⚠️ [EMAIL] No SENDGRID_API_KEY found - using mock mode')
      this.useMockMode = true
      return
    }

    try {
      sgMail.setApiKey(apiKey)
      this.isConfigured = true
      this.useMockMode = false
      console.log('✅ [EMAIL] SendGrid initialized successfully')
    } catch (error) {
      console.error('❌ [EMAIL] Failed to initialize SendGrid:', error)
      this.useMockMode = true
    }
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    // Initialize if not already done
    if (!this.isConfigured && !this.useMockMode) {
      this.initialize()
    }

    // Mock mode for testing
    if (this.useMockMode) {
      return this.sendMockEmail(options)
    }

    try {
      const from = options.from || {
        email: process.env.EMAIL_FROM || 'noreply@hiring-app.com',
        name: process.env.EMAIL_FROM_NAME || 'Hi-Ring Recruitment'
      }

      const msg: any = {
        to: options.to,
        from: `${from.name} <${from.email}>`,
        subject: options.subject,
        replyTo: options.replyTo || process.env.EMAIL_REPLY_TO
      }

      // Add text or HTML content
      if (options.html) {
        msg.html = options.html
      }
      if (options.text) {
        msg.text = options.text
      }

      // Add CC/BCC
      if (options.cc) msg.cc = options.cc
      if (options.bcc) msg.bcc = options.bcc

      // Add attachments
      if (options.attachments) {
        msg.attachments = options.attachments
      }

      // Use dynamic template if provided
      if (options.templateId) {
        msg.templateId = options.templateId
        if (options.templateVariables) {
          msg.dynamicTemplateData = options.templateVariables
        }
      }

      console.log(`📧 [EMAIL] Sending email to: ${options.to}`)
      console.log(`   Subject: ${options.subject}`)

      const [response] = await sgMail.send(msg)

      console.log(`✅ [EMAIL] Email sent successfully (Status: ${response.statusCode})`)

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: 'sendgrid'
      }
    } catch (error: any) {
      console.error('❌ [EMAIL] Failed to send email:', error)

      if (error.response) {
        console.error('   SendGrid Error:', error.response.body)
      }

      return {
        success: false,
        error: error.message || 'Unknown email error',
        provider: 'failed'
      }
    }
  }

  /**
   * Send mock email (for testing without SendGrid)
   */
  private static async sendMockEmail(options: EmailOptions): Promise<EmailResult> {
    console.log('📧 [EMAIL - MOCK] Would send email:')
    console.log('   To:', options.to)
    console.log('   Subject:', options.subject)
    console.log('   Text:', options.text?.substring(0, 100) + '...')

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      provider: 'mock'
    }
  }

  /**
   * Render email template with variables
   */
  static renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template

    // Replace all {{variable}} patterns
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      rendered = rendered.replace(regex, String(value || ''))
    })

    return rendered
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Send transactional email with template
   */
  static async sendTransactionalEmail(
    to: string,
    templateName: string,
    variables: Record<string, any>,
    subject?: string
  ): Promise<EmailResult> {
    // Get template from database or predefined templates
    const template = await this.getEmailTemplate(templateName)

    if (!template) {
      return {
        success: false,
        error: `Template "${templateName}" not found`,
        provider: 'failed'
      }
    }

    const renderedSubject = subject || this.renderTemplate(template.subject, variables)
    const renderedBody = this.renderTemplate(template.body, variables)
    const renderedHtml = this.convertToHtml(renderedBody)

    return this.sendEmail({
      to,
      subject: renderedSubject,
      text: renderedBody,
      html: renderedHtml
    })
  }

  /**
   * Get email template (stub - should load from database)
   */
  private static async getEmailTemplate(name: string): Promise<{ subject: string; body: string } | null> {
    // In production, load from database
    // For now, return null and let caller handle
    return null
  }

  /**
   * Convert plain text to HTML
   */
  private static convertToHtml(text: string): string {
    // Basic conversion: paragraphs and line breaks
    const paragraphs = text.split('\n\n')
    const html = paragraphs
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('')

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    p { margin-bottom: 15px; }
    a { color: #ffaf50; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  ${html}
  <div class="footer">
    <p>Cet email a été envoyé par Hi-Ring Recruitment Platform</p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Send bulk emails (with rate limiting)
   */
  static async sendBulkEmails(
    emails: EmailOptions[],
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ success: number; failed: number; results: EmailResult[] }> {
    const results: EmailResult[] = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < emails.length; i++) {
      const result = await this.sendEmail(emails[i])
      results.push(result)

      if (result.success) {
        successCount++
      } else {
        failedCount++
      }

      if (onProgress) {
        onProgress(i + 1, emails.length)
      }

      // Rate limiting: wait 100ms between emails
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results
    }
  }

  /**
   * Test email configuration
   */
  static async testConfiguration(testEmail: string): Promise<EmailResult> {
    console.log('🧪 [EMAIL] Testing email configuration...')

    const result = await this.sendEmail({
      to: testEmail,
      subject: 'Hi-Ring - Test Email Configuration',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b5335;">Email Configuration Test</h2>
          <p>If you're reading this, your email configuration is working correctly! ✅</p>
          <p>You can now use Hi-Ring's workflow automation to send automated emails to candidates.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Sent from Hi-Ring Recruitment Platform
          </p>
        </div>
      `
    })

    if (result.success) {
      console.log('✅ [EMAIL] Test email sent successfully!')
    } else {
      console.error('❌ [EMAIL] Test email failed:', result.error)
    }

    return result
  }
}

// Initialize on module load
EmailService.initialize()
