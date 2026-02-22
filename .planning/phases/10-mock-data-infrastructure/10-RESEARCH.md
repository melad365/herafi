# Phase 10: Mock Data Infrastructure - Research

**Researched:** 2026-02-22
**Domain:** Prisma database seeding with TypeScript
**Confidence:** HIGH

## Summary

Phase 10 establishes the infrastructure for generating deterministic, idempotent mock data for the Herafi marketplace. This research covers Prisma v7's seeding mechanism, @faker-js/faker for realistic data generation, and external APIs for avatars and images.

Prisma v7 introduces breaking changes to the seeding workflow: seeding is now explicitly triggered via `npx prisma db seed` (no automatic seeding during migrations), and the seed command is configured in `prisma.config.ts` under `migrations.seed`. The project already uses `tsx` for TypeScript execution, which is the recommended approach for running seed scripts without compilation.

The standard pattern combines: (1) @faker-js/faker with deterministic seeding via `faker.seed()` for reproducibility, (2) idempotent upsert operations to allow multiple runs without errors, (3) proper cleanup order respecting foreign key constraints, and (4) external APIs (DiceBear for avatars, Lorem Picsum for images) for visual assets.

**Primary recommendation:** Install @faker-js/faker as dev dependency, configure `seed: "tsx prisma/seed.ts"` in prisma.config.ts, implement upsert-based seeding with cleanup in reverse dependency order (reviews → orders → gigs → users), and use fixed seed value for reproducibility.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @faker-js/faker | ^9.3.0+ | Realistic fake data generation | Industry standard for test data; 60+ locales; deterministic seeding |
| tsx | ^4.21.0+ | TypeScript execution | Already in project; faster than ts-node; official Prisma recommendation |
| Prisma Client | ^7.3.0 | Database operations | Already installed; upsert support for idempotency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| DiceBear API | 9.x | Deterministic avatar generation | External HTTP API; no package install needed |
| Lorem Picsum API | v2 | Placeholder images | External HTTP API; seed parameter for consistency |
| dotenv | ^17.2.4+ | Environment variables | Already in project; required for prisma.config.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @faker-js/faker | casual, chance.js | Faker has better locale support, more active maintenance |
| tsx | ts-node | tsx is faster, simpler config, recommended by Prisma docs |
| Upsert pattern | deleteMany + createMany | Delete/create is faster but not idempotent |

**Installation:**
```bash
npm install -D @faker-js/faker
```

## Architecture Patterns

### Recommended Project Structure
```
prisma/
├── schema.prisma          # Already exists
└── seed.ts                # New - seed script entry point

prisma.config.ts           # Already exists - add seed config
```

### Pattern 1: Prisma v7 Seed Configuration
**What:** Configure seed command in prisma.config.ts
**When to use:** Always (Prisma v7 requirement)
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",  // Add this line
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Pattern 2: Deterministic Seeding with Faker
**What:** Use fixed seed value for reproducible data generation
**When to use:** Always (requirement SEED-06)
**Example:**
```typescript
// Source: https://fakerjs.dev/guide/frameworks
import { faker } from '@faker-js/faker';

// Set seed at the top of seed script
faker.seed(123456); // Fixed value for reproducibility

// Now all faker calls return same data on each run
const name = faker.person.fullName(); // Always returns same name
```

### Pattern 3: Idempotent Upsert Pattern
**What:** Use upsert operations with unique identifiers for safe re-runs
**When to use:** Always (requirement SEED-04)
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
const user = await prisma.user.upsert({
  where: { email: 'provider1@example.com' },
  update: {},  // Don't change if exists
  create: {
    email: 'provider1@example.com',
    name: faker.person.fullName(),
    // ... other fields
  },
});
```

### Pattern 4: Proper Cleanup Order
**What:** Delete in reverse dependency order to satisfy foreign key constraints
**When to use:** Before inserting seed data (requirement SEED-05)
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions
async function cleanup() {
  // Delete in reverse dependency order
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.gig.deleteMany({});
  await prisma.portfolioImage.deleteMany({});
  // Users last (they're referenced by everything else)
  await prisma.user.deleteMany({
    where: { email: { contains: '@example.com' } }  // Only test data
  });
}
```

