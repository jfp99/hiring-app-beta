# Email Configuration Guide

## Overview

The Hi-Ring recruitment platform now supports real email sending through multiple providers:
- **SMTP** (Gmail, Outlook, custom SMTP servers)
- **SendGrid** (cloud-based email delivery)
- **AWS SES** (Amazon Simple Email Service)
- **Mailgun** (email API service)

## Current Status

✅ Email service infrastructure implemented
✅ Multiple provider support
✅ Automatic retry logic (3 attempts)
✅ Email logging and activity tracking
✅ Demo mode (works without credentials)

## Quick Start (Demo Mode)

By default, the system runs in **demo mode** where emails are logged to the console but not actually sent. This is perfect for development and testing.

No configuration needed! Just use the email features and check the console logs.

## Configuration Options

### Option 1: Gmail (SMTP) - Recommended for Development

1. **Enable 2-Step Verification** in your Google Account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Generate and copy the 16-character password

3. **Update `.env.local`**:
```env
EMAIL_PROVIDER=smtp
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Hi-Ring Recrutement

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
```

4. **Restart your dev server**

### Option 2: SendGrid (Cloud Service)

1. **Create SendGrid account**: https://sendgrid.com/
2. **Generate API Key**:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Update `.env.local`**:
```env
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Hi-Ring Recrutement

SENDGRID_API_KEY=SG.your-api-key-here
```

4. **Verify sender email** in SendGrid dashboard

### Option 3: AWS SES (Amazon)

1. **Create AWS account** and access SES
2. **Verify your sending email/domain**
3. **Create SMTP credentials** in SES console
4. **Move out of sandbox mode** (optional, for production)

5. **Update `.env.local`**:
```env
EMAIL_PROVIDER=ses
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Hi-Ring Recrutement

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Option 4: Mailgun

1. **Create Mailgun account**: https://mailgun.com/
2. **Get API credentials** from dashboard
3. **Add and verify your domain**

4. **Update `.env.local`**:
```env
EMAIL_PROVIDER=mailgun
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Hi-Ring Recrutement

MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.your-domain.com
```

### Option 5: Custom SMTP Server

For any other SMTP provider (Outlook, custom server, etc.):

```env
EMAIL_PROVIDER=smtp
EMAIL_FROM=your-email@domain.com
EMAIL_FROM_NAME=Hi-Ring Recrutement

SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

**Common SMTP Ports:**
- `25` - Unsecured (usually blocked)
- `587` - TLS/STARTTLS (recommended)
- `465` - SSL (set SMTP_SECURE=true)
- `2525` - Alternative TLS port

## Testing Email Configuration

### 1. Test from the UI

1. Navigate to a candidate profile
2. Click "📧 Envoyer Email"
3. Select a template and fill in variables
4. Click "Envoyer l'Email"
5. Check candidate's activity timeline

### 2. Check Console Logs

The email service logs all operations:
- ✅ Email sent successfully
- ❌ Failed to send email
- ⚠️ Running in demo mode

### 3. Check Email Logs

All emails (sent or failed) are logged in the database:
- Navigate to MongoDB → `email_logs` collection
- View status, error messages, and delivery info

## Features

### Automatic Retry Logic

If an email fails to send, the system automatically retries:
- **Max retries:** 3 attempts
- **Retry delay:** 2 seconds between attempts
- **Error logging:** All failures logged with details

### Email Status Tracking

Each email has a status:
- `sent` - Successfully delivered
- `failed` - Failed after all retries
- `pending` - Queued for sending

### Activity Timeline

All email activities appear in the candidate's timeline:
- 📧 Email sent icon
- Template name
- Subject line
- Timestamp
- Sender information

### Variable Substitution

Templates support dynamic variables:
- `{{firstName}}` - Candidate's first name
- `{{lastName}}` - Candidate's last name
- `{{position}}` - Job position
- `{{interviewDate}}` - Interview date
- And many more...

## Troubleshooting

### Email not sending (Demo Mode)

**Symptom:** Emails logged to console but not actually sent

**Solution:** Configure email credentials in `.env.local` (see Configuration Options above)

### Gmail "Less secure app" error

**Symptom:** Authentication failed with Gmail

**Solution:**
- Don't use your regular password
- Enable 2-Step Verification
- Generate and use an App Password

### SendGrid "Sender not verified" error

**Symptom:** 403 Forbidden from SendGrid

**Solution:**
- Verify your sender email in SendGrid dashboard
- Wait for verification email and click the link

### AWS SES "Email address not verified" error

**Symptom:** Email rejected by SES

**Solution:**
- Verify your sending email address in SES console
- Or verify your entire domain
- Request production access (move out of sandbox)

### Connection timeout

**Symptom:** Email sending times out

**Solution:**
- Check firewall settings
- Ensure outbound SMTP ports are open (587, 465, 2525)
- Try alternative ports
- Check if your ISP blocks SMTP

### "Email logged but sending failed"

**Symptom:** Email saved to database but shows as failed

**Check:**
1. Console logs for specific error message
2. Email credentials are correct
3. Network connectivity
4. Provider account is active
5. Email limits not exceeded

## Production Recommendations

### Security

- [ ] Use environment-specific credentials
- [ ] Rotate API keys regularly
- [ ] Use domain email (not Gmail/personal)
- [ ] Enable DKIM and SPF records
- [ ] Monitor bounce and complaint rates

### Reliability

- [ ] Set up email delivery monitoring
- [ ] Configure bounce handling
- [ ] Implement rate limiting
- [ ] Use dedicated IP (for high volume)
- [ ] Set up retry queue for failures

### Compliance

- [ ] Add unsubscribe links (for marketing emails)
- [ ] Include physical address (CAN-SPAM)
- [ ] Respect opt-out requests
- [ ] Store email consent records
- [ ] Follow GDPR guidelines (EU users)

## Email Limits

### Development (Free Tiers)

- **Gmail:** 500 emails/day
- **SendGrid:** 100 emails/day (free tier)
- **AWS SES:** 200 emails/day (sandbox), 62,000/day (production free tier)
- **Mailgun:** 5,000 emails/month (free trial)

### Production

Consider upgrading for high volume:
- **SendGrid:** $19.95/month for 40,000 emails
- **AWS SES:** $0.10 per 1,000 emails
- **Mailgun:** $35/month for 50,000 emails

## Advanced Configuration

### Custom Email Templates HTML

Enhance templates with rich HTML formatting:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #3b5335; color: white; padding: 20px; }
    .content { padding: 20px; }
    .button { background: #ffaf50; color: #3b5335; padding: 10px 20px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hi-Ring Recrutement</h1>
  </div>
  <div class="content">
    <p>Bonjour {{firstName}},</p>
    <p>Your email content here...</p>
    <a href="#" class="button">Call to Action</a>
  </div>
</body>
</html>
```

### Attachments Support

The email service supports attachments:

```typescript
await emailService.sendEmail({
  to: 'candidate@example.com',
  subject: 'Your interview details',
  text: 'Please find attached...',
  attachments: [
    {
      filename: 'interview_details.pdf',
      path: '/path/to/file.pdf'
    }
  ]
})
```

### Email Scheduling (Future Enhancement)

For scheduled email sending:
- Use queue system (Bull, BullMQ)
- Schedule cron jobs
- Implement send delay parameter

## Support

For issues or questions:
- Check console logs first
- Review `.env.local` configuration
- Test with demo mode to isolate issues
- Verify provider account status
- Contact your email provider's support

## Further Reading

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid API Docs](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Email Best Practices](https://www.mailgun.com/blog/email-best-practices/)

---

**Last Updated:** 2025-10-11
**Version:** 1.0.0
