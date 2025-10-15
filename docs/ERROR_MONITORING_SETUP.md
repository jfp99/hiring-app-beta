# Error Monitoring Setup Guide

## Overview

This guide provides instructions for setting up error monitoring and observability for the Hi-ring application in production.

## Recommended Solution: Sentry

Sentry is the recommended error monitoring solution for Next.js applications, offering:

- **Error tracking**: Automatic error capture and stack traces
- **Performance monitoring**: Transaction traces and slow queries
- **Release tracking**: Track errors by deployment version
- **User feedback**: Collect user reports
- **Source maps**: Readable production stack traces
- **Integrations**: Slack, PagerDuty, GitHub, etc.

## Installation Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account (up to 5K errors/month free)
3. Create a new project for "Next.js"
4. Note your DSN (Data Source Name)

### 2. Install Dependencies

```bash
npm install @sentry/nextjs
```

### 3. Initialize Sentry

Run the Sentry wizard to automatically configure your project:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.ts` with Sentry webpack plugin
- Add Sentry env vars to `.env.local`

### 4. Environment Variables

Add to `.env.local`:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name

# Optional: Disable Sentry in development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

Add to `.env.production`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

**IMPORTANT**: Never commit `.env.production` to git. Add it to `.gitignore`.

### 5. Configuration Files

The wizard creates these files. Here's what they should contain:

#### `sentry.client.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      // Mask all text content, enable input recording
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out known errors
    const error = hint.originalException as Error
    if (error?.message?.includes('ResizeObserver loop')) {
      return null // Ignore ResizeObserver errors
    }

    return event
  },
})
```

#### `sentry.server.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Scrub sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }

    return event
  },
})
```

#### `sentry.edge.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
})
```

### 6. Update next.config.ts

Add Sentry webpack plugin configuration:

```typescript
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  // ... your existing config
}

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry project supports Tunnel before enabling this option.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
```

## Manual Error Capture

### Capture Exceptions

```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // Your code
  await somethingRisky()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'api',
      endpoint: 'candidates'
    },
    extra: {
      candidateId: 'abc123',
      userId: 'user456'
    }
  })

  // Re-throw or handle error
  throw error
}
```

### Capture Messages

```typescript
Sentry.captureMessage('Something important happened', {
  level: 'info',
  tags: {
    feature: 'workflows'
  }
})
```

### Add Context

```typescript
// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  role: user.role
})

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info'
})

// Set tags
Sentry.setTag('feature', 'candidate-import')

// Set context
Sentry.setContext('candidate', {
  id: 'abc123',
  status: 'new',
  source: 'linkedin'
})
```

## Error Boundary

Create a custom error boundary for React components:

```typescript
// app/components/ErrorBoundary.tsx
'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback

      if (Fallback) {
        return (
          <Fallback
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: null })}
          />
        )
      }

      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We've been notified and will fix it soon.</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

Usage:

```typescript
// app/layout.tsx
import { ErrorBoundary } from './components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

## API Route Error Handling

Wrap API routes with Sentry error handling:

```typescript
// app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  try {
    // Your route logic
    const data = await fetchCandidates()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    // Capture error with context
    Sentry.captureException(error, {
      tags: {
        api_route: 'candidates',
        method: 'GET'
      },
      extra: {
        url: request.url,
        headers: Object.fromEntries(request.headers)
      }
    })

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}
```

## Performance Monitoring

### Automatic Instrumentation

Sentry automatically instruments:
- Page loads
- API routes
- Database queries (via integrations)
- External HTTP requests

### Custom Transactions

```typescript
import * as Sentry from '@sentry/nextjs'

async function complexOperation() {
  const transaction = Sentry.startTransaction({
    op: 'task',
    name: 'Import Candidates from CSV'
  })

  try {
    // Parse CSV
    const parseSpan = transaction.startChild({
      op: 'parse',
      description: 'Parse CSV file'
    })
    const data = await parseCSV(file)
    parseSpan.finish()

    // Validate
    const validateSpan = transaction.startChild({
      op: 'validate',
      description: 'Validate candidates'
    })
    const validated = await validateCandidates(data)
    validateSpan.finish()

    // Save to database
    const saveSpan = transaction.startChild({
      op: 'db',
      description: 'Save to database'
    })
    await saveCandidates(validated)
    saveSpan.finish()

    transaction.setStatus('ok')
  } catch (error) {
    transaction.setStatus('error')
    throw error
  } finally {
    transaction.finish()
  }
}
```

## Alerts and Notifications

### Configure Alerts in Sentry

1. Go to **Settings** → **Alerts**
2. Create alert rules:

**High Error Rate Alert**:
- Condition: Error count > 100 in 1 hour
- Action: Send to Slack #engineering

**New Error Alert**:
- Condition: First seen error
- Action: Email to team@hi-ring.com

**Performance Degradation**:
- Condition: p95 response time > 3s
- Action: Create PagerDuty incident

### Slack Integration

1. Go to **Settings** → **Integrations** → **Slack**
2. Authorize Sentry app
3. Configure channels for alerts

### Email Notifications

Configure in **Settings** → **Notifications**:
- Personal notifications: Critical errors only
- Team notifications: All errors in production

## Release Tracking

Track errors by deployment version:

```bash
# Set release in CI/CD
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Build with release
npm run build

