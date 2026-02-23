# Herafi

## What This Is

Herafi is a services marketplace web app where users can offer and hire services — focused on in-person work like plumbing, painting, cleaning, carpentry, welding, and car washing, but also open to digital services. Think Fiverr, but for the trades. A single account lets you both hire and offer services.

**Current status:** v0.2.0 shipped (2026-02-23) — navigation improvements and realistic mock data complete.

## Core Value

Anyone can find and hire a trusted service provider for in-person or digital work through a simple, browsable marketplace with clear service listings.

## Requirements

### Validated

✅ **v0.1.0 shipped (2026-02-22):**

- ✓ Email/password authentication (single user type — buyer and provider in one) — v0.1.0
- ✓ Gig-style service listings with description, images, and pricing tiers (Basic/Standard/Premium) — v0.1.0
- ✓ Browse services by categories (Plumbing, Painting, Cleaning, Carpentry, Welding, Digital, etc.) — v0.1.0
- ✓ Search services with keyword and filters (price range, rating) — v0.1.0
- ✓ Real-time chat messaging between users and providers — v0.1.0
- ✓ Mock payment flow (auto-approved on user confirmation, no real payment processing) — v0.1.0
- ✓ Order tracking (request → provider accepts → in progress → complete) — v0.1.0
- ✓ Star ratings and written reviews after service completion — v0.1.0
- ✓ Provider dashboard: manage gigs, view incoming orders, messages — v0.1.0
- ✓ Warm, approachable UI with polished micro-interactions (hover effects, transitions) — v0.1.0
- ✓ Responsive layout (mobile and desktop) — v0.1.0

✅ **v0.2.0 shipped (2026-02-23):**

- ✓ Desktop hamburger menu with grouped navigation sections (Browse/Account/Provider) — v0.2.0
- ✓ User dropdown menu with profile info, provider mode indicator, and account actions — v0.2.0
- ✓ Click-outside detection and keyboard navigation support — v0.2.0
- ✓ Idempotent seed infrastructure with Faker.js for deterministic mock data — v0.2.0
- ✓ 15 realistic provider profiles with mixed Arabic/English names — v0.2.0
- ✓ 33 gigs distributed across all 13 service categories — v0.2.0
- ✓ 148 completed orders and 77 reviews with bell curve rating distribution — v0.2.0
- ✓ Category-specific pricing based on market research — v0.2.0
- ✓ Complete navigation routes (Categories, Help, Profile, Settings, My Gigs) — v0.2.0
- ✓ Seed user authentication with bcrypt-hashed passwords — v0.2.0

### Active

(No active requirements — define in next milestone)

### Out of Scope

- Location/map-based search — deferred, not needed for MVP
- Real payment processing / escrow — mock payments only for now, validate demand first
- OAuth / social login — email/password sufficient for MVP
- Email/push notifications — deferred to v2
- Admin moderation panel — deferred to v2
- Mobile app — web-first
- Video content in listings — storage/bandwidth complexity
- Dispute resolution system — no real payments yet
- Background checks for providers — regulatory complexity

## Context

**Shipped in v0.1.0 (2026-02-22):**
- ~10K lines of TypeScript/JavaScript across 196 files
- 8 phases, 26 plans, 122 commits over 6 days
- Complete authentication with JWT sessions
- Full marketplace with service listings, search, and discovery
- Real-time messaging with Socket.IO and typing indicators
- Trust layer with verified reviews and aggregate ratings
- Provider dashboard with comprehensive management tools
- Burgundy design system with landing page and mobile navigation

**Shipped in v0.2.0 (2026-02-23):**
- ~6,180 net lines added across 39 files
- 4 phases, 7 plans, 37 commits over 1.4 days
- Desktop navigation with hamburger menu and user dropdown
- Idempotent seed infrastructure with Faker.js
- 15 provider profiles, 33 gigs, 148 orders, 77 reviews
- All 13 service categories populated with realistic data
- Complete navigation coverage (no 404s)
- Seed user authentication for testing authenticated flows

**Current tech stack:**
- Next.js 15, TypeScript, Tailwind CSS, Prisma v7, PostgreSQL 17, Auth.js v5, Socket.IO
- ~10,553 total TypeScript/JavaScript LOC
- @faker-js/faker for deterministic mock data generation

**Key differentiators:**
- Focus on in-person/trade services (underserved on platforms like Fiverr)
- Single user type simplifies auth and UX — any user can switch between hiring and offering
- Warm, hand-crafted UI (burgundy theme) — not AI-generated looking
- Mixed Arabic/English content reflecting bilingual marketplace

**MVP approach:**
- Mock payment lets us build full order flow without payment provider integration
- No location constraints keeps scope manageable
- Local filesystem uploads sufficient for alpha validation
- Deterministic seed data enables reproducible testing and demos

## Constraints

- **Tech stack**: Next.js (React) — user preference
- **Scope**: MVP only — ship fast, validate, iterate
- **UI quality**: Must feel hand-crafted, not template/AI-generated. Simplicity with polish
- **Auth**: Single login system, no separate user/provider accounts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single user type (buyer + provider) | Simplifies auth, mirrors real behavior (anyone can do both) | ✓ Good — clean UX, no role confusion |
| Fiverr-style gigs with tiers | Proven model, clear structure for services | ✓ Good — users understand tiered pricing |
| Mock payments for MVP | Full order flow without payment integration complexity | ✓ Good — validates flow, defers Stripe complexity |
| No location in MVP | Reduces scope, can add city/region filtering in v2 | ✓ Good — kept scope manageable |
| Real-time chat over simple inbox | Better UX for service negotiation, user preference | ✓ Good — typing indicators enhance trust |
| Email/password only | Sufficient for MVP, OAuth deferred | ✓ Good — simpler implementation |
| Prisma v7 with PostgreSQL adapter | Required for Next.js 15 compatibility | — Pending (production validation) |
| JWT sessions for Credentials provider | Simpler than database sessions | ✓ Good — 30-day sessions work well |
| Burgundy design system | Conveys trust and craftsmanship | ✓ Good — warm, professional feel |
| Local filesystem uploads | Sufficient for MVP validation | — Pending (needs migration to cloud storage for production) |
| useClickOutside hook pattern | Reusable pattern for menus and dropdowns | ✓ Good — used in both hamburger and dropdown |
| Mixed Arabic/English seed data | Reflects bilingual Moroccan marketplace | ✓ Good — authentic representation |
| Round-robin category distribution | Ensures all 13 categories have gigs | ✓ Good — prevents empty browse pages |
| Bell curve rating distribution | Realistic marketplace ratings (3-5 stars) | ✓ Good — 25% 5-star, 65% 4-star, 10% 3-star |
| Deterministic seeding (faker.seed) | Reproducible test data across runs | ✓ Good — consistent demos and testing |
| Prisma groupBy for category counts | Single query vs 13 individual counts | ✓ Good — more efficient database access |
| Standard test password for seed users | Developer convenience (password123 for all) | ✓ Good — easy to remember, clearly documented |

---
*Last updated: 2026-02-23 — v0.2.0 milestone complete*
