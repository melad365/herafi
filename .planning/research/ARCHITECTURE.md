# Architecture Research

**Domain:** Services Marketplace (Fiverr-like for In-Person & Digital Services)
**Researched:** 2026-02-07
**Confidence:** MEDIUM (based on training knowledge of marketplace patterns; WebSearch unavailable for verification)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Browse  │  │ Search  │  │  Gig    │  │  Chat   │        │
│  │  Pages  │  │  Page   │  │ Detail  │  │  UI     │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│  ┌────┴────┐  ┌───┴────┐  ┌────┴────┐  ┌───┴────┐          │
│  │Provider │  │ Orders │  │  Auth   │  │Reviews │          │
│  │Dashboard│  │ Pages  │  │  Pages  │  │ Pages  │          │
│  └────┬────┘  └────┬───┘  └────┬────┘  └───┬────┘          │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                    Application Logic Layer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes / Server Actions             │   │
│  │                                                       │   │
│  │  • Gig CRUD          • Search/Filter                 │   │
│  │  • Order Management  • Auth Operations               │   │
│  │  • Review CRUD       • User Profile                  │   │
│  │  • File Upload       • Analytics Queries             │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
├────────────────────────┴─────────────────────────────────────┤
│                     Middleware Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Auth Guard  │  │  Rate      │  │  Request   │            │
│  │/Session    │  │  Limiter   │  │  Logger    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   User   │  │   Gig    │  │  Order   │  │ Message  │    │
│  │  Store   │  │  Store   │  │  Store   │  │  Store   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Review  │  │Category  │  │   File   │                  │
│  │  Store   │  │  Store   │  │  Store   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  WebSocket   │  │    File      │  │    Email     │
│   Server     │  │   Storage    │  │  Provider    │
│  (Chat)      │  │  (Images)    │  │ (Optional)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Presentation Layer** | Renders UI, handles user input, displays data | Next.js pages/components (App Router) |
| **API Routes / Server Actions** | Business logic, data validation, orchestration | Next.js API routes or Server Actions |
| **Middleware** | Cross-cutting concerns (auth, rate limiting, logging) | Next.js middleware, custom middleware functions |
| **Data Layer** | Data persistence, queries, relationships | Database (PostgreSQL/MySQL) + ORM (Prisma/Drizzle) |
| **WebSocket Server** | Real-time bidirectional communication for chat | Socket.io or native WebSocket with Next.js |
| **File Storage** | Image/document uploads for gig listings | Local storage (dev), S3-compatible (prod), Uploadthing, Cloudinary |

## Recommended Project Structure

```
herafi/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Data models
│   └── migrations/         # Version-controlled DB changes
├── public/                 # Static assets
│   ├── images/             # UI images (not user uploads)
│   └── icons/              # SVGs, favicons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth-related routes (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (marketplace)/  # Public marketplace routes
│   │   │   ├── browse/
│   │   │   ├── search/
│   │   │   ├── gigs/
│   │   │   │   └── [id]/
│   │   │   └── categories/
│   │   │       └── [slug]/
│   │   ├── (dashboard)/    # Protected provider routes
│   │   │   ├── dashboard/
│   │   │   ├── my-gigs/
│   │   │   ├── orders/
│   │   │   └── analytics/
│   │   ├── chat/           # Real-time chat interface
│   │   │   └── [conversationId]/
│   │   ├── api/            # API routes
│   │   │   ├── auth/
│   │   │   ├── gigs/
│   │   │   ├── orders/
│   │   │   ├── reviews/
│   │   │   ├── messages/
│   │   │   ├── upload/
│   │   │   └── search/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home/landing page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/             # Base UI primitives (Button, Card, Input)
│   │   ├── gigs/           # Gig-related components (GigCard, GigForm)
│   │   ├── orders/         # Order-related components
│   │   ├── chat/           # Chat components (MessageList, MessageInput)
│   │   ├── reviews/        # Review components (StarRating, ReviewForm)
│   │   ├── search/         # Search/filter components
│   │   └── layout/         # Layout components (Header, Footer, Sidebar)
│   ├── lib/                # Business logic and utilities
│   │   ├── db.ts           # Database client singleton
│   │   ├── auth.ts         # Auth utilities (session, JWT)
│   │   ├── validations/    # Zod schemas for data validation
│   │   │   ├── gig.ts
│   │   │   ├── order.ts
│   │   │   └── user.ts
│   │   ├── queries/        # Database query functions
│   │   │   ├── gigs.ts
│   │   │   ├── orders.ts
│   │   │   └── users.ts
│   │   ├── mutations/      # Database mutation functions
│   │   │   ├── gigs.ts
│   │   │   └── orders.ts
│   │   └── utils/          # Generic utilities
│   │       ├── currency.ts
│   │       ├── date.ts
│   │       └── image.ts
│   ├── server/             # Server-specific code
│   │   ├── websocket.ts    # WebSocket server setup
│   │   └── middleware/     # Custom middleware
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   └── useDebounce.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── gig.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   └── index.ts
│   └── config/             # App configuration
│       ├── categories.ts   # Hardcoded service categories
│       └── constants.ts    # App-wide constants
├── tests/                  # Test files
│   ├── unit/
│   └── integration/
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Structure Rationale

- **(auth), (marketplace), (dashboard) route groups:** Organize routes by access level and purpose without adding URL segments. Makes it clear what pages require authentication.
- **lib/queries and lib/mutations separation:** Keeps read and write operations separate, makes it easy to apply different caching strategies.
- **lib/validations with Zod:** Centralized validation schemas reusable in both client and server code. Critical for form validation and API input validation.
- **components organized by domain:** Avoids giant "components" folder. Groups related components together (gigs, orders, chat).
- **prisma/ at root:** Standard Prisma convention. Makes it obvious where database schema lives.
- **server/ directory:** Isolates server-only code (WebSocket setup) from client-compatible code.

## Architectural Patterns

### Pattern 1: Server Actions + Client Components

**What:** Use Next.js Server Actions for data mutations, keep components client-side for interactivity.

**When to use:** Form submissions, button actions that mutate data (create gig, place order, post review).

**Trade-offs:**
- Pros: No need to write API routes for simple mutations, automatic serialization, better type safety
- Cons: Less flexible for complex request handling (file uploads, WebSocket)

**Example:**
```typescript
// src/lib/mutations/gigs.ts (Server Action)
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { gigSchema } from '@/lib/validations/gig'
import { revalidatePath } from 'next/cache'

