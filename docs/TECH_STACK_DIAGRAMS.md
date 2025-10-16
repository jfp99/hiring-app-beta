# Hi-Ring: Technology Stack Diagrams

**Visual Architecture Overview**

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
        Extension[Chrome Extension]
    end

    subgraph "Frontend - Next.js 15.5.4"
        Pages[Pages/Routes]
        Components[React Components]
        Contexts[Global State]
        Hooks[Custom Hooks]
    end

    subgraph "API Layer"
        Auth[Authentication<br/>NextAuth.js v5]
        Routes[API Routes<br/>REST Endpoints]
        Middleware[Middleware<br/>Rate Limit + Validation]
    end

    subgraph "Service Layer"
        CandidateService[Candidate Service]
        InterviewService[Interview Service]
        EmailService[Email Service<br/>SendGrid]
        WorkflowService[Workflow Service]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB 6.20<br/>Atlas Cloud)]
        FileStorage[File Storage<br/>Vercel Blob]
    end

    Browser --> Pages
    Mobile --> Pages
    Extension --> Routes
    Pages --> Components
    Components --> Contexts
    Components --> Hooks
    Pages --> Routes
    Routes --> Auth
    Routes --> Middleware
    Middleware --> CandidateService
    Middleware --> InterviewService
    Middleware --> EmailService
    Middleware --> WorkflowService
    CandidateService --> MongoDB
    InterviewService --> MongoDB
    EmailService --> MongoDB
    WorkflowService --> MongoDB
    CandidateService --> FileStorage

    style Browser fill:#4A90E2
    style Mobile fill:#4A90E2
    style Extension fill:#7B68EE
    style Pages fill:#50C878
    style MongoDB fill:#13AA52
    style FileStorage fill:#FF6B6B
```

---

## 2. Frontend Technology Stack

```mermaid
graph LR
    subgraph "UI Layer"
        Next[Next.js 15.5.4<br/>App Router]
        React[React 19.1.0<br/>Server + Client]
        TS[TypeScript 5<br/>Strict Mode]
    end

    subgraph "Styling & Animation"
        Tailwind[Tailwind CSS v4<br/>Utility-First]
        Framer[Framer Motion<br/>Animations]
        Radix[Radix UI<br/>Primitives]
    end

    subgraph "State & Data"
        Context[React Context<br/>Theme + Notifications]
        Hooks[Custom Hooks<br/>useApi, useDebounce]
        Zod[Zod<br/>Validation]
    end

    Next --> React
    React --> TS
    Next --> Tailwind
    React --> Framer
    React --> Radix
    React --> Context
    React --> Hooks
    Hooks --> Zod

    style Next fill:#000000,color:#fff
    style React fill:#61DAFB
    style TS fill:#3178C6,color:#fff
    style Tailwind fill:#06B6D4,color:#fff
    style Zod fill:#3E67B1,color:#fff
```

---

## 3. Backend Technology Stack

```mermaid
graph TB
    subgraph "Authentication"
        NextAuth[NextAuth.js v5<br/>Beta 29]
        JWT[JWT Sessions<br/>30-day expiry]
        Bcrypt[bcrypt<br/>12 salt rounds]
    end

    subgraph "API & Validation"
        APIRoutes[Next.js API Routes<br/>REST Endpoints]
        ZodValidation[Zod Schemas<br/>Runtime Validation]
        RateLimit[Rate Limiter<br/>10 req/min]
    end

    subgraph "Business Logic"
        Services[Service Layer<br/>TypeScript Classes]
        Utils[Utility Libraries<br/>Security + Helpers]
    end

    subgraph "External Services"
        SendGrid[SendGrid<br/>Email Delivery]
        Vercel[Vercel Analytics<br/>Speed Insights]
    end

    NextAuth --> JWT
    NextAuth --> Bcrypt
    APIRoutes --> NextAuth
    APIRoutes --> ZodValidation
    APIRoutes --> RateLimit
    ZodValidation --> Services
    Services --> Utils
    Services --> SendGrid
    APIRoutes --> Vercel

    style NextAuth fill:#000000,color:#fff
    style SendGrid fill:#1A82E2,color:#fff
    style Vercel fill:#000000,color:#fff
```

---

## 4. Database Architecture

```mermaid
graph TB
    subgraph "MongoDB Collections"
        Candidates[(candidates<br/>Main Records)]
        Interviews[(interviews<br/>Schedules)]
        Tasks[(tasks<br/>Follow-ups)]
        Comments[(comments<br/>Discussions)]
        Users[(users<br/>Auth)]
        Workflows[(workflows<br/>Automation)]
        EmailTemplates[(emailTemplates<br/>Templates)]
        CustomFields[(customFields<br/>Config)]
        Offres[(offres<br/>Job Postings)]
    end

    subgraph "Indexes"
        EmailIdx[Email: Unique]
        StatusIdx[Status + Date]
        TextIdx[Full-Text Search]
        AssignedIdx[Assigned User]
    end

    Candidates --> EmailIdx
    Candidates --> StatusIdx
    Candidates --> TextIdx
    Candidates --> AssignedIdx
    Interviews --> Candidates
    Tasks --> Candidates
    Comments --> Candidates
    Workflows --> Candidates

    style Candidates fill:#13AA52,color:#fff
    style Interviews fill:#47A248,color:#fff
    style Users fill:#00684A,color:#fff
    style EmailIdx fill:#FFA500
