# Architecture Research: Navigation Menus & Seed Data

**Domain:** Navigation components and mock data seeding for Next.js 15 App Router
**Researched:** 2026-02-22
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   App Router Layer (Server)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/app/layout.tsx (Server Component)               │   │
│  │    - Fetches session state                           │   │
│  │    - Passes auth state as props to client components │   │
│  └────┬─────────────────────────────────────────────┬───┘   │
│       │                                             │       │
│       ├──> Header (Server Component)                │       │
│       │      - Fetches user.isProvider from DB      │       │
│       │      - Renders static navigation links      │       │
│       │                                             │       │
├───────┼─────────────────────────────────────────────┼───────┤
│       │      Client Component Boundary              │       │
├───────┼─────────────────────────────────────────────┼───────┤
│       │                                             │       │
│       ├──> MobileNav (Client Component)             │       │
│       │      - useState for menu open/close         │       │
│       │      - Receives props: isLoggedIn,          │       │
│       │        isProvider, username                 │       │
│       │                                             │       │
│       └──> UserDropdown (Client Component)          │       │
│              - useState for dropdown open/close     │       │
│              - Headless UI Menu component           │       │
│              - Click-outside detection              │       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   User   │  │   Gig    │  │  Review  │                   │
│  │(seeded)  │  │(seeded)  │  │(seeded)  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                             │
│  Populated via: prisma/seed.ts → npx prisma db seed        │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Header** (Server) | Session fetching, user.isProvider query, static nav rendering | async function in src/components/layout/Header.tsx |
| **MobileNav** (Client) | Hamburger menu state, responsive overlay, touch interactions | "use client" component with useState + Heroicons |
| **UserDropdown** (Client) | Avatar click → dropdown menu, profile/settings/signout links | "use client" with Headless UI Menu or Radix DropdownMenu |
| **seed.ts** | Populate database with 10-15 mock providers, gigs, reviews | TypeScript file in prisma/ using upsert for idempotency |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — SessionProvider, Header, Footer
│   └── (routes)/               # Next.js file-based routing
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Server Component — fetches session + isProvider
│   │   ├── MobileNav.tsx       # Client Component — hamburger menu (exists)
│   │   ├── UserDropdown.tsx    # Client Component — NEW avatar dropdown
│   │   └── Footer.tsx          # Server Component (exists)
│   │
│   └── ui/                     # Reusable UI primitives (existing)
│
├── lib/
│   ├── auth.ts                 # NextAuth.js config (exists)
│   └── db.ts                   # PrismaClient singleton (exists)
│
└── actions/                    # Server Actions (existing)

prisma/
├── schema.prisma               # Database schema (exists)
├── prisma.config.ts            # Prisma v7 config with seed command
├── seed.ts                     # NEW seed script
└── seed-data/                  # OPTIONAL helper files
    ├── providers.json          # Mock provider data
    └── images.json             # Mock image URLs (Unsplash/Picsum)
```

### Structure Rationale

- **src/components/layout/:** All persistent navigation lives here. Server Components for data fetching (Header), Client Components for interactivity (MobileNav, UserDropdown).
- **prisma/seed.ts:** Prisma v7 requires seed configuration in prisma.config.ts (not package.json). Single seed.ts file is standard. Split into seed-data/ only if JSON gets large (>500 lines).
- **Client Component boundary:** Only UserDropdown and MobileNav need "use client". Header stays Server Component to fetch session + DB data without client bundle bloat.

## Architectural Patterns

### Pattern 1: Server Component with Client Component Children

**What:** Server Component fetches data (session, user.isProvider), passes as props to Client Components for interactive UI.

**When to use:** Navigation menus that depend on authenticated state but need client-side interactivity (dropdowns, hamburgers).

**Trade-offs:**
- **Pro:** Minimal client JS bundle. Data fetching happens server-side with direct DB access.
- **Pro:** SEO-friendly — static nav links rendered server-side.
- **Con:** Props must be serializable (no functions, class instances).

**Example:**
```typescript
// src/components/layout/Header.tsx (Server Component)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import UserDropdown from "./UserDropdown"; // Client Component

export default async function Header() {
  const session = await auth();

  let isProvider = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProvider: true },
    });
    isProvider = user?.isProvider ?? false;
  }

  return (
    <header className="sticky top-0 z-50">
      <nav>
        {/* Static server-rendered links */}
        <Link href="/gigs">Browse</Link>

        {/* Pass data to Client Component via props */}
        {session && (
          <UserDropdown
            user={{
              name: session.user.name,
              email: session.user.email,
              avatarUrl: session.user.image,
            }}
            isProvider={isProvider}
          />
        )}
      </nav>
    </header>
  );
}
```

```typescript
// src/components/layout/UserDropdown.tsx (Client Component)
"use client";

