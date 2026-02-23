---
phase: 11-mock-data-generation
plan: 01
subsystem: data-generation
requires:
  - 10-01-seed-infrastructure
provides:
  - provider-profiles-with-arabic-english-names
  - category-distributed-gigs-with-pricing
  - 15-providers-33-gigs-across-13-categories
affects:
  - 11-02-orders-reviews (will reference these providers and gigs)
  - future-marketplace-browsing (all categories populated)
tech-stack:
  added: []
  patterns:
    - mixed-locale-faker-seeding
    - round-robin-category-distribution
    - deterministic-image-generation
key-files:
  created: []
  modified:
    - prisma/seed.ts
decisions:
  - decision: Use mixed Arabic/English locales (fakerAR/fakerEN) with alternating pattern
    rationale: Reflects Moroccan marketplace diversity without Moroccan-specific locale
    alternatives: Single locale (English only) or all Arabic
    impact: Provider names authentically represent bilingual market
  - decision: Round-robin category assignment vs random selection
    rationale: Ensures all 13 categories guaranteed coverage
    alternatives: Random category selection (could leave gaps)
    impact: Every category has gigs, preventing empty browse pages
  - decision: Category-specific pricing ranges from market research
    rationale: Plumbing ($75-$600) vs Car Washing ($30-$250) reflects reality
    alternatives: Single generic price range for all categories
    impact: More realistic marketplace data for testing
metrics:
  duration: 113 seconds (~2 minutes)
  completed: 2026-02-23
tags:
  - faker
  - seed-data
  - providers
  - gigs
  - localization
  - mock-data
---

# Phase 11 Plan 01: Provider & Gig Generation Summary

**One-liner:** 15 providers with mixed Arabic/English names, 33 gigs across all 13 categories with realistic category-specific pricing ($30-$1200 range)

## Objective Achieved

Populated `seedUsers()` and `seedGigs()` functions in the existing seed script with 15 provider profiles and category-distributed gigs with realistic content. All 13 service categories now have representative gigs with appropriate titles, descriptions, and 3-tier pricing.

## What Was Built

### Core Implementation

1. **Helper Functions (3 category-specific generators)**
   - `generateCategoryTitle()`: Returns category-appropriate title from templates (3 options per category)
   - `generateCategoryDescription()`: Combines lorem paragraphs for realistic gig descriptions
   - `generateCategoryPricing()`: Returns Basic/Standard/Premium tiers with category-specific price ranges

2. **Provider Generation (`seedUsers()`)**
   - Creates 15 provider profiles
   - Alternates Arabic (fakerAR) and English (fakerEN) names using index pattern (i % 2)
   - Generates deterministic avatars via DiceBear API seeded by email
   - Creates provider bios, professional summaries, and experience (1-20 years)
   - Skills array populated after gig creation

3. **Gig Generation (`seedGigs()`)**
   - Creates 1-3 gigs per provider (33 total gigs)
   - Round-robin category assignment ensures all 13 categories covered
   - Each gig has category-appropriate title from template
   - Lorem Picsum portfolio images (2 per gig, deterministic seeds)
   - Pricing tiers with category-specific ranges:
     - HVAC: $100-$1200 (premium tier)
     - Plumbing/Electrical: $75-$600
     - Digital services: $40-$600
     - Car washing: $30-$250
   - Updates provider skills array to match gig categories

### Data Distribution

**Category Coverage:**
- 13/13 categories populated (100% coverage)
- Distribution: 2-3 gigs per category (evenly spread)
- Categories: PLUMBING, PAINTING, CLEANING, CARPENTRY, WELDING, ELECTRICAL, HVAC, LANDSCAPING, MOVING, CAR_WASHING, DIGITAL_DESIGN, DIGITAL_WRITING, OTHER

**Provider Locale Mix:**
- 8 providers with Arabic names (fakerAR)
- 7 providers with English names (fakerEN)
- All usernames in English for URL compatibility

