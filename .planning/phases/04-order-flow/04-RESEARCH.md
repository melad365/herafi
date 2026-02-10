# Phase 4: Order Flow - Research

**Researched:** 2026-02-10
**Domain:** Service marketplace order management with state machines, mock payments, and order tracking
**Confidence:** HIGH

## Summary

Phase 4 implements the complete order flow for the Herafi marketplace: users place orders by selecting gig pricing tiers, payments are mocked with auto-approval, orders progress through states (request → accepted → in progress → complete), and both buyers and providers can track order status through dashboards. Research focused on order state machine patterns, Prisma schema design for dual-role users (buyer + provider), server action authorization patterns from existing codebase, mock payment flows for MVP simplicity, and order tracking UI patterns.

The standard approach uses a Prisma Order model with enum status field (simpler for MVP than separate transitions table), foreign keys to both buyer and provider (same User model), reference to selected Gig and chosen pricing tier, mock payment confirmation (boolean flag, no integration), and server actions with strict authorization checks (buyer can place orders, provider can accept/progress orders, only order participants can view). Dashboard shows contextual order lists: buyers see "My Orders", providers see "Incoming Requests" + "Active Orders".

**Primary recommendation:** Use simple OrderStatus enum for MVP (PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED) with state transition validation in server actions, store selected tier and price snapshot to preserve historical data if gig pricing changes, implement authorization checks following Phase 2-3 patterns (verify session + ownership), mock payments with instant approval (no payment gateway integration), and build separate dashboard views for buyer orders vs provider requests to maintain clear UX separation.

## Standard Stack

The established libraries/tools for implementing order flow in Next.js 15 with Prisma:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | App Router, Server Actions, dynamic routes for order pages | Already in use, native patterns for forms and mutations |
| Prisma | 7.x | Order model with enum status, relations to User and Gig | Already in use, handles foreign keys and state management |
| Zod | 3.x | Order validation (tier selection, delivery notes) | Already in use from Phase 2-3 for form validation |
| Auth.js | 5.x | Session management for authorization checks | Already in use, required for buyer/provider identity |
| PostgreSQL | 17 | Relational database with foreign keys, enum types | Already in use, supports referential integrity |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 3.x | Date formatting for order timestamps, delivery dates | Lightweight, tree-shakeable alternative to moment.js |
| React Hook Form | 7.x | Order placement form with tier selection | Optional, if order form becomes complex with many fields |
| React Toastify | 10.x | Success/error notifications after order actions | Optional, improves UX for async actions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Enum status field | Separate OrderTransition table | Transitions table better for audit logs but adds complexity; enum simpler for MVP |
| Mock payment flag | Stripe test mode | Stripe adds real integration work; mock flag sufficient for MVP validation |
| Single Order model | Separate BuyerOrder/ProviderOrder | Single model simpler with dual foreign keys; separate models would duplicate logic |
| Server action validation | Middleware state checks | Server actions align with existing patterns; middleware better for complex workflows |
| Snapshot pricing | Reference to Gig pricing | Snapshot preserves historical data if gig pricing changes; reference always current |

**Installation:**
```bash
npm install date-fns
# react-hook-form and react-toastify are optional
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── orders/
│   │   ├── page.tsx                  # Buyer's order list (My Orders)
│   │   ├── [orderId]/
│   │   │   └── page.tsx              # Order detail page (buyer or provider view)
│   ├── dashboard/
│   │   ├── orders/
│   │   │   └── page.tsx              # Provider's incoming order requests
│   ├── gigs/
│   │   └── [slug]/
│   │       └── order/
│   │           └── page.tsx          # Order placement form (tier selection)
├── actions/
│   └── orders.ts                     # Order CRUD + state transition actions
├── components/
│   ├── orders/
│   │   ├── OrderCard.tsx             # Order summary card for lists
│   │   ├── OrderStatusBadge.tsx      # Colored status indicator
│   │   ├── OrderTimeline.tsx         # Visual state progression
│   │   ├── TierSelectionCard.tsx     # Pricing tier selection UI
│   │   ├── MockPaymentFlow.tsx       # Fake payment confirmation dialog
│   │   └── OrderActionButtons.tsx    # Provider accept/progress/complete buttons
│   ├── dashboard/
│   │   ├── BuyerOrdersList.tsx       # Buyer dashboard order section
│   │   └── ProviderOrdersList.tsx    # Provider dashboard order section
├── lib/
│   ├── validations/
│   │   └── order.ts                  # Zod schemas for order creation
│   ├── order-state-machine.ts        # State transition validation logic
│   └── order-helpers.ts              # Order status checks, can transition, etc.
```

