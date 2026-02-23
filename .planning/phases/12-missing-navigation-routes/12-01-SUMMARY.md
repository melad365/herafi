---
phase: 12-missing-navigation-routes
plan: "01"
subsystem: navigation
tags: [routes, pages, authentication, seed, navigation]

dependencies:
  requires:
    - "09-01: Desktop navigation components with hamburger menu"
    - "09-02: User dropdown menu with profile/settings links"
    - "10-01: Seed infrastructure with @herafi-seed.test users"
    - "11-01: Mock provider and gig data"
  provides:
    - "/categories page with category grid"
    - "/help page with support information"
    - "/profile redirect to public profile or edit"
    - "/settings account management page"
    - "/provider/gigs gig management page"
    - "Seed users with bcrypt hashed passwords"
  affects:
    - "Future: Navigation audit can verify all links resolve"
    - "Future: Developer onboarding uses seed users to test flows"

tech-stack:
  added:
    - "bcryptjs: Password hashing for seed users"
    - "@types/bcryptjs: TypeScript types for bcrypt"
  patterns:
    - "Smart redirect pages (/profile redirects based on username status)"
    - "Provider-only pages with isProvider guard"
    - "Seed script with deterministic hashed passwords"

key-files:
  created:
    - path: "src/app/categories/page.tsx"
      purpose: "Category browse page with all 13 categories and gig counts"
      lines: 60
    - path: "src/app/help/page.tsx"
      purpose: "Help and support page with buyer/provider guidance"
      lines: 170
    - path: "src/app/profile/page.tsx"
      purpose: "Smart redirect to public profile or edit based on username"
      lines: 22
    - path: "src/app/settings/page.tsx"
      purpose: "Account settings with provider status and danger zone"
      lines: 157
    - path: "src/app/provider/gigs/page.tsx"
      purpose: "Provider gig management page showing all gigs"
      lines: 162
  modified:
    - path: "prisma/seed.ts"
      purpose: "Added bcrypt password hashing for all seed users"
      changes: "Import bcrypt, hash password before user creation, login instructions in console"

decisions:
  - id: "ROUTE-01"
    date: "2026-02-23"
    decision: "Use Prisma groupBy for category counts instead of 13 separate queries"
    rationale: "Single query more efficient, O(1) Map lookup for each category"
    alternatives: "Individual count queries per category (13 queries)"

  - id: "ROUTE-02"
    date: "2026-02-23"
    decision: "/profile is a smart redirect, not a display page"
    rationale: "Public profiles exist at /u/[username], /profile just routes to correct destination"
    alternatives: "Display profile content directly (duplicates /u/[username] page)"

  - id: "ROUTE-03"
    date: "2026-02-23"
    decision: "Standard password 'password123' for all seed users"
    rationale: "Developer convenience - same password for all test accounts, clearly communicated in seed output"
    alternatives: "Different passwords per user (harder to remember), random passwords (need to store)"

metrics:
  duration: "4.7 min"
  completed: "2026-02-23"

checkpoints: []
---

# Phase 12 Plan 01: Missing Navigation Routes Summary

Implemented all 5 missing navigation routes and enabled seed user authentication.

## One-Liner

Closed all navigation gaps with category browse, help/support, profile/settings pages, provider gig management, and bcrypt-hashed seed user passwords for authenticated testing.

## What Was Built

### 1. /categories Page (Task 1)
**File:** `src/app/categories/page.tsx`

Complete category browse page displaying all 13 service categories:
- Responsive grid layout (1/2/3 columns)
- Category cards link to /gigs with category filter
- Gig counts per category using Prisma groupBy (single efficient query)
- Burgundy design system with hover states
- Public access (no authentication required)

**Technical approach:**
- `prisma.gig.groupBy({ by: ['category'], where: { isActive: true } })`
- Convert to Map for O(1) lookups per category
- Map through Category enum to ensure all 13 shown

### 2. /help Page (Task 2)
**File:** `src/app/help/page.tsx`

