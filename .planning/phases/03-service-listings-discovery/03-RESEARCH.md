# Phase 3: Service Listings & Discovery - Research

**Researched:** 2026-02-08
**Domain:** Service marketplace gig listings, search/filtering, category browsing with Next.js 15
**Confidence:** HIGH

## Summary

Phase 3 implements the core marketplace feature: providers create service listings (gigs) with descriptions, images, pricing tiers, and categories; users browse by category, search with keywords, and filter results. Research focused on Next.js 15 search patterns using URL params, Prisma full-text search with PostgreSQL, category taxonomy for service marketplaces, pricing tier database schemas, multi-image upload patterns for gig galleries, slug generation for SEO-friendly URLs, and form validation patterns already established in Phase 2.

The standard approach uses URL search params (`?category=plumbing&q=leak+repair&minPrice=50`) for shareable/bookmarkable search state, PostgreSQL's native full-text search via Prisma's `search` operator, Prisma enums for category types, a tiered pricing JSON structure embedded in the Gig model, slug-based URLs (`/gig/fix-plumbing-leaks-123abc`) for SEO, and the existing server action patterns from Phase 2 for gig CRUD operations. Browse-by-category uses filtered queries on the category enum field.

**Primary recommendation:** Use URL search params as the single source of truth for search/filter state (enables bookmarking), implement Prisma's PostgreSQL full-text search for keyword queries, define categories as a Prisma enum (13 core categories based on Fiverr research), store pricing tiers as structured JSONB data in PostgreSQL (3 tiers: Basic/Standard/Premium), generate unique slugs from gig titles with collision handling, reuse Phase 2 multi-image upload patterns for gig galleries (limit 5-6 images), and build dedicated browse pages per category for SEO and discoverability.

## Standard Stack

The established libraries/tools for implementing service listings and search in Next.js 15:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | App Router, Server Components, searchParams, dynamic routes | Official framework, native search param handling |
| Prisma | 7.x | Full-text search, category enums, JSONB for pricing tiers | Already in use, native PostgreSQL full-text search support |
| PostgreSQL | 17 | Full-text search indexes, enum types, JSONB columns | Already in use, robust FTS capabilities |
| Zod | 3.x | Gig form validation (title, description, pricing) | Already in use, type-safe validation |
| file-type | 19.x | Magic byte validation for gig image uploads | Already in use from Phase 2 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 1.x+ | Type-safe search param state management | Optional, if search param logic becomes complex |
| Swiper | 11.x | Gig image gallery carousel | Already in use for portfolio, reuse for gig images |
| slugify | 1.6.x | URL slug generation from gig titles | Standard library for slug creation with options |
| React Hook Form | 7.x | Complex gig creation form state | Optional, if form becomes too complex for native forms |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| URL search params | Client state (useState) | Client state isn't shareable/bookmarkable; URL params are standard |
| Prisma full-text search | Raw SQL with ts_vector | Raw SQL is more powerful but breaks Prisma type safety; defer unless needed |
| Prisma enum | String field with validation | Enums provide type safety and database constraints; strings more flexible |
| JSONB pricing | Separate PricingTier table | JSONB keeps tiers atomic with gig; separate table allows more complex queries |
| slugify library | Custom regex slug function | Library handles edge cases (Unicode, collisions, special chars) |
| Built-in pagination | Cursor-based pagination | Offset pagination simpler for MVP; cursor better for large datasets |