### Pattern 1: Order Model with Dual User References

**What:** Single Order model with foreign keys to both buyer and provider (both reference User model), plus Gig reference and pricing snapshot.

**When to use:** All order-related data storage.

**Example:**
```prisma
// Source: Research on marketplace schema patterns + existing Herafi schema
// prisma/schema.prisma

enum OrderStatus {
  PENDING       // Order placed, awaiting provider acceptance
  ACCEPTED      // Provider accepted, not yet started
  IN_PROGRESS   // Provider working on order
  COMPLETED     // Order finished
  CANCELLED     // Order cancelled by either party
}

model Order {
  id          String      @id @default(cuid())

  // Buyer reference
  buyerId     String
  buyer       User        @relation("BuyerOrders", fields: [buyerId], references: [id], onDelete: Cascade)

  // Provider reference
  providerId  String
  provider    User        @relation("ProviderOrders", fields: [providerId], references: [id], onDelete: Cascade)

  // Gig reference
  gigId       String
  gig         Gig         @relation(fields: [gigId], references: [id], onDelete: Cascade)

  // Selected tier and price snapshot
  selectedTier     String  // "basic" | "standard" | "premium"
  tierSnapshot     Json    // Full tier details at time of purchase
  totalPrice       Float

  // Order details
  deliveryNotes    String?  @db.Text

  // State management
  status           OrderStatus @default(PENDING)

  // Mock payment
  paymentConfirmed Boolean @default(true)  // Auto-approved for MVP

  // Timestamps
  createdAt        DateTime @default(now())
  acceptedAt       DateTime?
  startedAt        DateTime?
  completedAt      DateTime?
  cancelledAt      DateTime?

  updatedAt        DateTime @updatedAt

  @@index([buyerId])
  @@index([providerId])
  @@index([gigId])
  @@index([status])
  @@index([createdAt])
}

// Extend User model with order relations
model User {
  // ... existing fields from Phase 1-3

  // Dual-role order relations
  buyerOrders     Order[] @relation("BuyerOrders")
  providerOrders  Order[] @relation("ProviderOrders")
}

// Extend Gig model with order relation
model Gig {
  // ... existing fields from Phase 3

  orders Order[]
}
```

### Pattern 2: State Transition Validation

**What:** Server-side validation ensuring orders only transition through valid state paths.

**When to use:** All order state change actions (accept, start, complete, cancel).

**Example:**
```typescript
// Source: Lawrence Jones state machine patterns + marketplace research
// lib/order-state-machine.ts

import { OrderStatus } from '@prisma/client'

export const ORDER_STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
}

export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const allowedTransitions = ORDER_STATE_TRANSITIONS[currentStatus]
  return allowedTransitions.includes(newStatus)
}

export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { valid: boolean; error?: string } {
  if (!canTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    }
  }
  return { valid: true }
}

// Get next allowed states for UI
export function getNextStates(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATE_TRANSITIONS[currentStatus]
}
```

### Pattern 3: Order Placement Server Action

**What:** Server action to create order with tier selection, mock payment, and authorization checks.

**When to use:** Order placement form submission.