Help and support page with comprehensive guidance:
- **For Buyers section:** Browse, order, messaging, reviews
- **For Providers section:** Setup, gig creation, order management, best practices
- **Contact Support section:** Email and response time
- Links to related pages (/provider/setup, /gigs, /dashboard)
- Public access, static content

### 3. /profile and /settings Pages (Task 3)
**Files:** `src/app/profile/page.tsx`, `src/app/settings/page.tsx`

**Profile page (smart redirect):**
- Authenticated users → redirect to `/u/[username]` if username exists
- No username → redirect to `/profile/edit` to prompt setup
- No UI rendering, pure redirect logic

**Settings page:**
- **Account Information:** Email, username, account type badge
- **Provider Status section:**
  - Providers: Active badge + link to /provider/dashboard
  - Non-providers: "Become a Provider" CTA
- **Danger Zone:** Delete account (disabled, placeholder for future)
- Authenticated only (redirects to /login if no session)

### 4. /provider/gigs Page (Task 4)
**File:** `src/app/provider/gigs/page.tsx`

Provider-only gig management page:
- Auth guard: Requires session + isProvider flag
- Redirects non-providers to /provider/setup
- Displays ALL provider's gigs (no pagination for v0.2.0)
- Each gig card shows:
  - Title + Active/Inactive badge
  - Category + starting price
  - Rating and review count (if reviews exist)
  - Created date
  - View and Edit action buttons
- Empty state: "Create Your First Gig" CTA
- Follows dashboard gig card pattern exactly

### 5. Seed Script Password Hashing (Task 5)
**File:** `prisma/seed.ts`

Updated seed script to generate bcrypt-hashed passwords:
- Installed `bcryptjs` and `@types/bcryptjs`
- Standard password: `password123` for all 19 seed users
- Hashed with `bcrypt.hash(password, 10)` (10 rounds)
- Applied to both providers (15) and buyers (4)
- Console output shows login instructions after seeding:
  ```
  🔐 Test Login Credentials:
     Email: provider1@herafi-seed.test (or provider2, buyer1, etc.)
     Password: password123
     Total users: 15 providers + 4 buyers
  ```

**Technical changes:**
- Import bcrypt at top of file
- Generate hashedPassword before provider loop
- Reuse same hash for buyer loop
- Replace `hashedPassword: null` with `hashedPassword`

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 559eb0e | Create /categories page with category grid |
| 2 | 0fcba74 | Create /help page with support information |
| 3 | f7e4902 | Create /profile and /settings pages |
| 4 | 20ce4ed | Create /provider/gigs page for gig management |
| 5 | 3921607 | Fix seed script to generate hashed passwords |

## Verification Results

**Route status codes:**
- ✅ GET /categories → 200 (displays "Browse by Category" with all categories)
- ✅ GET /help → 200 (displays 3 sections: For Buyers, For Providers, Contact Support)
- ✅ GET /profile (no auth) → 307 redirect to /login
- ✅ GET /settings (no auth) → 307 redirect to /login
- ✅ GET /provider/gigs (no auth) → 307 redirect to /login

**Navigation link resolution:**
From DesktopHamburger.tsx:
- ✅ "Categories" link (line 75) → /categories (200)
- ✅ "Help" link (line 140) → /help (200)
- ✅ "My Gigs" link (line 124) → /provider/gigs (200 for providers)

From UserDropdown.tsx:
- ✅ "Profile" link (line 84) → /profile (smart redirect)
- ✅ "Settings" link (line 92) → /settings (200 for authenticated)

**Authentication testing:**
- ✅ Seed script runs successfully
- ✅ Console shows login credentials
- ✅ All 19 seed users have hashed passwords
- ✅ Can log in with provider1@herafi-seed.test / password123

**Audit gap closure:**
- ✅ v0.2.0-MILESTONE-AUDIT.md gaps.routes: 0 (was 5)
- ✅ v0.2.0-MILESTONE-AUDIT.md gaps.auth: 0 (was 1 - seed user authentication)

## Decisions Made

### 1. Prisma groupBy for Category Counts
**Context:** Categories page needs to show gig count for all 13 categories.

**Decision:** Use single `groupBy` query instead of 13 individual counts.

