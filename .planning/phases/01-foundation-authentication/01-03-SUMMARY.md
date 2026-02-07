---
phase: 01-foundation-authentication
plan: 03
subsystem: ui
tags: [react-hook-form, tailwind, middleware, route-protection, dashboard]
dependencies:
  requires:
    - 01-02
  provides:
    - auth-ui-pages
    - route-protection-middleware
    - protected-dashboard
  affects:
    - 02-user-profiles
    - 03-service-listings
tech-stack:
  added: []
  patterns:
    - react-hook-form-with-zod
    - auth-layout-pattern
    - middleware-route-protection
    - server-component-auth-check
key-files:
  created:
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/dashboard/page.tsx
    - middleware.ts
  modified: []
decisions:
  - decision: Use Auth.js middleware wrapper pattern
    rationale: Auth.js v5 provides auth() wrapper for middleware that automatically handles session checking and provides req.auth. Simpler than manual session verification.
    impact: Middleware uses auth((req) => {...}) pattern. Session available as req.auth, boolean check with !!req.auth.
  - decision: Orange/amber warm color scheme for Herafi branding
    rationale: Service marketplace needs approachable, trustworthy feel. Warm tones convey friendliness and human connection.
    impact: Tailwind classes use orange-600/700 for primary actions, orange-50/amber-50 for backgrounds, consistent across auth and dashboard.
  - decision: Defense-in-depth for protected routes
    rationale: Both middleware and Server Component check authentication. Middleware catches most cases, Server Component provides fallback if middleware config matcher has gaps.
    impact: Dashboard page calls auth() and redirects if no session, even though middleware should catch unauthenticated access first.
metrics:
  duration: 12min
  completed: 2026-02-07
---

# Phase 01 Plan 03: Auth UI & Route Protection Summary

Complete authentication UI with React Hook Form, Zod validation, warm Tailwind styling, middleware route protection, and protected dashboard.

## What Was Built

**Objective achieved:** Built login and registration pages with React Hook Form + Zod validation, created protected dashboard showing user info with sign-out, and implemented middleware-based route protection. Full auth flow now works end-to-end with session persistence and proper error handling.

**Core capabilities delivered:**

1. **Auth Layout (src/app/(auth)/layout.tsx)**
   - Centered layout with full viewport height
   - Gradient background: orange-50 → amber-50 → orange-100
   - Herafi branding with tagline "Find trusted service providers"
   - White card container with shadow for form content
   - Max-width 400px for optimal form readability

2. **Registration Page (src/app/(auth)/register/page.tsx)**
   - Client component with React Hook Form
   - Three fields: name, email, password
   - Zod validation with zodResolver(registerSchema)
   - Field-level error display below each input
   - Server error display in red alert box above form
   - Disabled state with "Creating account..." loading text
   - Success: router.push("/dashboard") + router.refresh()
   - Link to login page for existing users
   - Orange-themed submit button with hover effect

3. **Login Page (src/app/(auth)/login/page.tsx)**
   - Client component with React Hook Form
   - Two fields: email, password
   - Zod validation with zodResolver(loginSchema)
   - Generic error message for auth failures
   - Disabled state with "Signing in..." loading text
   - Success: router.push("/dashboard") + router.refresh()
   - Link to register page for new users
   - Consistent styling with register page

4. **Route Protection Middleware (middleware.ts)**
   - Auth.js v5 middleware wrapper: auth((req) => {...})
   - Checks req.auth for authentication status
   - Redirects authenticated users from /login and /register to /dashboard
   - Redirects unauthenticated users from /dashboard to /login
   - Matcher excludes API routes, static files, and Next.js internals
   - Clean separation of auth pages vs protected pages

5. **Protected Dashboard (src/app/dashboard/page.tsx)**
   - Server Component with async auth() call
   - Defense-in-depth: redirects to /login if no session
   - Displays user name and email from session
   - Sign-out form with server action using signOut({ redirectTo: "/login" })
   - Warm gradient background matching auth pages
   - Card layout with welcome message and account info

## How It Works

**Registration flow:**
1. User visits /register
2. Fills in name, email, password
3. React Hook Form validates with Zod (client-side)
4. On submit: calls registerUser server action
5. Server action validates, hashes password, creates user, auto-signs in
6. Success: redirects to /dashboard with router.refresh() to update server state
7. Error: displays field errors or general error in red alert

**Login flow:**
1. User visits /login (or redirected from /dashboard if unauthenticated)
2. Fills in email, password
3. React Hook Form validates with Zod
4. On submit: calls loginUser server action
5. Server action validates, calls Auth.js signIn
6. Auth.js authorize function checks password with bcrypt
7. Success: JWT token created, redirects to /dashboard
8. Error: displays "Invalid email or password" (generic for security)

**Route protection:**
1. Middleware intercepts all requests (except static files)
2. Checks req.auth from Auth.js wrapper
3. If authenticated + on /login or /register → redirect to /dashboard
4. If unauthenticated + on /dashboard → redirect to /login
5. Otherwise: allow request to continue

**Session persistence:**
1. JWT token stored in httpOnly cookie
2. 30-day expiration from Auth.js config
3. Automatically included in requests
4. auth() in Server Components reads token and returns session
5. Middleware reads token and populates req.auth
6. Session persists across page refresh and browser close