**Example:**
```typescript
// Source: Existing gigs.ts action pattern + marketplace order flow research
// actions/orders.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { orderSchema } from '@/lib/validations/order'
import { revalidatePath } from 'next/cache'
import type { PricingTiers } from '@/lib/validations/pricing'

export type OrderActionState = {
  success: boolean
  orderId?: string
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function placeOrder(
  gigSlug: string,
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch gig with provider info
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    include: {
      provider: {
        select: { id: true, isProvider: true },
      },
    },
  })

  if (!gig) {
    return { success: false, error: 'Gig not found' }
  }

  if (!gig.provider.isProvider) {
    return { success: false, error: 'Invalid provider' }
  }

  // Prevent self-ordering
  if (gig.providerId === session.user.id) {
    return { success: false, error: 'Cannot order from yourself' }
  }

  // Parse and validate form data
  const raw = {
    selectedTier: formData.get('selectedTier') as string,
    deliveryNotes: formData.get('deliveryNotes') as string || null,
  }

  const parsed = orderSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Validate tier exists and extract price
  const pricingTiers = gig.pricingTiers as PricingTiers
  const tierName = parsed.data.selectedTier as 'basic' | 'standard' | 'premium'
  const tier = pricingTiers[tierName]

  if (!tier) {
    return { success: false, error: 'Invalid tier selected' }
  }

  try {
    // Create order with tier snapshot
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        providerId: gig.providerId,
        gigId: gig.id,
        selectedTier: tierName,
        tierSnapshot: tier, // Preserve tier details
        totalPrice: tier.price,
        deliveryNotes: parsed.data.deliveryNotes,
        status: 'PENDING',
        paymentConfirmed: true, // Mock payment auto-approved
      },
    })

    // Revalidate paths
    revalidatePath('/orders')
    revalidatePath('/dashboard')
    revalidatePath(`/gigs/${gigSlug}`)

    return { success: true, orderId: order.id }
  } catch (error) {
    return { success: false, error: 'Failed to place order' }
  }
}
```

### Pattern 4: Order State Update Actions

**What:** Server actions for provider to accept, start, complete orders with state validation.

**When to use:** Provider dashboard order management.

**Example:**
```typescript
// actions/orders.ts (continued)
import { canTransition } from '@/lib/order-state-machine'
import { OrderStatus } from '@prisma/client'

export async function acceptOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch order with authorization check
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { providerId: true, status: true },
  })

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  // Verify provider ownership
  if (order.providerId !== session.user.id) {
    return { success: false, error: 'Not authorized' }
  }

  // Validate state transition
  if (!canTransition(order.status, OrderStatus.ACCEPTED)) {
    return { success: false, error: 'Invalid order status transition' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to accept order' }
  }
}

export async function startOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { providerId: true, status: true },
  })

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  if (order.providerId !== session.user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (!canTransition(order.status, OrderStatus.IN_PROGRESS)) {
    return { success: false, error: 'Invalid order status transition' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to start order' }
  }
}

export async function completeOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { providerId: true, status: true },
  })

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  if (order.providerId !== session.user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (!canTransition(order.status, OrderStatus.COMPLETED)) {
    return { success: false, error: 'Invalid order status transition' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to complete order' }
  }
}

export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, providerId: true, status: true },
  })

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  // Both buyer and provider can cancel
  const isParticipant =
    order.buyerId === session.user.id || order.providerId === session.user.id

  if (!isParticipant) {
    return { success: false, error: 'Not authorized' }
  }

  if (!canTransition(order.status, OrderStatus.CANCELLED)) {
    return { success: false, error: 'Cannot cancel completed order' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to cancel order' }
  }
}
```

### Pattern 5: Dashboard Order Lists (Dual Views)

**What:** Separate order list views for buyers and providers with contextual filtering.

**When to use:** Dashboard page for order management.

**Example:**
```typescript
// Source: Existing dashboard.tsx pattern + marketplace order flow research
// app/dashboard/page.tsx (extended)

// Buyer's orders
const buyerOrders = await prisma.order.findMany({
  where: { buyerId: session.user?.id },
  include: {
    gig: {
      select: { title: true, slug: true },
    },
    provider: {
      select: { username: true, displayName: true, avatarUrl: true },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
})

// Provider's incoming and active orders
const providerOrders = user?.isProvider
  ? await prisma.order.findMany({
      where: {
        providerId: session.user?.id,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS],
        },
      },
      include: {
        gig: {
          select: { title: true, slug: true },
        },
        buyer: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  : []

// Render contextual sections
{buyerOrders.length > 0 && (
  <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      My Orders ({buyerOrders.length})
    </h2>
    <div className="space-y-3">
      {buyerOrders.map((order) => (
        <OrderCard key={order.id} order={order} viewAs="buyer" />
      ))}
    </div>
  </div>
)}

{user?.isProvider && providerOrders.length > 0 && (
  <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
      Order Requests ({providerOrders.length})
    </h2>
    <div className="space-y-3">
      {providerOrders.map((order) => (
        <OrderCard key={order.id} order={order} viewAs="provider" />
      ))}
    </div>
  </div>
)}
```