**Rationale:**
- Single database round-trip vs. 13 queries
- Returns Map-like structure for O(1) lookups
- Standard SQL GROUP BY pattern, well-supported by Prisma

**Implementation:**
```typescript
const categoryCounts = await prisma.gig.groupBy({
  by: ['category'],
  where: { isActive: true },
  _count: { category: true },
});
const countMap = new Map(categoryCounts.map(item => [item.category, item._count.category]));
```

### 2. Smart Redirect for /profile
**Context:** Users click "Profile" in dropdown menu.

**Decision:** /profile redirects to `/u/[username]` or `/profile/edit` based on username status, rather than displaying profile directly.

**Rationale:**
- Public profiles already exist at `/u/[username]` - don't duplicate
- /profile becomes a smart router to correct destination
- Consistent with "View My Profile" card on dashboard
- Prompts username setup if not configured

**Alternative considered:** Display profile content at /profile (duplicates /u/[username] functionality)

### 3. Standard Test Password for All Seed Users
**Context:** Developers need to log in with seed users to test authenticated flows.

**Decision:** Use same password (`password123`) for all 19 seed users, display in console output.

**Rationale:**
- Developer convenience - one password to remember
- Clearly communicated in seed output (no ambiguity)
- Test environment only (not production)
- Deterministic (same hash with same input)

**Alternative considered:**
- Different passwords per user (harder to remember, need docs)
- Random passwords (need to store/display mapping)

## Integration Points

**Navigation components:**
- DesktopHamburger.tsx links to /categories (line 75)
- DesktopHamburger.tsx links to /help (line 140)
- DesktopHamburger.tsx links to /provider/gigs (line 124)
- UserDropdown.tsx links to /profile (line 84)
- UserDropdown.tsx links to /settings (line 92)

**Authentication flow:**
- All authenticated pages use `auth()` + redirect pattern
- Provider-only pages check `user.isProvider` flag
- Seed users now have hashed passwords for login testing

**Design system:**
- All pages follow burgundy color scheme
- Card layouts match dashboard/orders patterns
- Same typography and spacing patterns
- Responsive grid layouts (sm/lg breakpoints)

## Deviations from Plan

None - plan executed exactly as written.

## What's Next

**Phase 12 completion:**
- This was the only plan in Phase 12
- All navigation gaps from v0.2.0 audit are now closed

**Testing recommendations:**
1. Log in with provider1@herafi-seed.test / password123
2. Click through all hamburger menu links → verify no 404s
3. Click through all dropdown menu links → verify correct redirects
4. Visit /provider/gigs as provider → see all gigs
5. Visit /categories → see all 13 categories with counts

**Future enhancements (out of scope for v0.2.0):**
- Delete account implementation in settings
- Password change functionality
- Profile picture upload in settings
- Email preferences/notifications

## Files Changed

**Created (5 files):**
- `src/app/categories/page.tsx` (60 lines)
- `src/app/help/page.tsx` (170 lines)
- `src/app/profile/page.tsx` (22 lines)
- `src/app/settings/page.tsx` (157 lines)
- `src/app/provider/gigs/page.tsx` (162 lines)

**Modified (3 files):**
- `prisma/seed.ts` (added bcrypt import, password hashing, login instructions)
- `package.json` (added bcryptjs dependency)
- `package-lock.json` (dependency lockfile)

**Total:** 571 lines of new page code + seed script updates

## Self-Check: PASSED

All created files verified:
- ✅ src/app/categories/page.tsx (2.0K)
- ✅ src/app/help/page.tsx (6.7K)
- ✅ src/app/profile/page.tsx (606B)
- ✅ src/app/settings/page.tsx (5.2K)
- ✅ src/app/provider/gigs/page.tsx (6.0K)

All commits verified:
- ✅ 559eb0e (Task 1: categories page)
- ✅ 0fcba74 (Task 2: help page)
- ✅ f7e4902 (Task 3: profile/settings pages)
- ✅ 20ce4ed (Task 4: provider gigs page)
- ✅ 3921607 (Task 5: seed password hashing)