export async function createGig(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const data = gigSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    // ... other fields
  })

  const gig = await db.gig.create({
    data: { ...data, userId: session.user.id }
  })

  revalidatePath('/dashboard/my-gigs')
  return { success: true, gigId: gig.id }
}
```

```typescript
// src/components/gigs/GigForm.tsx (Client Component)
'use client'

import { createGig } from '@/lib/mutations/gigs'
import { useTransition } from 'react'

export function GigForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createGig(formData)
      // Handle success
    })
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Gig'}
      </button>
    </form>
  )
}
```

### Pattern 2: Optimistic UI Updates

**What:** Immediately update UI before server confirms the action, rollback on error.

**When to use:** Chat messages, reviews, favoriting gigs - actions where instant feedback improves UX.

**Trade-offs:**
- Pros: Feels instant, better perceived performance
- Cons: Requires error handling and rollback logic, can mislead users if action fails

**Example:**
```typescript
// src/components/chat/MessageInput.tsx
'use client'

import { useOptimistic } from 'react'
import { sendMessage } from '@/lib/mutations/messages'

export function MessageInput({ conversationId, messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  )

  const handleSend = async (text: string) => {
    const tempId = crypto.randomUUID()
    addOptimisticMessage({ id: tempId, text, pending: true })

    try {
      await sendMessage(conversationId, text)
    } catch (error) {
      // Rollback handled automatically by React
      toast.error('Failed to send message')
    }
  }

  return (
    <div>
      <MessageList messages={optimisticMessages} />
      {/* Input component */}
    </div>
  )
}
```

### Pattern 3: Multi-Tenant Data Isolation (User Context)

**What:** Ensure every query and mutation operates within the context of the authenticated user. Never trust client-provided user IDs.

**When to use:** Every database operation in a marketplace. Critical for security.

**Trade-offs:**
- Pros: Prevents data leaks, enforces authorization at data layer
- Cons: Requires passing session context through every operation

**Example:**
```typescript
// src/lib/queries/orders.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getMyOrders() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // ALWAYS filter by session.user.id, never accept userId from client
  return await db.order.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },      // Orders I placed
        { sellerId: session.user.id }      // Orders for my gigs
      ]
    },
    include: {
      gig: true,
      buyer: { select: { name: true, image: true } },
      seller: { select: { name: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}
```

### Pattern 4: WebSocket + Database Sync (Chat Architecture)

**What:** Use WebSocket for real-time message delivery, but persist all messages to database for reliability and history.

**When to use:** Chat systems where users need real-time updates but also message history when offline.

**Trade-offs:**
- Pros: Real-time UX + reliable message storage
- Cons: More complex than simple polling, requires WebSocket infrastructure

**Example:**
```typescript
// src/server/websocket.ts
import { Server } from 'socket.io'
import { db } from '@/lib/db'

export function setupWebSocket(server) {
  const io = new Server(server)

  io.use(async (socket, next) => {
    // Auth middleware - verify JWT from socket handshake
    const token = socket.handshake.auth.token
    const user = await verifyToken(token)
    if (!user) return next(new Error('Unauthorized'))
    socket.data.userId = user.id
    next()
  })

  io.on('connection', (socket) => {
    // Join user's conversation rooms
    socket.on('join:conversation', async (conversationId) => {
      const isMember = await verifyConversationMembership(
        socket.data.userId,
        conversationId
      )
      if (isMember) socket.join(`conversation:${conversationId}`)
    })

    // Handle sending messages
    socket.on('message:send', async (data) => {
      // 1. Persist to database first
      const message = await db.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: socket.data.userId,
          content: data.content
        }
      })

      // 2. Then broadcast via WebSocket
      io.to(`conversation:${data.conversationId}`).emit('message:new', message)
    })
  })

  return io
}
```

## Data Flow

### Request Flow (Standard CRUD)

```
[User Action in Browser]
    ↓
