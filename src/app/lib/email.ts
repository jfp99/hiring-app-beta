// src/app/lib/email.ts
import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content?: string | Buffer
    path?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Email service supporting multiple providers:
 * - SMTP (Nodemailer) - Default
 * - SendGrid
 * - AWS SES
 * - Mailgun
 *
 * Configure via environment variables:
 * EMAIL_PROVIDER=smtp|sendgrid|ses|mailgun
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private provider: string

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp'
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const provider = this.provider.toLowerCase()

    switch (provider) {
      case 'smtp':
        this.initializeSMTP()
        break
      case 'sendgrid':
        this.initializeSendGrid()
        break
      case 'ses':
        this.initializeAWSSES()
        break
      case 'mailgun':
        this.initializeMailgun()
        break
      default:
        console.warn(`Unknown email provider: ${provider}. Using SMTP as fallback.`)
        this.initializeSMTP()
    }
  }

  private initializeSMTP() {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // If no credentials are provided, use a test account (Ethereal)
    if (!config.auth.user || !config.auth.pass) {
      console.warn('No SMTP credentials provided. Emails will be logged to console only.')
      this.transporter = null
      return
    }

    try {
      this.transporter = nodemailer.createTransport(config)
      console.log('✅ SMTP email service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize SMTP:', error)
      this.transporter = null
    }
  }

  private initializeSendGrid() {
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
      console.warn('No SendGrid API key provided. Emails will be logged to console only.')
      this.transporter = null
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: apiKey
        }
      })
      console.log('✅ SendGrid email service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid:', error)
      this.transporter = null
    }
  }

  private initializeAWSSES() {
    // AWS SES configuration
    const region = process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      console.warn('No AWS credentials provided. Emails will be logged to console only.')
      this.transporter = null
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: `email-smtp.${region}.amazonaws.com`,
        port: 587,
        secure: false,
        auth: {
          user: accessKeyId,
          pass: secretAccessKey
        }
      })
      console.log('✅ AWS SES email service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize AWS SES:', error)
      this.transporter = null
    }
  }

  private initializeMailgun() {
    const apiKey = process.env.MAILGUN_API_KEY
    const domain = process.env.MAILGUN_DOMAIN

    if (!apiKey || !domain) {
      console.warn('No Mailgun credentials provided. Emails will be logged to console only.')
      this.transporter = null
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: `postmaster@${domain}`,
          pass: apiKey
        }
      })
      console.log('✅ Mailgun email service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Mailgun:', error)
      this.transporter = null
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@hi-ring.com'
    const fromName = process.env.EMAIL_FROM_NAME || 'Hi-Ring'

    // Validate email options
    if (!options.to) {
      return { success: false, error: 'Recipient email is required' }
    }

    if (!options.subject) {
      return { success: false, error: 'Email subject is required' }
    }

    if (!options.text && !options.html) {
      return { success: false, error: 'Email body (text or HTML) is required' }
    }

    // If no transporter is configured, log to console and return success
    if (!this.transporter) {
      console.log('\n===== EMAIL TO SEND (DEMO MODE) =====')
      console.log('Provider:', this.provider)
      console.log('From:', `${fromName} <${fromEmail}>`)
      console.log('To:', options.to)
      if (options.cc && options.cc.length > 0) {
        console.log('CC:', options.cc.join(', '))
      }
      if (options.bcc && options.bcc.length > 0) {
        console.log('BCC:', options.bcc.join(', '))
      }
      console.log('Subject:', options.subject)
      console.log('---')
      console.log('Text:', options.text || '(HTML only)')
      if (options.html) {
        console.log('HTML:', options.html.substring(0, 200) + '...')
      }
      console.log('=====================================\n')

      return {
        success: true,
        messageId: `demo-${Date.now()}@hi-ring.com`
      }
    }

    // Prepare email
    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    }

    try {
      // Send email
      const info = await this.transporter.sendMail(mailOptions)

      console.log('✅ Email sent successfully:', info.messageId)

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error: any) {
      console.error('❌ Failed to send email:', error)

      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }
  }

  /**
   * Verify email service connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('No email transporter configured')
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ Email service connection verified')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error)
      return false
    }
  }

  /**
   * Send email with retry logic
   */
  async sendEmailWithRetry(
    options: EmailOptions,
    maxRetries: number = 3,
    retryDelay: number = 2000
  ): Promise<EmailResult> {
    let lastError: string = ''

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Email send attempt ${attempt}/${maxRetries}`)

      const result = await this.sendEmail(options)

      if (result.success) {
        return result
      }

      lastError = result.error || 'Unknown error'

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

// Export default instance
export default getEmailService()