**Installation:**
```bash
npm install slugify
# nuqs and react-hook-form are optional
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── gigs/
│   │   ├── page.tsx                  # Browse all gigs with search/filter
│   │   ├── new/
│   │   │   └── page.tsx              # Create new gig (provider only)
│   │   └── [slug]/
│   │       ├── page.tsx              # Gig detail page
│   │       ├── edit/
│   │       │   └── page.tsx          # Edit gig (owner only)
│   │       └── not-found.tsx         # 404 for invalid slugs
│   ├── browse/
│   │   └── [category]/
│   │       └── page.tsx              # Category-specific browse pages
│   ├── search/
│   │   └── page.tsx                  # Dedicated search results page (optional)
├── actions/
│   ├── gigs.ts                       # Gig CRUD server actions
│   └── upload-gig-images.ts          # Gig image upload handling
├── components/
│   ├── gigs/
│   │   ├── GigCard.tsx               # Gig preview card (grid/list view)
│   │   ├── GigGrid.tsx               # Grid of gig cards
│   │   ├── GigDetailView.tsx         # Full gig detail layout
│   │   ├── PricingTierCard.tsx       # Display single pricing tier
│   │   ├── GigImageGallery.tsx       # Image carousel for gig
│   │   └── ProviderCard.tsx          # Provider info sidebar
│   ├── search/
│   │   ├── SearchBar.tsx             # Keyword search input
│   │   ├── CategoryFilter.tsx        # Category dropdown/chips
│   │   ├── PriceRangeFilter.tsx      # Min/max price inputs
│   │   └── FilterPanel.tsx           # Combined filter UI
│   └── forms/
│       ├── GigForm.tsx               # Gig creation/edit form
│       ├── PricingTierInput.tsx      # Form section for 3 tiers
│       └── GigImageUpload.tsx        # Multi-image upload UI
├── lib/
│   ├── validations/
│   │   ├── gig.ts                    # Zod schemas for gig data
│   │   └── pricing.ts                # Pricing tier validation
│   ├── slug.ts                       # Slug generation utilities
│   └── search.ts                     # Search query builders
└── public/
    └── uploads/
        └── gigs/                     # Gig image storage
```

### Pattern 1: URL Search Params for Search/Filter State

**What:** Use Next.js searchParams as single source of truth for filters; client components update URL, server components read and query.

**When to use:** Browse/search pages with filtering (category, keyword, price range).

**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// app/gigs/page.tsx (Server Component)
interface SearchParams {
  q?: string           // keyword search
  category?: string    // category filter
  minPrice?: string    // minimum price
  maxPrice?: string    // maximum price
  page?: string        // pagination
}

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q || ''
  const category = params.category
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined
  const page = params.page ? parseInt(params.page) : 1

  // Build Prisma where clause from search params
  const where = {
    ...(query && {
      OR: [
        { title: { search: query } },
        { description: { search: query } },
      ]
    }),
    ...(category && { category }),
    ...(minPrice || maxPrice ? {
      pricingTiers: {
        path: ['basic', 'price'],
        gte: minPrice,
        ...(maxPrice && { lte: maxPrice }),
      }
    } : {}),
  }

  const gigs = await prisma.gig.findMany({
    where,
    include: { provider: true },
    skip: (page - 1) * 12,
    take: 12,
  })

  return (
    <div>
      <SearchBar defaultValue={query} />
      <FilterPanel category={category} minPrice={minPrice} maxPrice={maxPrice} />
      <GigGrid gigs={gigs} />
      <Pagination currentPage={page} />
    </div>
  )
}
```

```typescript
// components/search/SearchBar.tsx (Client Component)
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset to page 1 on new search
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <input
      type="search"
      placeholder="Search services..."
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

### Pattern 2: Prisma Full-Text Search with PostgreSQL

**What:** Use Prisma's `search` operator for PostgreSQL full-text search on title and description fields.

**When to use:** Keyword search queries.