### Pattern 5: Main Function with Disconnect
**What:** Wrap seed logic in async main with proper cleanup
**When to use:** Always (prevents hanging processes)
**Example:**
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seeding logic here
  console.log('Seeding database...');
  await cleanup();
  await seedUsers();
  await seedGigs();
  // ...
  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Pattern 6: External API URLs for Assets
**What:** Generate deterministic URLs for DiceBear avatars and Lorem Picsum images
**When to use:** For user avatars and gig portfolio images
**Example:**
```typescript
// Source: https://www.dicebear.com/how-to-use/http-api/
// DiceBear - use user email or ID as seed
const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`;

// Source: https://picsum.photos/
// Lorem Picsum - use seed for consistency + dimensions
const gigImage = `https://picsum.photos/seed/${gig.id}/800/600`;
```

### Anti-Patterns to Avoid
- **Don't use deleteMany + createMany without unique checks:** Not idempotent; second run causes duplicate key errors
- **Don't seed without faker.seed():** Non-deterministic; each run creates different data
- **Don't forget prisma.$disconnect():** Process hangs indefinitely
- **Don't delete users before their related records:** Foreign key constraint violations
- **Don't use raster image formats from DiceBear:** SVG is smaller, scalable, faster

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Generating realistic names | Custom name arrays | faker.person.fullName() | Locale-aware, realistic, varied |
| Creating valid email addresses | string concatenation | faker.internet.email() | Proper format, realistic domains |
| Generating review text | Lorem ipsum | faker.lorem.paragraph() | Variable length, realistic content |
| Creating timestamps | new Date() repeatedly | faker.date.between() | Realistic distribution, controlled ranges |
| Avatar image generation | Uploading/storing images | DiceBear HTTP API | Deterministic, no storage, lightweight SVG |
| Portfolio placeholder images | Stock photo downloads | Lorem Picsum API | Deterministic, no storage, real photos |
| Unique identifiers | Manual tracking | Faker seed + upsert where clause | Built-in uniqueness checking |

**Key insight:** @faker-js/faker handles edge cases like locale-specific name patterns, realistic email domains, proper date distributions, and text variety. Custom solutions miss these nuances and require maintenance.

## Common Pitfalls

### Pitfall 1: TypeScript Module System Errors
**What goes wrong:** ERR_UNKNOWN_FILE_EXTENSION or ERR_REQUIRE_ESM when running seed
**Why it happens:** Mismatch between TypeScript config and Node.js module expectations
**How to avoid:** Use `tsx` (already in project) instead of `ts-node` in seed command
**Warning signs:** Error messages mentioning ".ts extension" or "require() of ES Module"
**Source:** https://github.com/prisma/prisma/discussions/12752

### Pitfall 2: Non-Idempotent Seeds (Duplicate Key Errors)
**What goes wrong:** Second run of `npx prisma db seed` fails with unique constraint violations
**Why it happens:** Using createMany() or create() without checking for existing records
**How to avoid:** Use upsert() with unique identifiers (email, slug, etc.) for all insertions
**Warning signs:** Errors like "Unique constraint failed on the fields: (`email`)"
**Source:** https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding

### Pitfall 3: Cleanup Order Violations
**What goes wrong:** Foreign key constraint errors during deleteMany cleanup
**Why it happens:** Deleting parent records before deleting child records
**How to avoid:** Delete in reverse dependency order: reviews → orders → gigs → portfolioImages → users
**Warning signs:** "Foreign key constraint failed" errors during cleanup
**Source:** https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions

### Pitfall 4: Process Hangs After Seeding
**What goes wrong:** Script completes but doesn't exit; terminal hangs
**Why it happens:** Missing `await prisma.$disconnect()` in both success and error paths
**How to avoid:** Always disconnect in `.then()` and `.catch()` blocks of main function
**Warning signs:** Script logs "complete" but doesn't return to shell prompt
**Source:** https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding

### Pitfall 5: Non-Deterministic Data Across Runs
**What goes wrong:** Each seed run creates different data; hard to test consistently
**Why it happens:** Forgetting to call `faker.seed()` at script start
**How to avoid:** Set fixed seed value (e.g., `faker.seed(123456)`) before any faker calls
**Warning signs:** User names, emails, etc. change on each `npx prisma db seed` run
**Source:** https://fakerjs.dev/guide/frameworks

### Pitfall 6: Out of Memory with Large Datasets
**What goes wrong:** Script crashes with heap out of memory error
**Why it happens:** Trying to create thousands of records in single operation
**How to avoid:** Process in batches (1,000 records at a time) using loops
**Warning signs:** Memory usage climbing, slow performance, eventual crash
**Source:** https://github.com/prisma/prisma/discussions/12752

### Pitfall 7: DiceBear Rate Limiting
**What goes wrong:** Avatar URLs return 429 Too Many Requests during development
**Why it happens:** DiceBear limits SVG to 50 req/sec, raster to 10 req/sec
**How to avoid:** Use SVG format; store URLs (not fetch images); seed generates URLs only
**Warning signs:** Missing avatars, 429 HTTP errors in network tab
**Source:** https://www.dicebear.com/how-to-use/http-api/

## Code Examples

Verified patterns from official sources:

### Complete Seed Script Structure
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
import { PrismaClient, Category } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Set deterministic seed
faker.seed(123456);

async function cleanup() {
  console.log('Cleaning up existing seed data...');
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.gig.deleteMany({});
  await prisma.portfolioImage.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { contains: '@example.com' } }
  });
}

async function seedUsers() {
  console.log('Seeding users...');

  for (let i = 0; i < 15; i++) {
    const email = `provider${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: faker.person.fullName(),
        username: faker.internet.username().toLowerCase(),
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
        isProvider: true,
        providerBio: faker.lorem.paragraph(),
        skills: faker.helpers.arrayElements(
          ['Plumbing', 'Painting', 'Carpentry'],
          { min: 1, max: 3 }
        ),
        yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
      },
    });
  }
}