```

---

## 5. Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS
    participant API
    participant Auth
    participant Service
    participant MongoDB
    participant SendGrid

    User->>Browser: Login (email + password)
    Browser->>NextJS: POST /auth/login
    NextJS->>API: Forward request
    API->>Auth: Validate credentials
    Auth->>MongoDB: Query users collection
    MongoDB-->>Auth: Return user data
    Auth->>Auth: Compare bcrypt hash
    Auth-->>API: JWT token
    API-->>Browser: Set httpOnly cookie
    Browser-->>User: Redirect to /dashboard

    User->>Browser: View candidate list
    Browser->>NextJS: GET /candidates
    NextJS->>API: API call with JWT
    API->>Auth: Verify JWT
    Auth-->>API: Session valid
    API->>Service: candidateService.search()
    Service->>MongoDB: Query with filters
    MongoDB-->>Service: Return results
    Service-->>API: Processed data
    API-->>Browser: JSON response
    Browser-->>User: Display candidates

    User->>Browser: Send interview email
    Browser->>NextJS: POST /api/email/send
    NextJS->>API: API call
    API->>Service: emailService.send()
    Service->>SendGrid: Send email
    SendGrid-->>Service: Delivery status
    Service->>MongoDB: Log activity
    Service-->>API: Success
    API-->>Browser: Confirmation
    Browser-->>User: Email sent notification
```

---

## 6. Security Architecture

```mermaid
graph TB
    subgraph "Edge Layer - Vercel"
        CDN[Global CDN<br/>DDoS Protection]
        WAF[Web Application Firewall]
    end

    subgraph "Application Security"
        Middleware[Middleware Layer]
        Auth[NextAuth.js<br/>JWT + RBAC]
        RateLimit[Rate Limiting<br/>Redis-based]
        Validation[Zod Validation<br/>Input Sanitization]
    end

    subgraph "Data Security"
        Encryption[TLS 1.3 Transit<br/>AES-256 Rest]
        Hashing[bcrypt Password<br/>12+ Rounds]
        Audit[Audit Logs<br/>Activity Tracking]
    end

    subgraph "Compliance"
        GDPR[GDPR Compliance<br/>Right to Erasure]
        Privacy[Privacy Policy<br/>Consent Management]
        Retention[Data Retention<br/>2-year Policy]
    end

    CDN --> WAF
    WAF --> Middleware
    Middleware --> Auth
    Middleware --> RateLimit
    Middleware --> Validation
    Auth --> Encryption
    Auth --> Hashing
    Validation --> Audit
    Hashing --> GDPR
    Audit --> Privacy
    GDPR --> Retention

    style CDN fill:#FF6B6B
    style Auth fill:#4A90E2
    style Encryption fill:#50C878
    style GDPR fill:#9B59B6,color:#fff
```

---

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Dev<br/>npm run dev]
        Git[Git Repository<br/>GitHub]
    end

    subgraph "CI/CD Pipeline"
        Push[Git Push]
        Build[Build Process<br/>Type Check + Tests]
        Deploy[Auto Deploy]
    end

    subgraph "Production - Vercel"
        Edge[Vercel Edge Network<br/>40+ Locations]
        Lambda[Serverless Functions<br/>Auto-Scaling]
        Analytics[Analytics + Insights]
    end

    subgraph "Database - MongoDB Atlas"
        Primary[Primary Cluster<br/>Auto Failover]
        Replica[Read Replicas<br/>Load Distribution]
        Backup[Daily Backups<br/>Point-in-Time Recovery]
    end

    subgraph "External Services"
        SendGridProd[SendGrid<br/>Email Delivery]
        BlobStorage[Vercel Blob<br/>File Storage]
    end

    Dev --> Git
    Git --> Push
    Push --> Build
    Build --> Deploy
    Deploy --> Edge
    Edge --> Lambda
    Lambda --> Analytics
    Lambda --> Primary
    Primary --> Replica
    Primary --> Backup
    Lambda --> SendGridProd
    Lambda --> BlobStorage

    style Edge fill:#000000,color:#fff
    style Primary fill:#13AA52,color:#fff
    style SendGridProd fill:#1A82E2,color:#fff