**Pricing Realism:**
- Basic tier: 3-7 day delivery
- Standard tier: 5-10 day delivery
- Premium tier: 7-14 day delivery
- Prices reflect 2026 market research

## Task Commits

| Task | Name | Commit | Files Modified |
|------|------|--------|----------------|
| 1 | Add helper functions and populate seedUsers() and seedGigs() | 5b01e13 | prisma/seed.ts |

## Verification Results

All verification criteria passed:

1. ✅ `npx prisma db seed` completes without errors
2. ✅ Database has exactly 15 provider users with @herafi-seed.test emails
3. ✅ All 13 categories have at least 1 gig (verified: 2-3 gigs each)
4. ✅ Each gig has pricingTiers with basic/standard/premium structure
5. ✅ Running seed twice produces same results (idempotent via upsert)

**Sample Data Verification:**
```
Providers: 15
Gigs: 33
Categories with gigs: 13

Sample provider (provider1):
  Name: مازن السقا (Arabic)
  Username: moses.crist
  Experience: 15 years
  Skills: [ 'PLUMBING', 'PAINTING', 'CLEANING' ]

Sample gig (Plumbing):
  Title: Professional Plumbing Repair
  Category: PLUMBING
  Pricing: Basic $135, Standard $236, Premium $517
  Images: 2 Lorem Picsum images
```

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions Made

### 1. Locale Seeding Strategy
**Decision:** Seed both fakerAR and fakerEN instances separately
```typescript
faker.seed(SEED_VALUE);
fakerAR.seed(SEED_VALUE);
fakerEN.seed(SEED_VALUE);
```
**Rationale:** Locale-specific faker instances are not automatically seeded by global faker.seed()
**Impact:** Ensures deterministic output for both Arabic and English name generation

### 2. Slug Generation Pattern
**Decision:** Use first 8 characters of provider.id in slug
```typescript
const slug = `${faker.helpers.slugify(title).toLowerCase()}-${provider.id.slice(0, 8)}-${i}`;
```
**Rationale:** Full CUID (25 chars) creates excessively long URLs; 8 chars sufficient for uniqueness
**Impact:** Cleaner URLs while maintaining uniqueness

### 3. Skills Array Update Timing
**Decision:** Update provider skills after all gigs created for that provider
**Rationale:** Skills derived from gig categories; must wait until gigs exist
**Impact:** Skills accurately reflect provider's service offerings

## Key Patterns Established

1. **Mixed Locale Generation**
   - Index-based alternation (i % 2) is deterministic unlike Math.random()
   - Separate locale instances (fakerAR, fakerEN) must be seeded independently
   - Username always English for URL compatibility

2. **Round-Robin Category Distribution**
   - `categoryIndex % CATEGORIES.length` ensures even distribution
   - Prevents gaps in category coverage (all 13 categories guaranteed)
   - More reliable than random selection for small datasets

3. **Category-Specific Content**
   - Lookup tables (Record<Category, ...>) for titles, pricing ranges
   - Market research informs realistic pricing tiers
   - Helper functions encapsulate category logic

4. **Deterministic External APIs**
   - DiceBear: `seed=${email}` ensures same avatar per provider
   - Lorem Picsum: `seed=${slug}-1` ensures consistent images
   - No API keys or installations needed

## Next Phase Readiness

**Phase 11-02 (Orders & Reviews) Prerequisites:**
- ✅ 15 providers available for order/review generation
- ✅ 33 gigs available as order targets
- ✅ All categories represented (ensures diverse order distribution)
- ✅ Pricing tiers defined (needed for order totalPrice calculation)

**Blockers:** None

**Concerns:** None

## Self-Check: PASSED

All files exist:
- ✅ prisma/seed.ts (modified, not created)

All commits exist:
- ✅ 5b01e13 (feat: populate seedUsers and seedGigs)
