# Project Research Summary

**Project:** Herafi v0.2.0 - Navigation & Mock Data
**Domain:** Service marketplace navigation components and database seeding
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

Herafi v0.2.0 focuses on two critical infrastructure pieces: navigation components (hamburger menu, user dropdown) and realistic mock data seeding. Research confirms that Next.js 15 App Router requires a strict Server/Client component boundary strategy to avoid hydration errors. The existing MobileNav pattern (Server Component Header with Client Component children) should be extended to desktop navigation and user dropdown components.

The recommended approach is minimal new dependencies: reuse existing Heroicons and Tailwind patterns for navigation, add @faker-js/faker for mock data generation, and leverage HTTP APIs (DiceBear, Lorem Picsum) for avatars and images. The critical architectural decision is keeping Header as a Server Component while extracting all interactive UI (dropdowns, toggles) into separate Client Components that receive auth state as props.

Key risks include: (1) accidentally breaking the server/client boundary by adding "use client" to Header, (2) menu state persisting after navigation without explicit close handlers, and (3) seed scripts failing on re-run due to foreign key violations or duplicate constraints. These are all preventable with proper component extraction, pathname-based useEffect hooks, and idempotent upsert patterns in seed scripts.

## Key Findings

### Recommended Stack

The research advocates for a zero-bloat approach that maximizes existing patterns. Navigation requires no new UI libraries - the current MobileNav implementation using native React state and Heroicons works perfectly and should be replicated for desktop dropdowns. Only add @faker-js/faker (9.2.0+) as a dev dependency for realistic test data generation.

**Core technologies:**
- **Heroicons 2.2.0** (existing): Icon library for hamburger/dropdown icons - already installed, React 19 compatible, zero-config
- **Native React State**: Menu toggle state management - existing MobileNav pattern works perfectly, no library needed for simple click-to-toggle menus
- **@faker-js/faker 9.2.0**: Generate realistic user data, reviews, descriptions - industry standard, TypeScript support, 70+ locales, deterministic seeding
- **DiceBear HTTP API**: Avatar images for mock users - free, deterministic (same seed = same avatar), no package installation required
- **Lorem Picsum HTTP API**: Service/gig images - free Unsplash images, deterministic with seed, no API key required
- **tsx 4.21.0** (existing): TypeScript execution for seed scripts - already installed for dev server, run seed scripts with full TypeScript support
- **Prisma Client 7.3.0** (existing): Seed data insertion - use createMany() with skipDuplicates or upsert for idempotency

**Alternatives rejected:**
- shadcn/ui dropdown: Requires CLI setup, adds 50+ files for simple menus, Radix dependency bloat - overkill for basic click-toggle patterns
- react-burger-menu: Outdated (last update 2021), not React 19 compatible - use native state instead
- Headless UI: Could be used for accessible dropdowns with keyboard navigation, but research shows native implementation with proper ARIA is sufficient

### Expected Features

Navigation components and mock data must meet baseline marketplace expectations while avoiding over-engineering.

**Must have (table stakes):**
- **Hamburger menu items**: Browse/Search services, Category browsing, Dashboard link (authenticated), Messages/Inbox, Orders/Purchases, My Gigs (providers), Help/FAQ
- **User account dropdown items**: Profile link, Account Settings, Switch to Selling/Buying mode, Sign Out, Visual user avatar, Username/email display
- **Mock data realism**: Complete profiles (all schema fields populated), Realistic names (Faker.js locale-aware), Professional avatars (DiceBear), Diverse representation (mix demographics), Category distribution (10-15 providers across 13 categories), Rating variance (3.5-5.0 range), Review content quality (varied length), Multiple gigs per provider (1-3 each), Portfolio images (realistic work photos), Experience range (1-15 years)

**Should have (competitive):**
- **Navigation enhancements**: Active route highlighting (already exists in mobile nav), Icon + label menu items, Grouped menu sections (Browse/Account/Provider), Breadcrumb trail for context
- **Mock data quality**: Location/city diversity (US cities using Faker), Service-specific details (HVAC mentions brands, painter mentions techniques), Realistic pricing tiers (actual market rates), Timestamp realism (orders/reviews spread over months), Connected data stories (reviews reference specific gigs)

