# Feature Landscape: Navigation & Mock Data

**Domain:** Service marketplace navigation and mock data seeding
**Researched:** 2026-02-22

## Table Stakes

Features users expect in marketplace navigation and mock data. Missing = product feels incomplete or unprofessional.

### Navigation Menu Items (Hamburger)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Browse/Search services | Primary action in marketplace | Low | Already exists at `/gigs` |
| Category browsing | Standard marketplace navigation | Low | Categories already in schema |
| Dashboard link (authenticated) | Users expect access to their activity | Low | Already exists |
| Messages/Inbox | Essential for service negotiation | Low | Already exists |
| Orders/Purchases | Buyers need order tracking | Low | Need to add to menu |
| My Gigs (providers) | Providers manage their offerings | Low | Need provider-specific section |
| Help/FAQ | Expected support access | Medium | New page needed |

### User Account Dropdown Items

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Profile link | Users manage their identity | Low | Need profile page route |
| Account Settings | Change email/password/preferences | Medium | Settings page needed |
| Switch to Selling/Buying mode | Marketplace duality (Herafi's unique feature) | Low | Toggle provider status |
| Sign Out | Universal authentication expectation | Low | Already exists in mobile nav |
| Visual user avatar | Shows authentication state | Low | Avatar circle already rendered |
| Username/email display | Confirms which account is active | Low | Currently shows username |

### Mock Data Realism

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Complete profiles | Incomplete data looks broken | Medium | All schema fields populated |
| Realistic names | Generic "User 1" destroys trust | Low | Use Faker.js locale-aware names |
| Professional avatars | Missing images = low quality perception | Low | Use Pravatar.cc or UI Faces |
| Diverse representation | Homogeneous data feels artificial | Medium | Mix genders, backgrounds, locations |
| Category distribution | All categories should have providers | Low | 10-15 providers across 13 categories |
| Rating variance | All 5-star reviews = fake | Low | 3.5-5.0 range with bell curve |
| Review content quality | Generic reviews undermine trust | Medium | Varied length, specific details |
| Multiple gigs per provider | Real providers offer multiple services | Low | 1-3 gigs per provider |
| Portfolio images | Trade services need visual proof | Medium | Realistic work photos per category |
| Skills and certifications | Professional credibility markers | Low | Category-appropriate skills |
| Experience range | Mix of new and established providers | Low | 1-15 years range |

## Differentiators

Features that elevate UX beyond standard patterns. Not expected, but valued.

### Navigation Enhancements

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Active route highlighting | Clear wayfinding | Low | Mobile nav already does this |
| Icon + label menu items | Faster scanning and recognition | Low | Heroicons available |
| Grouped menu sections | Logical organization (Browse / Account / Provider) | Low | Separator dividers |
| Notification badges | Message/order count visibility | Medium | Deferred - requires polling/websocket |
| Persistent bottom nav on mobile | Faster access than hamburger | Medium | Hybrid approach per research |
| Breadcrumb trail | Context in deep navigation | Low | Especially for multi-page flows |
| User role badge | Show "Provider" status visually | Low | Small badge on avatar |

### Mock Data Quality

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Location/city diversity | Realistic geographic distribution | Low | Mix of US cities using Faker |
| Seasonal/cultural names | Feels current and representative | Low | Faker supports 70+ locales |
| Service-specific details | HVAC provider mentions brands, painter mentions techniques | High | Category templates with variables |
| Realistic pricing tiers | Actual market rates per category | Medium | Research typical trade pricing |
| Timestamp realism | Orders/reviews spread over months | Low | Date generation with variance |
| Connected data stories | Provider's reviews reference their gigs specifically | Medium | Relational seed logic |
| Bio personality variation | Some formal, some casual, matches provider persona | Medium | Multiple bio templates |
| Response time variance | Some providers fast responders, others slower | Low | Metadata for future features |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

### Navigation Anti-Patterns

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Mega-menus on hover | Touch devices can't hover, accidental triggers | Simple click-to-expand for categories |
| Non-clickable category headers | Frustrating UX, users expect headers to work | Make all navigation items actionable |
| Infinite nested menus | Cognitive overload, disorienting | Max 2 levels deep |
| Auto-close on any click | Annoying when exploring options | Only close on route navigation or explicit X |
| Hidden "More" menu overflow | Creates mystery meat navigation | Prioritize ruthlessly, show top 7 items |
| Inconsistent mobile/desktop patterns | Users learn one, get confused by other | Keep mental model consistent |
| Profile settings in hamburger | Conflates app nav with account management | Separate account dropdown for settings |

### Mock Data Anti-Patterns

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| All perfect 5.0 ratings | Obvious fake data, destroys trust | 3.5-5.0 distribution, most 4.0-4.5 |
| Generic "Lorem ipsum" content | Looks lazy, users ignore it | Brief but category-relevant text |
| Cartoon/AI-generated faces | Uncanny valley, unprofessional | Real photo avatars (AI-generated people via Faker or stock) |
| Same review templates repeated | Pattern recognition breaks immersion | 10+ unique review templates per category |
| Unrealistic provider names | "John Doe" and "Jane Smith" everywhere | Faker.js with multiple locales |
| Missing critical fields | Null bios, no images = broken experience | 100% field coverage for demo providers |
| Too much data (100+ providers) | Slows development, seed takes forever | 10-15 high-quality providers sufficient |
| Hardcoded seed IDs | Brittle, breaks on re-seed | Use upsert with email/slug as identifier |
| One provider per category | Feels empty, no choice | 1-2 providers per major category |
| Reviews without purchase proof | Fake review smell | Every review tied to completed order |

## Feature Dependencies

```
Navigation Flow:
├── Hamburger Menu
│   ├── Requires: Auth state check
│   ├── Displays: Conditional items based on isProvider
│   └── Groups: Browse / User / Provider sections
│
└── User Account Dropdown
    ├── Requires: User session
    ├── Displays: Avatar + username
    └── Contains: Profile / Settings / Sign Out

Mock Data Flow:
├── User/Provider Seeding
│   ├── Creates: 10-15 users with isProvider=true
│   ├── Generates: Full profile fields + provider fields
│   └── Includes: Avatars, bios, skills, certifications
│
├── Gig Seeding (depends on providers)
│   ├── Creates: 1-3 gigs per provider
│   ├── Distributes: Across all 13 categories
│   └── Includes: Realistic pricing, images, descriptions
│
└── Review Seeding (depends on gigs + users)
    ├── Creates: Orders first (COMPLETED status)
    ├── Generates: 3-8 reviews per provider
    └── Updates: Provider averageRating + totalReviews
```

## MVP Recommendation

For v0.2.0, prioritize:

### Navigation (High Priority)
1. **Hamburger menu** - Comprehensive app navigation with grouped sections
2. **User account dropdown** - Profile, settings, sign out on avatar click
3. **Active route highlighting** - Visual feedback (already in mobile nav)
4. **Icon + label items** - Clarity and scannability

### Mock Data (High Priority)
1. **10-15 complete providers** - All schema fields populated
2. **Realistic names and avatars** - Faker.js + Pravatar.cc/UI Faces
3. **Category distribution** - Cover all 13 categories
4. **Rating variance** - 3.5-5.0 range, realistic distribution
5. **Quality reviews** - Category-specific, varied length
6. **Portfolio images** - At least 1-2 per provider

Defer to post-v0.2.0:
- **Notification badges** - Requires real-time infrastructure
- **Bottom nav bar** - Mobile enhancement, not critical for desktop-first
- **Connected data stories** - Nice-to-have, complex seeding logic
- **Service-specific detail templates** - Diminishing returns on realism

## Complexity Notes

**Low complexity:**
- Menu structure changes (adding items, grouping)
- Basic Faker.js data generation (names, emails, dates)
- Avatar placeholder services (simple URLs)
- Rating distribution logic

**Medium complexity:**
- User account dropdown component (click outside to close, positioning)
- Category-specific review templates
- Realistic pricing research per trade
- Portfolio image sourcing (need category-appropriate stock photos)
- Seed script with relational data (users → gigs → orders → reviews)

**High complexity:**
- Service-specific detail generation (requires domain knowledge per category)
- Notification badge system (requires unread message/order counts)
- Connected data narratives (review mentions gig details)

## Implementation Sequence

Recommended order for v0.2.0:

**Wave 1: Navigation Structure**
1. Create hamburger menu component (desktop)
2. Add grouped menu sections (Browse / Account / Provider)
3. Create user account dropdown component
4. Add conditional rendering based on auth + provider status

**Wave 2: Mock Data Foundation**
1. Install Faker.js (`npm install @faker-js/faker`)
2. Create seed script structure (`prisma/seed.ts`)
3. Generate 10-15 user profiles with complete fields
4. Add realistic avatars (Pravatar.cc URLs or Faker image module)

**Wave 3: Mock Data Enrichment**
1. Create 1-3 gigs per provider across categories
2. Generate realistic pricing tiers per category
3. Create completed orders (for review basis)
4. Generate 3-8 reviews per provider with variance
5. Update provider aggregate ratings

## Authentication State Patterns

Research shows marketplaces handle navigation in three states:

### Unauthenticated Users
**Show:**
- Browse/Search (primary action)
- Categories
- How It Works / Help
- Log In / Sign Up (prominent)

**Hide:**
- Dashboard
- Messages
- Orders
- Provider tools

### Authenticated Buyers
**Show:**
- Browse/Search
- Dashboard (orders, saved gigs)
- Messages
- User account dropdown
- "Become a Seller" toggle

**Hide:**
- Provider Dashboard
- My Gigs

### Authenticated Providers (Herafi's hybrid model)
**Show:**
- All buyer features +
- Provider Dashboard
- My Gigs
- Switch to Buying Mode (contextual)

**Note:** Herafi's single-account model simplifies this - users don't create separate accounts, they toggle provider status. Navigation should reflect this duality gracefully.

## Menu Organization Best Practices

Based on research, successful marketplace navigation follows this pattern:

### Hamburger Menu Sections (Mobile + Desktop)

**Section 1: Core Discovery** (always visible)
- Browse All Services
- Categories (expandable or direct link)
- Search (or search bar separate)

**Section 2: User Actions** (authenticated only)
- Dashboard
- My Orders
- Messages
- Saved Gigs (future)

**Section 3: Provider Tools** (isProvider=true only)
- Provider Dashboard
- My Gigs
- Earnings (future)

**Section 4: Account & Help** (always visible)
- Help / FAQ
- About (if exists)
- Settings (authenticated only)

### User Account Dropdown (Desktop, Avatar Click)

**Top section:**
- Username + email
- Avatar image
- Role badge ("Provider" if applicable)

**Middle section:**
- View Profile
- Account Settings
- Switch to Selling / Switch to Buying (toggle)

**Bottom section:**
- Help Center
- Sign Out (danger styling - red text)

## Sources

### Navigation Patterns
- [Mobile Navigation Patterns That Work in 2026 – Phone Simulator](https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026)
- [Dropdown Menu UI: Best Practices and Real-World Examples](https://www.eleken.co/blog-posts/dropdown-menu-ui)
- [Mobile Navigation Patterns: Pros and Cons | UXPin](https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/)
- [The Future of Mobile Navigation: Hamburger Menus vs. Tab Bars - Acclaim](https://acclaim.agency/blog/the-future-of-mobile-navigation-hamburger-menus-vs-tab-bars)
- [What Good Marketplace UX Design Looks Like: A Feature-by-Feature Guide | Rigby Blog](https://www.rigbyjs.com/blog/marketplace-ux)

### E-commerce Navigation Best Practices
- [Homepage & Navigation UX Best Practices 2025 – Baymard](https://baymard.com/blog/ecommerce-navigation-best-practice)
- [eCommerce Navigation UX: Best Practices in 2024 | Onilab Blog](https://onilab.com/blog/ecommerce-navigation-ux)
- [An E-Commerce Study: Guidelines For Better Navigation And Categories — Smashing Magazine](https://www.smashingmagazine.com/2013/11/guidelines-navigation-categories-ecommerce-study/)

### Mock Data Seeding
- [Faker.js Official Documentation](https://fakerjs.dev/)
- [What is Data Seeding? How It Works, Methods, and Best Practices | Salesforce](https://www.salesforce.com/platform/data-seeding/)
- [Seeding test databases in 2021 - best practices - Synth](https://getsynth.com/docs/blog/2021/08/31/seeding-databases-tutorial)

### Avatar Services
- [Pravatar - CC0 Avatar Placeholder](https://pravatar.cc/)
- [UI Faces | Free AI-Generated Avatars for Design Mockups](https://uifaces.co/)
- [Free Random Avatar Generator | TestingBot](https://testingbot.com/free-online-tools/free-avatar-generator)

### User Account Menus
- [Managing your account settings – Fiverr Help Center](https://help.fiverr.com/hc/en-us/articles/360011329498-Managing-your-account-settings)
- [Upwork vs. Fiverr: A 2026 In-Depth Comparison - Upwork](https://www.upwork.com/resources/upwork-vs-fiverr)

---

**Research confidence:** MEDIUM-HIGH
- Navigation patterns: HIGH (well-documented standards, verified with authoritative sources)
- Mock data strategy: HIGH (Faker.js is authoritative, seeding best practices well-established)
- Marketplace-specific patterns: MEDIUM (inferred from general e-commerce + limited marketplace-specific sources)
- Herafi-specific recommendations: MEDIUM (applying general patterns to unique single-account model)
