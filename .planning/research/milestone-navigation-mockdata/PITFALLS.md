# Pitfalls Research

**Domain:** Navigation Menus and Mock Data Seeding for Next.js Marketplace
**Researched:** 2026-02-22
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Server/Client Component Boundary Violations in Navigation

**What goes wrong:**
When adding hamburger menus or user dropdowns to the existing Server Component Header, developers inadvertently break the server/client boundary. The Header component fetches session data server-side (`await auth()`) and queries the database for `isProvider` status. Adding interactive state (menu open/close) requires client components, but mixing server data fetching with client state causes hydration errors like "Text content does not match server-rendered HTML."

**Why it happens:**
Next.js 15 App Router defaults to Server Components. The existing Header.tsx uses `await auth()` and Prisma queries, which are server-only operations. Adding `useState` for menu toggle requires `"use client"`, but you cannot use async/await or direct database calls in client components. Developers often add `"use client"` to the entire Header, breaking server-side data access.

**How to avoid:**
- Keep Header as Server Component for data fetching
- Extract interactive menu components (MobileNav, UserDropdown) into separate client components
- Pass session data and user state as props from server to client boundary
- Use the pattern: Server Component fetches → passes props → Client Component handles interaction
- Never call `await auth()` or Prisma directly in a `"use client"` component

**Warning signs:**
- Error: "You're importing a component that needs `useState`... It only works in a Client Component"
- Error: "Text content does not match server-rendered HTML"
- Menu state works but user data (name, isProvider) is undefined
- Database queries failing silently in components marked `"use client"`

**Phase to address:**
Phase 1 (Hamburger menu implementation) - Establish correct component boundaries from the start

---

### Pitfall 2: Menu State Not Closing on Navigation

**What goes wrong:**
Hamburger menu remains open when users click navigation links, forcing manual close. In Next.js App Router, client-side navigation with `<Link>` doesn't trigger full page reloads, so component state persists. Users navigate to a new page but still see the overlay menu covering content, creating a broken UX.

**Why it happens:**
The useState-based `isOpen` state in MobileNav persists across Next.js client-side transitions. Developers expect navigation to reset state like traditional multi-page apps, but Next.js keeps client components mounted between route changes. Without explicitly closing the menu on link click, the state remains true.

**How to avoid:**
- Add `onClick={closeMenu}` to every `<Link>` inside the mobile menu
- Consider using `usePathname()` with `useEffect` to auto-close on route change:
  ```typescript
  const pathname = usePathname()
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  ```
- Test navigation from every menu link, not just the first one
- Verify menu closes on both same-page and cross-page navigation

**Warning signs:**
- Menu overlay persists after clicking navigation links
- Users must manually close menu after every navigation action
- QA reports "menu stuck open" issues
- Mobile users confused about how to see page content after navigation

**Phase to address:**
Phase 1 (Hamburger menu implementation) - Wire up close handlers immediately

---

### Pitfall 3: Auth Session Stale in User Dropdown

**What goes wrong:**
User dropdown shows outdated data after profile updates or provider status changes. User completes "Become a Provider" flow, but dropdown still shows "Become a Provider" button instead of "Provider Dashboard" link. Requires manual page refresh to see updated state, breaking the SPA experience.

**Why it happens:**
Auth.js v5 with JWT strategy stores session data in the encrypted JWT token. When you update the database (e.g., set `isProvider: true`), the JWT still contains the old session data. The Header component's server-side `await auth()` reads from the JWT, not the database. The session only updates when the JWT is regenerated (login, manual refresh, or token expiry).

Additionally, the Header performs a separate Prisma query for `isProvider` status on every render, creating a race condition where the JWT session and database query might disagree if the client hasn't revalidated the route.

**How to avoid:**
- After critical profile updates (becoming a provider, name change), call `revalidatePath('/')` to force Header re-fetch
- Implement optimistic UI updates in the dropdown component for immediate feedback
- Consider using Auth.js v5's `session` callback to include `isProvider` in the JWT payload:
  ```typescript
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        // Fetch and include isProvider in session
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isProvider: true }
        })
        session.user.isProvider = user?.isProvider ?? false
      }
      return session
    }
  }
  ```
- Pass `session.user.isProvider` to components instead of querying separately
- Document which actions require logout/login to update JWT

