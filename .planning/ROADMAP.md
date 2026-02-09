# Roadmap: Herafi Services Marketplace

## Overview

This roadmap delivers a Fiverr-style marketplace for in-person and digital services in 8 phases: foundation (auth), user identity (profiles), core marketplace (gig listings and discovery), transaction flow (orders with mock payments), communication infrastructure (real-time chat), trust layer (reviews), provider tools (dashboard), and final polish (UI refinement). Every v1 requirement maps to exactly one phase, delivering a complete MVP for validation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Authentication** - User accounts with secure login
- [x] **Phase 2: User Profiles** - Identity layer with provider showcase
- [x] **Phase 3: Service Listings & Discovery** - Core marketplace with gig CRUD and browse/search
- [ ] **Phase 4: Order Flow** - Transaction system with mock payments
- [ ] **Phase 5: Real-Time Messaging** - Chat infrastructure for user communication
- [ ] **Phase 6: Reviews & Ratings** - Trust mechanism with verified feedback
- [ ] **Phase 7: Provider Dashboard** - Seller tools for managing services and orders
- [ ] **Phase 8: UI Polish** - Final refinement of user experience and responsiveness

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: Users can securely create accounts and authenticate
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can create a new account with email and password
  2. User can log in with their credentials
  3. User remains logged in after closing and reopening browser
  4. User sees appropriate error messages for invalid credentials or duplicate emails
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project setup, dependencies, Prisma schema
- [x] 01-02-PLAN.md — Auth.js config, validation schemas, server actions
- [x] 01-03-PLAN.md — Auth UI pages, middleware, route protection

### Phase 2: User Profiles
**Goal**: Users can establish identity and showcase provider credentials
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03
**Success Criteria** (what must be TRUE):
  1. User can set their display name, upload an avatar, and write a bio
  2. User profile page displays their information, services offered, and aggregate rating
  3. User can upload portfolio images showing their work samples
  4. Profile changes save and persist across sessions
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Schema extensions, dependencies, upload utils, validation schemas
- [x] 02-02-PLAN.md — Server actions, profile edit page, avatar crop modal
- [x] 02-03-PLAN.md — Public profile page, display components, portfolio carousel
- [x] 02-04-PLAN.md — Become a provider flow, dashboard updates, middleware

### Phase 3: Service Listings & Discovery
**Goal**: Users can create, browse, and search service offerings
**Depends on**: Phase 2
**Requirements**: GIG-01, GIG-02, GIG-03, GIG-04, DISC-01, DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. Provider can create a gig with title, description, category, and pricing tiers (Basic/Standard/Premium)
  2. Provider can edit and delete their own gigs
  3. User can browse services by category (Plumbing, Painting, Cleaning, Carpentry, Welding, Digital, etc.)
  4. User can search services using keywords
  5. User can filter search results by price range and rating
  6. Gig detail page shows full description, images, pricing tiers, provider info, and reviews
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Database schema (Gig model, Category enum), validation schemas, slug utility, search builder
- [x] 03-02-PLAN.md — Gig CRUD server actions, create/edit forms, image upload
- [x] 03-03-PLAN.md — Browse/search pages, filter components, category browse, pagination
- [x] 03-04-PLAN.md — Gig detail page, image gallery, pricing tier cards, provider sidebar, dashboard update

### Phase 4: Order Flow
**Goal**: Users can place and track orders with mock payment processing
**Depends on**: Phase 3
**Requirements**: ORD-01, ORD-02
**Success Criteria** (what must be TRUE):
  1. User can place an order by selecting a gig tier from the gig detail page
  2. User sees a mock payment flow that auto-approves upon confirmation
  3. Order appears in user's order history with current status
  4. Provider sees incoming order requests
  5. Order progresses through states: request → accepted → in progress → complete
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during plan-phase

### Phase 5: Real-Time Messaging
**Goal**: Users can communicate in real-time via chat
**Depends on**: Phase 4
**Requirements**: MSG-01
**Success Criteria** (what must be TRUE):
  1. User can send and receive real-time chat messages with another user
  2. Messages appear instantly without page refresh
  3. Chat conversation persists across page reloads
  4. User can initiate chat from provider profile or gig page
  5. Message history loads when reopening a conversation
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during plan-phase

### Phase 6: Reviews & Ratings
**Goal**: Users can provide and view verified feedback on completed services
**Depends on**: Phase 5
**Requirements**: REV-01
**Success Criteria** (what must be TRUE):
  1. User can leave a star rating (1-5) and written review after service completion
  2. Reviews appear on provider profile and gig detail pages
  3. Provider's aggregate rating updates automatically when new reviews are submitted
  4. Reviews are linked to verified completed orders only
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during plan-phase

### Phase 7: Provider Dashboard
**Goal**: Providers have dedicated tools to manage their services and orders
**Depends on**: Phase 6
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Provider can access a dashboard showing all their gigs
  2. Provider can manage (edit, delete, view) their gigs from the dashboard
  3. Provider can view all incoming orders with status and customer details
  4. Provider can access all their message conversations from the dashboard
  5. Dashboard clearly distinguishes between "provider mode" (managing services) and "buyer mode" (browsing services)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD during plan-phase

### Phase 8: UI Polish
**Goal**: Application delivers warm, polished, responsive user experience
**Depends on**: Phase 7
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. All interactive elements have polished micro-interactions (hover effects, transitions, loading states)
  2. Design feels warm and approachable (rounded corners, warm palette, whitespace) — not template-generated
  3. Application works seamlessly on mobile, tablet, and desktop screen sizes
  4. All user actions provide clear feedback (success messages, error states, loading indicators)
  5. Navigation is intuitive with clear visual cues for buyer vs. provider contexts
**Plans**: TBD

Plans:
- [ ] 08-01: TBD during plan-phase

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 3/3 | ✓ Complete | 2026-02-07 |
| 2. User Profiles | 4/4 | ✓ Complete | 2026-02-08 |
| 3. Service Listings & Discovery | 4/4 | ✓ Complete | 2026-02-09 |
| 4. Order Flow | 0/TBD | Not started | - |
| 5. Real-Time Messaging | 0/TBD | Not started | - |
| 6. Reviews & Ratings | 0/TBD | Not started | - |
| 7. Provider Dashboard | 0/TBD | Not started | - |
| 8. UI Polish | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-07*
*Last updated: 2026-02-09 — Phase 3 complete*