**Sign-out:**
1. User clicks "Sign out" button on dashboard
2. Form submits server action: signOut({ redirectTo: "/login" })
3. Auth.js clears session cookie
4. User redirected to /login
5. Middleware will now redirect to /login if they try to access /dashboard

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**PostgreSQL database connection issue (resolved before checkpoint)**

During Task 3 verification, discovered PostgreSQL wasn't running locally:
- **Problem:** Auth flow failed when trying to create/query users
- **Root cause:** PostgreSQL not installed on development machine
- **Resolution (by orchestrator between executor runs):**
  1. Installed PostgreSQL 17 via Homebrew
  2. Created postgres user and herafi database
  3. Fixed .env.local: replaced Prisma v7 prisma+postgres:// URL with standard postgresql:// URL pointing to localhost:5432
  4. Ran npx prisma db push to sync schema to database
- **Impact:** Full auth flow now works. Database connection issue was environmental, not code-related.

This was a setup issue, not a deviation from the plan. Once PostgreSQL was configured, all must-haves passed verification.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create auth pages (login, register) with React Hook Form | 57801ed | src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx |
| 2 | Create protected dashboard and middleware route protection | 5b229eb | middleware.ts, src/app/dashboard/page.tsx |
| 3 | Verify complete auth flow | CHECKPOINT APPROVED | User verified all must-haves working |

## Verification Results

All must-haves verified and approved by user:

- ✅ User can create account via register page with name, email, password
- ✅ User can log in via login page with email and password
- ✅ User is redirected to dashboard after successful login/registration
- ✅ Unauthenticated user is redirected to login when accessing dashboard
- ✅ Authenticated user is redirected to dashboard when accessing login/register
- ✅ User sees validation errors for invalid input (client-side Zod validation)
- ✅ User sees error message for wrong credentials or duplicate email
- ✅ Session persists across browser refresh (JWT token in httpOnly cookie)

Additional verification by user:
- ✅ Session persists across browser close/reopen (30-day JWT expiration)
- ✅ Sign-out works and redirects to login
- ✅ Form styling is polished with warm orange/amber theme
- ✅ Loading states show during form submission

## Files Created/Modified

**Created:**
- `src/app/(auth)/layout.tsx` - Centered auth layout with Herafi branding and warm gradient background
- `src/app/(auth)/login/page.tsx` - Login form with email/password, React Hook Form, Zod validation, error handling
- `src/app/(auth)/register/page.tsx` - Registration form with name/email/password, validation, server error display
- `src/app/dashboard/page.tsx` - Protected dashboard Server Component showing user info with sign-out button
- `middleware.ts` - Auth.js middleware wrapper for route protection (auth pages ↔ dashboard redirects)

**Modified:**
- None

## Decisions Made

1. **Auth.js middleware wrapper pattern**
   - Why: Auth.js v5 provides auth() wrapper that automatically handles session checking
   - Trade-off: Slightly different syntax than raw middleware, but much cleaner and type-safe
   - Impact: Middleware has access to req.auth with session data, no manual JWT parsing needed

2. **Orange/amber warm color scheme**
   - Why: Service marketplace needs approachable, trustworthy visual identity
   - Trade-off: Bold color choice (not neutral gray), but distinctive and friendly
   - Impact: Orange-600 primary buttons, amber gradient backgrounds, consistent across all auth/dashboard pages

3. **Defense-in-depth route protection**
   - Why: Middleware catches most cases, but Server Component provides safety net
   - Trade-off: Slight redundancy, but ensures protected routes stay protected even if middleware config has gaps
   - Impact: Dashboard page calls auth() and redirects if no session, even though middleware should already redirect

4. **router.refresh() after auth actions**
   - Why: Ensures server state (session) is updated immediately after login/register
   - Trade-off: Extra request, but prevents stale server data in Server Components
   - Impact: Dashboard shows correct user info immediately after redirect

## Next Phase Readiness

**Ready for:** Phase 2 - User Profiles & Service Provider Setup

**Blockers:** None

**What's complete:**
- Full authentication flow (register, login, sign-out)
- Session persistence (JWT with 30-day expiration)
- Route protection (middleware + Server Component checks)
- Polished UI with warm branding
- Form validation (client-side Zod + server-side validation)
- Error handling (field-level and general errors)
- Database integration (Prisma with PostgreSQL)

**Notes for next phase:**
- User model exists with id, name, email, hashedPassword
- Session provides user.id, user.name, user.email
- Protected routes can use auth() in Server Components
- Middleware automatically redirects unauthenticated users
- Ready to add profile pages, edit functionality, service provider onboarding

**Database requirement:**
- PostgreSQL must be running locally for development
- Connection string: postgresql://postgres@localhost:5432/herafi
- Schema synced with `npx prisma db push`

## Self-Check: PASSED

All created files exist:
- ✓ src/app/(auth)/layout.tsx
- ✓ src/app/(auth)/login/page.tsx
- ✓ src/app/(auth)/register/page.tsx
- ✓ src/app/dashboard/page.tsx
- ✓ middleware.ts

All commits exist:
- ✓ 57801ed (Task 1)
- ✓ 5b229eb (Task 2)