**Defer (v2+):**
- Notification badges (requires real-time infrastructure with polling/websocket)
- Persistent bottom nav on mobile (hybrid approach, not critical for desktop-first)
- Service-specific detail templates (diminishing returns on realism, requires deep domain knowledge per category)

### Architecture Approach

Next.js 15 App Router requires strict separation between server-side data fetching and client-side interactivity. The pattern is: Server Component (Header) fetches session and user.isProvider via Prisma, passes as props to Client Components (MobileNav, UserDropdown) that handle interactive state. This preserves SSR benefits while keeping client bundle minimal.

**Major components:**
1. **Header (Server Component)** - Fetches session via `await auth()`, queries database for `isProvider` status, renders static nav links, passes serializable props to client components
2. **MobileNav (Client Component)** - Already exists, uses useState for hamburger toggle, receives props (isLoggedIn, isProvider, username), needs pathname effect to auto-close on navigation
3. **UserDropdown (Client Component)** - NEW component for avatar click dropdown, uses Headless UI Menu or native implementation with click-outside detection, receives user object and isProvider flag as props
4. **Seed Script (prisma/seed.ts)** - TypeScript file using upsert for idempotency, creates users → gigs → orders → reviews in dependency order, generates realistic data with @faker-js/faker, configured in prisma.config.ts

**Data flow:**
- Session-aware navigation: Session fetched server-side → passed to client components as props → client components render conditionally based on auth state
- Seed execution: Runs independently via `npx prisma db seed` → connects to DATABASE_URL from .env → upserts users → creates gigs referencing user IDs → generates reviews tied to orders → disconnects

### Critical Pitfalls

Research identified 10 major pitfalls specific to this domain. The top 5 most dangerous:

1. **Server/Client Component Boundary Violations** - Adding `"use client"` to Header breaks server-side data fetching. Solution: Keep Header as Server Component, extract interactive menus (MobileNav, UserDropdown) into separate client components, pass session data as props.

2. **Menu State Not Closing on Navigation** - Hamburger menu remains open when users click links because Next.js preserves client state across route transitions. Solution: Add `onClick={closeMenu}` to every Link inside menu, or use `usePathname()` + `useEffect` to auto-close on route change.

