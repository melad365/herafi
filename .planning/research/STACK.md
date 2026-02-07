# Technology Stack

**Project:** Herafi (Services Marketplace)
**Researched:** 2026-02-07
**Confidence:** MEDIUM (based on training data from Jan 2025, external verification tools unavailable)

## Executive Summary

For a services marketplace with real-time chat, gig listings, and mock payments, the recommended stack centers on Next.js 15 with App Router, PostgreSQL via Prisma ORM, NextAuth.js v5 for authentication, and a real-time solution (Pusher or Socket.io). This stack is industry-standard for marketplace applications in 2025/2026 and provides excellent developer experience while supporting all required features.

**Key architectural choices:**
- Next.js App Router for server/client component optimization
- PostgreSQL for relational data integrity (users, gigs, orders, reviews)
- Prisma for type-safe database access
- Server Actions for form handling and mutations
- WebSockets or managed service for real-time chat
- Vercel deployment for zero-config Next.js hosting

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Next.js** | 15.x (App Router) | Framework, routing, SSR/SSG | Required by project. App Router is stable and production-ready. Server Components reduce client bundle size. | HIGH |
| **React** | 18.x | UI library | Included with Next.js. Concurrent features support modern UX patterns. | HIGH |
| **TypeScript** | 5.x | Type safety | Industry standard for production apps. Catches bugs early, improves DX. | HIGH |
| **PostgreSQL** | 15.x or 16.x | Primary database | Best relational DB for marketplace data. ACID compliance for orders/payments. Strong JSON support. Widely supported hosting. | HIGH |
| **Prisma** | 5.x | ORM, migrations | Type-safe queries, excellent DX. Migration system. Best-in-class Next.js integration. | HIGH |
| **NextAuth.js** | v5 (Auth.js) | Authentication | Native Next.js integration. Supports email/password. Can add OAuth later. Active community. | MEDIUM |

### Real-Time Chat

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Pusher** | Latest | Managed WebSocket service | Zero infrastructure, reliable, generous free tier. Built-in presence. Easier than self-hosting. | MEDIUM |
| **Alternative: Socket.io** | 4.x | Self-hosted WebSockets | Full control, no vendor lock-in. Requires more setup. Good for cost control at scale. | MEDIUM |
| **Alternative: Ably** | Latest | Managed real-time service | Enterprise-grade reliability. More expensive than Pusher. | LOW |

**Recommendation:** Start with Pusher for MVP (fast setup, reliable). Migrate to Socket.io later if cost becomes an issue.

### UI & Styling

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Tailwind CSS** | 3.x or 4.x | Utility-first CSS | Industry standard for modern React apps. Fast prototyping. Small bundle size. Design system ready. | HIGH |
| **shadcn/ui** | Latest | Component library | Accessible components you own. Built on Radix UI. Copy-paste, not npm install. Matches "hand-crafted" requirement. | HIGH |
| **Radix UI** | Latest | Headless UI primitives | Accessibility built-in. Unstyled, full control. Powers shadcn/ui. | HIGH |
| **Framer Motion** | 11.x | Animation library | Declarative animations for micro-interactions. Matches Airbnb warmth requirement. | MEDIUM |

### File Storage

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Vercel Blob** | Latest | Image/file storage | Zero-config on Vercel. Simple API. Good free tier for MVP. | MEDIUM |
| **Alternative: Cloudinary** | Latest | Image CDN + transforms | Automatic optimization, transformations. Generous free tier. | MEDIUM |
| **Alternative: AWS S3** | Latest | Object storage | Industry standard. Cheap at scale. More setup required. | HIGH |

