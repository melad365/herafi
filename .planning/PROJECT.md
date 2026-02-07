# Herafi

## What This Is

Herafi is a services marketplace web app where users can offer and hire services — focused on in-person work like plumbing, painting, cleaning, carpentry, welding, and car washing, but also open to digital services. Think Fiverr, but for the trades. A single account lets you both hire and offer services.

## Core Value

Anyone can find and hire a trusted service provider for in-person or digital work through a simple, browsable marketplace with clear service listings.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Email/password authentication (single user type — buyer and provider in one)
- [ ] Gig-style service listings with description, images, and pricing tiers (Basic/Standard/Premium)
- [ ] Browse services by categories (Plumbing, Painting, Cleaning, Carpentry, Welding, Digital, etc.)
- [ ] Search services with keyword and filters
- [ ] Real-time chat messaging between users and providers
- [ ] Mock payment flow (auto-approved on user confirmation, no real payment processing)
- [ ] Order tracking (request → provider accepts → in progress → complete)
- [ ] Star ratings and written reviews after service completion
- [ ] Provider dashboard: manage gigs, view incoming orders, messages, basic analytics
- [ ] Warm, approachable UI with polished micro-interactions (hover effects, transitions)

### Out of Scope

- Location/map-based search — deferred, not needed for MVP
- Real payment processing / escrow — mock payments only for now
- OAuth / social login — email/password sufficient for MVP
- Notifications (email/push) — deferred to v2
- Admin moderation panel — deferred to v2
- Mobile app — web-first
- Video content in listings — storage/bandwidth complexity
- Dispute resolution system — no real payments yet

## Context

- Marketplace model: Fiverr-style where providers create gig listings with tiered packages
- Key differentiator: focus on in-person/trade services (underserved on platforms like Fiverr)
- Single user type simplifies auth and UX — any user can switch between hiring and offering
- UI direction: Airbnb warmth — rounded corners, warm palette, whitespace, subtle animations. Not AI-generated looking. Attention to details like button hover states, transitions, micro-interactions
- No location for MVP keeps scope manageable — providers list services without geographic constraints
- Mock payment lets us build the full order flow without payment provider integration complexity

## Constraints

- **Tech stack**: Next.js (React) — user preference
- **Scope**: MVP only — ship fast, validate, iterate
- **UI quality**: Must feel hand-crafted, not template/AI-generated. Simplicity with polish
- **Auth**: Single login system, no separate user/provider accounts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single user type (buyer + provider) | Simplifies auth, mirrors real behavior (anyone can do both) | — Pending |
| Fiverr-style gigs with tiers | Proven model, clear structure for services | — Pending |
| Mock payments for MVP | Full order flow without payment integration complexity | — Pending |
| No location in MVP | Reduces scope, can add city/region filtering in v2 | — Pending |
| Real-time chat over simple inbox | Better UX for service negotiation, user preference | — Pending |
| Email/password only | Sufficient for MVP, OAuth deferred | — Pending |

---
*Last updated: 2026-02-07 after initialization*