import { Menu } from "@headlessui/react";
import { useState } from "react";

interface UserDropdownProps {
  user: { name: string; email: string; avatarUrl?: string };
  isProvider: boolean;
}

export default function UserDropdown({ user, isProvider }: UserDropdownProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center">
        <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
        <Menu.Item>
          {({ active }) => (
            <Link href="/profile" className={active ? "bg-gray-100" : ""}>
              Profile
            </Link>
          )}
        </Menu.Item>
        {/* More menu items */}
      </Menu.Items>
    </Menu>
  );
}
```

### Pattern 2: Idempotent Seeding with Upsert

**What:** Seed scripts use Prisma's `upsert()` to create-or-update records, preventing duplicate key errors on re-runs.

**When to use:** Always. Seed scripts must be idempotent because:
- `prisma migrate reset` re-runs seeds
- Developers re-run seeds to refresh mock data
- CI/CD pipelines may run seeds multiple times

**Trade-offs:**
- **Pro:** Safe to run multiple times without errors.
- **Pro:** Can update existing data if seed logic changes.
- **Con:** Slightly slower than raw `create()` (upsert checks existence first).

**Example:**
```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Upsert users (idempotent)
  const provider1 = await prisma.user.upsert({
    where: { email: "john.plumber@example.com" },
    update: {}, // Update nothing if exists (or update fields if needed)
    create: {
      email: "john.plumber@example.com",
      name: "John the Plumber",
      hashedPassword: await bcrypt.hash("password123", 10),
      isProvider: true,
      providerBio: "20 years fixing leaks and clogs.",
      skills: ["Pipe repair", "Drain cleaning", "Water heater installation"],
      yearsOfExperience: 20,
      averageRating: 4.8,
      totalReviews: 127,
    },
  });

  // Create gigs referencing provider (must exist first)
  await prisma.gig.upsert({
    where: { slug: "emergency-plumbing-repair" },
    update: {},
    create: {
      title: "Emergency Plumbing Repair",
      slug: "emergency-plumbing-repair",
      description: "24/7 emergency plumbing services...",
      category: "PLUMBING",
      providerId: provider1.id, // Reference seeded user
      pricingTiers: {
        basic: { price: 75, description: "Drain unclogging" },
        standard: { price: 150, description: "Pipe repair" },
        premium: { price: 300, description: "Full system inspection" },
      },
      averageRating: 4.9,
      totalReviews: 45,
    },
  });

  console.log("✅ Seeded 1 provider, 1 gig");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // CRITICAL: prevents hanging
  });
```

### Pattern 3: Controlled Dropdown with Click-Outside Detection

**What:** Dropdown state managed with React state + useEffect to detect clicks outside component bounds.

**When to use:** User dropdowns, context menus, popovers that should close when clicking away.

**Trade-offs:**
- **Pro:** Better UX — intuitive close behavior.
- **Pro:** Headless UI libraries (Headless UI, Radix) handle this automatically.
- **Con:** Manual implementation requires careful event listener cleanup.

**Example with Headless UI (Recommended):**
```typescript
"use client";