[Client Component] → triggers Server Action
    ↓
[Server Action] → validates input with Zod schema
    ↓              → checks auth session
    ↓              → calls database query/mutation
    ↓
[Database] ← executes query
    ↓
[Database] → returns data
    ↓
[Server Action] → transforms data if needed
    ↓              → revalidates cache if needed
    ↓
[Client Component] ← receives response
    ↓
[User sees updated UI]
```

### Real-Time Chat Flow

```
[User types message]
    ↓
[MessageInput Component] → sends via WebSocket + optimistic update
    ↓
[WebSocket Server] → verifies user is in conversation
    ↓                → persists to database
    ↓
[Database] ← stores message
    ↓
[Database] → returns saved message with ID
    ↓
[WebSocket Server] → broadcasts to all clients in conversation room
    ↓
[All clients in room] ← receive message
    ↓
[MessageList Components update] → replace optimistic message with real one
```

### Order Flow

```
[Buyer clicks "Order" on gig page]
    ↓
[OrderForm Component] → selects pricing tier, provides details
    ↓
[createOrder Server Action] → validates input
    ↓                         → checks gig exists and is active
    ↓                         → creates order (status: pending)
    ↓                         → creates mock payment (auto-approved)
    ↓                         → updates order status to "awaiting_acceptance"
    ↓
[Database] ← saves order
    ↓
[Buyer redirected to order page]

[Provider sees order in dashboard]
    ↓
[Provider clicks "Accept Order"]
    ↓
[acceptOrder Server Action] → verifies provider owns the gig
    ↓                         → updates order status to "in_progress"
    ↓
[Both users get WebSocket notification] (optional, can also poll)

[Provider clicks "Mark Complete"]
    ↓
[completeOrder Server Action] → updates status to "completed"
    ↓                           → enables review submission for buyer
    ↓
[Buyer can now submit review]
```

### Search/Filter Flow

```
[User types in search box]
    ↓
[useDebounce hook] → delays API call by 300ms
    ↓
[Search Component] → calls /api/search with query params
    ↓
[API Route] → parses filters (category, price range, rating)
    ↓          → builds Prisma query with where clauses
    ↓          → includes full-text search if supported
    ↓
[Database] → returns matching gigs
    ↓
[API Route] → formats results
    ↓
[Search Component] ← receives results
    ↓
[GigGrid Component] → renders matching gigs
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Monolithic Next.js app, single database, local or simple cloud storage. WebSocket in same process as Next.js server. This is sufficient for MVP and early growth. |
| **1k-10k users** | Separate WebSocket server (Node.js process), use Redis for session storage and WebSocket pub/sub. Add database read replicas. Use CDN for static assets and uploaded images. Consider connection pooling for database. |
| **10k-100k users** | Add full-text search with dedicated service (Algolia, Meilisearch). Extract background jobs (email notifications, analytics) to queue system (BullMQ + Redis). Consider database sharding by user ID or region. Rate limiting becomes critical. |
| **100k+ users** | Microservices for chat, search, and payments. Separate databases per service. Event-driven architecture for cross-service communication. Kubernetes for orchestration. This is beyond MVP scope. |

### Scaling Priorities (What Breaks First)

