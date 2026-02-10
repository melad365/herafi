---
phase: 04-order-flow
plan: 01
subsystem: database
tags: [prisma, postgresql, state-machine, zod, order-management]

# Dependency graph
requires:
  - phase: 03-service-listings-discovery
    provides: Gig model with pricing tiers and provider relations
  - phase: 01-auth-profile
    provides: User model with buyer and provider capabilities
provides:
  - Order model with buyer/provider/gig relations and pricing snapshot
  - OrderStatus enum with 5-state lifecycle
  - State machine validation for order status transitions
  - Zod schema for order creation with tier selection
affects: [04-02, 04-03, 04-04, 05-messaging-chat]

# Tech tracking
tech-stack:
  added: [date-fns]
  patterns: [state-machine-validation, tier-snapshot-pattern, terminal-states]

key-files:
  created: [src/lib/order-state-machine.ts, src/lib/validations/order.ts]
  modified: [prisma/schema.prisma]

key-decisions:
  - "Pricing snapshot stored as JSON to preserve historical tier details at purchase time"
  - "Five-state order lifecycle: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED / CANCELLED (terminal states)"
  - "paymentConfirmed defaults to true for MVP mock payment auto-approval"
  - "Timestamp fields for each state transition (acceptedAt, startedAt, completedAt, cancelledAt)"

patterns-established:
  - "State machine pattern: ORDER_STATE_TRANSITIONS map with canTransition(), validateTransition(), getNextStates()"
  - "Terminal states: COMPLETED and CANCELLED have no valid transitions"
  - "Tier snapshot pattern: full pricing tier details stored in tierSnapshot JSON field at order creation"

# Metrics
duration: 2.1min
completed: 2026-02-10
---

# Phase 04 Plan 01: Order Model Foundation Summary

**Order model with 5-state lifecycle (PENDING→ACCEPTED→IN_PROGRESS→COMPLETED/CANCELLED), state machine validation, and pricing snapshot preservation**

## Performance

- **Duration:** 2.1 min
- **Started:** 2026-02-10T14:59:48Z
- **Completed:** 2026-02-10T15:01:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Order model created with buyer, provider, and gig foreign key relations
- OrderStatus enum with 5 states enforcing valid lifecycle transitions
- State machine with canTransition(), validateTransition(), and getNextStates() functions
- Zod validation schema for order creation with tier selection and delivery notes
- date-fns installed for timestamp formatting in subsequent plans

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Order model and OrderStatus enum to Prisma schema** - `8b27407` (feat)
2. **Task 2: Create order state machine and validation schema** - `ac0c547` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added Order model with relations to User (buyer/provider) and Gig, OrderStatus enum, indexes on buyerId/providerId/gigId/status/createdAt
- `src/lib/order-state-machine.ts` - State machine with ORDER_STATE_TRANSITIONS map and validation functions
- `src/lib/validations/order.ts` - Zod schema for order creation (selectedTier enum, deliveryNotes string)
- `package.json` / `package-lock.json` - Added date-fns dependency

## Decisions Made

**Pricing snapshot as JSON:**
- Stores full tier details (name, price, deliveryTime, description, features) at order creation time
- Preserves historical pricing even if provider changes gig tiers later
- Enables accurate order history and dispute resolution

**Five-state lifecycle with terminal states:**
- PENDING → ACCEPTED → IN_PROGRESS → COMPLETED (happy path)
- Any state except terminal can transition to CANCELLED
- COMPLETED and CANCELLED are terminal (no further transitions allowed)
- Timestamp fields track when each transition occurred

**Mock payment auto-approval:**
- paymentConfirmed defaults to true for MVP
- Allows full order flow testing without payment integration complexity
- Phase 5 can extend with real payment gateway

**State machine validation pattern:**
- ORDER_STATE_TRANSITIONS map explicitly defines allowed transitions
- canTransition() for boolean checks (middleware, guards)
- validateTransition() for error messages (API responses)
- getNextStates() for UI rendering (show available actions)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Prisma client generation required:**
- After schema push, needed to run `npx prisma generate` to regenerate client with OrderStatus enum
- TypeScript compilation failed initially because OrderStatus type wasn't available
- Resolved by regenerating Prisma client before TypeScript verification

**Zod enum errorMap syntax:**
- Initial implementation used `errorMap: () => ({ message: "..." })` which isn't valid for z.enum()
- Corrected to use `message: "..."` directly in params object
- TypeScript compilation passed after fix

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 04 Plan 02 (Order Placement UI):**
- Order model exists with all required fields
- State machine validates PENDING → ACCEPTED transition
- orderSchema ready for form validation
- Gig pricing tiers can be read and snapshotted at order creation

**Ready for Phase 04 Plan 03 (Provider Order Management):**
- Provider can query orders via providerOrders relation
- State machine enforces valid transitions (ACCEPTED → IN_PROGRESS → COMPLETED)
- Timestamp fields track order progress

**No blockers or concerns.**

---
*Phase: 04-order-flow*
*Completed: 2026-02-10*

## Self-Check: PASSED

All created files verified:
- src/lib/order-state-machine.ts ✓
- src/lib/validations/order.ts ✓

All commits verified:
- 8b27407 ✓
- ac0c547 ✓
