---
phase: 06-reviews-and-ratings
plan: 01
subsystem: database
tags: [prisma, postgres, reviews, ratings, server-actions, zod]

# Dependency graph
requires:
  - phase: 04-order-management
    provides: Order model with COMPLETED status for verified purchase checks
provides:
  - Review model with composite unique constraint preventing duplicate reviews
  - Denormalized averageRating and totalReviews on User and Gig models
  - submitReview server action with transactional aggregate updates
  - reviewSchema validation for rating (1-5) and optional content
affects: [06-02, 06-03, profile-display, gig-display, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Transactional aggregate recalculation pattern using prisma.$transaction
    - Composite unique constraint for preventing duplicate reviews
    - Denormalized rating fields for fast display without joins

key-files:
  created:
    - src/lib/validations/review.ts
    - src/actions/reviews.ts
  modified:
    - prisma/schema.prisma

key-decisions:
  - "One review per buyer per order enforced via @@unique([buyerId, orderId])"
  - "Aggregate ratings denormalized on User and Gig for fast display"
  - "Transactional aggregate updates ensure atomic consistency"
  - "Only buyers of COMPLETED orders can submit reviews"

patterns-established:
  - "Transaction pattern: create review → fetch all reviews → recalculate averages → update aggregates"
  - "Composite unique constraint pattern for relationship-scoped uniqueness"
  - "Verified purchase check via order status and buyer ID validation"

# Metrics
duration: 2min
completed: 2026-02-11
---

# Phase 6 Plan 01: Review Model & Server Action Summary

**Review model with atomic aggregate recalculation in PostgreSQL transactions, preventing duplicate reviews via composite unique constraint**

## Performance

- **Duration:** 2 minutes
- **Started:** 2026-02-11T18:57:44Z
- **Completed:** 2026-02-11T19:00:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Review model created with buyerId, orderId, providerId, gigId, rating, and content fields
- Denormalized averageRating and totalReviews fields added to User and Gig models for O(1) display
- submitReview server action with verified purchase checks and transactional aggregate updates
- Composite unique constraint prevents duplicate reviews per order

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Review model and aggregate fields to Prisma schema** - `4b7fe80` (feat)
2. **Task 2: Create review validation schema and submitReview server action** - `01ffa70` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added Review model with composite unique constraint, added averageRating/totalReviews to User and Gig
- `src/lib/validations/review.ts` - Zod schema validating rating (1-5) and optional content (10-1000 chars)
- `src/actions/reviews.ts` - submitReview server action with verified purchase checks and transactional aggregate updates

## Decisions Made

**1. One review per buyer per order enforced via @@unique([buyerId, orderId])**
- Prevents duplicate reviews at database level
- Composite key on buyerId and orderId ensures one review per purchase
- Aligned with standard review system patterns (one review per transaction)

**2. Aggregate ratings denormalized on User and Gig for fast display**
- averageRating (Float, default 0.0) and totalReviews (Int, default 0) on User model
- Same fields on Gig model
- Avoids expensive aggregation queries on every profile/gig page load
- Trade-off: slight write overhead during review creation for massive read performance gain

**3. Transactional aggregate updates ensure atomic consistency**
- Used prisma.$transaction to wrap review creation and aggregate recalculation
- Fetch all reviews → compute average → update user/gig in single transaction
- Prevents race conditions where ratings could be inconsistent
- Ensures database integrity even under concurrent review submissions

**4. Only buyers of COMPLETED orders can submit reviews**
- Verified purchase check: order.status === COMPLETED
- Buyer ownership check: session.user.id === order.buyerId
- Prevents review spam and ensures reviews come from actual customers
- Aligned with standard marketplace practices (verified purchase badge)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Prisma Client regeneration required after schema changes**
- After updating schema.prisma with Review model, TypeScript errors appeared because Prisma Client hadn't regenerated
- Resolution: Ran `npx prisma generate` to update generated types
- This is standard workflow - db push updates database, generate updates types

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for 06-02 (Review submission UI) and 06-03 (Review display components):**
- Review model exists in database with all required fields
- submitReview server action ready to be called from form components
- Aggregate ratings ready to be displayed on profiles and gigs
- Composite unique constraint prevents duplicate reviews at database level

**Data ready:**
- averageRating and totalReviews fields exist on User and Gig models
- New reviews automatically update aggregates via transaction

**No blockers:**
- All verification criteria passed
- TypeScript compiles without errors
- Prisma schema valid and migrated

---
*Phase: 06-reviews-and-ratings*
*Completed: 2026-02-11*

## Self-Check: PASSED

All files created and commits verified:
- ✓ src/lib/validations/review.ts
- ✓ src/actions/reviews.ts
- ✓ Commit 4b7fe80 (Task 1)
- ✓ Commit 01ffa70 (Task 2)