1. **First bottleneck: Database connections**
   - Symptom: Slow queries, connection pool exhaustion, timeouts
   - Fix: Connection pooling (Prisma already does this), add database indexes on frequently queried fields (userId, gigId, category, createdAt), optimize N+1 queries with includes

2. **Second bottleneck: WebSocket server**
   - Symptom: Dropped messages, slow message delivery, server restarts affect all users
   - Fix: Separate WebSocket server from Next.js, use Redis adapter for Socket.io to share state across multiple WebSocket servers, scale horizontally

3. **Third bottleneck: Search performance**
   - Symptom: Slow search results, high database CPU usage
   - Fix: Add full-text search indexes (PostgreSQL tsvector or external search service like Meilisearch), cache popular search results, implement pagination with cursor-based pagination

4. **Fourth bottleneck: Image uploads**
   - Symptom: Slow page loads, high server disk/memory usage
   - Fix: Use CDN for image delivery, implement image optimization pipeline (resize, compress, convert to WebP), use cloud storage (S3, Cloudflare R2)

## Anti-Patterns

### Anti-Pattern 1: Storing Auth State in Client-Side Only Storage

**What people do:** Store JWT tokens in localStorage, use client-side state to determine if user is logged in.

**Why it's wrong:**
- Vulnerable to XSS attacks (malicious scripts can read localStorage)
- Can't verify auth status on server during SSR
- No CSRF protection
- Tokens can't be revoked easily

**Do this instead:**
- Use HTTP-only cookies for session tokens (Next.js session cookies with iron-session or NextAuth)
- Validate session on server for protected routes
- Store only non-sensitive display data (username, avatar URL) in client state

```typescript
// BAD
localStorage.setItem('token', jwt)
const isAuthenticated = Boolean(localStorage.getItem('token'))

// GOOD - using iron-session example
import { getIronSession } from 'iron-session'

export async function auth() {
  const session = await getIronSession(cookies(), {
    password: process.env.SESSION_SECRET,
    cookieName: 'herafi_session',
  })
  return session.user || null
}
```

### Anti-Pattern 2: Accepting User IDs from Client Requests

**What people do:** Let client pass `userId` in API requests, trust it without verification.

**Why it's wrong:**
- Massive security vulnerability - any user can impersonate another by changing the userId parameter
- Enables data breaches, unauthorized modifications
- Violates principle of least privilege

**Do this instead:**
- Always derive user context from authenticated session
- Never accept userId, sellerId, buyerId from client for authorization-sensitive operations
- Use session data as the source of truth

```typescript
// BAD
async function getMyOrders(userId: string) {  // Attacker can pass any userId
  return db.order.findMany({ where: { buyerId: userId } })
}

// GOOD
async function getMyOrders() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  return db.order.findMany({ where: { buyerId: session.user.id } })
}
```

### Anti-Pattern 3: N+1 Query Problem in Marketplace Listings

**What people do:** Fetch list of gigs, then loop through and fetch seller info for each gig.