```

---

## 8. Technology Comparison Matrix

```mermaid
graph LR
    subgraph "Hi-Ring Stack"
        NextJS[Next.js 15<br/>2025]
        React19[React 19<br/>2024]
        MongoDB6[MongoDB 6<br/>Latest]
        TypeScript5[TypeScript 5<br/>Strict]
    end

    subgraph "Greenhouse Stack"
        Rails[Ruby on Rails<br/>~2015]
        jQuery[jQuery<br/>~2010]
        PostgreSQL[PostgreSQL<br/>Standard]
        Ruby[Ruby<br/>Mixed Types]
    end

    subgraph "Lever Stack"
        Angular[Angular<br/>~2018]
        NodeJS[Node.js<br/>Standard]
        MySQL[MySQL<br/>Standard]
        JS[JavaScript<br/>Some TS]
    end

    NextJS -.Modern.-> Rails
    React19 -.Modern.-> jQuery
    MongoDB6 -.Flexible.-> PostgreSQL
    TypeScript5 -.Safe.-> Ruby

    NextJS -.Latest.-> Angular
    React19 -.Latest.-> NodeJS
    MongoDB6 -.NoSQL.-> MySQL
    TypeScript5 -.Strict.-> JS

    style NextJS fill:#50C878
    style React19 fill:#50C878
    style MongoDB6 fill:#50C878
    style TypeScript5 fill:#50C878
    style Rails fill:#FF6B6B
    style jQuery fill:#FF6B6B
    style Angular fill:#FFA500
    style JS fill:#FFA500
```

---

## 9. Performance Architecture

```mermaid
graph TB
    subgraph "Performance Optimizations"
        SSR[Server-Side Rendering<br/>Fast First Paint]
        SSG[Static Site Generation<br/>Public Pages]
        ISR[Incremental Regeneration<br/>Cache + Fresh Data]
        CodeSplit[Code Splitting<br/>Route-Based]
    end

    subgraph "Asset Optimization"
        ImageOpt[Next.js Image<br/>AVIF + WebP]
        FontOpt[Font Optimization<br/>next/font]
        CSSPurge[CSS Purging<br/>Tailwind JIT]
    end

    subgraph "Caching Strategy"
        EdgeCache[Edge Caching<br/>Vercel CDN]
        BrowserCache[Browser Cache<br/>Service Workers]
        APICache[API Cache<br/>SWR Strategy]
    end

    subgraph "Monitoring"
        WebVitals[Core Web Vitals<br/>LCP, FID, CLS]
        Analytics[Vercel Analytics<br/>Real User Monitoring]
        SpeedInsights[Speed Insights<br/>Performance Score]
    end

    SSR --> EdgeCache
    SSG --> EdgeCache
    ISR --> EdgeCache
    ImageOpt --> BrowserCache
    FontOpt --> BrowserCache
    CSSPurge --> BrowserCache
    EdgeCache --> WebVitals
    APICache --> Analytics
    WebVitals --> SpeedInsights

    style SSR fill:#4A90E2
    style ImageOpt fill:#50C878
    style EdgeCache fill:#9B59B6,color:#fff
    style WebVitals fill:#FFA500
```

---

## 10. Development Workflow

```mermaid
graph LR
    subgraph "Local Development"
        Code[Write Code<br/>VSCode]
        Lint[ESLint Check<br/>Auto-fix]
        TypeCheck[TypeScript<br/>Strict Mode]
        Test[Vitest Tests<br/>Unit + Integration]
    end

    subgraph "Git Workflow"
        Commit[Git Commit<br/>Husky Hooks]
        Push[Git Push<br/>GitHub]
    end

    subgraph "CI/CD"
        BuildCI[Build Check<br/>GitHub Actions]
        TestCI[Test Suite<br/>Automated]
        PreviewDeploy[Preview Deploy<br/>Vercel]
    end

    subgraph "Production"
        MainDeploy[Main Deploy<br/>Automatic]
        Monitor[Monitoring<br/>Errors + Performance]
    end

    Code --> Lint
    Lint --> TypeCheck
    TypeCheck --> Test
    Test --> Commit
    Commit --> Push
    Push --> BuildCI
    BuildCI --> TestCI
    TestCI --> PreviewDeploy
    PreviewDeploy --> MainDeploy
    MainDeploy --> Monitor
    Monitor -.Feedback.-> Code

    style Code fill:#4A90E2
    style Commit fill:#50C878
    style MainDeploy fill:#9B59B6,color:#fff
    style Monitor fill:#FFA500
```

---

## How to View These Diagrams

### Method 1: GitHub/GitLab (Automatic Rendering)
Push this file to GitHub or GitLab—Mermaid diagrams render automatically.

### Method 2: VS Code Extension
Install **Mermaid Preview** extension in VS Code:
```bash
ext install vstirbu.vscode-mermaid-preview
```

### Method 3: Online Editors
- **Mermaid Live Editor**: https://mermaid.live/
- **Markdown Preview Enhanced**: VS Code extension

### Method 4: Export to Images
Use Mermaid CLI to generate PNG/SVG:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i TECH_STACK_DIAGRAMS.md -o diagrams.pdf
```

---

## Diagram Legend

| Color | Meaning |
|-------|---------|
| 🟢 Green | Modern/Optimized Technology |
| 🔵 Blue | Core Infrastructure |
| 🟣 Purple | Security/Compliance |
| 🟠 Orange | Monitoring/Analytics |
| 🔴 Red | Legacy/Outdated (Competitors) |

---

**Document Version**: 1.0
**Created By**: Jeff Pruvost
**Date**: October 2025
**Format**: Mermaid Diagrams (Markdown)

---

*Visual architecture documentation for Hi-Ring recruitment platform*
