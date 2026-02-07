# Research Summary: Herafi Services Marketplace

**Domain:** Services Marketplace (Fiverr-like for In-Person & Digital Services)
**Researched:** 2026-02-07
**Overall Confidence:** MEDIUM (based on training data through Jan 2025; WebSearch/WebFetch unavailable)

## Executive Summary

Herafi is a services marketplace targeting an underserved market: in-person trades (plumbing, painting, carpentry, welding) using a proven Fiverr-style fixed-pricing model. Research confirms this is a viable approach with a well-established technology stack (Next.js 15 + PostgreSQL + Prisma) and clear feature priorities.

The standard stack for 2025/2026 service marketplaces centers on **Next.js 15 App Router**, **PostgreSQL** with **Prisma ORM**, **NextAuth.js v5** for authentication, and **Pusher** or **Socket.io** for real-time chat. This stack provides excellent developer experience, strong type safety, and supports all required features (gig listings, search, orders, chat, reviews, mock payments).

**Key success factors identified:**
1. **Cold start prevention:** Launch with 10-20 seed gigs across multiple categories before public launch
2. **Trust mechanisms:** Identity verification (email, phone, ID) and robust review system are table stakes for in-person services
3. **Order state machine:** Design for cancellations, declines, and edge cases from day one, not just happy path
4. **Real-time chat infrastructure:** Requires proper reconnection handling, message persistence, and performance planning
5. **Clear role separation:** Single user type (buyer + provider) requires strong UX to distinguish "browsing" from "managing" modes

**Differentiation strategy:** Herafi's focus on in-person trades is a genuine gap in the market. Most platforms choose either digital (Fiverr) or local services (Thumbtack), but few effectively serve both. The Fiverr-style fixed pricing (vs. Upwork-style bidding) simplifies UX and works well for standardized services.

## Key Findings

**Stack:** Next.js 15 (App Router) + PostgreSQL + Prisma + NextAuth.js v5 + Pusher (chat) + shadcn/ui + Tailwind CSS + Vercel deployment. This is the industry-standard 2025/2026 stack for marketplaces with strong type safety, excellent DX, and all features needed.

**Architecture:** Monolithic Next.js app with Server Components + Server Actions for MVP. WebSocket chat (Pusher for simplicity, Socket.io for control). Clear separation of concerns: `/lib/queries` for reads, `/lib/mutations` for writes, `/components` organized by domain (gigs, orders, chat, reviews).

**Critical pitfall:** Cold start problem (launching with empty marketplace) and inadequate trust/safety for in-person services. Must seed provider listings before launch and implement identity verification early (not deferred).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 0: Pre-Launch Seeding (Optional but Recommended)
- **What:** Manually recruit 10-20 initial providers across key categories (plumbing, painting, cleaning, carpentry, welding)
- **Why:** Prevents cold start problem. Buyers see active marketplace on day one.
- **Addresses:** Critical Pitfall #1 (Cold Start Problem)
- **Avoids:** Launching to empty category pages, death spiral of no supply → no demand → no supply

### Phase 1: Foundation (Week 1-2)
- **What:** Authentication (NextAuth.js), user profiles, basic UI components (shadcn/ui)
- **Why:** Every feature depends on user identity and base UI primitives
- **Addresses:** Technical foundation, identity verification basics
- **Avoids:** Building features before auth exists (requires rework)

### Phase 2: Core Listings & Discovery (Week 2-3)
- **What:** Gig CRUD, categories, browse/search, image upload
- **Why:** Without gigs, there's nothing to transact. Discovery must match mental model (category-first, not just keyword search)
- **Addresses:** Feature table stakes (service listings), Pitfall #5 (search mental model)
- **Avoids:** Generic search that doesn't fit service marketplace patterns

### Phase 3: Order Flow & Mock Payments (Week 3-4)
- **What:** Complete order state machine (request, accept, decline, cancel, complete), mock payment UI, commission calculations (not collected)
- **Why:** Core transaction flow. Must handle edge cases (cancellations, declines) from start, not just happy path
- **Addresses:** Feature table stakes (booking), Pitfall #6 (order state machine), Pitfall #3 (pricing model)
- **Avoids:** Incomplete state machine requiring rewrite later; pricing model that breaks at scale

### Phase 4: Real-Time Chat (Week 4-5)
- **What:** WebSocket setup (Pusher or Socket.io), chat UI, message persistence, reconnection logic
- **Why:** Critical for pre-order negotiation. Most complex infrastructure piece; deserves dedicated phase
- **Addresses:** Feature table stakes (messaging), Pitfall #4 (real-time performance)
- **Avoids:** Chat that loses messages, doesn't handle disconnections, or crashes under load

### Phase 5: Reviews & Ratings (Week 5)
- **What:** Double-blind review system, verified purchase requirement, review display on profiles, aggregate ratings
- **Why:** Trust mechanism. Must prevent gaming (fake reviews, retaliation)
- **Addresses:** Feature table stakes (trust), Pitfall #7 (review gaming)
- **Avoids:** Review system that degrades trust instead of building it

