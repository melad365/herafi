---
phase: 11-mock-data-generation
plan: 02
subsystem: database
tags: [faker, prisma, seed-data, orders, reviews, ratings]

# Dependency graph
requires:
  - phase: 11-01
    provides: Provider and gig seed data foundation
provides:
  - Complete marketplace data with 4 buyers, 148 orders, 77 reviews
  - Bell curve rating distribution (3-5 stars) for realistic marketplace
  - Provider and gig aggregate ratings accurately calculated
affects: [browsing, search, provider-profiles, gig-details]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Bell curve rating distribution helper (generateRating)
    - Per-provider review count control (3-8 reviews)
    - Aggregate rating calculation with zero-division safety

key-files:
  created: []
  modified:
    - prisma/seed.ts

key-decisions:
  - "Bell curve distribution: 25% 5-star, 65% 4-star, 10% 3-star for realistic marketplace ratings"
  - "3-8 reviews per provider controlled at provider level (not order level) to meet constraints"
  - "Review content length varies: short sentence (lengthRoll=1), medium paragraph (2), long multi-paragraph (3)"

patterns-established:
  - "generateRating(): Bell curve helper for realistic rating distributions"
  - "Zero-division safety: check totalReviews > 0 before averaging"
  - "Review timestamps: faker.date.between(order.completedAt, now)"

# Metrics
duration: 3.8min
completed: 2026-02-23
---

# Phase 11 Plan 02: Orders & Reviews Summary

**Complete marketplace seed data: 4 buyers, 148 completed orders, 77 reviews with bell curve ratings (3-5 stars), and accurate aggregate ratings on all 15 providers and 33 gigs**

## Performance

- **Duration:** 3.8 min
- **Started:** 2026-02-23T00:30:13Z
- **Completed:** 2026-02-23T00:34:03Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Created 4 buyer accounts for order/review generation
- Generated 148 completed orders (3-6 per gig) with realistic timestamps
- Implemented bell curve rating distribution (25% 5-star, 65% 4-star, 10% 3-star)
- Created 77 reviews with varied content lengths (20-320 chars: short/medium/long)
- Calculated and updated provider averageRating (3.7-4.5 range) and totalReviews (3-8 per provider)
- Calculated and updated gig averageRating and totalReviews

## Task Commits

Each task was committed atomically:

1. **Task 1: Create buyer accounts and completed orders** - `3d99de4` (feat)
2. **Task 2: Add reviews and aggregate ratings with bell curve distribution** - `033eaaf` (feat)

## Files Created/Modified
- `prisma/seed.ts` - Added seedOrders(), generateRating(), seedReviews(), and updateAggregates() functions

## Decisions Made

**Bell curve rating distribution**
- Implemented generateRating() helper with 25% 5-star, 65% 4-star, 10% 3-star distribution for realistic marketplace ratings
- Returns integers 3-5 matching schema Int type

**Per-provider review control**
- Initially used 85% probability per order, but this led to some providers having >8 reviews
- Changed to per-provider approach: fetch provider's orders, target 3-8 reviews, shuffle and select subset
- Ensures all providers meet 3-8 review constraint

**Review content variety**
- lengthRoll 1: faker.lorem.sentence() for short reviews
- lengthRoll 2: faker.lorem.paragraph() for medium reviews
- lengthRoll 3: faker.lorem.paragraphs(2) for long reviews

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed date range validation error**
- **Found during:** Task 1 (Order timestamp generation)
- **Issue:** faker.date.between() failed when `from` date was after `to` date - happened when createdAt was too recent (within 30 days), causing calculated startedAt + 1 day to be after current date
- **Fix:** Added validation to ensure createdAt is at least 30 days in the past by checking against minCreatedAt and adjusting if needed
- **Files modified:** prisma/seed.ts
- **Verification:** Seed ran successfully without date range errors
- **Committed in:** 3d99de4 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added review count constraint enforcement**
- **Found during:** Task 2 verification
- **Issue:** Initial 85% review probability per order led to some providers having 9-15 reviews (exceeding 3-8 constraint) when they had multiple gigs
- **Fix:** Changed from per-order probability to per-provider targeting: fetch all provider orders, calculate target reviews (3-8 min of available), shuffle and select subset
- **Files modified:** prisma/seed.ts
- **Verification:** All 15 providers now have 3-8 reviews (verified via query)
- **Committed in:** 033eaaf (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both auto-fixes necessary for correctness (avoiding runtime errors) and meeting must-have constraints. No scope creep.

## Issues Encountered

**Date arithmetic complexity**
- Generating realistic order timestamps with proper sequencing (created → accepted → started → completed) while ensuring valid date ranges required careful arithmetic
- Solution: Used explicit timestamp calculations with 1-hour/1-day increments and validation before calling faker.date.between()

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 11-03 (Conversations & Messages):**
- Complete marketplace foundation with users, gigs, orders, and reviews
- Buyer and provider accounts available for message seeding
- Realistic data for testing browsing, search, and profile pages

**Data verification:**
- 15 providers with 3-8 reviews each (rating range 3.7-4.5)
- 4 buyers for conversation seeding
- 33 gigs across all 13 categories
- 148 completed orders as message context
- 77 reviews with varied content and bell curve ratings

## Self-Check: PASSED

---
*Phase: 11-mock-data-generation*
*Completed: 2026-02-23*