3. **Auth Session Stale in User Dropdown** - JWT session shows outdated data after profile updates (user becomes provider, but dropdown doesn't reflect it). Solution: Call `revalidatePath('/')` after critical updates, or include isProvider in JWT via Auth.js session callback instead of separate Prisma query.

4. **Hydration Mismatch from Responsive Menu Rendering** - Server renders one version, client renders another based on viewport, causing "Text content does not match server-rendered HTML" error. Solution: Use CSS-only responsive hiding (`hidden md:flex`) instead of JavaScript viewport checks during render.

5. **Seed Data with Orphaned Foreign Key References** - Deleting tables in wrong order or creating child records before parents causes "Foreign key constraint failed" errors. Solution: Clear tables in reverse dependency order (reviews → orders → gigs → users), capture created IDs for relations, verify schema has explicit `onDelete: Cascade` directives.

## Implications for Roadmap

Based on component dependencies and pitfall prevention, suggested phase structure:

### Phase 1: Navigation Components (2-3 hours)
**Rationale:** Navigation is independent, can be built and tested immediately. MobileNav already exists, so this phase extends existing patterns rather than introducing new architecture. Critical to establish correct server/client boundary from the start to avoid hydration issues.

**Delivers:**
- Desktop hamburger menu component (reuse MobileNav pattern)
- User account dropdown component on avatar click
- Grouped menu sections (Browse / Account / Provider)
- Conditional rendering based on auth + provider status
- Auto-close on navigation with pathname effect

**Addresses features:**
- Hamburger menu items (Browse, Categories, Dashboard, Messages, Orders, My Gigs, Help)
- User account dropdown items (Profile, Settings, Switch mode, Sign Out)
- Active route highlighting (already exists in mobile nav)
- Icon + label menu items for clarity

**Avoids pitfalls:**
- Pitfall 1: Server/Client boundary violations - keep Header as Server Component
- Pitfall 2: Menu state persistence - add pathname effect for auto-close
- Pitfall 4: Hydration mismatch - use CSS-only responsive hiding
- Pitfall 7: Missing keyboard navigation - implement ARIA from start (or use Headless UI)
- Pitfall 9: Missing click-outside handler - add useEffect listener immediately

**Research flags:** Standard patterns, well-documented. Skip /gsd:research-phase.

### Phase 2: Mock Data Infrastructure (1-2 hours)
**Rationale:** Seed script foundation must be established before generating data. Installing Faker.js and configuring Prisma v7 seed command enables all subsequent data generation. This phase focuses on idempotent script structure and proper cleanup order.

**Delivers:**
- Install @faker-js/faker as dev dependency
- Update prisma.config.ts with seed command
- Create prisma/seed.ts structure
- Implement proper table cleanup order (reviews → orders → gigs → users)
- Configure deterministic seeding with faker.seed() for reproducibility

**Uses:**
- @faker-js/faker for realistic data generation
- tsx for TypeScript execution in seed script
- Prisma upsert for idempotent inserts

**Implements:**
- Seed script architecture pattern from ARCHITECTURE.md
- Idempotent upsert pattern to avoid duplicate key errors

**Avoids pitfalls:**
- Pitfall 5: Orphaned foreign key references - cleanup in reverse dependency order
- Pitfall 8: Seed script breaking on duplicate keys - use upsert with where clauses

**Research flags:** Standard Prisma seeding pattern. Skip /gsd:research-phase.

### Phase 3: Mock Data Generation (3-4 hours)
**Rationale:** With seed infrastructure ready, generate realistic providers, gigs, orders, and reviews. Order matters: users first (parents), then gigs (children), then orders (grandchildren), then reviews (depend on orders). This phase delivers browsable marketplace data for development and demos.

**Delivers:**
- 10-15 complete provider profiles (all User schema fields populated)
- Realistic names, emails, bios using Faker.js with locale awareness
- DiceBear avatar URLs (deterministic with email seed)
- 1-3 gigs per provider across all 13 categories
- Lorem Picsum image URLs for gig portfolio images
- Realistic pricing tiers per category
- 3-8 reviews per provider with rating variance (3.5-5.0 range)
- Update provider averageRating and totalReviews aggregates

**Addresses features:**
- Complete profiles (table stakes)
- Realistic names, avatars, diversity (table stakes)
- Category distribution (table stakes)
- Rating variance and quality reviews (table stakes)
- Multiple gigs per provider (table stakes)
- Portfolio images (table stakes)
- Location/city diversity (differentiator)
- Realistic pricing tiers (differentiator)
- Timestamp realism (differentiator)

**Avoids pitfalls:**
- Pitfall 6: Unrealistic mock data that breaks UI assumptions - vary field lengths, test edge cases
- Pitfall 10: Seed data not representing realistic relationships - model user segments (browsers, buyers, new providers, active providers, top providers)

**Research flags:** Straightforward data generation. Skip /gsd:research-phase unless specific category pricing research needed.

### Phase Ordering Rationale

- **Navigation first** because it's independent of seed data and extends existing patterns (MobileNav). Establishing correct server/client boundary early prevents architectural debt.
- **Seed infrastructure before data generation** because Faker.js installation and Prisma config must precede data creation. Proper cleanup order prevents cascading failures.
- **Sequential phases** because each builds on the previous: navigation uses existing auth state, seed infrastructure enables data generation, data generation populates database for browsing through new navigation.

This ordering minimizes dependencies, allows early visual progress (navigation), and defers complex data modeling until infrastructure is solid.

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Navigation):** Well-documented Next.js Server/Client Component patterns, existing MobileNav reference, abundant dropdown/hamburger menu resources
- **Phase 2 (Seed Infrastructure):** Official Prisma seeding docs, established upsert patterns, straightforward TypeScript configuration
- **Phase 3 (Mock Data):** Faker.js well-documented, HTTP APIs for images are simple GET requests, no novel integration needed