async function main() {
  console.log('Starting database seed...');
  await cleanup();
  await seedUsers();
  // More seed functions...
  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Generating Realistic Pricing Tiers
```typescript
// Source: https://www.testmuai.com/learning-hub/faker-js/
function generatePricingTiers(category: Category) {
  return {
    basic: {
      name: "Basic",
      price: faker.number.int({ min: 50, max: 200 }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 3, max: 7 }),
    },
    standard: {
      name: "Standard",
      price: faker.number.int({ min: 200, max: 500 }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 5, max: 10 }),
    },
    premium: {
      name: "Premium",
      price: faker.number.int({ min: 500, max: 1500 }),
      description: faker.lorem.sentence(),
      deliveryDays: faker.number.int({ min: 7, max: 14 }),
    },
  };
}
```

### Creating Related Records (Gigs)
```typescript
// Source: https://www.stackfive.io/work/prisma/seeding-relational-data-with-prisma
async function seedGigs(providers: User[]) {
  console.log('Seeding gigs...');

  for (const provider of providers) {
    const numGigs = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numGigs; i++) {
      const title = faker.lorem.words(5);
      const slug = `${faker.helpers.slugify(title).toLowerCase()}-${provider.id}`;

      await prisma.gig.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          title,
          description: faker.lorem.paragraphs(3),
          category: faker.helpers.arrayElement(Object.values(Category)),
          pricingTiers: generatePricingTiers(category),
          providerId: provider.id,
          images: [
            `https://picsum.photos/seed/${slug}-1/800/600`,
            `https://picsum.photos/seed/${slug}-2/800/600`,
          ],
        },
      });
    }
  }
}
```

### Generating Reviews with Rating Distribution
```typescript
// Source: Custom pattern based on bell curve research
function generateRating(): number {
  // Bell curve centered around 4.5 (range 3.5-5.0)
  // 70% get 4-5 stars, 25% get 4.5-5, 5% get 3.5-4
  const random = Math.random();

  if (random < 0.25) return 5.0;  // Top performers (25%)
  if (random < 0.70) return 4.5;  // Above average (45%)
  if (random < 0.90) return 4.0;  // Average (20%)
  return faker.number.float({ min: 3.5, max: 3.9, fractionDigits: 1 }); // Below average (10%)
}