**Recommendation:** Vercel Blob for MVP (simplest). Migrate to Cloudinary or S3 if you need advanced transforms or move off Vercel.

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Zod** | 3.x | Schema validation | API routes, Server Actions, form validation. Type-safe runtime validation. | HIGH |
| **React Hook Form** | 7.x | Form state management | Complex forms (gig creation). Integrates with Zod for validation. | HIGH |
| **date-fns** | 3.x | Date utilities | Order timestamps, review dates. Lighter than moment.js. | HIGH |
| **clsx** or **cn** | Latest | Conditional class names | Tailwind class merging. Used by shadcn/ui. | HIGH |
| **@tanstack/react-query** | 5.x | Server state management | Caching API data, optimistic updates. Excellent DX. | MEDIUM |
| **next-themes** | Latest | Dark mode (optional) | If you add theme switching later. | LOW |
| **react-hot-toast** or **sonner** | Latest | Toast notifications | Order confirmations, error messages. | MEDIUM |

### Development Tools

| Tool | Purpose | Notes | Confidence |
|------|---------|-------|------------|
| **ESLint** | Linting | Included with Next.js. Extend with recommended rules. | HIGH |
| **Prettier** | Code formatting | Team consistency. Auto-format on save. | HIGH |
| **Prisma Studio** | Database GUI | Inspect/edit data during development. | HIGH |
| **TypeScript** | Type checking | Run `tsc --noEmit` in CI to catch type errors. | HIGH |
| **Husky** | Git hooks | Pre-commit linting, formatting. Optional but recommended. | MEDIUM |

## Installation

```bash
# Initialize Next.js project
npx create-next-app@latest herafi --typescript --tailwind --app --use-npm

# Core dependencies
npm install prisma @prisma/client next-auth@beta zod react-hook-form @hookform/resolvers

# UI components (use shadcn CLI to add components as needed)
npx shadcn-ui@latest init

# Real-time (choose one)
npm install pusher pusher-js  # OR
npm install socket.io socket.io-client

# File uploads (choose one)
npm install @vercel/blob  # OR
npm install cloudinary

# Supporting libraries
npm install date-fns clsx @tanstack/react-query framer-motion react-hot-toast

# Dev dependencies
npm install -D @types/node eslint prettier eslint-config-prettier
```

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative | Confidence |
|----------|-------------|-------------|------------------------|------------|
| Database | PostgreSQL | MySQL | Existing MySQL infrastructure, team familiarity | HIGH |
| Database | PostgreSQL | MongoDB | If data model is truly document-based (unlikely for marketplace) | HIGH |
| ORM | Prisma | Drizzle ORM | Lighter weight, SQL-first approach. Newer, smaller ecosystem. | MEDIUM |
| Auth | NextAuth.js v5 | Clerk | If you want fully managed auth UI. More expensive at scale. | MEDIUM |
| Auth | NextAuth.js v5 | Supabase Auth | If using Supabase for database. Tight integration. | MEDIUM |
| Real-time | Pusher | Supabase Realtime | If using Supabase. Postgres-based real-time. | LOW |
| Hosting | Vercel | Netlify | Similar DX. Slightly different pricing/features. | MEDIUM |
| Hosting | Vercel | Railway/Render | If you need more control or lower cost at scale. | MEDIUM |

## What NOT to Use

| Avoid | Why | Use Instead | Confidence |
|-------|-----|-------------|------------|
| **Next.js Pages Router** | Superseded by App Router. Less efficient. Community moving to App Router. | Next.js App Router | HIGH |
| **Firebase Firestore** | NoSQL doesn't fit marketplace relational data model. Query limitations. | PostgreSQL + Prisma | HIGH |
| **Redux** | Overkill for this app. Server State handled by React Query. Client state is minimal. | React Context + React Query | MEDIUM |
| **Styled Components / Emotion** | Runtime CSS-in-JS slows SSR. Tailwind has won the ecosystem. | Tailwind CSS | MEDIUM |
| **Moment.js** | Deprecated. Large bundle size. | date-fns or native Temporal API (when stable) | HIGH |
| **Create React App** | Not maintained. Use Next.js. | Next.js | HIGH |
| **Self-hosted Auth0** | Complex setup. NextAuth.js simpler for MVP. | NextAuth.js v5 | LOW |