**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search
// lib/search.ts
export async function searchGigs(query: string, filters: {
  category?: string
  minPrice?: number
  maxPrice?: number
}) {
  return await prisma.gig.findMany({
    where: {
      AND: [
        // Full-text search
        query ? {
          OR: [
            { title: { search: query } },
            { description: { search: query } },
          ]
        } : {},
        // Category filter
        filters.category ? { category: filters.category } : {},
        // Price range filter (check Basic tier price)
        filters.minPrice || filters.maxPrice ? {
          pricingTiers: {
            path: ['basic', 'price'],
            ...(filters.minPrice && { gte: filters.minPrice }),
            ...(filters.maxPrice && { lte: filters.maxPrice }),
          }
        } : {},
      ],
    },
    include: {
      provider: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
    orderBy: {
      _relevance: query ? {
        fields: ['title', 'description'],
        search: query,
        sort: 'desc',
      } : undefined,
    },
  })
}
```

**Note:** For full-text search to work, enable the preview feature in Prisma schema:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}
```

### Pattern 3: Category Enum with Browse Pages

**What:** Define service categories as Prisma enum, create dedicated browse pages per category.

**When to use:** Category browsing and filtering.

**Example:**
```prisma
// Source: Research on service marketplace taxonomy + Prisma enum docs
// prisma/schema.prisma
enum Category {
  PLUMBING
  PAINTING
  CLEANING
  CARPENTRY
  WELDING
  ELECTRICAL
  HVAC
  LANDSCAPING
  MOVING
  CAR_WASHING
  DIGITAL_DESIGN
  DIGITAL_WRITING
  OTHER
}

model Gig {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String   @db.Text
  category    Category
  images      String[] @default([])

  // Provider relation
  providerId  String
  provider    User     @relation(fields: [providerId], references: [id], onDelete: Cascade)

  // Pricing tiers as JSONB
  pricingTiers Json    // { basic: {...}, standard: {...}, premium: {...} }

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([providerId])
}
```

```typescript
// app/browse/[category]/page.tsx
import { Category } from '@prisma/client'
import { notFound } from 'next/navigation'

const CATEGORY_LABELS: Record<string, string> = {
  PLUMBING: 'Plumbing',
  PAINTING: 'Painting',
  CLEANING: 'Cleaning',
  // ... etc
}

export default async function CategoryBrowsePage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const categoryUpper = category.toUpperCase()

  // Validate category exists
  if (!Object.keys(Category).includes(categoryUpper)) {
    notFound()
  }

  const gigs = await prisma.gig.findMany({
    where: { category: categoryUpper as Category },
    include: { provider: true },
  })

  return (
    <div>
      <h1>{CATEGORY_LABELS[categoryUpper]} Services</h1>
      <GigGrid gigs={gigs} />
    </div>
  )
}
```

### Pattern 4: Pricing Tiers as JSONB

**What:** Store 3 pricing tiers (Basic/Standard/Premium) as structured JSON in PostgreSQL JSONB column.

**When to use:** Gig pricing model.

**Example:**
```typescript
// lib/validations/pricing.ts
import { z } from 'zod'

export const pricingTierSchema = z.object({
  name: z.enum(['Basic', 'Standard', 'Premium']),
  price: z.number().positive('Price must be positive').max(999999),
  description: z.string().min(10).max(200),
  deliveryDays: z.number().int().positive().max(365),
  revisions: z.number().int().nonnegative().max(99),
  features: z.array(z.string().min(1).max(100)).max(10),
})

export const pricingTiersSchema = z.object({
  basic: pricingTierSchema,
  standard: pricingTierSchema.optional(),
  premium: pricingTierSchema.optional(),
})

export type PricingTier = z.infer<typeof pricingTierSchema>
export type PricingTiers = z.infer<typeof pricingTiersSchema>

// Example data structure:
const examplePricing: PricingTiers = {
  basic: {
    name: 'Basic',
    price: 50,
    description: 'Fix minor plumbing issues',
    deliveryDays: 2,
    revisions: 1,
    features: ['Leak repair', 'Drain unclogging', '1 hour service'],
  },
  standard: {
    name: 'Standard',
    price: 150,
    description: 'Complete plumbing service',
    deliveryDays: 5,
    revisions: 2,
    features: ['All Basic features', 'Pipe installation', 'Water heater check', '3 hours service'],
  },
  premium: {
    name: 'Premium',
    price: 300,
    description: 'Full plumbing overhaul',
    deliveryDays: 10,
    revisions: 5,
    features: ['All Standard features', 'Full system inspection', 'Emergency support', 'Unlimited hours'],
  },
}
```

### Pattern 5: Slug Generation with Collision Handling

**What:** Generate SEO-friendly URL slugs from gig titles with uniqueness enforcement.

**When to use:** Gig creation and editing.

**Example:**
```typescript
// Source: https://www.npmjs.com/package/slugify + collision handling pattern
// lib/slug.ts
import slugify from 'slugify'
import crypto from 'crypto'
import { prisma } from './db'

export async function generateUniqueGigSlug(title: string, gigId?: string): Promise<string> {
  // Generate base slug from title
  const baseSlug = slugify(title, {
    lower: true,
    strict: true, // Remove special characters
    trim: true,
  })

  // Append short random string for uniqueness (6 chars = ~281 trillion combinations)
  const randomSuffix = crypto.randomBytes(3).toString('hex')
  const slug = `${baseSlug}-${randomSuffix}`

  // Verify uniqueness (extremely unlikely to collide, but check)
  const existing = await prisma.gig.findUnique({
    where: { slug },
    select: { id: true },
  })

  // If collision AND not updating same gig, regenerate
  if (existing && existing.id !== gigId) {
    return generateUniqueGigSlug(title, gigId) // Recursive retry
  }

  return slug
}

// Example usage:
// "Fix Your Plumbing Leaks Fast!" → "fix-your-plumbing-leaks-fast-a3f8b2"
```

### Pattern 6: Multi-Image Upload for Gig Gallery

**What:** Reuse Phase 2 multi-image upload pattern for gig images (5-6 image limit).

**When to use:** Gig creation/editing.

**Example:**
```typescript
// actions/upload-gig-images.ts (similar to upload-portfolio.ts)
'use server'

import { auth } from '@/lib/auth'
import { saveFile, deleteFile } from '@/lib/file-upload'
import { revalidatePath } from 'next/cache'

const MAX_GIG_IMAGES = 6

export async function uploadGigImages(
  gigSlug: string,
  formData: FormData
): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user owns this gig
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: { providerId: true, images: true },
  })

  if (!gig || gig.providerId !== session.user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const files = formData.getAll('images') as File[]
  if (files.length === 0) {
    return { success: false, error: 'No files provided' }
  }

  if (gig.images.length + files.length > MAX_GIG_IMAGES) {
    return { success: false, error: `Maximum ${MAX_GIG_IMAGES} images allowed` }
  }

  try {
    const imageUrls: string[] = []
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Each image must be under 5MB' }
      }
      const imageUrl = await saveFile(file, 'gigs')
      imageUrls.push(imageUrl)
    }

    // Update gig with new images
    await prisma.gig.update({
      where: { slug: gigSlug },
      data: {
        images: { push: imageUrls }, // Append to array
      },
    })

    revalidatePath(`/gigs/${gigSlug}`)
    return { success: true, imageUrls }
  } catch (error) {
    return { success: false, error: 'Failed to upload images' }
  }
}
```

### Pattern 7: Gig CRUD Server Actions

**What:** Server actions for creating, updating, and deleting gigs (follows Phase 2 profile action pattern).

**When to use:** Gig form submissions.

**Example:**
```typescript
// actions/gigs.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { gigSchema } from '@/lib/validations/gig'
import { generateUniqueGigSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'

export type GigActionState = {
  success: boolean
  slug?: string
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createGig(
  _prevState: GigActionState,
  formData: FormData
): Promise<GigActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is a provider
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProvider: true },
  })

  if (!user?.isProvider) {
    return { success: false, error: 'Only providers can create gigs' }
  }

  // Parse and validate form data
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    pricingTiers: JSON.parse(formData.get('pricingTiers') as string),
  }

  const parsed = gigSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const slug = await generateUniqueGigSlug(parsed.data.title)

    const gig = await prisma.gig.create({
      data: {
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        pricingTiers: parsed.data.pricingTiers,
        providerId: session.user.id,
      },
    })

    revalidatePath('/gigs')
    revalidatePath('/dashboard')
    return { success: true, slug: gig.slug }
  } catch (error) {
    return { success: false, error: 'Failed to create gig' }
  }
}
```

### Anti-Patterns to Avoid

- **Don't use client-side filtering for large datasets:** Search params + server-side queries scale better
- **Don't store pricing as separate rows:** 3 tiers per gig is fixed structure, JSONB avoids JOIN complexity
- **Don't generate slugs without random suffix:** Title-only slugs cause collisions ("plumbing-service" × 100)
- **Don't skip category enum validation:** Raw strings allow typos/inconsistency; enum enforces valid categories
- **Don't query all gigs then filter client-side:** Use Prisma `where` clauses for database-level filtering
- **Don't forget to index category and provider fields:** Search/browse pages will be slow without indexes
- **Don't allow providers to create gigs if !isProvider:** Enforce provider status at server action level

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL slug generation | Custom title.toLowerCase().replace() | slugify library | Handles Unicode, special chars, transliteration, configurable options |
| Full-text search | LIKE queries | PostgreSQL full-text search (Prisma `search`) | Relevance ranking, stemming, stop words, indexed for performance |
| Search param management | Manual URLSearchParams logic | useSearchParams + usePathname + useRouter hooks | Next.js-optimized, handles navigation, progressive enhancement |
| Debounced search | Manual setTimeout | useDebouncedCallback from use-debounce | Cleanup, memory management, TypeScript support |
| Price range filtering | String manipulation | Structured JSONB queries | Type-safe, indexed, supports complex queries |
| Category validation | Array of strings | Prisma enum | Type safety, database constraints, auto-generated TypeScript types |

**Key insight:** Search and discovery have subtle edge cases that established patterns solve. URL state management requires careful debouncing and navigation handling. Full-text search needs relevance ranking and stemming. Slug generation must handle Unicode and collisions. Libraries and database features solve these problems better than custom code.

## Common Pitfalls

### Pitfall 1: Search Params Not Updating URL

**What goes wrong:** User types in search box but URL doesn't update; refresh loses search state.

**Why it happens:** Forgot to use `router.replace()` or `router.push()` to update URL.

**How to avoid:**
- Always update URL search params when filters change
- Use `useSearchParams` + `usePathname` + `useRouter` pattern from Next.js docs
- Debounce search input to avoid excessive URL updates (300ms)
- Delete search params when cleared (don't leave `?q=`)

**Warning signs:** Search works but bookmarking/sharing doesn't preserve filters; back button doesn't restore previous search.

### Pitfall 2: Full-Text Search Not Finding Partial Matches

**What goes wrong:** User searches "plumb" but gigs with "plumbing" don't appear.

**Why it happens:** PostgreSQL full-text search uses stemming; single word searches may not match.

**How to avoid:**
- Use `OR` with both full-text search AND `contains` for short queries
- Consider prefix matching for queries under 3 characters
- Document search behavior to users (e.g., "Try complete words")
- Optionally use fuzzy search library for better partial matching

**Warning signs:** Users report "can't find services I know exist"; exact matches work but partial don't.

### Pitfall 3: Pricing Tier Queries Not Working

**What goes wrong:** Filter by price range returns no results despite gigs in that range.

**Why it happens:** JSONB path queries require exact JSON structure; typos in path break queries.

**How to avoid:**
- Use consistent JSONB structure: `{ basic: { price: 50 }, standard: { price: 100 }, ... }`
- Validate JSONB structure with Zod schema before saving
- Test JSONB queries in Prisma Studio or `psql` directly
- Consider adding a computed `minPrice` field if queries are complex

**Warning signs:** Price filter returns empty results; database has gigs in range; direct queries work.

### Pitfall 4: Category Enum Migration Fails

**What goes wrong:** Adding new category to enum causes Prisma migration to fail.

**Why it happens:** PostgreSQL enum types are immutable; can't add values via standard migration.

**How to avoid:**
- Use Prisma's enum migration: it handles `ALTER TYPE ... ADD VALUE` correctly
- Add new categories at end of enum (PostgreSQL order matters)
- Don't remove enum values in production (existing data breaks)
- Test enum changes in development before migrating production

**Warning signs:** Migration errors like "type does not exist" or "duplicate key value violates unique constraint".

### Pitfall 5: Slug Collisions Despite Randomness

**What goes wrong:** Two gigs created simultaneously get same slug; database unique constraint fails.

**Why it happens:** Race condition between slug generation and database insert.

**How to avoid:**
- Use database unique constraint on slug field (catch `P2002` error)
- Retry slug generation if unique constraint violated
- Use cryptographically random suffix (crypto.randomBytes, not Math.random)
- Keep suffix length reasonable (6 hex chars = 16M combinations, enough for MVP)

**Warning signs:** Occasional "slug already exists" errors; no pattern to when it happens (timing-based).

### Pitfall 6: Image Upload Before Gig Creation

**What goes wrong:** User uploads gig images before gig exists; images orphaned if form submission fails.

**Why it happens:** Multi-step form uploads images first, then creates gig; gig creation fails mid-process.

**How to avoid:**
- Create gig first (with empty images array), then upload images
- OR use temporary storage, move to final location after gig creation
- OR use optimistic UI: create gig and upload images in single server action
- Cleanup orphaned images with cron job (files in /uploads/gigs not referenced in DB)

**Warning signs:** Disk fills with unreferenced images; users report "images disappeared after error".

### Pitfall 7: Provider Filter Not Applied to Search

**What goes wrong:** Deleted or unpublished gigs appear in search results.

**Why it happens:** Forgot to filter by active status or provider account status.

**How to avoid:**
- Add `isActive: true` to all public-facing gig queries
- Filter out gigs from deleted/suspended provider accounts
- Consider soft delete pattern (add `deletedAt` field instead of hard delete)
- Exclude draft gigs if you add draft functionality

**Warning signs:** Users see broken gigs or gigs from banned providers; search results include deleted items.

## Code Examples

Verified patterns from official sources:

### Gig Validation Schema

```typescript
// lib/validations/gig.ts
import { z } from 'zod'
import { pricingTiersSchema } from './pricing'

export const gigSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  category: z.enum([
    'PLUMBING',
    'PAINTING',
    'CLEANING',
    'CARPENTRY',
    'WELDING',
    'ELECTRICAL',
    'HVAC',
    'LANDSCAPING',
    'MOVING',
    'CAR_WASHING',
    'DIGITAL_DESIGN',
    'DIGITAL_WRITING',
    'OTHER',
  ]),
  pricingTiers: pricingTiersSchema,
})

export type GigFormData = z.infer<typeof gigSchema>
```

### Prisma Schema Extension for Gigs

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"] // Enable PostgreSQL full-text search
}

datasource db {
  provider = "postgresql"
}

enum Category {
  PLUMBING
  PAINTING
  CLEANING
  CARPENTRY
  WELDING
  ELECTRICAL
  HVAC
  LANDSCAPING
  MOVING
  CAR_WASHING
  DIGITAL_DESIGN
  DIGITAL_WRITING
  OTHER
}

model Gig {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String   @db.Text
  category    Category
  images      String[] @default([])

  // Pricing tiers stored as JSONB
  // Structure: { basic: {...}, standard?: {...}, premium?: {...} }
  pricingTiers Json

  // Provider relation
  providerId  String
  provider    User     @relation(fields: [providerId], references: [id], onDelete: Cascade)

  // Soft delete / publishing
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([providerId])
  @@index([isActive])
}

// Extend User model with gigs relation
model User {
  // ... existing fields from Phase 1 & 2
  gigs Gig[]
}
```

### File Upload Helper Extension for Gigs

```typescript
// lib/file-upload.ts (extend existing from Phase 2)
export async function saveFile(
  file: File,
  subDir: "avatars" | "portfolio" | "gigs"
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subDir)
  await fs.mkdir(dir, { recursive: true })

  const ext = path.extname(file.name) || ".jpg"
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
  const filePath = path.join(dir, uniqueName)

  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate file is an image by checking magic bytes
  const { fileTypeFromBuffer } = await import("file-type")
  const type = await fileTypeFromBuffer(buffer)
  if (!type || !type.mime.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed.")
  }

  await fs.writeFile(filePath, buffer)
  return `/uploads/${subDir}/${uniqueName}`
}
```

### Search Query Builder

```typescript
// lib/search.ts
import { Category, Prisma } from '@prisma/client'

