---
phase: 04-order-flow
plan: 02
subsystem: api
tags: [server-actions, prisma, state-machine, authorization, order-lifecycle]

# Dependency graph
requires:
  - phase: 04-01
    provides: Order model schema, state machine, validation schemas
  - phase: 03-01
    provides: Gig model with pricing tiers
  - phase: 02-01
    provides: Server action patterns
provides:
  - Complete order CRUD server actions (place, accept, start, complete, cancel)
  - Authorization enforcement (provider-only vs buyer/provider)
  - State transition validation via state machine
  - Self-ordering prevention
  - Tier pricing snapshot at order creation
affects: [04-03-order-ui, 04-04-dashboard-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - State machine-driven order transitions with canTransition validation
    - Dual authorization model (provider-only vs buyer+provider for cancel)
    - Pricing snapshot preservation for historical accuracy
    - Self-ordering prevention at action layer

key-files:
  created:
    - src/actions/orders.ts
  modified: []

key-decisions:
  - "Provider-only state transitions except cancel (buyer+provider)"
  - "Self-ordering prevented at gig.providerId check"
  - "Tier snapshot captured at order creation for pricing history"
  - "Mock payment auto-approval (paymentConfirmed: true)"

patterns-established:
  - "Order authorization: Provider-only for accept/start/complete, buyer+provider for cancel"
  - "State validation: canTransition() enforces valid transitions before database updates"

# Metrics
duration: 2.4min
completed: 2026-02-10
---

# Phase 4 Plan 2: Order Server Actions Summary

**Complete order lifecycle server actions with authorization, state machine validation, self-ordering prevention, and tier pricing snapshots**

## Performance

- **Duration:** 2.4 min
- **Started:** 2026-02-10T15:04:29Z
- **Completed:** 2026-02-10T15:06:52Z
- **Tasks:** 2
- **Files created:** 1

## Accomplishments
- placeOrder action with self-ordering prevention and tier snapshot preservation
- acceptOrder/startOrder/completeOrder actions (provider-only authorization)
- cancelOrder action with dual authorization (buyer OR provider)
- State machine integration via canTransition() for all transitions
- Timestamp tracking for all state changes (acceptedAt, startedAt, completedAt, cancelledAt)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create placeOrder server action** - `ab78501` (feat)
2. **Task 2: Create order state transition actions** - `06e1945` (feat)

## Files Created/Modified
- `src/actions/orders.ts` - Complete order lifecycle: placeOrder (with self-order check, tier snapshot), acceptOrder, startOrder, completeOrder, cancelOrder (all with auth checks, state validation, path revalidation)

## Decisions Made

**Provider-only state transitions except cancel:**
- Accept, start, and complete actions verify session.user.id === order.providerId
- Cancel action allows either buyer OR provider (checks both buyerId and providerId)
- Prevents unauthorized state manipulation

**Self-ordering prevented at action layer:**
- placeOrder checks if gig.providerId === session.user.id
- Returns "Cannot order from yourself" error before order creation
- Complements potential UI-level prevention

**Tier snapshot captured at order creation:**
- Full tier object (price, description, deliveryDays, revisions, features) stored in tierSnapshot
- totalPrice extracted from tier.price and stored separately for quick queries
- Preserves historical pricing if provider changes tiers later

**Mock payment auto-approval:**
- paymentConfirmed defaults to true in placeOrder
- Orders immediately actionable without payment integration
- MVP simplification, payment gateway deferred to later phase

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Ready for:** Phase 4 Plan 3 (Order UI components)

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

All created files exist:
- ✓ src/actions/orders.ts

All commits exist:
- ✓ ab78501
- ✓ 06e1945