### Phase 6: Provider Dashboard (Week 5-6)
- **What:** Manage gigs, view orders (placed vs. received), basic analytics, clear mode switching UX
- **Why:** Provider experience. Must distinguish "I'm browsing to hire" from "I'm managing my services"
- **Addresses:** Feature table stakes (seller tools), Pitfall #8 (role switching confusion)
- **Avoids:** Mixed contexts that confuse users about their current role

### Phase 7: Polish & Launch (Week 6)
- **What:** Responsive design refinement, loading states, error handling, performance optimization, basic SEO
- **Why:** "Airbnb warmth" requires attention to micro-interactions, not just features
- **Addresses:** UI quality requirement, "hand-crafted" feel
- **Avoids:** Shipping features that work but feel unpolished or template-generated

**Phase ordering rationale:**
- **Foundation first:** Auth and profiles before any features (dependency)
- **Gigs before orders:** Can't order what doesn't exist
- **Search with gigs:** Discovery is part of core listing experience, not deferred
- **Orders before chat:** Chat is complex; get basic transaction flow working first
- **Chat before reviews:** Need completed orders to review, but chat aids order completion
- **Provider dashboard later:** Buying experience validates marketplace first, then optimize seller tools
- **Polish last:** Features must exist before they can be polished

**Research flags for phases:**
- **Phase 0 (Seeding):** Likely needs manual work, not code. Strategy question, not technical.
- **Phase 2 (Discovery):** Standard patterns. Prisma full-text search sufficient for MVP. Unlikely to need deeper research.
- **Phase 3 (Order Flow):** Standard patterns, but verify state machine completeness. Review order state diagram before implementing.
- **Phase 4 (Real-Time Chat):** Likely needs deeper research. Choose Pusher vs. Socket.io based on: cost model, ease of setup, scaling needs. Research reconnection patterns.
- **Phase 5 (Reviews):** Review double-blind review implementation patterns to prevent common gaming tactics.
- **Phase 6 (Dashboard):** Standard patterns. Unlikely to need research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | MEDIUM-HIGH | Core technologies (Next.js, PostgreSQL, Prisma) are established. Version-specific recommendations (NextAuth.js v5, Tailwind 4.x) may need verification as they could still be beta. |
| **Features** | HIGH | Marketplace feature patterns are well-established. Table stakes (listings, search, orders, chat, reviews) consistent across Fiverr, Upwork, TaskRabbit, Thumbtack. |
| **Architecture** | MEDIUM-HIGH | Next.js App Router patterns are stable. Marketplace architecture patterns (two-sided, order state machines, review systems) are well-documented. Real-time chat patterns are established. |
| **Pitfalls** | MEDIUM | Based on training knowledge of marketplace post-mortems and failure patterns. Cold start problem, trust/safety, and order edge cases are universal. Specific 2026 data unavailable. |

**Overall confidence: MEDIUM** — Recommendations are based on solid training data (through Jan 2025) and established patterns, but lack verification against current 2026 sources due to WebSearch/WebFetch unavailability.

## Gaps to Address

**Gaps identified during research (verification recommended):**
1. **NextAuth.js v5 status:** May still be in beta as of Feb 2026. Verify production-readiness or use v4 (stable) with Pages Router compatibility.
2. **Tailwind CSS v4:** May be in alpha/beta. Verify stability or stick with v3.x (battle-tested).
3. **Pusher pricing:** Verify free tier limits for MVP scale. Consider Socket.io if free tier is insufficient.
4. **Next.js 15 stability:** Verify current patch version. App Router was stable in Next.js 14; confirm 15 doesn't introduce breaking changes.
5. **Real-time infrastructure choice:** Deeper research needed on Pusher vs. Socket.io vs. Supabase Realtime tradeoffs for this specific use case.

**Topics needing phase-specific research later:**
- **Phase 0 (Seeding):** Provider recruitment strategy, pricing to offer seed providers, legal considerations
- **Phase 4 (Chat):** Reconnection logic patterns, message queue design, read receipts implementation
- **Phase 5 (Reviews):** Double-blind review timing (when to reveal), helpfulness voting algorithms
- **Post-MVP:** Real payment integration (Stripe Connect patterns), background check services (options, costs, legal)

**Knowledge domains not fully explored (due to tool unavailability):**
- Current 2026 marketplace trends (latest trust/safety innovations, new review system patterns)
- Recent Next.js features specifically designed for marketplace apps
- Emerging alternatives to established stack (new ORMs, auth libraries, real-time services)
- Competitor feature evolution (what has Fiverr, Upwork, Thumbtack added in 2025-2026?)

## Actionable Recommendations

### For Roadmap Creation

1. **Use 7-phase structure** outlined above. Proven dependency order (foundation → listings → orders → chat → reviews → dashboard → polish).

2. **Budget 5-6 weeks** for solo developer with Next.js experience. Phases 1-2 are faster (foundation, CRUD), Phase 4 (chat) is slower (complexity).