**Phases NOT needing deeper research:**
- All three phases use established patterns with high-quality official documentation
- Existing codebase provides working examples (MobileNav, Auth.js integration)
- No complex integrations, niche domains, or novel architecture

If category-specific pricing research becomes a bottleneck in Phase 3 (e.g., "What's realistic pricing for HVAC in Moroccan market?"), consider quick ad-hoc research, but this is a data problem, not an architectural one.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing dependencies work (Heroicons, tsx, Prisma). @faker-js/faker is industry standard. HTTP APIs (DiceBear, Lorem Picsum) are free and well-documented. Verified compatibility with React 19 and Next.js 15. |
| Features | HIGH | Navigation patterns well-documented across marketplace and e-commerce research. Mock data requirements clear from multiple seeding best practices sources. Table stakes vs differentiators backed by UX research. |
| Architecture | HIGH | Official Next.js docs on Server/Client Components provide clear guidance. Existing MobileNav demonstrates working pattern. Prisma v7 seeding configuration documented in official sources. |
| Pitfalls | HIGH | All 10 pitfalls backed by authoritative sources (official Next.js docs, Auth.js discussions, Prisma docs, accessibility guidelines). Multiple sources confirm each pitfall pattern. |

**Overall confidence:** HIGH

All recommendations are backed by official documentation, verified compatibility with current stack, and validated against existing codebase patterns. No speculative or unproven approaches.

### Gaps to Address

Minor gaps that need attention during implementation:

- **Locale for Faker.js:** Research used general examples. Herafi targets Moroccan market, so consider mixing `faker/locale/ar` (Arabic) with `faker/locale/en` for realistic diversity. Test which locale distribution feels authentic for platform.

- **Category-specific pricing:** Research identified "realistic pricing tiers per category" as differentiator but didn't provide specific MAD (Moroccan Dirham) rates for each of 13 categories. During Phase 3 seeding, use placeholder ranges (e.g., 50-500 MAD) or conduct quick market research for top 5 categories.

- **Headless UI vs native dropdown:** Research suggests Headless UI Menu component for accessibility but also notes native implementation is sufficient with proper ARIA. During Phase 1, decide based on team preference: Headless UI (automatic accessibility, 50KB bundle increase) vs native (manual ARIA, zero dependencies).

- **Session callback vs separate query:** Pitfall 3 notes two approaches for isProvider state: include in JWT via Auth.js session callback (faster, but requires JWT regeneration on update) or separate Prisma query on each Header render (slower, always fresh). Current architecture uses separate query. Consider refactoring to session callback if performance becomes issue.

None of these gaps block implementation. All have reasonable defaults and can be refined during execution.

## Sources

### Primary (HIGH confidence)
- Next.js 15 Official Documentation - Server/Client Components, App Router patterns
- Prisma 7 Official Documentation - Seeding, upsert, foreign key constraints
- Auth.js v5 Documentation - Session management, JWT callbacks
- @faker-js/faker Official Documentation - Data generation, locale support
- Heroicons Official Documentation - React component usage
- Headless UI Official Documentation - Accessible dropdown menus
- DiceBear Official API Documentation - Avatar generation with seed parameter
- Lorem Picsum Official Documentation - Placeholder image service

### Secondary (MEDIUM confidence)
- Baymard Institute - E-commerce navigation UX best practices (2025)
- Smashing Magazine - Building accessible menu systems
- MDN Web Docs - ARIA menu role and keyboard navigation patterns
- Multiple Next.js community articles on hydration errors (2026)
- Cloud Active Labs - Prisma seeding best practices for test environments
- TestMu AI - Faker.js complete guide with realistic data patterns
- UXPin Studio - Mobile navigation patterns pros and cons
- Eleken Design - Dropdown menu UI best practices with real-world examples

### Tertiary (LOW confidence, needs validation)
- Marketplace-specific navigation patterns inferred from general e-commerce research (Fiverr/Upwork references limited)
- Moroccan market pricing assumptions (not researched in detail, use placeholders)
- Optimal number of seed records (10-15) based on general recommendations, not Herafi-specific testing

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
