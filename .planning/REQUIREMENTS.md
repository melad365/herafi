# Requirements: Herafi v0.2.0

**Defined:** 2026-02-22
**Core Value:** Anyone can find and hire a trusted service provider for in-person or digital work through a simple, browsable marketplace with clear service listings.

## v0.2.0 Requirements

Requirements for navigation improvements and mock data seeding.

### Navigation

- [ ] **NAV-01**: Hamburger menu component displays next to logo on desktop
- [ ] **NAV-02**: Hamburger menu contains grouped sections (Browse / Account / Provider)
- [ ] **NAV-03**: Hamburger menu includes Browse Services, Categories, Dashboard, Messages, Orders, My Gigs, Help links
- [ ] **NAV-04**: Hamburger menu auto-closes when user navigates to a new page
- [ ] **NAV-05**: User dropdown menu appears when clicking avatar in header
- [ ] **NAV-06**: User dropdown displays username/email and avatar
- [ ] **NAV-07**: User dropdown includes Profile, Settings, and Sign Out links
- [ ] **NAV-08**: User dropdown includes provider mode indicator for users with isProvider=true
- [ ] **NAV-09**: User dropdown closes when clicking outside the menu
- [ ] **NAV-10**: Navigation components maintain Server/Client boundary (Header stays Server Component)
- [ ] **NAV-11**: Menu items render conditionally based on authentication state
- [ ] **NAV-12**: Keyboard navigation support (Tab, Enter, Escape) for accessibility

### Mock Data Infrastructure

- [ ] **SEED-01**: Install @faker-js/faker as dev dependency
- [ ] **SEED-02**: Configure Prisma seed command in prisma.config.ts
- [ ] **SEED-03**: Create prisma/seed.ts with TypeScript support
- [ ] **SEED-04**: Implement idempotent upsert pattern for all seed data
- [ ] **SEED-05**: Implement proper cleanup order (reviews → orders → gigs → users)
- [ ] **SEED-06**: Configure deterministic seeding with faker.seed() for reproducibility

### Mock Data Content

- [ ] **SEED-07**: Generate 10-15 complete provider profiles with all User schema fields
- [ ] **SEED-08**: Use realistic names from Faker.js with locale awareness
- [ ] **SEED-09**: Generate deterministic avatar URLs using DiceBear API
- [ ] **SEED-10**: Distribute providers across all 13 service categories
- [ ] **SEED-11**: Include diverse representation in provider demographics
- [ ] **SEED-12**: Generate 1-3 gigs per provider with category-appropriate content
- [ ] **SEED-13**: Use realistic pricing tiers (Basic/Standard/Premium) per category
- [ ] **SEED-14**: Add portfolio images using Lorem Picsum API
- [ ] **SEED-15**: Create completed orders as foundation for reviews
- [ ] **SEED-16**: Generate 3-8 reviews per provider with varied content
- [ ] **SEED-17**: Implement rating variance (3.5-5.0 range, bell curve distribution)
- [ ] **SEED-18**: Vary review length and writing style for realism
- [ ] **SEED-19**: Spread timestamps across realistic time periods
- [ ] **SEED-20**: Update provider averageRating and totalReviews aggregates

## Future Requirements

Deferred to later milestones.

### Production Readiness
- Real payment integration (Stripe Connect)
- Cloud storage migration (S3, Cloudinary)
- Email notifications for critical events
- Production deployment infrastructure

### Feature Enhancements
- Location-based search and filtering
- Provider portfolios with work samples
- Availability calendar for scheduling
- Advanced search filters
- Favorites/saved providers
- Skill verification badges

## Out of Scope

Explicitly excluded from v0.2.0.

| Feature | Reason |
|---------|--------|
| Notification badges in navigation | Requires real-time infrastructure (polling/websockets) |
| Persistent bottom navigation bar | Not critical for desktop-first focus |
| Service-specific detail templates | Diminishing returns on realism, requires deep domain expertise |
| Real user recruitment | Mock data sufficient for development/demo purposes |
| Mega-menus or multi-level navigation | Over-engineering for current feature set |

## Traceability

Which phases cover which requirements. To be populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| NAV-03 | TBD | Pending |
| NAV-04 | TBD | Pending |
| NAV-05 | TBD | Pending |
| NAV-06 | TBD | Pending |
| NAV-07 | TBD | Pending |
| NAV-08 | TBD | Pending |
| NAV-09 | TBD | Pending |
| NAV-10 | TBD | Pending |
| NAV-11 | TBD | Pending |
| NAV-12 | TBD | Pending |
| SEED-01 | TBD | Pending |
| SEED-02 | TBD | Pending |
| SEED-03 | TBD | Pending |
| SEED-04 | TBD | Pending |
| SEED-05 | TBD | Pending |
| SEED-06 | TBD | Pending |
| SEED-07 | TBD | Pending |
| SEED-08 | TBD | Pending |
| SEED-09 | TBD | Pending |
| SEED-10 | TBD | Pending |
| SEED-11 | TBD | Pending |
| SEED-12 | TBD | Pending |
| SEED-13 | TBD | Pending |
| SEED-14 | TBD | Pending |
| SEED-15 | TBD | Pending |
| SEED-16 | TBD | Pending |
| SEED-17 | TBD | Pending |
| SEED-18 | TBD | Pending |
| SEED-19 | TBD | Pending |
| SEED-20 | TBD | Pending |

**Coverage:**
- v0.2.0 requirements: 32 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 32 ⚠️

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after initial definition*
