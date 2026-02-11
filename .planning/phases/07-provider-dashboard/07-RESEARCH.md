# Phase 7: Provider Dashboard - Research

**Researched:** 2026-02-11
**Domain:** Provider dashboard patterns, Next.js App Router architecture, dual-role marketplace UX
**Confidence:** HIGH

## Summary

Phase 7 implements a dedicated provider dashboard to consolidate provider-specific tools (gig management, order handling, message access) in a focused interface. The existing `/dashboard` page already mixes buyer and provider contexts, showing both buyer orders and provider gigs conditionally. This phase will create a dedicated `/provider` route group with organized views for providers to manage their business.

Research reveals that successful provider dashboards in 2026 emphasize:
1. **Clear role separation** - Distinct buyer vs. provider modes with contextual navigation
2. **Task prioritization** - "Today's Agenda" pattern showing time-sensitive actions first
3. **Parallel data loading** - Fetch all dashboard data simultaneously using React Server Components
4. **Tab-based organization** - URL-based tabs for deep-linkable sections (gigs, orders, messages)

The standard approach uses Next.js 15 App Router with Server Components for data fetching, URL search params for tab state, and existing server actions for mutations. No new libraries needed - all required patterns are achievable with the current stack (Next.js 15, Prisma, Tailwind CSS).

**Primary recommendation:** Create `/provider` route group with tabbed dashboard using URL params (`?tab=gigs|orders|messages`), leveraging existing server actions and components. Maintain existing `/dashboard` as buyer-focused hub.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.1.6 | Route structure, Server Components, data fetching | Official Next.js pattern for dashboards - SSR with fresh data |
| React Server Components | 19.0.0 | Parallel data fetching, reduce client JS | Industry standard for dashboard data loading in 2026 |
| Tailwind CSS | 3.4.1 | Dashboard UI styling, responsive grids | Already in use, mobile-first approach |
| Prisma | 7.3.0 | Database queries with aggregations | Existing ORM, handles complex joins for dashboard stats |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date formatting for order timestamps | Already installed, use for relative dates ("2 days ago") |
| URL Search Params | Built-in | Tab state management | Native browser API, enables bookmarkable dashboard views |
| Existing Server Actions | N/A | Gig/order mutations | Reuse `/actions/gigs.ts` and `/actions/orders.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| URL params for tabs | Client-side state (useState) | URL params enable deep links, browser history, bookmarkable views |
| Separate `/provider/*` routes | Extend existing `/dashboard` | Dedicated provider routes provide clearer mental model and role separation |
| Custom pagination | Third-party table library | Custom pagination sufficient for MVP, avoids heavy dependencies |

**Installation:**
No new packages required. All patterns achievable with existing dependencies.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── dashboard/                    # Existing buyer-focused dashboard
│   │   └── page.tsx
│   ├── provider/
│   │   ├── dashboard/                # New provider-focused dashboard
│   │   │   ├── page.tsx              # Main provider dashboard with tabs
│   │   │   └── _components/          # Dashboard-specific components
│   │   │       ├── GigsTab.tsx
│   │   │       ├── OrdersTab.tsx
│   │   │       └── MessagesTab.tsx
│   │   └── setup/                    # Existing provider setup flow
│   │       └── page.tsx
│   └── orders/
│       └── page.tsx                  # Existing buyer orders page
├── components/
│   ├── gigs/                         # Existing gig components (reuse)
│   ├── orders/                       # Existing order components (reuse)
│   └── provider/                     # Provider-specific shared components
│       ├── ProviderNav.tsx           # Provider mode navigation
│       └── TabNavigation.tsx         # URL-based tab switcher
└── actions/
    ├── gigs.ts                       # Existing (reuse)
    └── orders.ts                     # Existing (reuse)
```

### Pattern 1: URL-Based Tab Navigation
**What:** Use URL search params (`?tab=gigs`) to control dashboard sections, enabling bookmarkable and shareable views.

**When to use:** Dashboard with multiple sections where users need deep links to specific views.

**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// app/provider/dashboard/page.tsx
type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function ProviderDashboardPage({ searchParams }: Props) {
  const params = await searchParams
  const activeTab = params.tab || 'gigs' // Default to gigs tab

  // Fetch data for active tab only (or all tabs if needed)
  // Render tab content based on activeTab
}

// components/provider/TabNavigation.tsx
'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function TabNavigation() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'gigs'

  return (
    <div className="border-b">
      <Link
        href="/provider/dashboard?tab=gigs"
        className={activeTab === 'gigs' ? 'border-orange-600' : ''}
      >
        My Gigs
      </Link>
      {/* More tabs... */}
    </div>
  )
}
```

**Benefits:**
- Bookmarkable URLs (e.g., `/provider/dashboard?tab=orders`)
- Browser back/forward works correctly
- Shareable links to specific sections
- SEO-friendly if tabs have unique content

### Pattern 2: Parallel Data Fetching in Server Components
**What:** Use `Promise.all()` to fetch multiple independent data sources simultaneously in async Server Components.

**When to use:** Dashboard pages loading multiple unrelated datasets (gigs, orders, stats).

**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/fetching-data
export default async function ProviderDashboardPage({ searchParams }: Props) {
  const session = await auth()
  const params = await searchParams

  // Parallel queries - all execute simultaneously
  const [gigs, activeOrders, stats] = await Promise.all([
    prisma.gig.findMany({
      where: { providerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.order.findMany({
      where: {
        providerId: session.user.id,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      },
      include: { gig: true, buyer: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.aggregate({
      where: { providerId: session.user.id },
      _count: true,
      _sum: { totalPrice: true }
    })
  ])

  // Single round-trip to database, no waterfalls
}
```