### Pattern 6: Order Detail Page with Authorization

**What:** Single order detail page accessible to both buyer and provider with contextual actions.

**When to use:** `/orders/[orderId]` page.

**Example:**
```typescript
// app/orders/[orderId]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { OrderStatus } from '@prisma/client'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      provider: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      gig: {
        select: { title: true, slug: true, category: true },
      },
    },
  })

  if (!order) {
    notFound()
  }

  // Authorization: only buyer or provider can view
  const isBuyer = order.buyerId === session.user?.id
  const isProvider = order.providerId === session.user?.id

  if (!isBuyer && !isProvider) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-red-600">Not Authorized</h1>
        <p className="mt-2 text-gray-600">
          You don&apos;t have permission to view this order.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Order header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Gig info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Service</h2>
          <Link href={`/gigs/${order.gig.slug}`} className="text-orange-600 hover:underline">
            {order.gig.title}
          </Link>
        </div>

        {/* Buyer/Provider info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Buyer</h3>
            <Link href={`/u/${order.buyer.username}`} className="text-orange-600 hover:underline">
              {order.buyer.displayName || order.buyer.username}
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Provider</h3>
            <Link href={`/u/${order.provider.username}`} className="text-orange-600 hover:underline">
              {order.provider.displayName || order.provider.username}
            </Link>
          </div>
        </div>

        {/* Pricing details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tier Selected</h3>
          <p className="text-gray-900 capitalize">{order.selectedTier}</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            ${order.totalPrice}
          </p>
        </div>

        {/* Action buttons - contextual based on role and status */}
        {isProvider && order.status === OrderStatus.PENDING && (
          <div className="flex gap-3">
            <form action={acceptOrder.bind(null, order.id)}>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md">
                Accept Order
              </button>
            </form>
            <form action={cancelOrder.bind(null, order.id)}>
              <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md">
                Decline
              </button>
            </form>
          </div>
        )}

        {isProvider && order.status === OrderStatus.ACCEPTED && (
          <form action={startOrder.bind(null, order.id)}>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md">
              Start Working
            </button>
          </form>
        )}

        {isProvider && order.status === OrderStatus.IN_PROGRESS && (
          <form action={completeOrder.bind(null, order.id)}>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md">
              Mark Complete
            </button>
          </form>
        )}
      </div>

      {/* Order timeline */}
      <OrderTimeline order={order} />
    </div>
  )
}
```

### Pattern 7: Mock Payment Flow

**What:** Simple confirmation dialog for payment with auto-approval (no actual payment processing).

**When to use:** Order placement flow from gig detail page.