import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function UserDropdown({ user }) {
  // Headless UI handles click-outside automatically
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-burgundy-100">
              {user.name[0].toUpperCase()}
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Menu.Button>

          {/* Automatically closes on click outside */}
          <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-2">
            <Menu.Item>
              {({ active }) => (
                <a href="/profile" className={`block px-4 py-2 rounded ${active ? "bg-gray-100" : ""}`}>
                  Profile
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a href="/settings" className={`block px-4 py-2 rounded ${active ? "bg-gray-100" : ""}`}>
                  Settings
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a href="/api/auth/signout" className={`block px-4 py-2 rounded text-red-600 ${active ? "bg-red-50" : ""}`}>
                  Sign Out
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}
```

## Data Flow

### Navigation State Flow

```
[User loads page]
    ↓
[Server] auth() → fetch session from Auth.js
    ↓
[Server] prisma.user.findUnique → fetch isProvider flag
    ↓
[Server Component] Header renders with session data
    ↓
[Client Component] UserDropdown receives props { user, isProvider }
    ↓
[User clicks avatar]
    ↓
[Client] useState toggles dropdown visibility
    ↓
[User clicks "Sign Out"]
    ↓
[Client] navigates to /api/auth/signout → Auth.js clears session
```

### Seed Data Flow

```
Developer runs: npx prisma db seed
    ↓
Prisma reads prisma.config.ts → executes "tsx prisma/seed.ts"
    ↓
seed.ts connects to DATABASE_URL from .env
    ↓
For each mock provider:
  1. upsert User (check email uniqueness)
  2. upsert Gigs (referencing User.id)
  3. upsert Reviews (referencing User.id, Gig.id)
    ↓
prisma.$disconnect() → script exits
    ↓
Database now contains 10-15 mock providers with realistic data
```

### Key Data Flows

1. **Session-aware navigation:** Session fetched server-side → passed to client components as props → client components render conditionally based on auth state.
2. **Hamburger menu state:** Client-only (useState) — no server involvement. Opens/closes via CSS classes + React state.
3. **User dropdown state:** Client-only (Headless UI manages internally). Click-outside handled by library.
4. **Seed script execution:** Runs independently of app runtime. Must be explicitly triggered (`npx prisma db seed`).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is optimal. Server Components for nav, client components for interactivity. No changes needed. |
| 1k-10k users | Add React Query to cache user.isProvider check client-side (reduces DB queries). Consider edge middleware for session checks. |
| 10k+ users | Move session storage to Redis (faster than DB lookups). Use static generation for public nav links. Consider CDN caching for header HTML. |

### Scaling Priorities

1. **First bottleneck:** Repeated `prisma.user.findUnique()` calls for isProvider check. **Fix:** Cache in session JWT or use React Query with stale-while-revalidate.
2. **Second bottleneck:** Header re-renders on every page navigation. **Fix:** Move Header to layout (already done ✓) or use React Query to dedupe fetches.

## Anti-Patterns

### Anti-Pattern 1: Fetching Session in Client Component

**What people do:**
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession(); // ❌ Client-side fetch
  // ...
}
```

**Why it's wrong:**
- Adds client JS bundle weight (next-auth/react is large).
- Causes flash of unauthenticated content (FOUC) on page load.
- Misses opportunity for server-side rendering of nav links.

**Do this instead:**
```typescript
// Server Component
import { auth } from "@/lib/auth";

export default async function Header() {
  const session = await auth(); // ✅ Server-side fetch
  return (
    <header>
      {session && <UserDropdown user={session.user} />}
    </header>
  );
}
```

### Anti-Pattern 2: Using create() Instead of upsert() in Seeds

**What people do:**
```typescript
// prisma/seed.ts
await prisma.user.create({
  data: { email: "john@example.com", /* ... */ }
}); // ❌ Fails on second run (duplicate email)
```

**Why it's wrong:**
- Seed fails on re-run with "Unique constraint violation" error.
- Forces developers to manually delete data before re-seeding.
- Breaks CI/CD pipelines that run seeds automatically.

**Do this instead:**
```typescript
await prisma.user.upsert({
  where: { email: "john@example.com" },
  update: {}, // or update fields if needed
  create: { email: "john@example.com", /* ... */ },
}); // ✅ Idempotent
```

### Anti-Pattern 3: Marking Entire Header as Client Component

**What people do:**
```typescript
"use client"; // ❌ at top of Header.tsx

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // ... renders nav + dropdown
}
```

**Why it's wrong:**
- Entire nav (logo, links) becomes client-side JS.
- Loses server-side rendering benefits (SEO, performance).
- Increases client bundle size unnecessarily.

**Do this instead:**
```typescript
// Header.tsx (Server Component — no "use client")
export default async function Header() {
  const session = await auth();
  return (
    <header>
      <Link href="/">Logo</Link> {/* Server-rendered */}
      <UserDropdown user={session.user} /> {/* Only dropdown is client */}
    </header>
  );
}
```

### Anti-Pattern 4: Forgetting prisma.$disconnect()

**What people do:**
```typescript
// prisma/seed.ts
async function main() {
  await prisma.user.create({ /* ... */ });
  console.log("Seeded!");
}

main(); // ❌ Script hangs indefinitely
```

**Why it's wrong:**
- Prisma connection pool stays open, preventing script from exiting.
- CI/CD pipelines timeout waiting for seed to complete.

**Do this instead:**
```typescript
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // ✅ Always disconnect
  });
```

## Integration Points

### Existing Herafi Architecture

| Integration Point | Pattern | Notes |
|-------------------|---------|-------|
| **app/layout.tsx → Header** | Server Component import | Header fetches session server-side. SessionProvider wraps children for client components. |
| **Header → MobileNav** | Props passing (isLoggedIn, isProvider, username) | MobileNav already exists as Client Component. Pattern works well. |
| **Header → UserDropdown** | NEW props passing (user, isProvider) | Follow same pattern as MobileNav. User object must be serializable. |
| **Auth.js middleware** | Session management | middleware.ts already handles auth. Header uses `auth()` helper to fetch session. |
| **Prisma schema** | Database models | User.isProvider, Gig, Review models exist. Seed script references these. |

### External Services (for Seed Data)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Unsplash API** | Optional — fetch random images for gig.images[] | Free tier: 50 requests/hour. Store URLs in seed-data/images.json. |
| **Lorem Picsum** | Simpler alternative — no API key needed | https://picsum.photos/800/600 returns random image. Good for MVP seeding. |
| **Faker.js** | Optional — generate realistic names, bios | Adds 2MB to dev dependencies. Overkill for 10-15 providers (hand-write instead). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Server Component ↔ Client Component** | Props (one-way) | Server fetches data, passes as serializable props. Client handles interactivity. |
| **Seed script ↔ App runtime** | None (separate processes) | Seed runs once manually. App queries seeded data at runtime. |
| **Header ↔ Prisma** | Direct import via `@/lib/db` | Server Components can import Prisma directly. No API route needed. |

## Configuration Requirements

### Prisma v7 Seed Configuration

**File:** `prisma/prisma.config.ts` (NOT package.json in v7)

```typescript
// prisma/prisma.config.ts (or prisma.config.ts at root)
import { defineConfig } from "prisma";
import "dotenv/config"; // Load .env for DATABASE_URL

export default defineConfig({
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // ✅ Seed command
  },
});
```

**Important Prisma v7 changes:**
- Seed command moved from `package.json#prisma.seed` to `prisma.config.ts`.
- Automatic seeding during `prisma migrate dev` removed. Must run `npx prisma db seed` explicitly.
- DATABASE_URL must be in `.env` (NOT `.env.local`) for Prisma CLI to read.

### Environment Variables

Both `.env` and `.env.local` need DATABASE_URL:

```bash
# .env (for Prisma CLI — migrations, seed)
DATABASE_URL="postgresql://user:password@localhost:5432/herafi"

# .env.local (for Next.js runtime — app queries)
DATABASE_URL="postgresql://user:password@localhost:5432/herafi"
```

**Why both?** Prisma CLI uses `dotenv/config` which reads `.env`. Next.js runtime reads `.env.local` by default.

## Build Order Recommendations

### Phase Structure Suggestion

Based on component dependencies:

**1. User Dropdown Component (Phase 1 — ~2 hours)**
   - Install Headless UI: `npm install @headlessui/react`
   - Create `src/components/layout/UserDropdown.tsx`
   - Integrate into existing `Header.tsx` (replace avatar div)
   - Test: click avatar → dropdown appears, click outside → closes

**2. Hamburger Menu Enhancement (Phase 1 — ~1 hour)**
   - MobileNav already exists ✓
   - Optional: Add links for "Become a Provider" or "Settings" if needed
   - Test: mobile view → hamburger works, links navigate correctly

**3. Seed Data Script (Phase 2 — ~3-4 hours)**
   - Update `prisma/prisma.config.ts` with seed command
   - Create `prisma/seed.ts`
   - Seed 10-15 providers with:
     - Realistic names, emails, bios
     - 2-3 gigs per provider (varied categories)
     - 3-5 reviews per gig (mix of 4-5 star ratings)
   - Run `npx prisma db seed` to populate database
   - Test: browse /gigs → see seeded data, click provider → see profile

**Why this order:**
- User dropdown is independent (can build/test immediately).
- Hamburger menu already exists (just verify/enhance).
- Seed data last because it depends on finalizing User/Gig schema.

## Sources

**Official Documentation:**
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — Component boundaries, composition patterns
- [Prisma Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding) — v7 seed configuration, idempotency best practices
- [Headless UI Menu (Dropdown)](https://headlessui.com/react/menu) — Accessible dropdown component with keyboard navigation

**Architecture Patterns (2026):**
- [Next.js 15: App Router — A Complete Senior-Level Guide](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Next.js App Router — Advanced Patterns for 2026](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)
- [Next.js Architecture in 2026 — Server-First, Client-Islands](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)

**Component Patterns:**
- [shadcn/ui Profile Dropdown Pattern](https://www.shadcn.io/patterns/dropdown-menu-profile-1) — Modern dropdown with avatar trigger
- [Creating a Hamburger Menu in React](https://khuang159.medium.com/creating-a-hamburger-menu-in-react-f22e5ae442cb) — State management patterns
- [Building a Dropdown Menu Component With React Hooks](https://www.letsbuildui.dev/articles/building-a-dropdown-menu-component-with-react-hooks/)

**Prisma v7 Resources:**
- [Prisma 7 Release Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) — Breaking changes, seed configuration updates
- [Automate Database Seeding with Prisma in 2026](https://backlinksindiit.wixstudio.com/app-development-expe/post/complete-guide-to-prisma-seed-data-for-development)

**State Management (2026):**
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) — When to use Context vs local state

---

*Architecture research for: Herafi v0.2.0 Navigation & Seeding*
*Researched: 2026-02-22*
*Confidence: HIGH (official Next.js/Prisma docs + verified 2026 patterns)*
