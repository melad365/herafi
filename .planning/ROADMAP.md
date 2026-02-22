# Roadmap: Herafi v0.2.0

## Overview

This milestone enhances navigation UX and populates the marketplace with realistic mock data. Phase 9 delivers comprehensive navigation components (hamburger menu and user dropdown), Phase 10 establishes seed infrastructure with Faker.js and idempotent patterns, and Phase 11 generates 10-15 complete provider profiles with gigs, reviews, and ratings across all 13 service categories.

## Milestones

- ✅ **v0.1.0 MVP** - Phases 1-8 (shipped 2026-02-22)
- 🚧 **v0.2.0 Polish & Seeding** - Phases 9-11 (in progress)

## Phases

<details>
<summary>✅ v0.1.0 MVP (Phases 1-8) - SHIPPED 2026-02-22</summary>

**Delivered:** Initial alpha release with complete authentication, service listings, real-time messaging, reviews, and provider dashboard.

**Key accomplishments:**
- End-to-end authentication system with JWT sessions
- Complete service marketplace with gig CRUD and search
- Real-time messaging with Socket.IO
- Trust layer with ratings and reviews
- Provider dashboard for managing gigs and orders
- Burgundy design system with landing page

**Stats:** 196 files, ~10K lines TypeScript/JavaScript, 8 phases, 26 plans, 122 commits over 6 days

</details>

### 🚧 v0.2.0 Polish & Seeding (In Progress)

**Milestone Goal:** Improve navigation UX and populate marketplace with realistic mock data for development and demo purposes.

- [ ] **Phase 9: Navigation Components** - Desktop hamburger menu and user account dropdown
- [ ] **Phase 10: Mock Data Infrastructure** - Faker.js setup and idempotent seed scripts
- [ ] **Phase 11: Mock Data Generation** - Complete provider profiles with gigs and reviews

## Phase Details

### Phase 9: Navigation Components
**Goal**: Users have comprehensive navigation access via hamburger menu and user account dropdown.
**Depends on**: Phase 8 (v0.1.0 complete)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, NAV-07, NAV-08, NAV-09, NAV-10, NAV-11, NAV-12
**Success Criteria** (what must be TRUE):
  1. User can click hamburger icon next to logo and see grouped navigation sections (Browse, Account, Provider)
  2. User can navigate to all key app pages from hamburger menu (Browse, Categories, Dashboard, Messages, Orders, My Gigs, Help)
  3. User can click avatar to open dropdown showing username/email and access Profile, Settings, and Sign Out
  4. Menus auto-close when user navigates to another page or clicks outside dropdown
  5. Keyboard users can navigate menus with Tab, Enter, and Escape keys for accessibility
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md — Desktop hamburger menu with grouped navigation sections
- [ ] 09-02-PLAN.md — User account dropdown with profile info and sign out

### Phase 10: Mock Data Infrastructure
**Goal**: Seed infrastructure ready to generate idempotent, reproducible mock data.
**Depends on**: Phase 9
**Requirements**: SEED-01, SEED-02, SEED-03, SEED-04, SEED-05, SEED-06
**Success Criteria** (what must be TRUE):
  1. Developer can run `npx prisma db seed` to populate database with mock data
  2. Running seed command multiple times produces same deterministic results without errors
  3. Seed script clears existing test data in proper dependency order before insertion
  4. All seed script TypeScript code executes without compilation errors
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

### Phase 11: Mock Data Generation
**Goal**: Marketplace populated with 10-15 realistic providers across all categories.
**Depends on**: Phase 10
**Requirements**: SEED-07, SEED-08, SEED-09, SEED-10, SEED-11, SEED-12, SEED-13, SEED-14, SEED-15, SEED-16, SEED-17, SEED-18, SEED-19, SEED-20
**Success Criteria** (what must be TRUE):
  1. User browsing marketplace sees 10-15 unique service providers with complete profiles (name, avatar, bio, experience)
  2. Each provider has 1-3 gigs with realistic descriptions, pricing tiers, and portfolio images
  3. Providers distributed across all 13 service categories (Plumbing, Painting, Cleaning, Carpentry, Welding, Digital, etc.)
  4. Each provider displays aggregate rating (3.5-5.0 range) with 3-8 written reviews showing varied content and timestamps
  5. Provider profile pages show accurate averageRating and totalReviews counts matching actual review data
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 9 → 10 → 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 9. Navigation Components | v0.2.0 | 0/2 | Planned | - |
| 10. Mock Data Infrastructure | v0.2.0 | 0/TBD | Not started | - |
| 11. Mock Data Generation | v0.2.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-22*
*Last updated: 2026-02-22*
