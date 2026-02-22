# Stack Research

**Domain:** Navigation components and mock data seeding for Next.js 15 marketplace
**Researched:** 2026-02-22
**Confidence:** HIGH

## Recommended Stack

### Navigation Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Heroicons | 2.2.0 (current) | Icon library for hamburger/dropdown icons | Already installed, used in existing MobileNav, React 19 compatible, zero-config |
| Native React State | Built-in | Menu toggle state management | Existing MobileNav pattern works perfectly, no library needed |
| Tailwind CSS | 3.4.1 (current) | Styling dropdown/hamburger menus | Already configured with burgundy design system, utility-first approach matches existing patterns |

### Mock Data Generation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @faker-js/faker | ^9.2.0 | Generate realistic user data, reviews, descriptions | Industry standard for test data, TypeScript support, 70+ locales, deterministic seeding |
| DiceBear API | HTTP API (no install) | Avatar images for mock users | Free, deterministic (same seed = same avatar), SVG/PNG support, no attribution required |
| Lorem Picsum API | HTTP API (no install) | Service/gig images from Unsplash | Free Unsplash images, deterministic with seed, no API key required |

### Database Seeding

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| tsx | 4.21.0 (current) | TypeScript execution for seed scripts | Already installed for dev server, run seed scripts with full TypeScript support |
| Prisma Client | 7.3.0 (current) | Seed data insertion | Use createMany() with skipDuplicates for batch operations |

## Installation

```bash
# Mock data generation (dev dependency)
npm install -D @faker-js/faker

# No additional installations needed for:
# - Navigation (using existing Heroicons + React state)
# - Avatar/images (HTTP APIs, no packages)
# - Seeding (using existing tsx + Prisma)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native React State | Headless UI (Radix, shadcn/ui) | Use only if building complex accessible dropdowns with keyboard navigation, focus management, or ARIA patterns. Overkill for simple click-to-toggle menus. |
| @faker-js/faker | Manual JSON fixtures | Use if you need < 5 providers and want full control. Faker shines for 10-15+ diverse records. |
| DiceBear HTTP API | Local avatar generation library | Use if you need offline development or custom avatar styles not offered by DiceBear. |
| Lorem Picsum HTTP API | Unsplash official API | Use if you need search/filtering by topic. Lorem Picsum is simpler for random placeholders. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-burger-menu | Outdated (last update 2021), not React 19 compatible, opinionated animations conflict with Tailwind | Native React state + Tailwind transitions (existing MobileNav pattern) |
| shadcn/ui dropdown | Requires CLI setup, adds 50+ files for simple menus, Radix dependency bloat | Native implementation with Heroicons (match existing patterns) |
| Faker.js (legacy) | Deprecated, unmaintained since 2022 | @faker-js/faker (community fork, actively maintained) |
| Unsplash Direct API | Requires API key, rate limits (50 req/hour free tier) | Lorem Picsum (no auth, 1000+ req/min) |
| prisma-generator-fake-data | Adds Prisma generator complexity, overkill for one-time seed | Manual seed script with @faker-js/faker |

## Implementation Patterns

### Navigation Pattern (Existing)

**Already established in MobileNav.tsx:**
- useState for toggle state
- Heroicons for hamburger (Bars3Icon) and close (XMarkIcon)
- Tailwind for transitions and styling
- Fixed positioning with z-index management

**Reuse this pattern for:**
- Desktop hamburger menu (same approach, different breakpoint)
- User dropdown on avatar click (same state pattern)

### Mock Data Seeding Pattern

**Recommended approach:**

1. Create `prisma/seed.ts` with TypeScript
2. Use @faker-js/faker with deterministic seed for reproducibility
3. Generate 10-15 providers with:
   - `faker.person.fullName()` for names
   - `faker.internet.email()` for emails
   - `faker.lorem.paragraphs()` for descriptions
   - DiceBear API URLs: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`
   - Lorem Picsum URLs: `https://picsum.photos/seed/${id}/800/600`
4. Use Prisma `createMany()` with `skipDuplicates: true`
5. Configure package.json: `"prisma": { "seed": "tsx prisma/seed.ts" }`

**Why this pattern:**
- Deterministic: Same seed = same data across environments
- Fast: Batch operations via createMany()
- Type-safe: TypeScript + Prisma types
- Idempotent: skipDuplicates allows re-running

### Avatar & Image URLs

**DiceBear (User Avatars):**
```typescript
const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`;
// Same email always generates same avatar
```

**Lorem Picsum (Service Images):**
```typescript
const imageUrl = `https://picsum.photos/seed/${gig.id}/800/600`;
// Same seed always returns same image
```

**Why HTTP APIs over libraries:**
- No package bloat (0 KB added to bundle)
- No build-time generation needed
- Deterministic with seed parameter
- Free, no rate limit issues for development
- Works in production (CDN-backed)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @heroicons/react@2.2.0 | React 19, Next.js 15 | Verified compatible with current stack |
| @faker-js/faker@^9.x | TypeScript 5, Node 20+ | TypeScript 5.x required, full ESM support |
| tsx@4.21.0 | TypeScript 5, Prisma 7 | Already used for dev server, works with Prisma seed |

## Package.json Configuration

**Add to package.json:**
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Why separate from `prisma db seed`:**
- `npm run db:seed` for manual runs during development
- `prisma db seed` auto-runs after migrations in CI/CD
- Both use same script, different triggers

## Sources

**Navigation Components:**
- [Creating an animated hamburger menu in NextJS & Tailwind CSS](https://jacobhocker.medium.com/creating-an-animated-hamburger-menu-in-nextjs-tailwind-css-9e332d428811) — Verified pattern matches existing MobileNav implementation
- [shadcn/ui with Next.js 15 & React 19](https://ui.shadcn.com/docs/react-19) — Considered but rejected (overkill for simple menus)
- Existing codebase: `/Users/anas/CodeV2/Herafi/src/components/layout/MobileNav.tsx` — HIGH confidence reference

**Mock Data Generation:**
- [@faker-js/faker on npm](https://www.npmjs.com/package/@faker-js/faker) — Official package page (attempted WebFetch, rate limited)
- [Faker.js: Complete Guide to Generating Realistic Test Data](https://www.testmuai.com/learning-hub/faker-js/) — MEDIUM confidence (verified seed patterns)
- [Generating Realistic Test Data with Faker.js](https://blog.openreplay.com/generating-realistic-test-data-faker-js/) — MEDIUM confidence

**Prisma Seeding:**
- [Prisma Seeding Documentation](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding) — Official docs (attempted WebFetch, rate limited)
- [Prisma Data Seeding: Best Practices for Test Environments](https://cloudactivelabs.com/en/blog/prisma-data-seeding-best-practices-for-test-environments) — MEDIUM confidence (verified createMany pattern)
- [Prisma Seeding: Quickly Populate Your Database for Development](https://blog.alexrusin.com/prisma-seeding-quickly-populate-your-database-for-development/) — MEDIUM confidence

**Avatar & Image APIs:**
- [DiceBear - Open Source Avatar Library](https://www.dicebear.com/) — Official site, HIGH confidence
- [DiceBear HTTP API Documentation](https://www.dicebear.com/how-to-use/http-api/) — Official API docs, HIGH confidence
- [Lorem Picsum](https://picsum.photos/) — Official site, HIGH confidence
- [Lorem Picsum Is My Favorite Free Placeholder Image Service](https://acusti.ca/blog/2025/02/03/lorem-picsum-best-free-placeholder-image-service/) — MEDIUM confidence (verified seed parameter)

---
*Stack research for: Herafi navigation improvements and mock data seeding*
*Researched: 2026-02-22*
