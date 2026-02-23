# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Anyone can find and hire a trusted service provider for in-person or digital work through a simple, browsable marketplace with clear service listings.
**Current focus:** Phase 11 - Mock Data Generation

## Current Position

Phase: 11 of 11 (Mock Data Generation)
Plan: 2 of 3
Status: In progress
Last activity: 2026-02-23 — Completed 11-02-PLAN.md

Progress: [█████████░] 92% (10/11 phases complete, 2/3 plans in Phase 11)

## Performance Metrics

**Velocity (v0.1.0):**
- Total plans completed: 26
- Average duration: ~4.1 min
- Total execution time: ~1.79 hours

**By Phase (v0.1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | 22.4m | 7.5m |
| 2 | 4 | 9.4m | 2.4m |
| 3 | 5 | 10.6m | 2.1m |
| 4 | 3 | 10.3m | 3.4m |
| 5 | 3 | 10.8m | 3.6m |
| 6 | 2 | 7.0m | 3.5m |
| 7 | 2 | 4.0m | 2.0m |
| 8 | 4 | 30.6m | 7.7m |

**Recent Trend:**
- v0.1.0 velocity: Stable to improving across phases
- v0.2.0: Phase 9 complete (09-01: 2 min, 09-02: 1 min)
- v0.2.0: Phase 10 complete (10-01: 2 min)
- v0.2.0: Phase 11 in progress (11-01: 2 min, 11-02: 3.8 min)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v0.1.0]: Single user type (buyer + provider) simplifies auth
- [v0.1.0]: Fiverr-style gigs with tiers proven model
- [v0.1.0]: Mock payments validate flow without Stripe complexity
- [v0.1.0]: Real-time chat over simple inbox enhances trust
- [v0.1.0]: JWT sessions for Credentials provider simpler than database sessions
- [v0.1.0]: Burgundy design system conveys trust and craftsmanship
- [v0.2.0]: Research recommends reusing MobileNav pattern for desktop navigation
- [v0.2.0]: @faker-js/faker chosen for realistic mock data generation
- [v0.2.0]: DiceBear and Lorem Picsum APIs for avatars and images (no package install)
- [09-01]: CSS-only responsive hiding (hidden md:block) avoids hydration mismatch
- [09-01]: Capturing phase event listener for reliable click-outside detection
- [09-01]: useClickOutside hook pattern established for menus and dropdowns
- [09-02]: Separation of concerns - UserDropdown for account actions vs DesktopHamburger for primary navigation
- [09-02]: Provider mode indicator in dropdown for clear provider status visibility
- [10-01]: @herafi-seed.test email domain for seed data (not @example.com)
- [10-01]: PrismaClient with pg adapter in seed script (matches src/lib/db.ts)
- [10-01]: faker.seed(42) for deterministic, reproducible seed data
- [11-01]: Mixed Arabic/English locales for provider diversity (fakerAR/fakerEN alternating)
- [11-01]: Round-robin category assignment ensures all 13 categories have gigs
- [11-01]: Category-specific pricing ranges based on market research ($30-$1200)
- [11-02]: Bell curve rating distribution (25% 5-star, 65% 4-star, 10% 3-star) for realistic marketplace
- [11-02]: Per-provider review control (3-8 reviews) via shuffle-and-select approach
- [11-02]: Review content length varies (short sentence, medium paragraph, long multi-paragraph)

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 9 (Navigation):**
- ✓ Server/Client component boundary maintained (Header stays Server Component)
- ✓ Menus auto-close on navigation (usePathname + useEffect + onClick handlers)
- ✓ Keyboard navigation support implemented (Enter/Escape with ARIA attributes)
- Phase 9 COMPLETE - All 12 NAV requirements satisfied

**Phase 10 (Seed Infrastructure):**
- ✓ Table cleanup follows reverse dependency order (reviews → messages → conversations → orders → gigs → portfolioImages → users)
- ✓ Idempotent execution verified (runs successfully twice)
- ✓ Deterministic seeding with faker.seed(42)
- ✓ Proper connection cleanup (prisma + pool.end) prevents hanging
- Phase 10 COMPLETE - All 6 SEED requirements satisfied (SEED-01 through SEED-06)

**Phase 11 (Mock Data):**
- ✓ Locale decision resolved: Mixed Arabic/English (fakerAR/fakerEN) with alternating pattern
- ✓ Category-specific pricing implemented based on market research
- ✓ Date range validation for order timestamps (createdAt must be ≥30 days before now)
- ✓ Per-provider review targeting ensures 3-8 reviews constraint met
- Plan 11-01 COMPLETE - 15 providers, 33 gigs, all 13 categories covered
- Plan 11-02 COMPLETE - 4 buyers, 148 orders, 77 reviews with bell curve ratings

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 11-02-PLAN.md (Orders & Reviews Generation)
Resume file: None

---
*Created: 2026-02-22*
*Last updated: 2026-02-23 — Phase 11 Plan 02 complete*