**Why it's wrong:**
- Causes one query for gigs, then N additional queries for sellers (if 20 gigs, that's 21 queries)
- Destroys performance, maxes out database connections
- Especially bad for browse/search pages with many results

**Do this instead:**
- Use Prisma includes to fetch related data in single query
- Or use dataloader pattern for batching
- Consider caching for frequently accessed data (seller profiles)

```typescript
// BAD - N+1 problem
const gigs = await db.gig.findMany()
const gigsWithSellers = await Promise.all(
  gigs.map(async (gig) => ({
    ...gig,
    seller: await db.user.findUnique({ where: { id: gig.userId } })
  }))
)

// GOOD - single query with include
const gigs = await db.gig.findMany({
  include: {
    seller: {
      select: { id: true, name: true, image: true, rating: true }
    }
  }
})
```

### Anti-Pattern 4: Mixing WebSocket and REST for Same Features

**What people do:** Use WebSocket for sending messages but REST API for fetching message history. Or vice versa - inconsistent patterns.

**Why it's wrong:**
- Confusing for developers to maintain
- Harder to ensure consistency between real-time and historical data
- Can lead to race conditions and duplicate messages

**Do this instead:**
- Use WebSocket for real-time updates (new messages arriving)
- Use REST/Server Actions for initial data fetch and pagination (message history)
- Make sure both paths read from same database, no separate cache
- Clear separation: WebSocket for events, HTTP for queries

```typescript
// GOOD separation
// Initial load: fetch via Server Component or API route
export async function getConversationMessages(conversationId: string) {
  return await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

// Real-time updates: WebSocket for new messages
socket.on('message:new', (message) => {
  setMessages(prev => [...prev, message])
})
```

### Anti-Pattern 5: No Data Validation on Server

**What people do:** Trust client-side validation, skip validation in API routes or Server Actions.

**Why it's wrong:**
- Client-side validation can be bypassed trivially (disable JS, modify requests)
- Malicious users can send garbage data
- SQL injection, XSS, business logic violations

**Do this instead:**
- Always validate on server with schema validation library (Zod, Yup)
- Treat all client input as untrusted
- Use TypeScript for type safety, but remember types don't exist at runtime - validate actual data

```typescript
// BAD
export async function createGig(data: any) {
  // Directly insert without validation
  return await db.gig.create({ data })
}

// GOOD
import { z } from 'zod'

const gigSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(5000),
  price: z.number().positive().max(100000),
  category: z.enum(['plumbing', 'painting', 'cleaning', 'carpentry', 'welding', 'digital'])
})

export async function createGig(rawData: unknown) {
  const data = gigSchema.parse(rawData)  // Throws if invalid
  return await db.gig.create({ data })
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **File Storage (Uploadthing, Cloudinary, S3)** | Upload via API route with presigned URLs or direct upload | Use client-side upload for better UX. Return public URL to store in database. |
| **Email (Optional - Resend, SendGrid)** | Background job triggered by order events | Deferred for MVP. When added, use queue system to avoid blocking requests. |
| **Search (Meilisearch, Algolia)** | Sync database to search index via webhook or cron job | Not needed for MVP. Use PostgreSQL full-text search initially. |
| **WebSocket (Socket.io)** | Separate server process or embedded in Next.js custom server | Socket.io easier than raw WebSocket. Use Redis adapter for multi-instance scaling. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client ↔ Server** | Server Actions (mutations) + Server Components (queries) | Prefer Server Actions for forms. Use API routes for file uploads and WebSocket. |
| **UI Components ↔ Data** | Props (server-fetched) + React hooks (client-side state) | Fetch in Server Components when possible, pass as props. Use client hooks for interactive state only. |
| **API Routes ↔ Database** | Direct Prisma queries | Keep business logic in separate functions (`lib/queries`, `lib/mutations`) for reusability. |
| **WebSocket Server ↔ Database** | Same Prisma client | Ensure WebSocket server shares same database instance/connection pool. |

## Build Order Dependencies

Based on component dependencies, recommended build order:

1. **Database Schema + Auth** (foundational)
   - Define Prisma models (User, Gig, Order, Message, Review, Category)
   - Implement auth (session management, login/register)
   - Reason: Everything depends on user identity and data persistence

2. **Gig CRUD** (core value)
   - Create/edit/delete gigs
   - Gig detail page
   - Image upload
   - Reason: Without gigs, there's nothing to browse or order

3. **Browse + Search** (discovery)
   - Browse by category
   - Search with filters
   - Gig listing grid
   - Reason: Users need to discover gigs before ordering

4. **Order Management** (transaction flow)
   - Place order
   - Mock payment
   - Order status tracking
   - Reason: Completes the core transaction loop

5. **Provider Dashboard** (seller experience)
   - View incoming orders
   - Accept/complete orders
   - Manage own gigs
   - Reason: Sellers need to manage their side of transactions

6. **Chat System** (communication)
   - WebSocket setup
   - Chat UI
   - Message history
   - Reason: Requires most infrastructure (WebSocket), but critical for negotiation

7. **Reviews + Ratings** (trust/quality)
   - Submit reviews
   - Display reviews on gig page
   - Aggregate seller rating
   - Reason: Depends on completed orders, enhances trust

8. **Analytics + Polish** (optimization)
   - Dashboard analytics
   - Micro-interactions
   - Performance optimization
   - Reason: Nice-to-have, done after core features work

## Sources

**Confidence note:** This architecture research is based on training knowledge of marketplace patterns (Fiverr, Upwork, TaskRabbit, Airbnb) and Next.js best practices as of January 2025. WebSearch was unavailable for verification against 2026 sources. Patterns are MEDIUM confidence - they represent established industry practices but may have newer alternatives.

- Next.js App Router patterns (training knowledge, Jan 2025)
- Prisma ORM documentation (training knowledge, Jan 2025)
- Two-sided marketplace architecture patterns (training knowledge - Fiverr, Upwork, TaskRabbit case studies)
- Socket.io documentation for WebSocket implementation (training knowledge)
- React Server Components and Server Actions patterns (training knowledge, Next.js 14+)

---
*Architecture research for: Herafi (Services Marketplace)*
*Researched: 2026-02-07*