# Create release in Sentry
sentry-cli releases new $SENTRY_RELEASE
sentry-cli releases set-commits $SENTRY_RELEASE --auto
sentry-cli releases finalize $SENTRY_RELEASE

# Deploy
# ...

# Mark deployment
sentry-cli releases deploys $SENTRY_RELEASE new -e production
```

## Best Practices

### 1. Don't Log Sensitive Data

```typescript
// Bad
Sentry.captureException(error, {
  extra: {
    password: user.password,  // Never!
    creditCard: payment.cc    // Never!
  }
})

// Good
Sentry.captureException(error, {
  extra: {
    userId: user.id,
    paymentMethod: payment.type
  }
})
```

### 2. Use Appropriate Sample Rates

```typescript
// Development: 100% sampling
tracesSampleRate: 1.0

// Production: 10% sampling (adjust based on traffic)
tracesSampleRate: 0.1
```

### 3. Add Context

```typescript
// Add useful context to all errors
Sentry.setUser({ id: userId })
Sentry.setTag('feature', 'workflows')
Sentry.addBreadcrumb({
  message: 'User clicked export button',
  level: 'info'
})
```

### 4. Filter Noise

```typescript
beforeSend(event, hint) {
  // Filter known issues
  const error = hint.originalException as Error

  if (error?.message?.includes('ResizeObserver loop')) {
    return null
  }

  if (error?.message?.includes('Network request failed')) {
    // Log but don't send to Sentry (too common)
    console.warn('Network error:', error)
    return null
  }

  return event
}
```

### 5. Test in Development

```typescript
// Add test error button
<button onClick={() => {
  throw new Error('Test Sentry error')
}}>
  Test Error
</button>
```

## Alternative Solutions

### Datadog

- **Pros**: Full observability (logs, metrics, APM, RUM)
- **Cons**: More expensive, steeper learning curve
- **Use case**: Enterprise applications with complex infrastructure

### LogRocket

- **Pros**: Session replay, user monitoring
- **Cons**: Focused on frontend only
- **Use case**: Heavy focus on user experience debugging

### New Relic

- **Pros**: Comprehensive APM, infrastructure monitoring
- **Cons**: Expensive, complex setup
- **Use case**: Large-scale applications with performance requirements

### Rollbar

- **Pros**: Simple error tracking, good for small teams
- **Cons**: Limited performance monitoring
- **Use case**: Startups and small teams

## Cost Estimation

### Sentry Pricing (as of 2024)

**Free Tier**:
- 5,000 errors/month
- 10,000 performance units/month
- 500 replays/month
- Good for: Small apps, MVP, staging

**Team Plan ($26/month)**:
- 50,000 errors/month
- 100,000 performance units/month
- 5,000 replays/month
- Good for: Small to medium production apps

**Business Plan (Custom)**:
- Unlimited errors
- Custom performance units
- Custom replays
- Good for: Enterprise applications

## Deployment Checklist

- [ ] Create Sentry account and project
- [ ] Install @sentry/nextjs package
- [ ] Run Sentry wizard
- [ ] Configure environment variables
- [ ] Test error capture in development
- [ ] Add custom error boundaries
- [ ] Configure alerts
- [ ] Set up Slack/email notifications
- [ ] Integrate with CI/CD for releases
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor for first 24 hours
- [ ] Fine-tune sample rates and filters

## Support Resources

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Community**: https://discord.gg/sentry
- **Status**: https://status.sentry.io/

## Next Steps

After setting up error monitoring:

1. **Monitor for 1 week**: Observe error patterns
2. **Fix critical errors**: Address high-frequency issues
3. **Set up alerts**: Configure for your team's workflow
4. **Integrate with incident management**: Connect to PagerDuty/Opsgenie
5. **Regular reviews**: Weekly error review meetings
