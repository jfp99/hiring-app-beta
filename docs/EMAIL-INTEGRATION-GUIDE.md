# Email Integration Guide - SendGrid Setup

**Date**: October 13, 2025
**Status**: Production Ready
**Service**: SendGrid (recommended) or SMTP

---

## Overview

Your Hi-Ring CRM now has **real email sending capability** integrated with the workflow automation system. Emails are sent automatically when workflows trigger, with full variable substitution and HTML formatting.

### Features

✅ **SendGrid Integration** - Professional email delivery
✅ **Variable Substitution** - `{{firstName}}`, `{{companyName}}`, etc.
✅ **HTML Email Templates** - Beautiful, responsive emails
✅ **Mock Mode** - Test without SendGrid (for development)
✅ **Email Validation** - Prevents invalid email addresses
✅ **Error Handling** - Graceful failures with logging
✅ **Test Interface** - UI for testing email configuration

---

## Quick Start (5 Minutes)

### 1. Create SendGrid Account

**Free Tier**: 100 emails/day permanently free

1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Sign up with your email
3. Verify your email address
4. Complete the onboarding questionnaire

### 2. Create API Key

1. Log into SendGrid Dashboard
2. Go to **Settings → API Keys**
3. Click **Create API Key**
4. Configuration:
   - **Name**: `Hi-Ring Recruitment`
   - **Type**: **Full Access** (or Restricted with "Mail Send" permission)
5. Click **Create & View**
6. **Copy the API key** (it will only be shown once!)
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Configure Environment Variables

Edit `.env.local`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here

# Email Sender Settings
EMAIL_FROM=noreply@votre-domaine.com
EMAIL_FROM_NAME=Hi-Ring Recrutement
EMAIL_REPLY_TO=contact@votre-domaine.com  # Optional

# Company name for email templates
COMPANY_NAME=Hi-Ring
```

### 4. Restart Development Server

```bash
npm run dev
```

### 5. Test Email Configuration

1. Navigate to `/admin/email-test`
2. Enter your email address
3. Click "**Envoyer Email de Test**"
4. Check your inbox (also spam/junk folder)

✅ **Success**: You'll receive a test email
❌ **Failed**: Check console logs for error details

---

## Email Configuration Options

### Option 1: SendGrid (Recommended)

**Pros**:
- ✅ 100 emails/day free forever
- ✅ Best deliverability
- ✅ Detailed analytics
- ✅ Easy setup (just API key)
- ✅ No SMTP configuration needed

**Cons**:
- ⚠️ Requires account creation
- ⚠️ Paid plans for >100 emails/day

**Setup**:
```bash
SENDGRID_API_KEY=SG.your_key_here
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company Name
```

### Option 2: Gmail SMTP

**Pros**:
- ✅ Use existing Gmail account
- ✅ No new service signup
- ✅ Free up to 500 emails/day

**Cons**:
- ⚠️ Requires App Password (not regular password)
- ⚠️ May mark as "sent via gmail.com"
- ⚠️ Less professional for businesses

**Setup**:
1. Generate Gmail App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Configure:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_app_password_here
EMAIL_FROM=your.email@gmail.com
EMAIL_FROM_NAME=Your Name
```

### Option 3: Custom SMTP Server

**Pros**:
- ✅ Use your own email server
- ✅ Full control

**Cons**:
- ⚠️ Requires SMTP server setup
- ⚠️ Need to manage deliverability

**Setup**:
```bash
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company
```

---

## Email Service Features

### 1. Variable Substitution

**Available Variables**:
```javascript
{{firstName}}        // Candidate first name
{{lastName}}         // Candidate last name
{{fullName}}         // First + Last name
{{email}}            // Candidate email
{{position}}         // Applied/current position
{{companyName}}      // Your company name
{{currentDate}}      // Today's date (formatted)
{{recruiterName}}    // Assigned recruiter
{{recruiterEmail}}   // Recruiter email
```

