# Hi-ring - Recruitment Platform

A modern, full-stack recruitment platform built with Next.js 15, MongoDB, and NextAuth. Streamline your hiring process with advanced candidate management, job postings, and team collaboration tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- SendGrid account (for emails)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hiring-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database (optional)
npm run db:init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation

- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Complete deployment guide and checklist
- **[Development Guide](./docs-dev/guides/CLAUDE.md)** - S-Tier development principles and standards
- **[E2E Testing](./docs-dev/testing/E2E-TEST-SUMMARY.md)** - Playwright test suite documentation

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - NoSQL database
- **NextAuth.js 5** - Authentication
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

### Email
- **SendGrid** - Transactional emails
- **Nodemailer** - Email handling

### Testing
- **Playwright** - E2E testing (37 tests, 100% passing)
- **Vitest** - Unit testing
- **Testing Library** - Component testing

### Development
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Husky** - Git hooks

---

## 📁 Project Structure

```
hiring-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   └── (pages)/           # Page routes
│   ├── lib/                   # Utility functions
│   └── services/              # Business logic
├── public/                    # Static assets
├── tests/                     # Test files (E2E, unit)
├── scripts/                   # Database & utility scripts
├── docs/                      # Business documentation (gitignored)
├── docs-dev/                  # Development docs (gitignored)
└── [config files]            # Configuration files
```

---

## 🎯 Features

### Public Pages
- 🏠 **Homepage** - Company presentation with hero section, services showcase
- 👁️ **Vision** - Company mission and client types
- 💼 **Job Listings** - Dynamic job board with search and filters
- 📧 **Contact** - Multi-type contact form (candidate/company)

### Admin Dashboard
- 👥 **Candidate Management** - Complete applicant tracking system
- 📊 **Pipeline View** - Kanban-style candidate workflow
- 📝 **Job Management** - Create, edit, publish job postings
- 📧 **Bulk Email** - Send templated emails to multiple candidates
- 📈 **Analytics** - Recruitment metrics and insights
- 🔧 **Settings** - Platform configuration

### Key Capabilities
- ✅ Multi-step application forms with file uploads
- ✅ Resume parsing (PDF, DOCX)
- ✅ Email notifications and templates
- ✅ Custom fields and workflow automation
- ✅ Interview scheduling with calendar invites
- ✅ Comment threads and feedback system
- ✅ Dark mode support
- ✅ Mobile-responsive design
- ✅ WCAG AA accessibility compliance

---

## 🧪 Testing

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# Chromium only (fastest)
npm run test:e2e:chromium
```

**Coverage:** 37 tests covering all interactive elements
- Homepage: 7 tests ✅
- Contact: 10 tests ✅
- Vision: 6 tests ✅
- Job Listings: 9 tests ✅
- Cross-page: 5 tests ✅

### Unit Tests (Vitest)
```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

---

## 📜 Available Scripts

### Development
```bash
npm run dev              # Start development server (port 3000 or 3002)
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint
```

### Database
```bash
npm run db:init          # Initialize database with schema
npm run db:seed          # Seed development data
npm run db:indexes       # Create database indexes
npm run test:seed        # Seed test data
```

### Testing
```bash
npm run test             # Run unit tests (Vitest)
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:coverage    # Generate coverage report
```

### Utilities
```bash
npm run test:bulk-email  # Test bulk email functionality
npm run test:analytics   # Test analytics queries
```

---

## 🔐 Environment Variables

Required environment variables (copy from `.env.example`):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DB=hiring-app

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@hi-ring.fr

# Admin
ADMIN_EMAIL=admin@hi-ring.fr

# Optional
NODE_ENV=development
```

**⚠️ Security:** Never commit `.env.local` to version control!

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to Git**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Connect your GitHub repository
   - Vercel auto-detects Next.js
   - Add environment variables in settings

3. **Configure Build**
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

4. **Deploy**
   - Automatic deployment on push
   - Preview deployments for branches

### Environment Setup
Set all environment variables in Vercel dashboard:
- Settings → Environment Variables
- Add production values
- Ensure NEXTAUTH_URL matches your domain

### Database
- Verify MongoDB Atlas cluster is production-ready
- Whitelist Vercel IPs (0.0.0.0/0 for serverless)
- Run index creation: `npm run db:indexes`

**📋 Full deployment checklist:** See [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

## 🎨 UI/UX Standards

### Design Score: **87/100** ✅

**Brand Colors:**
- Primary Green: `#3b5335ff`, `#2a3d26ff`
- Accent Orange: `#ffaf50ff`, `#ff9500ff`

**Key Features:**
- ✅ Consistent color palette across all pages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode with smooth transitions
- ✅ WCAG AA accessibility compliance
- ✅ Professional animations and transitions
- ✅ Optimized images with Next.js Image
- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements

---

## 🔧 Configuration Files

- **`next.config.ts`** - Next.js configuration with security headers
- **`tsconfig.json`** - TypeScript configuration (strict mode)
- **`eslint.config.mjs`** - ESLint rules and plugins
- **`tailwind.config.ts`** - Tailwind CSS customization
- **`playwright.config.ts`** - Playwright E2E test configuration
- **`vitest.config.ts`** - Vitest unit test configuration
- **`middleware.ts`** - NextAuth middleware for protected routes
- **`vercel.json`** - Vercel deployment configuration

---

## 📊 Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅

### Lighthouse Scores (Target)
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🤝 Contributing

This is a production application. Development guidelines:

1. Follow the [S-Tier Development Principles](./docs-dev/guides/CLAUDE.md)
2. Write tests for new features
3. Ensure TypeScript types are properly defined
4. Run linting and type-checking before committing
5. Follow semantic commit messages

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

For questions or support:
- **Hugo**: [06 66 74 76 18](tel:+33666747618)
- **Izia**: [06 09 11 15 98](tel:+33609111598)
- **Email**: contact@hi-ring.fr
- **Hours**: Mon-Fri, 9h-18h

---

## 🔗 Links

- **Production**: [Deployed URL]
- **Staging**: [Staging URL]
- **Documentation**: [This repository]

---

**Built with ❤️ by Hi-ring Team**

*Transforming recruitment with modern technology*