**Example:**
```typescript
// components/orders/MockPaymentFlow.tsx
'use client'

import { useState } from 'react'

interface MockPaymentFlowProps {
  tierName: string
  price: number
  onConfirm: () => void
}

export function MockPaymentFlow({ tierName, price, onConfirm }: MockPaymentFlowProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    // Mock payment auto-approves
    setIsOpen(false)
    onConfirm()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Continue to Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Payment
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                You are ordering: <span className="font-semibold capitalize">{tierName}</span> tier
              </p>
              <p className="text-3xl font-bold text-orange-600">
                ${price}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-900">
                <strong>MVP Mode:</strong> This is a simulated payment. In production, this would integrate with a payment gateway.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### Anti-Patterns to Avoid

- **Don't allow self-ordering:** Validate that buyer and provider are different users
- **Don't skip state transition validation:** Always check canTransition() before updating order status
- **Don't reference live gig pricing:** Snapshot tier details at order creation to preserve historical data
- **Don't forget authorization on every action:** Verify user is buyer or provider for each operation
- **Don't use optimistic UI for order state changes:** Order state is critical, wait for server confirmation
- **Don't show all orders on dashboard:** Filter by status and role (provider sees pending/active, buyer sees all)
- **Don't skip indexes on foreign keys:** Order queries by buyer/provider/gig need indexes for performance

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine validation | Manual if/else chains | State transition map with validation function | Centralized logic, easier to test, prevents invalid transitions |
| Date formatting | new Date().toString() | date-fns format() | Consistent formatting, timezone handling, relative dates |
| Authorization checks | Inline session checks | Reusable helper functions | DRY principle, consistent security, easier to audit |
| Order status badges | Inline className logic | StatusBadge component with color mapping | Consistent UI, centralized color scheme |
| Payment processing | DIY escrow logic | Mock flag for MVP, real gateway for production | Payment security requires expertise, mock sufficient for validation |
| Dual-role queries | Separate buyer/provider models | Single User model with relations | Simpler schema, users can be both roles simultaneously |

**Key insight:** State machines have subtle edge cases around concurrent transitions and validation. Authorization is security-critical and must be consistent. Date handling requires timezone awareness. Payment processing is complex with fraud/regulatory concerns—mock for MVP, integrate real gateway later.

## Common Pitfalls

### Pitfall 1: Concurrent State Transitions

**What goes wrong:** Two requests try to update order status simultaneously; both succeed, skipping a state.

**Why it happens:** Database read-then-update has time gap; no transaction isolation.

**How to avoid:**
- Use Prisma transactions for state updates with where clause checking current status
- Add optimistic locking with version field or updatedAt comparison
- Catch Prisma `P2025` error (record not found) as indicator of concurrent update
- Return clear error: "Order status changed, please refresh and try again"

**Warning signs:** Order jumps from PENDING to COMPLETED, skipping ACCEPTED; state machine validation passed but wrong state persists.

### Pitfall 2: Self-Ordering Prevention Missing

**What goes wrong:** Provider places order on their own gig; breaks buyer/provider separation.

**Why it happens:** Forgot to check if session.user.id === gig.providerId.

**How to avoid:**
- Add explicit check in placeOrder action: "Cannot order from yourself"
- Consider UI-level prevention (hide order button if user is provider)
- Test with same user logged in as both buyer and provider

**Warning signs:** Orders where buyerId === providerId; broken analytics separating buyer/provider metrics.

### Pitfall 3: Pricing Tier Changes After Order Placement

**What goes wrong:** Provider updates gig pricing; existing orders show new prices instead of what buyer paid.

**Why it happens:** Order references live gig pricingTiers instead of snapshotting at purchase time.

**How to avoid:**
- Store tierSnapshot as JSON in Order model with full tier details at creation
- Display tierSnapshot.price in order details, not current gig.pricingTiers[tier].price
- Preserve tier details even if gig is edited or deleted

**Warning signs:** Order history shows different prices than receipts; buyer disputes arise.

### Pitfall 4: Missing Authorization on Order Viewing

**What goes wrong:** Users can view any order by guessing orderId in URL.

**Why it happens:** Order detail page fetches order but doesn't verify user is buyer or provider.

**How to avoid:**
- Check `order.buyerId === session.user.id || order.providerId === session.user.id`
- Return 404 (not 403) to prevent order ID enumeration attacks
- Log unauthorized access attempts for security monitoring

**Warning signs:** Users report seeing other people's orders; privacy breach.

### Pitfall 5: Order Status Doesn't Update After Action

**What goes wrong:** Provider clicks "Accept Order" but order still shows PENDING after refresh.

**Why it happens:** Forgot to call revalidatePath() after order update.

**How to avoid:**
- Call revalidatePath('/orders'), revalidatePath('/dashboard'), and revalidatePath(`/orders/${orderId}`)
- Revalidate all pages that display order data
- Consider revalidateTag('orders') if using tag-based caching

**Warning signs:** User reports "button doesn't work"; database shows updated status but UI shows stale data.

### Pitfall 6: Terminal State Transitions Allowed

**What goes wrong:** Order marked COMPLETED but later transitions to IN_PROGRESS.

**Why it happens:** State machine transitions allow backwards movement or exit from terminal states.

**How to avoid:**
- Define terminal states (COMPLETED, CANCELLED) with empty transition arrays
- Validate no transitions allowed from terminal states
- Consider soft delete or archive pattern instead of reopening completed orders

**Warning signs:** Completed orders reappear as active; analytics show decreasing completion rates.

### Pitfall 7: No Delivery Notes or Custom Instructions

**What goes wrong:** Buyer places order but provider doesn't know specific requirements; disputes arise.

**Why it happens:** Order form only captures tier selection, not custom delivery notes.

**How to avoid:**
- Add optional deliveryNotes text field to order form and model
- Display delivery notes prominently in provider's order view
- Consider making delivery notes required for certain gig categories

**Warning signs:** Providers complain "I don't know what they want"; high cancellation rates.

## Code Examples

Verified patterns from official sources and existing codebase:

### Order Validation Schema

```typescript
// lib/validations/order.ts
import { z } from 'zod'