**Warning signs:**
- User completes profile update but UI doesn't reflect changes
- "Provider Dashboard" link appears/disappears inconsistently
- Different values for `isProvider` on client vs server
- Refreshing page fixes the issue (indicates stale session)

**Phase to address:**
Phase 2 (User dropdown with auth state) - Plan session sync strategy before building dropdown

---

### Pitfall 4: Hydration Mismatch from Responsive Menu Rendering

**What goes wrong:**
Server renders desktop navigation HTML, but client detects mobile viewport and renders hamburger menu, causing hydration error: "There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering." The app works but loses SSR benefits and shows console errors.

**Why it happens:**
The existing Header uses `className="hidden md:flex"` and `className="md:hidden"` to conditionally show desktop vs mobile nav. This is CSS-based hiding, which works correctly. However, if you add JavaScript-based conditional rendering (e.g., `if (isMobile) return <MobileNav />`) that checks `window.innerWidth`, the server always renders the default (doesn't have window), but the client renders based on actual viewport, creating a DOM mismatch.

**How to avoid:**
- Use CSS-only responsive hiding with Tailwind (`hidden md:flex` / `md:hidden`)
- Never use `window.innerWidth` or `matchMedia()` during initial render
- If you must detect viewport in JS, use `useEffect` to set state after hydration:
  ```typescript
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  if (!isMounted) return <div className="h-16" /> // Match server height
  ```
- Render both mobile and desktop versions, hide with CSS
- Avoid libraries like `react-responsive` that check viewport during render

**Warning signs:**
- Console error: "Text content does not match server-rendered HTML"
- Console error: "Hydration failed because the initial UI does not match"
- Navigation flickers on page load
- Different menu renders on server (view source) vs client (inspector)

**Phase to address:**
Phase 1 (Hamburger menu implementation) - Use CSS-only approach from the start

---

### Pitfall 5: Seed Data with Orphaned Foreign Key References

**What goes wrong:**
Seed script creates gigs referencing deleted or non-existent users, orders referencing non-existent gigs, or reviews without valid order IDs. Database inserts succeed because constraints aren't enforced properly, but app crashes when querying with `include` relations. Error: "Foreign key constraint failed on the field" or queries return null unexpectedly.

**Why it happens:**
Seed scripts often clear tables independently (`await prisma.user.deleteMany()`, `await prisma.gig.deleteMany()`) without respecting foreign key constraints. If you delete users before gigs, and `onDelete: Cascade` isn't properly configured, you leave orphaned gigs. When re-creating seed data, hardcoded IDs (e.g., `providerId: "user123"`) might not match the generated CUIDs from the new user inserts.

**How to avoid:**
- Clear tables in reverse dependency order (children first, parents last):
  ```typescript
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.message.deleteMany()
  await prisma.gig.deleteMany()
  await prisma.portfolioImage.deleteMany()
  await prisma.user.deleteMany()
  ```
- Verify all `@relation` directives have explicit `onDelete` behavior:
  - `onDelete: Cascade` for owned data (Gig → User, Order → Gig)
  - `onDelete: Restrict` for critical references
- Capture created IDs and use them for relations:
  ```typescript
  const user = await prisma.user.create({ data: {...} })
  const gig = await prisma.gig.create({
    data: { providerId: user.id, ... }
  })
  ```
- Never use hardcoded IDs unless using `upsert` with deterministic IDs
- Run seed script multiple times to verify idempotency

**Warning signs:**
- Seed script works first time but fails on re-run
- "Foreign key constraint failed" errors during seeding
- Queries return null for relations that should exist
- App crashes with "Cannot read property of null" when accessing related data
- Seed script has `deleteMany` calls without corresponding cascade setup

**Phase to address:**
Phase 3 (Mock data seeding) - Design proper cleanup and creation order before writing seed logic

---

### Pitfall 6: Unrealistic Mock Data That Breaks UI Assumptions

**What goes wrong:**
Seed data contains usernames like "John_Doe123", emails like "test1@example.com", gig titles like "Test Gig 1", and all gigs have exactly 3 images. UI looks obviously fake, breaking immersion. Worse, edge cases go untested: long titles overflow containers, missing images break layouts, empty bios cause spacing issues.

**Why it happens:**
Developers hardcode simple test data or use basic Faker.js calls without domain context. `faker.person.fullName()` generates names but doesn't match Arabic/Moroccan locale for Herafi. `faker.lorem.paragraph()` creates Latin placeholder text that doesn't reflect real service descriptions. Developers don't test edge cases (0 images, 10 images, very long titles, empty optional fields) because seed data is too uniform.

**How to avoid:**
- Use Faker.js with appropriate locale:
  ```typescript
  import { faker } from '@faker-js/faker/locale/ar'
  // or mix locales for diversity
  ```
- Vary data realistically:
  - Some gigs have 1 image, some have 8
  - Some users have no bio, some have very long bios
  - Mix skill levels (1-30 years experience)
  - Some providers have 0 gigs, some have 15
- Create domain-specific generators:
  ```typescript
  function generateGigTitle(category: Category): string {
    const templates = {
      PLUMBING: ['Professional Plumbing Services', 'Expert Leak Repair', ...],
      PAINTING: ['Interior Painting Specialist', 'Exterior Home Painting', ...],
      // ...
    }
    return faker.helpers.arrayElement(templates[category])
  }
  ```
- Test edge cases explicitly: create one gig with empty optional fields, one with max lengths
- Use realistic pricing for Moroccan context (MAD currency)
- Generate related data consistently (provider with plumbing skills creates plumbing gigs, not digital design)

**Warning signs:**
- All mock data looks identical (same length titles, same number of images)
- Text is obviously placeholder (lorem ipsum, "test", sequential numbering)
- UI never tested with empty states or overflow scenarios
- Locale doesn't match target market (English names for Moroccan platform)
- Designers complain that demo doesn't look like real product

**Phase to address:**
Phase 3 (Mock data seeding) - Build comprehensive generators with realistic variance

---

### Pitfall 7: Dropdown Menu Missing Keyboard Navigation and ARIA

**What goes wrong:**
User dropdown works with mouse but keyboard users can't access it. Screen readers don't announce menu state (expanded/collapsed). Pressing Tab focuses the avatar/button, but Enter doesn't open the dropdown. Arrow keys don't navigate menu items. Escape doesn't close the dropdown. Fails WCAG 2.1 AA accessibility standards.

**Why it happens:**
Developers build dropdowns with `onMouseEnter`/`onMouseLeave` or `onClick` alone, without implementing keyboard event handlers. They don't add ARIA attributes (`aria-expanded`, `aria-haspopup`, `role="menu"`). Common mistake: using ARIA `role="menu"` for navigation dropdowns when it should only be used for application menus (like File/Edit menus in software), not site navigation.

**How to avoid:**
- For user dropdowns (navigation), use button with proper ARIA:
  ```typescript
  <button
    onClick={toggleDropdown}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') toggleDropdown()
      if (e.key === 'Escape') closeDropdown()
    }}
    aria-expanded={isOpen}
    aria-haspopup="true"
    aria-label="User menu"
  >
  ```
- Make dropdown items focusable and keyboard-navigable:
  ```typescript
  <a href="/dashboard"
     role="menuitem"
     onKeyDown={(e) => {
       if (e.key === 'Escape') closeDropdown()
       // Optional: Arrow key navigation
     }}
  >
  ```
- Close dropdown on Escape key, focus outside click, and link activation
- Consider using headless UI library (Radix UI, Headless UI) that handles accessibility correctly
- Test with keyboard only (no mouse) and screen reader
- Don't use `role="menu"` for navigation dropdowns - it's for application menus only

**Warning signs:**
- Can't open dropdown with Enter/Space key
- Escape key doesn't close dropdown
- Screen reader doesn't announce "expanded" or "collapsed"
- Tab key skips dropdown items when menu is open
- Accessibility audit tool flags missing ARIA attributes
- Can't navigate menu items with arrow keys (if implementing full menu pattern)

**Phase to address:**
Phase 2 (User dropdown implementation) - Build accessibility in from the start, not as afterthought

---

### Pitfall 8: Seed Script Breaking on Duplicate Keys

**What goes wrong:**
Running seed script twice fails with "Unique constraint failed on the fields: (`email`)" or "Unique constraint failed on the fields: (`slug`)". Developer must manually clear database before every seed run, slowing down development and testing iteration.

**Why it happens:**
Seed script uses `prisma.user.create()` with fixed emails, or generates slugs without checking for conflicts. On second run, the data already exists, violating unique constraints. The schema has multiple unique fields (email, username, slug on Gig) that aren't handled idempotently.

**How to avoid:**
- Use `upsert` instead of `create` for deterministic seed data:
  ```typescript
  const user = await prisma.user.upsert({
    where: { email: 'provider1@herafi.com' },
    update: {},
    create: {
      email: 'provider1@herafi.com',
      name: 'Ahmed El Fassi',
      // ...
    }
  })
  ```
- For random data, clear tables at script start (in correct order - see Pitfall 5)
- Use `createMany` with `skipDuplicates: true` for non-critical bulk inserts:
  ```typescript
  await prisma.user.createMany({
    data: mockUsers,
    skipDuplicates: true,
  })
  ```
- Generate unique slugs with timestamp or counter:
  ```typescript
  slug: `${faker.helpers.slugify(title)}-${Date.now()}`
  ```
- Document whether seed script is additive or replaces all data
- Add script flag: `npm run seed:clean` (deletes first) vs `npm run seed:append`

**Warning signs:**
- Seed script fails on second execution
- Must manually run Prisma Studio to delete data before re-seeding
- Error messages about unique constraints during development
- Inconsistent database state between team members
- CI/CD seed step fails intermittently

**Phase to address:**
Phase 3 (Mock data seeding) - Make seed script idempotent from the start

---

### Pitfall 9: Missing Click-Outside Handler for Dropdowns

**What goes wrong:**
User opens dropdown menu by clicking avatar, then clicks elsewhere on the page expecting the dropdown to close, but it stays open. User must explicitly click the avatar again to toggle closed. Creates frustrating UX, especially on mobile where dropdown overlays content.

**Why it happens:**
Developer implements toggle logic (`setIsOpen(!isOpen)`) but doesn't add a click-outside-to-close handler. This pattern is expected in modern web apps but requires explicit implementation - tracking clicks on the document and checking if they're outside the dropdown element.

**How to avoid:**
- Add `useEffect` to listen for outside clicks:
  ```typescript
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])
  ```
- Use ref on the dropdown container: `<div ref={dropdownRef}>`
- Clean up event listener when component unmounts
- Consider using headless UI library that handles this automatically
- Test on mobile: tapping outside dropdown should close it

**Warning signs:**
- Dropdown stays open when clicking page content
- Users confused about how to close dropdown
- Multiple dropdowns can be open simultaneously (if you have multiple dropdown menus)
- Mobile users struggle to access content behind open dropdown
- QA reports "dropdown won't close" issues

**Phase to address:**
Phase 2 (User dropdown implementation) - Add outside-click handler immediately after basic toggle

---

### Pitfall 10: Seed Data Not Representing Realistic Relationships

**What goes wrong:**
Seed data creates 20 users, all providers, all with 5 gigs each. No regular buyers, no providers without gigs, no orders, no conversations. When testing the marketplace, every search returns identical result counts, every provider looks equally active, and edge cases (new provider, inactive provider, high-demand provider) are never tested.

**Why it happens:**
Developers focus on populating tables without modeling realistic user journeys and marketplace dynamics. Real marketplaces have: (1) many browsers, few buyers, (2) many new providers with 0-2 gigs, (3) few established providers with many gigs and reviews, (4) some inactive users, (5) asymmetric order distribution (80/20 rule).

**How to avoid:**
- Model realistic user segments:
  ```typescript
  const segments = {
    browsers: 30,      // No gigs, no orders placed
    buyers: 15,        // No gigs, have placed orders
    newProviders: 10,  // 1-2 gigs, 0-2 reviews
    activeProviders: 8,// 3-8 gigs, 5-20 reviews
    topProviders: 2,   // 10+ gigs, 30+ reviews
  }
  ```
- Generate realistic order distribution (Pareto principle):
  - 20% of providers get 80% of orders
  - Some gigs have 0 orders, some have 50+
  - Recent orders clustered (weekly activity patterns)
- Create message conversations between buyers and providers
- Vary user activity:
  - Some users created recently, some 6+ months ago
  - Some providers haven't logged in for weeks (test "Last active" features)
  - Mix of pending, completed, and cancelled orders
- Generate realistic review patterns:
  - Not every order has a review (60-70% review rate)
  - Rating distribution: mostly 4-5 stars, some 3s, rare 1-2s
  - Review dates match order completion dates

**Warning signs:**
- Every user has identical data patterns
- Search results always return the same count
- Can't test "no results" or "new provider" scenarios
- Order history looks unrealistic (all users have exact same activity)
- Designers/PMs complain demo doesn't reflect real marketplace dynamics

**Phase to address:**
Phase 3 (Mock data seeding) - Design seed data architecture with realistic distribution model

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding `"use client"` to Header component | Quick fix for adding useState | Breaks server-side data fetching, forces all child components to client-side, loses SSR benefits | Never - Extract interactive parts instead |
| Manual menu close (no auto-close on navigation) | Saves 10 lines of code | Poor UX, user complaints, higher support burden | Never - Auto-close is expected behavior |
| Hardcoded seed data IDs | Easy to reference in test cases | Breaks on database reset, fails on second run, team can't sync | Only for initial dev; switch to generated IDs before sharing |
| Using `deleteMany()` without order | Faster to write | Orphaned records, foreign key errors, inconsistent state | Never - Always respect dependency order |
| Basic Faker.js without locale | Quick to implement | Unrealistic demos, missed edge cases, poor product presentation | Early prototyping only; enhance before demos |
| Mouse-only dropdown (no keyboard) | Works for 90% of manual testing | Fails accessibility audits, excludes keyboard users, legal risk (WCAG) | Never - Accessibility is non-negotiable |
| Simple toggle without click-outside | Saves implementing useEffect | Frustrating UX, feels broken, user confusion | Never - Industry standard pattern |
| `skipDuplicates: true` on all seed inserts | Script never fails on re-run | Silently skips updates, hard to debug, state diverges from intent | Only for append-mode seeding; not for reset-and-seed |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Auth.js session in dropdowns | Reading stale JWT session data after profile updates | Call `revalidatePath()` after updates, or include dynamic data in JWT via session callback |
| Next.js Link in mobile menu | Expecting navigation to reset state | Explicitly call `setIsOpen(false)` on link click, or use pathname effect |
| Prisma foreign keys in seed | Creating child records before parents exist | Create in dependency order: users → gigs → orders → reviews |
| Faker.js with Herafi context | Using default English locale | Use `faker/locale/ar` or mix locales; create domain-specific generators |
| Headless UI components | Fighting default accessibility features | Trust the library's ARIA implementation; don't override unless necessary |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Querying `isProvider` on every Header render | Works fine initially | Include `isProvider` in JWT session via session callback; avoid separate DB query per request | 100+ concurrent users (extra DB load) |
| Seeding 10,000 records with individual `create()` calls | Script takes 5+ minutes, possible timeouts | Use `createMany()` in batches of 1000; consider SQL imports for very large datasets | 1,000+ seed records |
| Loading all gig images in mobile menu dropdown | Not applicable (no images in nav) | N/A | N/A |
| Event listeners not cleaned up in dropdowns | Memory leaks accumulate over time | Always return cleanup function from useEffect; remove listeners on unmount | After extended SPA session (hours of use without refresh) |
| Fetching session on every header interaction | Noticeable lag on slow connections | Session is fetched server-side once per page; pass as props to client components | Not a real issue with current architecture |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing full session object to client components | Leaks sensitive user data (email, hashed password field names) to client bundle | Only pass needed fields (id, name, isProvider) as props; keep session.user minimal |
| Using predictable seed data emails in production | Test accounts discoverable, potential unauthorized access | Use distinct seed data patterns (e.g., `seed-*@herafi.local`); never run seed in production |
| Client-side `isProvider` check without server verification | User can manipulate client state to access provider features | Always verify permissions server-side in API routes and Server Actions |
| Seed script committing with actual test passwords | Leaked credentials if repo becomes public | Use environment variable for seed passwords, never commit real passwords, use `bcrypt` even for seed data |
| Dropdown menu leaking user data in HTML comments | Debug info visible in source | Remove all debug logging before production; audit rendered HTML |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hamburger menu doesn't close on navigation | Users confused, content hidden behind overlay, requires manual close every time | Auto-close menu on link click or pathname change |
| No visual feedback when dropdown opens | Users unsure if click registered, click multiple times | Add subtle animation (scale, fade), clear expanded state indicator |
| Desktop navigation cut off at narrow widths | Links overlap or disappear between md breakpoint and full desktop | Test at all breakpoints (768px, 1024px transitions); adjust breakpoint or reduce link text |
| User avatar shows "U" for users without names | Impersonal, doesn't match rest of UI polish | Use first letter of email as fallback, or default to user icon SVG |
| Mobile menu overlaps header logo | Users can't see branding, confusing navigation | Use `top-16` offset for menu overlay to clear header |
| Long usernames overflow dropdown button | Layout breaks, text cut off | Truncate with ellipsis: `className="truncate max-w-[120px]"` |
| Provider Dashboard link visible to non-providers | Confusion, leads to error page or empty dashboard | Only show link when `isProvider === true` (already implemented correctly) |
| Dropdown opens upward on mobile, cut off by top | Menu items not visible or partially visible | Force downward direction: `top-full mt-2` instead of `bottom-full` |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Mobile menu:** Often missing auto-close on navigation — verify clicking each link closes overlay
- [ ] **User dropdown:** Often missing keyboard navigation — verify Enter to open, Escape to close, Tab through items
- [ ] **User dropdown:** Often missing click-outside handler — verify clicking elsewhere on page closes dropdown
- [ ] **User dropdown:** Often missing ARIA attributes — verify screen reader announces "expanded/collapsed" state
- [ ] **Seed script:** Often missing proper cleanup order — verify running twice doesn't cause foreign key errors
- [ ] **Seed script:** Often missing idempotency — verify script can run multiple times without manual DB reset
- [ ] **Seed data:** Often missing edge cases — verify at least one user with no gigs, one gig with no images, one very long title
- [ ] **Seed data:** Often missing realistic variance — verify not all records have identical field lengths/counts
- [ ] **Navigation integration:** Often missing revalidation after updates — verify provider status change reflects immediately
- [ ] **Responsive design:** Often missing mid-breakpoint testing — verify navigation at 768px, 900px, 1024px, not just mobile/desktop extremes

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Server/client boundary violation | MEDIUM | Extract interactive components to separate client component files; pass server data as props; remove `"use client"` from Header |
| Menu state persists on navigation | LOW | Add `onClick={closeMenu}` to all Link components; wrap in single handler function for maintainability |
| Stale session in dropdown | MEDIUM | Add `revalidatePath('/')` after profile updates; or refactor session callback to include isProvider in JWT |
| Hydration mismatch from responsive check | LOW | Remove JavaScript viewport checks; use CSS-only responsive hiding with Tailwind classes |
| Orphaned foreign keys in seed data | HIGH | Drop database, fix schema `onDelete` directives, rewrite seed script with proper ordering, re-run migrations |
| Unrealistic mock data | MEDIUM | Replace basic Faker calls with domain-specific generators; add variance logic; re-run seed script |
| Missing keyboard navigation | MEDIUM | Add onKeyDown handlers for Enter/Space/Escape; add ARIA attributes; test with keyboard and screen reader |
| Non-idempotent seed script | LOW | Convert `create()` to `upsert()` for deterministic data; add `deleteMany()` in correct order for random data |
| Missing click-outside handler | LOW | Add useEffect with event listener; create ref for dropdown container; test outside-click behavior |
| Unrealistic relationships in seed | MEDIUM | Redesign seed data architecture with user segments; generate asymmetric distributions; re-run seed |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Server/client boundary violations | Phase 1 (Hamburger menu) | Verify Header remains Server Component; MobileNav is separate client component; props flow correctly |
| Menu state persistence | Phase 1 (Hamburger menu) | Click every navigation link; verify overlay closes automatically; test on mobile device |
| Auth session staleness | Phase 2 (User dropdown) | Update profile; verify dropdown reflects changes without manual refresh; check revalidatePath calls |
| Hydration mismatch | Phase 1 (Hamburger menu) | Check console for hydration errors; verify no window/document access during render; test SSR HTML |
| Orphaned foreign keys | Phase 3 (Mock data seeding) | Run seed script 3 times consecutively; verify no foreign key errors; query relations with include |
| Unrealistic mock data | Phase 3 (Mock data seeding) | Review seeded data in UI; verify variance in lengths/counts; check locale matches domain; test edge cases |
| Missing keyboard navigation | Phase 2 (User dropdown) | Navigate site with keyboard only (no mouse); verify Enter opens, Escape closes, Tab navigates items |
| Non-idempotent seed | Phase 3 (Mock data seeding) | Run seed script multiple times; verify success without manual DB cleanup; check for duplicate errors |
| Missing click-outside | Phase 2 (User dropdown) | Open dropdown; click elsewhere on page; verify dropdown closes; test on mobile with tap outside |
| Unrealistic relationships | Phase 3 (Mock data seeding) | Browse marketplace with seed data; verify order distribution realistic; check user segment variety |

## Sources

**Hydration and Server/Client Components:**
- [Text content does not match server-rendered HTML | Next.js](https://nextjs.org/docs/messages/react-hydration-error)
- [How to Fix 'Hydration Mismatch' Errors in Next.js](https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view)
- [Next.js Hydration Errors in 2026: The Real Causes, Fixes, and Prevention Checklist](https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702)
- [Getting Started: Server and Client Components | Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Directives: use client | Next.js](https://nextjs.org/docs/app/api-reference/directives/use-client)

**Auth.js v5 Session Management:**
- [Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5)
- [signOut not refreshing app and useSession does not get state from server side](https://github.com/nextauthjs/next-auth/discussions/11271)
- [NextAuth Session Status Stuck at "Loading" State](https://github.com/nextauthjs/next-auth/discussions/11172)
- [Next.js Session Management: Solving NextAuth Persistence Issues in 2025](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues)

**Mobile Menu UX and State:**
- [How to fix the burger menu when switching pages in next js](https://github.com/vercel/next.js/discussions/16316)
- [Mobile Navigation Patterns That Work in 2026](https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026)
- [Mobile Navigation UX Best Practices, Patterns & Examples (2026)](https://www.designstudiouiux.com/blog/mobile-navigation-ux/)
- [App Navigation UX Design: 8 Mistakes to Avoid for Better UX](https://ux4sight.com/blog/8-app-navigation-design-mistakes-to-avoid)

**Accessibility and Dropdown Menus:**
- [Accessible Navigation Menus: Pitfalls and Best Practices](https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/)
- [Does your navigation need an ARIA menu? Probably not.](https://blog.pope.tech/2026/02/10/does-your-navigation-need-an-aria-menu-probably-not/)
- [Mastering Web Accessibility: Making Drop-Down Menus User-Friendly](https://www.a11y-collective.com/blog/mastering-web-accessibility-making-drop-down-menus-user-friendly/)
- [Building Accessible Menu Systems](https://www.smashingmagazine.com/2017/11/building-accessible-menu-systems/)
- [ARIA: menu role - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menu_role)

**Prisma Seeding and Foreign Keys:**
- [Automate Database Seeding with Prisma in 2026](https://backlinksindiit.wixstudio.com/app-development-expe/post/complete-guide-to-prisma-seed-data-for-development)
- [Prisma Fake Data: The Ultimate Guide to Flawless Seeding](https://researchhub.blog/prisma-fake-data-ultimate-guide-seeding)
- [Emulate database integrity constraints using the Prisma ORM](https://blog.tericcabrel.com/database-integrity-prisma-orm/)
- [Special rules for referential actions in SQL Server and MongoDB | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)
- [Seeding | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

**Test Data Generation:**
- [Faker.js: Complete Guide to Generating Realistic Test Data with Best Practices](https://www.testmuai.com/learning-hub/faker-js/)
- [You Shouldn't Use Faker (or other test randomization libraries)](https://kevin.burke.dev/kevin/faker-js-problems/)
- [FakerJS](https://fakerjs.dev/)
- [Synthetic Data for Mobile Testing in 2026: GDPR Guide](https://vocal.media/01/synthetic-data-for-mobile-testing-in-2026-gdpr-guide)
- [5 Best Practices for Software Testing with Realistic Data in 2026](https://news.iowanewsheadlines.com/story/599193/5-best-practices-for-software-testing-with-realistic-data-in-2026.html)

---
*Pitfalls research for: Navigation menus and mock data seeding in Next.js 15 App Router marketplace*
*Researched: 2026-02-22*
