# Requirements: Herafi

**Defined:** 2026-02-07
**Core Value:** Anyone can find and hire a trusted service provider for in-person or digital work through a simple, browsable marketplace with clear service listings.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in with email and password
- [x] **AUTH-03**: User session persists across browser refresh

### Profiles

- [x] **PROF-01**: User can set display name, avatar, and bio
- [x] **PROF-02**: User profile shows services offered and aggregate rating (provider view)
- [x] **PROF-03**: User can upload portfolio/work sample images

### Service Listings

- [x] **GIG-01**: Provider can create a gig with title, description, and category
- [x] **GIG-02**: Provider can set pricing tiers (Basic/Standard/Premium) per gig
- [x] **GIG-03**: Provider can edit and delete their gigs
- [x] **GIG-04**: Gig detail page shows full description, images, tiers, provider info, and reviews

### Search & Discovery

- [x] **DISC-01**: User can browse services by category (Plumbing, Painting, Cleaning, Carpentry, Welding, Digital, etc.)
- [x] **DISC-02**: User can search services by keyword
- [x] **DISC-03**: User can filter results by price range and rating

### Orders & Payments

- [ ] **ORD-01**: User can place an order by selecting a gig tier
- [ ] **ORD-02**: Mock payment flow auto-approves on user confirmation

### Messaging

- [ ] **MSG-01**: User can send and receive real-time chat messages with another user

### Reviews

- [ ] **REV-01**: User can leave a star rating and written review

### Provider Dashboard

- [ ] **DASH-01**: Provider can manage their gigs from a dashboard
- [ ] **DASH-02**: Provider can view incoming orders
- [ ] **DASH-03**: Provider can access their message conversations

### UI & Design

- [ ] **UI-01**: Warm, approachable design with polished micro-interactions (hover effects, transitions)
- [ ] **UI-02**: Responsive layout that works on mobile and desktop

## v2 Requirements

### Authentication Enhancements

- **AUTH-04**: User can reset password via email link
- **AUTH-05**: User receives email verification after signup
- **AUTH-06**: OAuth login (Google)

### Profile Enhancements

- **PROF-04**: Response time metrics displayed on profile
- **PROF-05**: Skill verification badges (email, phone, ID)

### Service Listing Enhancements

- **GIG-05**: Gig draft/publish states (save before publishing)
- **GIG-06**: Provider can pause/resume gig visibility
- **GIG-07**: Image uploads on gig listings

### Discovery Enhancements

- **DISC-04**: Saved searches / favorites
- **DISC-05**: Advanced filters (delivery time, verified status)
- **DISC-06**: "Popular" and "Recently viewed" sections

### Order Enhancements

- **ORD-03**: Full order state machine (accept, decline, cancel with reasons)
- **ORD-04**: Order history with status tracking
- **ORD-05**: Commission calculations displayed (not collected)

### Messaging Enhancements

- **MSG-02**: Conversation list view
- **MSG-03**: Message persistence (visible on reload)
- **MSG-04**: Read receipts
- **MSG-05**: File attachments

### Review Enhancements

- **REV-02**: Reviews only after completed order (verified purchase)
- **REV-03**: Reviews displayed on profile and gig pages
- **REV-04**: Double-blind review submission

### Dashboard Enhancements

- **DASH-04**: Basic analytics (views, orders, earnings)

### Notifications

- **NOTF-01**: In-app notifications for new messages
- **NOTF-02**: In-app notifications for order status changes
- **NOTF-03**: Email notifications for critical events

### Moderation

- **MOD-01**: User can report content
- **MOD-02**: Admin panel for reviewing reports

## Out of Scope

| Feature | Reason |
|---------|--------|
| Location/map-based search | Deferred — not needed for MVP, adds significant complexity |
| Real payment processing / escrow | Mock payments only — validate demand before Stripe complexity |
| Mobile native app | Web-first — responsive design sufficient for MVP |
| Video content in listings | Storage/bandwidth costs — defer to v2+ |
| Dispute resolution system | No real payments — no disputes to resolve yet |
| Multi-language support | Single market first |
| Background checks for providers | Regulatory complexity — defer to v2+ |
| Service subscriptions (recurring bookings) | Different business model — defer |
| API for third-party integrations | No ecosystem yet |
| Bidding/auction system | Race-to-bottom pricing — use fixed tiers instead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| PROF-01 | Phase 2 | Complete |
| PROF-02 | Phase 2 | Complete |
| PROF-03 | Phase 2 | Complete |
| GIG-01 | Phase 3 | Complete |
| GIG-02 | Phase 3 | Complete |
| GIG-03 | Phase 3 | Complete |
| GIG-04 | Phase 3 | Complete |
| DISC-01 | Phase 3 | Complete |
| DISC-02 | Phase 3 | Complete |
| DISC-03 | Phase 3 | Complete |
| ORD-01 | Phase 4 | Pending |
| ORD-02 | Phase 4 | Pending |
| MSG-01 | Phase 5 | Pending |
| REV-01 | Phase 6 | Pending |
| DASH-01 | Phase 7 | Pending |
| DASH-02 | Phase 7 | Pending |
| DASH-03 | Phase 7 | Pending |
| UI-01 | Phase 8 | Pending |
| UI-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-02-07*
*Last updated: 2026-02-09 — Phase 3 requirements complete (DISC-03 rating filter deferred to Phase 6)*