export const orderSchema = z.object({
  selectedTier: z.enum(['basic', 'standard', 'premium'], {
    errorMap: () => ({ message: 'Please select a pricing tier' }),
  }),
  deliveryNotes: z
    .string()
    .max(1000, 'Delivery notes must be under 1000 characters')
    .optional()
    .nullable(),
})

export type OrderFormData = z.infer<typeof orderSchema>
```

### Order Status Badge Component

```typescript
// components/orders/OrderStatusBadge.tsx
import { OrderStatus } from '@prisma/client'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; colorClass: string }
> = {
  PENDING: {
    label: 'Pending',
    colorClass: 'bg-yellow-100 text-yellow-800',
  },
  ACCEPTED: {
    label: 'Accepted',
    colorClass: 'bg-blue-100 text-blue-800',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    colorClass: 'bg-purple-100 text-purple-800',
  },
  COMPLETED: {
    label: 'Completed',
    colorClass: 'bg-green-100 text-green-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    colorClass: 'bg-red-100 text-red-800',
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.colorClass}`}
    >
      {config.label}
    </span>
  )
}
```

### Order Timeline Component

```typescript
// components/orders/OrderTimeline.tsx
import { format } from 'date-fns'
import type { Order } from '@prisma/client'

interface OrderTimelineProps {
  order: Pick<
    Order,
    'createdAt' | 'acceptedAt' | 'startedAt' | 'completedAt' | 'cancelledAt'
  >
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const events = [
    { label: 'Order Placed', date: order.createdAt, icon: '📝' },
    order.acceptedAt && {
      label: 'Accepted',
      date: order.acceptedAt,
      icon: '✅',
    },
    order.startedAt && {
      label: 'Started',
      date: order.startedAt,
      icon: '🚀',
    },
    order.completedAt && {
      label: 'Completed',
      date: order.completedAt,
      icon: '🎉',
    },
    order.cancelledAt && {
      label: 'Cancelled',
      date: order.cancelledAt,
      icon: '❌',
    },
  ].filter(Boolean) as { label: string; date: Date; icon: string }[]

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">
              {event.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{event.label}</p>
              <p className="text-sm text-gray-600">
                {format(event.date, 'PPpp')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Tier Selection Card

```typescript
// components/orders/TierSelectionCard.tsx
'use client'

import type { PricingTier } from '@/lib/validations/pricing'

interface TierSelectionCardProps {
  tier: PricingTier
  isSelected: boolean
  onSelect: () => void
}

export function TierSelectionCard({
  tier,
  isSelected,
  onSelect,
}: TierSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-6 border-2 rounded-lg transition-all ${
        isSelected
          ? 'border-orange-500 bg-orange-50 shadow-md'
          : 'border-gray-200 hover:border-orange-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
        <span className="text-2xl font-bold text-orange-600">
          ${tier.price}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{tier.description}</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>⏱️</span>
          <span>{tier.deliveryDays} day delivery</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>🔄</span>
          <span>{tier.revisions} revision{tier.revisions !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-600">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate OrderTransition table | Enum status field for simple state | Context-dependent | Transitions table better for audit/analytics; enum simpler for MVP |
| Payment gateway integration | Mock payment boolean | Always for MVP | Full payment integration requires compliance; mock validates flow |
| Separate buyer/seller models | Single User with dual relations | Common in gig economy | Single model allows users to be both buyer and provider |
| Client-side state management | Server Actions with revalidation | Next.js 13+ (2023) | Server-side mutations ensure consistency, progressive enhancement |
| Status badges in inline styles | Component with color config | Always for maintainability | Centralized UI logic, consistent branding |
| Hard-coded authorization | Helper functions with clear contracts | Always for security | DRY, easier auditing, prevents authorization bugs |

**Deprecated/outdated:**
- Complex workflow engines for simple state machines: Overkill for linear order flow with few states
- Redux/client state for order status: Server-side state via database is source of truth
- Numeric status codes (1, 2, 3): Enums provide type safety and self-documenting code

## Open Questions

Things that couldn't be fully resolved:

1. **Should we implement order notifications via email or in-app?**
   - What we know: Requirements mention "order appears in history" but not notifications
   - What's unclear: Whether users need real-time alerts when order status changes
   - Recommendation: Defer notifications to Phase 5 (Real-time chat); dashboard shows order lists for now

2. **How to handle order disputes or refunds?**
   - What we know: Mock payments auto-approve; requirements mention "order progresses through states"
   - What's unclear: Whether MVP needs dispute resolution flow
   - Recommendation: Add CANCELLED status for MVP; build formal dispute system in Phase 7

3. **Should orders have expiration or auto-acceptance timers?**
   - What we know: Marketplace research shows Fiverr auto-cancels if provider doesn't respond in 3 days
   - What's unclear: Whether MVP needs automated state changes
   - Recommendation: Defer to Phase 8; manual state management sufficient for MVP

4. **Should we track order milestones or deliverables?**
   - What we know: Requirements mention "in progress" state but not milestone tracking
   - What's unclear: Whether single IN_PROGRESS state is sufficient or needs sub-states
   - Recommendation: Single state for MVP; add milestone tracking in Phase 7 if needed

5. **How to handle partial refunds or price adjustments?**
   - What we know: Order stores totalPrice at creation time
   - What's unclear: Whether price can change after order placement (discounts, partial refunds)
   - Recommendation: Price is immutable for MVP; add adjustment tracking in future phase

## Sources

### Primary (HIGH confidence)

- [Sharetribe Academy: How to Design Your Marketplace's Transaction Flow](https://www.sharetribe.com/academy/how-to-design-your-marketplaces-transaction-flow/) - Order states, payment holds, review period design
- [Lawrence Jones: Use Your Database to Power State Machines](https://blog.lawrencejones.dev/state-machines/) - State transition validation patterns
- [Next.js Official Docs: Authentication](https://nextjs.org/docs/app/guides/authentication) - Authorization patterns for Server Actions
- [Next.js Official Docs: Updating Data](https://nextjs.org/docs/app/getting-started/updating-data) - Server Actions and form handling
- [Prisma Relations Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations) - Dual foreign key patterns

### Secondary (MEDIUM confidence)

- [MakerKit: Next.js Server Actions Complete Guide 2026](https://makerkit.dev/blog/tutorials/nextjs-server-actions) - Server action patterns and best practices
- [Pedro Alonso: Real-Time Notifications with SSE in Next.js](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/) - Real-time order updates patterns
- [Softpost: Prisma Schema for User, Cart and Order Models](https://www.softpost.org/prisma/how-to-create-prisma-schema-for-user-cart-and-order-models) - Order model structure examples
- [Rigby Blog: Checklist of 24 Features Your B2C Marketplace Needs in 2026](https://www.rigbyjs.com/blog/b2c-marketplace-features) - Marketplace order management features
- [Sylius Order State Machine RFC](https://github.com/Sylius/Sylius/issues/4060) - State machine implementation patterns

### Tertiary (LOW confidence)

- [DataModelPack: Marketplace Data Model](https://datamodelpack.com/data-models/marketplace-data-model.html) - Multi-vendor marketplace schema patterns
- [Various WebSearch results on order status validation and authorization](https://github.com/vercel/next.js/discussions/56194) - Community discussions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing Herafi codebase patterns, official Next.js docs
- Architecture: HIGH - Patterns verified in existing Phase 2-3 actions, Prisma official docs
- State machine: HIGH - Authoritative blog post + e-commerce framework implementations
- Pitfalls: MEDIUM-HIGH - Drawn from marketplace platform documentation and security best practices
- Authorization: HIGH - Next.js official authentication guide

**Research date:** 2026-02-10
**Valid until:** ~30 days (stable stack, existing patterns established, marketplace patterns well-known)