3. **Flag Phase 0 (seeding)** as non-technical but critical. Don't skip. 10-20 seed gigs prevent cold start death spiral.

4. **Dedicate Phase 4 entirely to chat**. Don't combine with other features. Real-time is complex; deserves full focus.

5. **Design order state machine in Phase 3 planning**. Draw diagram, validate all transitions before coding. Edge cases (decline, cancel, timeout) are not optional.

6. **Include commission calculations in Phase 3** even though payments are mocked. Prevents pricing model rewrite later.

7. **Plan identity verification in Phase 1-2**. Email verification minimum. Phone verification recommended. ID verification can be Phase 8+.

### For Stack Decisions

1. **Use Next.js 15 App Router** (not Pages Router). Community has moved to App Router; better performance via Server Components.

2. **Use PostgreSQL** (not MongoDB). Relational data model (users, gigs, orders, reviews) is core to marketplace.

3. **Use Prisma** (not Drizzle or raw SQL). Excellent DX, type safety, migration system. Well-integrated with Next.js.

4. **Use shadcn/ui** (not Material-UI or Chakra). Copy-paste components you own. Matches "hand-crafted" requirement. Built on Radix (accessible).

5. **Use Pusher for MVP chat** (not Socket.io). Faster setup, zero infrastructure, reliable. Migrate to Socket.io post-MVP if cost becomes issue.

6. **Use Vercel Blob for MVP images** (not S3). Zero-config on Vercel. Migrate to Cloudinary or S3 later if you need transforms or move off Vercel.

7. **Verify NextAuth.js v5 status** before starting. If still beta, use v4 or consider Clerk/Supabase Auth as alternatives.

### For Feature Prioritization

**Must Have (MVP):**
- Auth (email/password)
- User profiles
- Gig CRUD with tiers (Basic/Standard/Premium)
- Categories + search/browse
- Order flow (full state machine)
- Mock payment (looks real)
- Real-time chat
- Reviews (double-blind, verified purchase)
- Provider dashboard (manage gigs, view orders)
- Responsive UI (Airbnb warmth)

**Should Have (v1.x after validation):**
- Portfolio/work samples for providers
- Availability calendar for in-person services
- Advanced search filters (price range, rating, delivery time)
- Favorites/saved providers
- Skill verification badges (email → phone → ID → background check)
- In-app notifications (supplement email)

**Defer (v2+ or never):**
- Real payment integration (Stripe Connect) — wait for validation
- OAuth / social login — email/password sufficient
- Dispute resolution system — no real payments yet
- Location/map search — explicitly out of scope for MVP
- Mobile native apps — web-first, PWA if needed
- Multi-language support — single market first
- API for third-party integrations — no ecosystem yet

### For Avoiding Pitfalls

1. **Seed marketplace before launch.** Don't go live with zero listings. Recruit 10-20 providers manually.

2. **Implement identity verification early.** Email verification in Phase 1. Phone in Phase 2. Don't defer trust mechanisms.

3. **Design order state machine completely.** Include decline, cancel, timeout, dispute states from start. Not just happy path.

4. **Plan chat for reconnection.** Test: close tab, reopen. Turn off WiFi, turn on. Mobile sleep, wake. Chat must survive all.

5. **Prevent review gaming.** Verified purchase only. Double-blind submission. Review helpfulness voting.

6. **Distinguish buyer/provider modes.** Clear navigation, visual cues. "My Orders" (placed) vs. "Incoming Orders" (received). Don't mix.

7. **Calculate commissions now, collect later.** Show "Service fee: 15%" in order breakdown even during mock payments. Prevents pricing model rewrite.

8. **Validate on server, always.** Client-side validation is UX. Server-side validation is security. Never trust client.

## Ready for Roadmap

Research is complete and comprehensive. Roadmap creation can proceed with:

- **Clear technology choices:** Next.js 15, PostgreSQL, Prisma, NextAuth.js, Pusher, shadcn/ui
- **Defined feature priorities:** Table stakes vs. differentiators vs. anti-features mapped
- **Proven architecture patterns:** Server Components + Server Actions, WebSocket + DB sync, multi-tenant isolation
- **Identified pitfalls:** Cold start, trust/safety, order edge cases, chat complexity, review gaming, role switching
- **7-phase structure:** Foundation → Listings → Orders → Chat → Reviews → Dashboard → Polish
- **Realistic timeline:** 5-6 weeks for solo developer
- **Success metrics:** 10+ seed gigs before launch, >20% provider signup rate, >10 orders/week, >60% review completion

**Next steps for orchestrator:**
1. Create milestone structure based on 7 phases
2. Break each phase into concrete tasks (use FEATURES.md, ARCHITECTURE.md, PITFALLS.md as reference)
3. Assign time estimates (FEATURES.md has sizing estimates)
4. Flag Phase 4 (chat) for deeper research before implementation
5. Flag Phase 0 (seeding) as manual/strategy work, not code

---
*Research summary for: Herafi Services Marketplace*
*Researched: 2026-02-07*
*Overall Confidence: MEDIUM*