**Benefits:**
- Reduces total loading time (parallel vs sequential)
- Single server round-trip
- Automatic deduplication by React
- Direct database access (no client-side fetching)

### Pattern 3: Role-Based Navigation Context
**What:** Provide clear visual distinction between buyer mode (browsing/ordering) and provider mode (managing services).

**When to use:** Marketplaces with dual-role users who can both buy and sell.

**Example:**
```typescript
// components/provider/ProviderNav.tsx
export function ProviderNav() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-orange-600">Provider Mode</span>
            <Link href="/provider/dashboard">Dashboard</Link>
            <Link href="/gigs/new">Create Gig</Link>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Switch to Buyer Mode →
          </Link>
        </div>
      </div>
    </nav>
  )
}
```

**UX Principle (from marketplace research):**
> "The UX design must distinguish between buyers and sellers, showing only the relevant tools, settings, and metrics for each. Buyers see their purchase history, saved items, and delivery tracking, while sellers see orders, listings, earnings, and support tools. Hybrid users get both, organized clearly in navigation elements."
> Source: [What Good Marketplace UX Design Looks Like](https://www.rigbyjs.com/blog/marketplace-ux)

### Pattern 4: Reusable Components with View Context
**What:** Reuse existing components (OrderCard, GigCard) by passing `viewAs` prop to adapt display.

**When to use:** When buyer and provider views show similar data with different emphasis.

**Example:**
```typescript
// Already implemented in src/components/orders/OrderCard.tsx
interface OrderCardProps {
  order: { /* ... */ }
  viewAs: "buyer" | "provider"  // Determines which user info to show
}

// Provider dashboard reuses this component
<OrderCard order={order} viewAs="provider" />
// Shows buyer info (counterparty) instead of provider info
```

### Anti-Patterns to Avoid

- **Mixing buyer/provider data in single page** - The current `/dashboard` does this. Instead, create dedicated provider dashboard that's provider-first.
- **Client-side data fetching for dashboard** - Use Server Components for fresh data, avoid useState + useEffect waterfalls.
- **Complex client state for tabs** - URL search params are simpler, more powerful (bookmarkable, SSR-compatible).
- **Copying code instead of composing** - Reuse OrderCard, GigCard with different props rather than creating ProviderOrderCard, ProviderGigCard.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab state management | Custom useState + router.push logic | URL search params (`searchParams.get('tab')`) | Browser history, bookmarkability, SSR compatibility already handled |
| Date formatting | Custom relative date logic | `date-fns` (already installed) | Handles edge cases (timezone, locale, pluralization) |
| Data table sorting | Manual array.sort() with state | URL params + Prisma orderBy | Server-side sorting prevents client-side data exposure, handles large datasets |
| Pagination | Manual slicing with page state | URL params + Prisma skip/take | Enables deep links to pages, SSR-friendly |
| Role switching UI | Custom context provider | Simple Link navigation | Simpler mental model, no hydration issues |

**Key insight:** URL-based state management (search params) solves most dashboard state problems (tabs, filters, pagination) without client-side complexity. Next.js 15 makes this pattern first-class with async `searchParams` prop.

## Common Pitfalls

### Pitfall 1: Sequential Data Fetching Waterfalls
**What goes wrong:** Loading data sequentially creates slow page loads.
```typescript
// BAD - Sequential waterfall (slow)
const user = await prisma.user.findUnique(...)
const gigs = await prisma.gig.findMany({ where: { providerId: user.id } })
const orders = await prisma.order.findMany({ where: { providerId: user.id } })
```

**Why it happens:** Natural coding pattern (fetch dependencies first), but inefficient when queries are independent.

**How to avoid:** Use `Promise.all()` for parallel queries when data is independent.
```typescript
// GOOD - Parallel queries (fast)
const [user, gigs, orders] = await Promise.all([
  prisma.user.findUnique(...),
  prisma.gig.findMany({ where: { providerId: session.user.id } }),
  prisma.order.findMany({ where: { providerId: session.user.id } })
])
```

**Warning signs:** Dashboard feels slow, network tab shows sequential database queries.

### Pitfall 2: Client Components for Static Tabs
**What goes wrong:** Using 'use client' unnecessarily for tab navigation.

**Why it happens:** Confusion about when client interactivity is needed.

**How to avoid:** Tab navigation can be Server Components with `<Link>` - only use client component for active tab highlighting.
```typescript
// TabNavigation can be client component (needs useSearchParams)
// But tab CONTENT should be Server Components (for data fetching)
```

**Warning signs:** Lots of 'use client' directives, client-side data fetching.

### Pitfall 3: Role Confusion in Shared Data
**What goes wrong:** Showing buyer's orders instead of provider's orders in provider dashboard.

**Why it happens:** User model has both `buyerOrders` and `providerOrders` relations.

**How to avoid:** Always filter by correct relation:
```typescript
// Provider dashboard - show orders WHERE I am the provider
const providerOrders = await prisma.order.findMany({
  where: { providerId: session.user.id }  // NOT buyerId
})

// Buyer dashboard - show orders WHERE I am the buyer
const buyerOrders = await prisma.order.findMany({
  where: { buyerId: session.user.id }
})
```

**Warning signs:** Provider sees empty orders list despite having active gigs, or sees their own purchase orders.

### Pitfall 4: Over-Engineering Empty States
**What goes wrong:** Complex conditional rendering for empty states leads to bugs.

**Why it happens:** Trying to handle every edge case upfront.

**How to avoid:** Simple conditional checks:
```typescript
{gigs.length === 0 ? (
  <EmptyState message="No gigs yet" action={<Link href="/gigs/new">Create First Gig</Link>} />
) : (
  <GigsList gigs={gigs} />
)}
```

**Warning signs:** Deeply nested ternaries, many null checks.

### Pitfall 5: Forgetting Mobile Responsiveness
**What goes wrong:** Dashboard looks great on desktop, broken on mobile.

**Why it happens:** Testing only on desktop during development.

**How to avoid:** Use Tailwind responsive classes from start:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards auto-stack on mobile, 2-col on tablet, 3-col on desktop */}
</div>
```

**Warning signs:** Horizontal scrolling on mobile, tiny touch targets, tables overflow viewport.

**2026 Context:** Mobile commerce accounts for 65%+ of marketplace traffic - mobile-first is non-negotiable.

## Code Examples

Verified patterns from official sources:

### Example 1: Provider Dashboard with Tabs
```typescript
// app/provider/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TabNavigation } from '@/components/provider/TabNavigation'
import GigsTab from './_components/GigsTab'
import OrdersTab from './_components/OrdersTab'
import MessagesTab from './_components/MessagesTab'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function ProviderDashboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Check provider status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProvider: true }
  })

  if (!user?.isProvider) redirect('/provider/setup')

  const params = await searchParams
  const activeTab = params.tab || 'gigs'

  // Parallel data fetching - all tabs at once (or conditionally per tab)
  const [gigs, orders, conversations] = await Promise.all([
    prisma.gig.findMany({
      where: { providerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } }
    }),
    prisma.order.findMany({
      where: { providerId: session.user.id },
      include: { gig: true, buyer: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.conversation.findMany({
      where: { participantIds: { has: session.user.id } },
      orderBy: { lastMessageAt: 'desc' },
      take: 10
    })
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-gray-600">Manage your services and orders</p>
        </div>

        <TabNavigation activeTab={activeTab} />

        <div className="mt-6">
          {activeTab === 'gigs' && <GigsTab gigs={gigs} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} />}
          {activeTab === 'messages' && <MessagesTab conversations={conversations} />}
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Client Tab Navigation Component
```typescript
// components/provider/TabNavigation.tsx
'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Tab = {
  id: string
  label: string
  icon?: string
  badge?: number
}

export function TabNavigation({ activeTab }: { activeTab: string }) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || activeTab

  const tabs: Tab[] = [
    { id: 'gigs', label: 'My Gigs' },
    { id: 'orders', label: 'Orders' },
    { id: 'messages', label: 'Messages' }
  ]

  return (
    <div className="bg-white rounded-lg shadow border-b">
      <nav className="flex gap-6 px-6">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={`/provider/dashboard?tab=${tab.id}`}
            className={`
              py-4 px-2 border-b-2 font-medium text-sm transition-colors
              ${currentTab === tab.id
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
```

### Example 3: GigsTab Server Component with Actions
```typescript
// app/provider/dashboard/_components/GigsTab.tsx
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/components/forms/GigForm'
import type { PricingTiers } from '@/lib/validations/pricing'

type Gig = {
  id: string
  slug: string
  title: string
  category: string
  pricingTiers: PricingTiers
  isActive: boolean
  _count: { orders: number }
}

export default function GigsTab({ gigs }: { gigs: Gig[] }) {
  if (gigs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-600 mb-4">You haven't created any gigs yet.</p>
        <Link
          href="/gigs/new"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
        >
          Create Your First Gig
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Gigs ({gigs.length})</h2>
        <Link
          href="/gigs/new"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Create New Gig
        </Link>
      </div>

      <div className="space-y-3">
        {gigs.map(gig => {
          const pricingTiers = gig.pricingTiers as PricingTiers
          const startingPrice = pricingTiers.basic?.price
          const categoryLabel = CATEGORY_LABELS[gig.category] || gig.category

          return (
            <div
              key={gig.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:border-orange-300 transition-colors"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">{gig.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    gig.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {gig.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="uppercase font-medium">{categoryLabel}</span>
                  {startingPrice && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Starting at ${startingPrice}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>{gig._count.orders} orders</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/gigs/${gig.slug}`}
                  className="text-sm text-gray-600 hover:text-orange-600 font-medium px-3 py-1.5 rounded transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/gigs/${gig.slug}/edit`}
                  className="text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### Example 4: OrdersTab with Status Filtering
```typescript
// app/provider/dashboard/_components/OrdersTab.tsx
import OrderCard from '@/components/orders/OrderCard'
import type { OrderStatus } from '@prisma/client'

type Order = {
  id: string
  status: OrderStatus
  totalPrice: number
  selectedTier: string
  createdAt: Date
  gig: { title: string; slug: string }
  buyer: { username: string | null; displayName: string | null; avatarUrl: string | null }
}

export default function OrdersTab({ orders }: { orders: Order[] }) {
  // Group orders by status
  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const activeOrders = orders.filter(o => ['ACCEPTED', 'IN_PROGRESS'].includes(o.status))
  const completedOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status))

  return (
    <div className="space-y-6">
      {/* Pending Orders - Needs Attention */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Pending Orders ({pendingOrders.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            These orders are waiting for your response
          </p>
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} viewAs="provider" />
            ))}
          </div>
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Active Orders ({activeOrders.length})
          </h2>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} viewAs="provider" />
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          Completed Orders ({completedOrders.length})
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No completed orders yet</p>
        ) : (
          <div className="space-y-3">
            {completedOrders.slice(0, 5).map(order => (
              <OrderCard key={order.id} order={order} viewAs="provider" />
            ))}
            {completedOrders.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-4">
                Showing 5 of {completedOrders.length} completed orders
              </p>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600">No orders yet. When customers order your services, they'll appear here.</p>
        </div>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side tab state (useState) | URL search params with server components | Next.js 13+ App Router (2023) | Bookmarkable URLs, SSR compatibility, browser history |
| Separate pages per section | Tabbed dashboards with parallel routes | 2024-2025 | Faster perceived performance, better UX |
| Client-side data fetching (useEffect) | Server Components with direct DB access | React 18+ (2022), Next.js 13+ | Better security (no client data exposure), faster initial load |
| Generic dashboards | Role-specific dashboards (buyer vs. provider) | Marketplace UX evolution (2024-2026) | Reduced cognitive load, clearer task prioritization |

**Deprecated/outdated:**
- **getServerSideProps**: Replaced by async Server Components in App Router (no longer needed)
- **API routes for data fetching**: Direct Prisma access in Server Components replaces intermediate API layer
- **Complex state management (Redux, Zustand) for dashboard**: URL params + Server Components handle most state needs

## Open Questions

Things that couldn't be fully resolved:

1. **Should provider dashboard show ALL orders or paginate?**
   - What we know: Current `/orders` page shows all buyer orders unpaginated
   - What's unclear: Provider might have hundreds of orders over time
   - Recommendation: Start with "show recent orders (last 20)" with "View All Orders" link. Add pagination in Phase 8 if needed.

2. **Should messages tab show full chat or just conversation list?**
   - What we know: `/messages` page shows conversation list, clicking opens full chat
   - What's unclear: Whether to embed chat interface in dashboard or link to messages page
   - Recommendation: Show conversation list in tab, link to full chat page. Keeps dashboard focused on overview, not full interactions.

3. **Do providers need analytics/stats (total earnings, order count)?**
   - What we know: ROADMAP requirements don't explicitly mention analytics
   - What's unclear: Whether basic stats would help providers understand their business
   - Recommendation: Add simple aggregate stats (total orders, total earnings) at top of dashboard - requires one Prisma `aggregate()` query, minimal effort, high value.

4. **Should inactive/draft gigs appear in gigs tab?**
   - What we know: Gig model has `isActive` boolean
   - What's unclear: UI treatment of inactive gigs in provider dashboard
   - Recommendation: Show all gigs (active and inactive) with visual badge. Provider needs to see all their listings to reactivate or delete.

5. **Mode switching: Navigation link or dedicated switcher component?**
   - What we know: Research shows "clear role separation" is critical UX pattern
   - What's unclear: Best UI pattern for switching between buyer and provider modes
   - Recommendation: Add simple navigation link "Switch to Buyer/Provider Mode" in header. Persistent across dashboard, clear affordance.

## Sources

### Primary (HIGH confidence)
- [Next.js Official Docs: Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - URL params pattern
- [Next.js Official Docs: Fetching Data](https://nextjs.org/learn/dashboard-app/fetching-data) - Parallel queries with Promise.all()
- [Next.js Official Docs: Dynamic Route Segments](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/) - App Router patterns
- Existing codebase analysis - `/src/app/dashboard/page.tsx`, `/src/actions/orders.ts`, `/src/actions/gigs.ts`

### Secondary (MEDIUM confidence)
- [What Good Marketplace UX Design Looks Like](https://www.rigbyjs.com/blog/marketplace-ux) - Role-based navigation patterns
- [Marketplace UX Design Best Practices](https://www.netguru.com/blog/marketplace-ux-design) - Dual-role user patterns
- [Next.js 15 Advanced Patterns](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/) - App Router best practices 2026
- [Fiverr Community: New Seller Dashboard](https://community.fiverr.com/public/forum/boards/from-the-fiverr-team-cd2/posts/new-changes-coming-to-your-seller-dashboard-jdxspjoq2g) - Real-world provider dashboard UX

### Tertiary (LOW confidence)
- General marketplace trends articles (mobile-first, AI personalization) - directional guidance only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, Next.js 15 patterns well-documented
- Architecture: HIGH - URL params + Server Components is proven pattern, verified in Next.js official docs
- Pitfalls: MEDIUM - Based on general Next.js experience and research, not phase-specific testing

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - Next.js patterns are stable)

---

## Implementation Checklist for Planner

When creating plans, ensure:
- [ ] `/provider/dashboard` route created with tab navigation
- [ ] Parallel data fetching with `Promise.all()` for gigs, orders, stats
- [ ] URL search params used for tab state (`?tab=gigs|orders|messages`)
- [ ] Reuse existing components (OrderCard, GigCard) with `viewAs="provider"`
- [ ] Reuse existing server actions (no new actions needed)
- [ ] Mobile-responsive grid layouts (Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- [ ] Clear role context with "Provider Mode" indicator and "Switch to Buyer" link
- [ ] Empty states for no gigs, no orders, no messages
- [ ] Order status grouping (pending, active, completed) for provider prioritization
- [ ] Stats/aggregate data (total orders, total earnings) at dashboard top