**Example Email Template**:
```
Bonjour {{firstName}},

Nous avons bien reçu votre candidature pour le poste de {{position}}
chez {{companyName}}.

Notre équipe va examiner votre profil et reviendra vers vous
sous 48 heures.

Cordialement,
{{recruiterName}}
{{companyName}}
```

**Renders as**:
```
Bonjour Marie,

Nous avons bien reçu votre candidature pour le poste de
Développeur Full-Stack chez Hi-Ring.

Notre équipe va examiner votre profil et reviendra vers vous
sous 48 heures.

Cordialement,
Jean Dupont
Hi-Ring
```

### 2. HTML Email Formatting

All emails are automatically converted to beautiful HTML:
- ✅ Responsive design
- ✅ Readable on mobile
- ✅ Professional footer
- ✅ Proper paragraph spacing
- ✅ Line breaks preserved

### 3. Email Validation

Before sending, the system validates:
- ✅ Email format (RFC 5322)
- ✅ Recipient exists
- ✅ No empty fields
- ❌ Rejects invalid emails

### 4. Error Handling

If email fails:
1. Error is logged to console
2. Workflow continues (doesn't fail entirely)
3. Error details saved to workflow execution log
4. Administrator can review failed emails

### 5. Rate Limiting

Built-in rate limiting:
- **100ms delay** between bulk emails
- Prevents SendGrid rate limits
- Protects your sending reputation

---

## Workflow Integration

### Creating Email-Sending Workflows

#### Example 1: Welcome Email

```javascript
Trigger: Status changed to "Contacted"

Action: Send Email
  - To: Candidate
  - Subject: Bienvenue chez {{companyName}}
  - Body:
    Bonjour {{firstName}},

    Merci pour votre candidature au poste de {{position}}.

    Nous allons étudier votre profil et reviendrons vers vous
    dans les 48 heures.

    Cordialement,
    L'équipe {{companyName}}
```

#### Example 2: Interview Confirmation

```javascript
Trigger: Status changed to "Interview Scheduled"

Action: Send Email
  - To: Candidate
  - Subject: Confirmation - Entretien {{companyName}}
  - Body:
    Bonjour {{firstName}},

    Votre entretien pour le poste de {{position}} est confirmé.

    Nous sommes impatients de vous rencontrer!

    À bientôt,
    {{recruiterName}}
```

#### Example 3: Rejection (Gentle)

```javascript
Trigger: Status changed to "Rejected"

Action: Send Email
  - To: Candidate
  - Subject: Suite de votre candidature - {{companyName}}
  - Body:
    Bonjour {{firstName}},

    Nous avons examiné votre profil avec attention.

    Malheureusement, nous ne pourrons pas donner suite à votre
    candidature pour ce poste.

    Nous gardons votre profil dans notre base de données et
    vous recontacterons si une opportunité correspondant mieux
    à votre profil se présente.

    Nous vous souhaitons beaucoup de succès dans votre recherche.

    Cordialement,
    L'équipe {{companyName}}
```

### Testing Workflows with Email

1. Create workflow with test mode: `testMode: true`
2. Workflow will log emails but not send them
3. Check console for email content
4. Once validated, set `testMode: false`

---

## Testing & Troubleshooting

### Test Email Configuration

**UI Method**:
1. Go to `/admin/email-test`
2. Check configuration status
3. Send test email to your address

**API Method**:
```bash
# Check status
curl http://localhost:3000/api/email/test

# Send test email
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your@email.com"}'
```

### Common Issues

#### ❌ "SENDGRID_API_KEY not found"

**Solution**: Add API key to `.env.local`
```bash
SENDGRID_API_KEY=SG.your_key_here
```
Then restart server: `npm run dev`

#### ❌ "Unauthorized" (401 error)

**Problem**: Invalid API key

**Solutions**:
1. Check API key is copied correctly (no extra spaces)
2. Verify key has "Mail Send" permission in SendGrid
3. Key may be expired - create a new one

#### ❌ "From email not verified"

**Problem**: SendGrid requires sender verification

**Solutions**:
1. **Single Sender Verification** (Free):
   - Go to SendGrid → Settings → Sender Authentication
   - Add & verify your email address
   - Use this email in `EMAIL_FROM`

2. **Domain Authentication** (Professional):
   - Go to SendGrid → Settings → Sender Authentication
   - Authenticate your domain (requires DNS changes)
   - Use any email @ your domain

#### ❌ Emails going to spam

**Solutions**:
1. **Authenticate your domain** in SendGrid
2. Add **SPF and DKIM** records to your DNS
3. Use a **professional email address** (not @gmail.com)
4. Avoid **spam trigger words** in subject/body
5. Include an **unsubscribe link**

#### ❌ Rate limit exceeded

**Problem**: SendGrid free tier is 100 emails/day

**Solutions**:
1. Upgrade to SendGrid paid plan ($15/month for 40k emails)
2. Spread email sending across multiple days
3. Use bulk email feature with delays

---

## Production Deployment

### Environment Variables for Production

```bash
# Required
SENDGRID_API_KEY=SG.production_key_here
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company Name

# Optional but recommended
EMAIL_REPLY_TO=support@yourcompany.com
COMPANY_NAME=Your Company
```

### Best Practices

1. **Use Production API Key**
   - Create separate API key for production
   - Don't reuse development keys

2. **Verify Sender Domain**
   - Authenticate your sending domain in SendGrid
   - Improves deliverability by 50%+

3. **Monitor Email Quota**
   - SendGrid Dashboard shows usage
   - Set up alerts at 80% quota

4. **Track Email Opens/Clicks** (Optional)
   - Enable in SendGrid settings
   - View analytics in SendGrid Dashboard

5. **Handle Bounces**
   - Monitor bounce rate in SendGrid
   - Remove invalid emails from database

6. **Backup Email Service**
   - Configure SMTP as backup
   - System will fallback if SendGrid fails

---

## Email Logging & Tracking

### Workflow Execution Logs

Every email sent is logged:
```javascript
{
  workflowId: "xxx",
  candidateId: "yyy",
  action: "send_email",
  result: {
    success: true,
    messageId: "abc123",
    provider: "sendgrid",
    to: "candidate@email.com",
    subject: "Welcome Email"
  },
  timestamp: "2025-10-13T10:30:00Z"
}
```

### Viewing Logs

**Database**: `workflow_executions` collection
**Console**: Check server logs for email activity
**SendGrid Dashboard**: View delivery stats

### Monitoring

Monitor these metrics:
- ✅ **Emails sent** (total count)
- ✅ **Delivery rate** (sent / attempted)
- ✅ **Open rate** (opened / delivered)
- ✅ **Click rate** (clicked / delivered)
- ⚠️ **Bounce rate** (bounced / sent) - should be <5%
- ⚠️ **Spam rate** (marked spam / sent) - should be <0.1%

---

## Advanced Configuration

### Custom Email Templates

Create reusable HTML templates:

```javascript
// In workflow action
{
  type: 'send_email',
  emailTo: 'candidate',
  emailTemplateId: 'd-xyz123',  // SendGrid Dynamic Template ID
  emailTemplateVariables: {
    firstName: '{{firstName}}',
    position: '{{position}}',
    interviewDate: '2025-10-15'
  }
}
```

### Multiple Email Addresses

Send to multiple recipients:

```javascript
{
  type: 'send_email',
  emailTo: 'custom',
  emailCustomRecipient: 'hr@company.com,manager@company.com',
  cc: 'recruiter@company.com',
  bcc: 'archive@company.com'
}
```

### Email with Attachments

```javascript
await EmailService.sendEmail({
  to: 'candidate@email.com',
  subject: 'Interview Details',
  html: '<p>Please find attached...</p>',
  attachments: [{
    content: base64Content,
    filename: 'interview-guide.pdf',
    type: 'application/pdf',
    disposition: 'attachment'
  }]
})
```

---

## API Reference

### EmailService Class

#### `sendEmail(options: EmailOptions)`

Send a single email.

```typescript
const result = await EmailService.sendEmail({
  to: 'candidate@email.com',
  subject: 'Welcome!',
  text: 'Plain text content',
  html: '<p>HTML content</p>',
  from: {
    email: 'noreply@company.com',
    name: 'Company Name'
  }
})

// Returns: { success: boolean, messageId?: string, error?: string }
```

#### `renderTemplate(template: string, variables: object)`

Render template with variables.

```typescript
const text = EmailService.renderTemplate(
  'Hello {{firstName}}, welcome to {{companyName}}!',
  { firstName: 'Marie', companyName: 'Hi-Ring' }
)
// Returns: "Hello Marie, welcome to Hi-Ring!"
```

#### `testConfiguration(email: string)`

Test email setup.

```typescript
const result = await EmailService.testConfiguration('test@email.com')
// Sends test email and returns result
```

#### `isValidEmail(email: string)`

Validate email format.

```typescript
EmailService.isValidEmail('test@email.com')  // true
EmailService.isValidEmail('invalid-email')    // false
```

---

## Security Considerations

### API Key Protection

✅ **DO**:
- Store API key in `.env.local` (never in code)
- Add `.env.local` to `.gitignore`
- Use different keys for dev/staging/production
- Rotate keys every 90 days

❌ **DON'T**:
- Commit API keys to Git
- Share keys via email/Slack
- Use same key across environments
- Log API keys to console

### Email Content Security

✅ **DO**:
- Sanitize user-provided content
- Validate recipient email addresses
- Rate limit email sending
- Include unsubscribe links

❌ **DON'T**:
- Send to unverified email addresses
- Include sensitive data in emails
- Send without user consent
- Ignore bounces/complaints

---

## Upgrade Paths

### Current: Free Tier
- **100 emails/day**
- All features
- Perfect for testing & small teams

### SendGrid Essentials ($15/month)
- **40,000 emails/month**
- Email validation
- Dedicated IP
- 24/7 support

### SendGrid Pro ($60/month)
- **100,000 emails/month**
- Advanced statistics
- Subuser management
- Priority support

### SendGrid Premier ($hundreds/month)
- **Millions of emails**
- Dedicated IP pool
- Custom contracts
- White-glove support

---

## Success Checklist

- [ ] SendGrid account created
- [ ] API key generated
- [ ] `.env.local` configured with `SENDGRID_API_KEY`
- [ ] Development server restarted
- [ ] Test email sent successfully via `/admin/email-test`
- [ ] Workflow created with email action
- [ ] Workflow triggered and email sent
- [ ] Email received in inbox (not spam)
- [ ] Sender domain authenticated (production)
- [ ] Email monitoring set up

---

## Support & Resources

### SendGrid Resources
- [SendGrid Docs](https://docs.sendgrid.com/)
- [API Reference](https://docs.sendgrid.com/api-reference)
- [Getting Started Guide](https://docs.sendgrid.com/for-developers/sending-email)

### Hi-Ring Resources
- Workflow documentation: `docs/IMPLEMENTATION-COMPLETE-OCT-2025.md`
- Email service code: `src/app/lib/emailService.ts`
- Workflow engine: `src/app/lib/workflowEngine.ts`
- Test UI: `src/app/admin/email-test/page.tsx`

### Need Help?
1. Check console logs for errors
2. Test email configuration at `/admin/email-test`
3. Verify API key has correct permissions
4. Check SendGrid Dashboard for delivery issues
5. Review workflow execution logs

---

**Version**: 1.0
**Last Updated**: October 13, 2025
**Status**: Production Ready

---

*Congratulations! Your CRM now has professional email automation! 📧🎉*