## Stack Patterns by Variant

### If you need offline-first capabilities:
- **Not recommended for marketplace:** Real-time pricing, order state requires server truth.
- Defer until explicit user request.

### If you need mobile app later:
- **Use:** Expo (React Native) with shared types via TypeScript.
- **Backend:** Next.js API routes serve as REST API for mobile.
- **Real-time:** Pusher/Socket.io work cross-platform.

### If you plan international expansion:
- **Add:** `next-intl` for i18n.
- **Database:** Ensure PostgreSQL collation supports target languages.
- **Payments:** Keep payment provider abstraction layer.

### If traffic scales significantly (10K+ concurrent):
- **Database:** Add read replicas, connection pooling (PgBouncer).
- **Real-time:** Move to self-hosted Socket.io cluster with Redis adapter.
- **Caching:** Add Redis for session storage, frequently-accessed data.

## Version Compatibility

| Package | Compatible With | Notes | Confidence |
|---------|-----------------|-------|------------|
| Next.js 15.x | React 18.x | React 19 support may be in beta. Check compatibility. | HIGH |
| Prisma 5.x | PostgreSQL 12+ | Older Postgres versions may lack features. Use 15+ for best support. | HIGH |
| NextAuth.js v5 | Next.js 14+ | v5 requires App Router. v4 (stable) works with Pages Router. | MEDIUM |
| Tailwind CSS 4.x | PostCSS 8+ | v4 is new. v3.x is battle-tested and stable. | MEDIUM |
| Pusher | Next.js 15 | Client-side library. No version conflicts. | HIGH |
| shadcn/ui | React 18+, Tailwind 3+ | Component library, not versioned traditionally. | MEDIUM |

## Configuration Recommendations

### Prisma Setup
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enable preview features if needed
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"] // For search functionality
}
```

### NextAuth.js Setup
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      // Email/password logic here
    })
  ],
  // Use database sessions for production
  session: { strategy: "database" }
}
```

### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."
BLOB_READ_WRITE_TOKEN="..." # Vercel Blob
```

## Migration Path

### MVP (Now)
- Next.js + PostgreSQL + Prisma
- NextAuth.js email/password
- Pusher for chat
- Vercel Blob for images
- shadcn/ui + Tailwind

### Post-MVP (After validation)
- Add OAuth providers (Google, GitHub)
- Migrate to Socket.io if cost is an issue
- Add Redis caching
- Consider Cloudinary for image transforms
- Add background jobs (BullMQ + Redis)

### Scale (If successful)
- Database read replicas
- CDN for static assets
- Socket.io cluster with Redis adapter
- Consider microservices for payment/chat if needed

## Sources

**Note:** WebSearch and WebFetch were unavailable during research. Recommendations based on:

- **Training data (Jan 2025):** Next.js ecosystem best practices, marketplace architecture patterns
- **Project requirements:** From `/Users/anas/CodeV2/Herafi/.planning/PROJECT.md`
- **Confidence levels:** HIGH for well-established patterns, MEDIUM for version-specific recommendations (may need verification), LOW for emerging alternatives

**Verification recommended for:**
- NextAuth.js v5 current status (may still be beta as of Feb 2026)
- Tailwind CSS v4 adoption (may be in alpha/beta)
- Next.js 15 current patch version and stability
- Pusher pricing tiers (verify free tier limits)

**Official docs to consult:**
- https://nextjs.org/docs (Next.js version, App Router patterns)
- https://www.prisma.io/docs (Prisma current version, PostgreSQL best practices)
- https://authjs.dev (NextAuth.js v5 status)
- https://pusher.com/docs (Real-time setup, pricing)
- https://ui.shadcn.com (Component installation, usage patterns)

---
*Stack research for: Herafi Services Marketplace*
*Researched: 2026-02-07*
*Confidence: MEDIUM (training data only, external verification unavailable)*