export interface GigSearchFilters {
  query?: string
  category?: Category
  minPrice?: number
  maxPrice?: number
}

export function buildGigSearchWhere(filters: GigSearchFilters): Prisma.GigWhereInput {
  const conditions: Prisma.GigWhereInput[] = [
    { isActive: true }, // Always filter active gigs
  ]

  // Full-text search on title and description
  if (filters.query) {
    conditions.push({
      OR: [
        { title: { search: filters.query } },
        { description: { search: filters.query } },
      ],
    })
  }

  // Category filter
  if (filters.category) {
    conditions.push({ category: filters.category })
  }

  // Price range filter (checks Basic tier price)
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceFilter: any = { path: ['basic', 'price'] }
    if (filters.minPrice !== undefined) {
      priceFilter.gte = filters.minPrice
    }
    if (filters.maxPrice !== undefined) {
      priceFilter.lte = filters.maxPrice
    }
    conditions.push({ pricingTiers: priceFilter })
  }

  return { AND: conditions }
}

export async function searchGigs(filters: GigSearchFilters, page: number = 1, pageSize: number = 12) {
  const where = buildGigSearchWhere(filters)

  const [gigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: filters.query
        ? {
            _relevance: {
              fields: ['title', 'description'],
              search: filters.query,
              sort: 'desc',
            },
          }
        : { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.gig.count({ where }),
  ])

  return {
    gigs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
```

### Gig Card Component

```typescript
// components/gigs/GigCard.tsx
import Image from 'next/image'
import Link from 'next/link'

interface GigCardProps {
  gig: {
    slug: string
    title: string
    images: string[]
    category: string
    pricingTiers: any
    provider: {
      username: string
      displayName: string
      avatarUrl?: string
    }
  }
}

export function GigCard({ gig }: GigCardProps) {
  const basicPrice = gig.pricingTiers.basic?.price || 0

  return (
    <Link href={`/gigs/${gig.slug}`} className="block group">
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
        {/* Gig image */}
        <div className="relative aspect-video bg-gray-200">
          {gig.images[0] ? (
            <Image
              src={gig.images[0]}
              alt={gig.title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Gig info */}
        <div className="p-4">
          <p className="text-xs text-gray-600 uppercase">{gig.category}</p>
          <h3 className="font-semibold mt-1 group-hover:text-orange-600 transition">
            {gig.title}
          </h3>

          {/* Provider info */}
          <div className="flex items-center gap-2 mt-2">
            {gig.provider.avatarUrl && (
              <Image
                src={gig.provider.avatarUrl}
                alt={gig.provider.displayName || gig.provider.username}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <p className="text-sm text-gray-600">
              {gig.provider.displayName || gig.provider.username}
            </p>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Starting at</span>
            <span className="text-lg font-bold text-orange-600">
              ${basicPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side filtering | URL search params + server queries | Next.js 13+ (2023) | Shareable URLs, SEO-friendly, progressive enhancement |
| LIKE queries | PostgreSQL full-text search | Ongoing standard | Relevance ranking, better performance, stemming support |
| Separate pricing table | JSONB pricing tiers | 2020+ for simple tiers | Simpler queries, atomic updates, less JOIN complexity |
| String categories | Enum types | Always for fixed sets | Type safety, database constraints, auto-completion |
| Manual slug generation | slugify library | Ongoing standard | Handles edge cases, Unicode support, configurable |
| offset pagination | cursor-based pagination | 2023+ for large datasets | Better performance at scale; offset OK for MVP |

**Deprecated/outdated:**
- Client-side search filtering (React state): Not shareable, poor SEO, doesn't scale
- MySQL FULLTEXT: Less powerful than PostgreSQL FTS; no relevance ranking in older versions
- Auto-incrementing numeric IDs in URLs: Poor SEO, not human-readable

## Open Questions

Things that couldn't be fully resolved:

1. **Should we implement rating/review filtering in Phase 3?**
   - What we know: Requirements mention "filter by rating" but reviews come in Phase 6
   - What's unclear: Whether to show placeholder UI or defer filter entirely
   - Recommendation: Show filter UI but display "Coming soon" tooltip; wire up in Phase 6

2. **How many categories are optimal for MVP?**
   - What we know: Fiverr uses 13 core specializations with 700+ subcategories
   - What's unclear: Whether 13 categories cover our trade-focused marketplace
   - Recommendation: Start with 13 (listed in schema), add subcategories if needed in future phase

3. **Should gig creation be multi-step or single form?**
   - What we know: Phase 2 used single scrolling form; gig form has more fields (images, 3 tiers)
   - What's unclear: Whether single form is too overwhelming
   - Recommendation: Single scrolling form for consistency; add progress indicator if UX feels heavy

4. **Should we implement draft gigs?**
   - What we know: Requirements don't mention drafts; Fiverr has published/draft states
   - What's unclear: Whether providers need to save incomplete gigs
   - Recommendation: Defer to Phase 8; require complete gig at creation for MVP

5. **How to handle gig images if no images uploaded?**
   - What we know: Phase 2 allows empty portfolio; services usually show images
   - What's unclear: Whether to allow imageless gigs or require at least 1 image
   - Recommendation: Allow 0 images but show placeholder; encourage 3-6 images in UI

## Sources

### Primary (HIGH confidence)

- [Next.js Search and Pagination Official Docs](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - URL search params pattern, useSearchParams hooks
- [Prisma Full-Text Search Docs](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search) - PostgreSQL full-text search with Prisma
- [Next.js Dynamic Routes Docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Slug-based routes, params handling
- [Prisma Filtering and Sorting Docs](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting) - JSONB queries, enum filtering
- [slugify npm package](https://www.npmjs.com/package/slugify) - Standard slug generation library

### Secondary (MEDIUM confidence)

- [Aurora Scharff: Managing Advanced Search Param Filtering](https://aurorascharff.no/posts/managing-advanced-search-param-filtering-next-app-router/) - Search param state management patterns
- [Strapi: Epic Next.js 15 Tutorial Part 8](https://strapi.io/blog/epic-next-js-15-tutorial-part-8-search-and-pagination-in-next-js) - Search and pagination implementation
- [Pedro Alonso: Full-Text Search with PostgreSQL and Prisma](https://www.pedroalonso.net/blog/postgres-full-text-search/) - Practical FTS patterns
- [Fiverr Services Directory](https://www.fiverr.com/categories) - Category taxonomy research
- [Adapty: Tiered Pricing Strategies Guide](https://adapty.io/blog/tiered-pricing/) - Pricing tier best practices
- [Tim Santeford: Automating URL Slug Generation in PostgreSQL](https://www.timsanteford.com/posts/automating-url-slug-generation-in-postgresql-with-triggers-and-functions/) - Database-level slug generation patterns

### Tertiary (LOW confidence)

- [Medium: How to Properly Manage Search Params in Next.js](https://medium.com/@Jaimayal/how-to-properly-manage-search-params-in-nextjs-app-router-leverage-the-power-of-nuqs-the-right-way-9f7238cff76a) - nuqs library patterns
- [GitHub: Prisma Soft Delete Middleware](https://github.com/olivierwilkinson/prisma-soft-delete-middleware) - Soft delete implementation
- Various WebSearch results for service marketplace patterns (unverified)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js and Prisma docs, established libraries
- Architecture: HIGH - Patterns verified in Next.js 15 docs and existing Phase 2 codebase
- Pitfalls: MEDIUM - Drawn from community discussions and PostgreSQL FTS documentation
- Search patterns: HIGH - Official Next.js learning resources and tutorials

**Research date:** 2026-02-08
**Valid until:** ~30 days (stable stack, Next.js 15 mature, PostgreSQL FTS well-established)