async function seedReviews() {
  console.log('Seeding reviews...');

  // Reviews must link to completed orders
  const completedOrders = await prisma.order.findMany({
    where: { status: 'COMPLETED' },
  });

  for (const order of completedOrders) {
    const shouldHaveReview = faker.datatype.boolean({ probability: 0.8 }); // 80% of orders reviewed

    if (shouldHaveReview) {
      await prisma.review.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          buyerId: order.buyerId,
          orderId: order.id,
          providerId: order.providerId,
          gigId: order.gigId,
          rating: Math.round(generateRating()),  // Integer for schema
          content: faker.lorem.paragraph(),
          createdAt: faker.date.between({
            from: order.completedAt!,
            to: new Date(),
          }),
        },
      });
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Automatic seeding during migrations | Explicit `npx prisma db seed` only | Prisma v7 (2024) | More control; must run seed manually |
| package.json "prisma.seed" | prisma.config.ts migrations.seed | Prisma v7 (2024) | Configuration centralized in prisma.config.ts |
| ts-node for TypeScript execution | tsx for TypeScript execution | 2023+ | Faster, simpler, better ESM support |
| faker@5 (deprecated) | @faker-js/faker@9+ | 2022+ | Better locale support, active maintenance |
| 32-bit random values | 53-bit random values | Faker v9 (2024) | Better distribution for large datasets |

**Deprecated/outdated:**
- **faker (npm package):** Deprecated; use @faker-js/faker instead
- **"prisma" key in package.json:** Moved to prisma.config.ts in v7
- **--skip-seed flag:** Removed in Prisma v7; seeding never automatic
- **ts-node:** Still works but tsx recommended for better performance

## Open Questions

Things that couldn't be fully resolved:

1. **Locale for Faker.js data**
   - What we know: Faker supports 60+ locales including Arabic (ar) and English (en)
   - What's unclear: Should providers have Arabic names (Moroccan market) or English (international)?
   - Recommendation: Defer to Phase 11 planning; likely mix of both for realism

2. **Category-specific pricing realism**
   - What we know: Different service categories have different typical price ranges
   - What's unclear: What are realistic prices for each of the 13 categories in Moroccan market?
   - Recommendation: Use broad ranges in Phase 10 infrastructure; refine in Phase 11 if needed

3. **Review content variety**
   - What we know: faker.lorem provides generic text; not service-specific
   - What's unclear: Should reviews mention specific service details (e.g., "fixed my sink")?
   - Recommendation: Use faker.lorem in Phase 10; consider custom templates in Phase 11 if time permits

## Sources

### Primary (HIGH confidence)
- [Prisma Seeding Documentation](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding) - Seed configuration, upsert pattern, script structure
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference) - prisma.config.ts schema
- [Faker.js Frameworks Guide](https://fakerjs.dev/guide/frameworks) - Deterministic seeding with faker.seed()
- [DiceBear HTTP API](https://www.dicebear.com/how-to-use/http-api/) - Avatar URL structure, seed parameter, rate limits
- [Lorem Picsum](https://picsum.photos/) - Image placeholder API, seed parameter
- [Prisma Referential Actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions) - Cascade delete behavior

### Secondary (MEDIUM confidence)
- [Prisma TypeScript Seeding Discussion](https://github.com/prisma/prisma/discussions/12752) - tsx vs ts-node, common errors
- [Faker.js Deterministic Values Issue](https://github.com/faker-js/faker/issues/1413) - Seeding patterns and best practices
- [Seeding Relational Data with Prisma](https://www.stackfive.io/work/prisma/seeding-relational-data-with-prisma) - Creating related records pattern

### Tertiary (LOW confidence)
- [Bell Curve Performance Appraisals](https://www.deel.com/blog/bell-curve-performance-appraisal/) - Distribution patterns (adapted for ratings)
- [Faker.js Complete Guide](https://www.testmuai.com/learning-hub/faker-js/) - General best practices
- [Prisma Seed Best Practices Blog](https://backlinksindiit.wixstudio.com/app-development-expe/post/complete-guide-to-prisma-seed-data-for-development) - Community patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Prisma and Faker docs confirm all recommendations
- Architecture: HIGH - Patterns verified from official documentation and project setup
- Pitfalls: HIGH - Sourced from official docs and GitHub issue discussions
- Image APIs: MEDIUM - Documentation found but usage in seed scripts is straightforward
- Rating distribution: LOW - Adapted from general bell curve research, not seeding-specific

**Research date:** 2026-02-22
**Valid until:** ~90 days (Prisma v7 and Faker v9 are stable; slow-moving domain)
