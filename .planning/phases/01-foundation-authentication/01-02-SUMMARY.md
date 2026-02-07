---
phase: 01-foundation-authentication
plan: 02
subsystem: authentication
tags: [auth.js, credentials, server-actions, validation]
dependencies:
  requires:
    - 01-01
  provides:
    - auth-config
    - validation-schemas
    - auth-server-actions
  affects:
    - 01-03
    - 01-04
tech-stack:
  added:
    - "@prisma/adapter-pg@7.3.0"
    - "pg@8.13.1"
    - "dotenv@16.4.7"
  patterns:
    - auth-js-v5-credentials
    - jwt-sessions
    - prisma-v7-adapter
    - zod-validation
    - server-actions
key-files:
  created:
    - src/lib/auth.ts
    - src/lib/validations/auth.ts
    - src/actions/auth.ts
    - src/app/api/auth/[...nextauth]/route.ts
  modified:
    - src/lib/db.ts
decisions:
  - decision: Use JWT sessions instead of database sessions for Credentials provider
    rationale: Auth.js v5 with Credentials provider requires manual session creation for database sessions. JWT strategy is simpler and works out-of-the-box with 30-day maxAge.
    impact: Sessions stored in JWT tokens, not database. Session table will be used for OAuth providers if added later.
  - decision: Use Prisma v7 with PostgreSQL adapter (@prisma/adapter-pg)
    rationale: Prisma v7 requires an adapter or accelerateUrl for client initialization. Using PrismaPg adapter with connection pool for PostgreSQL.
    impact: All Prisma operations go through the adapter. Added pg driver and @prisma/adapter-pg as dependencies.
  - decision: Return generic error for login failures
    rationale: Security best practice - don't reveal whether email or password is wrong to prevent user enumeration attacks.
    impact: loginUser always returns "Invalid email or password" for any auth failure.
metrics:
  duration: 4.9min
  completed: 2026-02-07
---

# Phase 01 Plan 02: Auth Backend Configuration Summary

Auth.js v5 with Credentials provider, JWT sessions (30-day maxAge), Zod validation, and server actions for registration/login.

## What Was Built

**Objective achieved:** Configured Auth.js v5 with Credentials provider and JWT sessions. Created shared Zod validation schemas for login and registration with email normalization and strong password rules. Implemented server actions for user registration and login with bcrypt password hashing and auto-sign-in after registration.

**Core capabilities delivered:**

1. **Shared Validation Schemas (src/lib/validations/auth.ts)**
   - loginSchema: email (lowercase transform), password (8+ chars)
   - registerSchema: name (2-50 chars), email (lowercase), strong password (8+ chars, uppercase, lowercase, number)
   - Exported TypeScript types: LoginInput, RegisterInput

2. **Auth.js Configuration (src/lib/auth.ts)**
   - Credentials provider with email/password authentication
   - JWT session strategy with 30-day maxAge
   - Prisma adapter for user storage
   - Custom sign-in page at /login
   - authorize function: validates with loginSchema, finds user by email, compares bcrypt password
   - JWT callback: includes user.id in token
   - Session callback: exposes user.id to session.user.id
   - Exports: handlers, signIn, signOut, auth

3. **Auth.js API Route (src/app/api/auth/[...nextauth]/route.ts)**
   - Exposes GET and POST handlers from Auth.js
   - Handles all Auth.js endpoints: /api/auth/signin, /api/auth/signout, /api/auth/session, etc.

4. **Server Actions (src/actions/auth.ts)**
   - registerUser: validates input, checks for duplicate email, hashes password with bcrypt (10 rounds), creates user in database, auto-signs in
   - loginUser: validates input, calls Auth.js signIn, returns generic error on failure
   - Both return { success?: boolean; error?: string | Record<string, string[]> }
   - "use server" directive for server-side execution

## How It Works

**Registration flow:**
1. User submits name, email, password
2. registerUser validates with registerSchema (field-level errors returned if validation fails)
3. Checks for existing user by email (case-insensitive)
4. Hashes password with bcrypt (10 rounds)
5. Creates user in database with hashedPassword
6. Auto-signs in via Auth.js credentials provider
7. Returns { success: true }

**Login flow:**
1. User submits email, password
2. loginUser validates with loginSchema
3. Calls Auth.js signIn("credentials", { email, password, redirect: false })
4. Auth.js calls authorize function in auth.ts:
   - Validates input again with loginSchema
   - Finds user by lowercase email
   - Returns null if user not found or no hashedPassword
   - Compares password with bcrypt.compare
   - Returns { id, email, name } on success
5. JWT token created with user.id
6. Returns { success: true }

**Session management:**
- JWT tokens stored in cookies (httpOnly, secure, sameSite)
- 30-day expiration
- session.user.id available in server components via auth()
- Session refresh handled automatically by Auth.js

**Key technical details:**
- Email normalized to lowercase in all schemas (prevents duplicate accounts with different casing)
- Strong password validation: 8+ chars, uppercase, lowercase, number
- Generic error messages for login (security best practice)
- Field-level validation errors for registration (UX best practice)
- Prisma v7 adapter pattern with PrismaPg and connection pool

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed dotenv for Prisma v7 config**
- **Found during:** Task 1 (npm run build)
- **Issue:** Prisma v7's prisma.config.ts requires dotenv to be installed (imports "dotenv/config")
- **Fix:** Installed dotenv as dev dependency
- **Files modified:** package.json, package-lock.json
- **Commit:** 99fc127 (included in Task 1 commit)

**2. [Rule 3 - Blocking] Configured Prisma v7 PostgreSQL adapter**
- **Found during:** Task 1 (npm run build)
- **Issue:** Prisma v7 requires either "adapter" or "accelerateUrl" for PrismaClient constructor. Error: "Using engine type 'client' requires either 'adapter' or 'accelerateUrl' to be provided"
- **Fix:** Installed @prisma/adapter-pg and pg driver. Updated src/lib/db.ts to use PrismaPg adapter with connection pool
- **Files modified:** package.json, package-lock.json, src/lib/db.ts
- **Commit:** 99fc127 (included in Task 1 commit)
- **Impact:** This is a breaking change in Prisma v7. Traditional PostgreSQL connections now require an adapter layer. Added 3 new dependencies: @prisma/adapter-pg, pg, @types/pg

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Auth.js config, validation schemas, and API route | 99fc127 | src/lib/auth.ts, src/lib/validations/auth.ts, src/app/api/auth/[...nextauth]/route.ts, src/lib/db.ts, package.json |
| 2 | Create server actions for registration and login | 376b01e | src/actions/auth.ts |

## Verification Results

All verification criteria passed:

- ✅ `npm run build` completes without errors
- ✅ Auth.js config exports handlers, signIn, signOut, auth
- ✅ Validation schemas export loginSchema, registerSchema, LoginInput, RegisterInput
- ✅ Server actions export registerUser, loginUser with "use server" directive
- ✅ API route exists at /api/auth/[...nextauth]

## Decisions Made

1. **JWT sessions instead of database sessions**
   - Why: Auth.js v5 Credentials provider works seamlessly with JWT strategy. Database sessions require manual session creation for Credentials provider
   - Trade-off: Sessions not queryable in database, but simpler implementation and better performance
   - Impact: 30-day session expiration, automatic refresh, user.id available in session

2. **Prisma v7 with PostgreSQL adapter**
   - Why: Prisma v7 requires adapter for client initialization
   - Trade-off: Added complexity (adapter + pool) but necessary for Prisma v7
   - Impact: Three new dependencies (@prisma/adapter-pg, pg, @types/pg), connection pooling pattern in db.ts

3. **Generic login error messages**
   - Why: Security best practice to prevent user enumeration
   - Trade-off: Less specific feedback for users, but protects against attackers discovering valid emails
   - Impact: loginUser always returns "Invalid email or password" regardless of which field is wrong

4. **Email normalization to lowercase**
   - Why: Prevents duplicate accounts (user@example.com vs USER@example.com)
   - Trade-off: None - transparent to users, emails are case-insensitive by RFC
   - Impact: All email comparisons are case-insensitive, database stores lowercase

## Next Phase Readiness

**Ready for:** Phase 01 Plan 03 (Auth UI - Login/Register Forms)

**Blockers:** None

**Notes:**
- Auth backend fully functional
- Server actions ready to be called from React Hook Form
- Validation schemas provide TypeScript types for form inputs
- Database migrations not applied (PostgreSQL not running locally - expected for development)
- Auth.js API endpoints available at /api/auth/*

**What's next:**
- Build login and registration forms with React Hook Form
- Create protected route layout
- Add sign-out functionality to UI
- Test full authentication flow end-to-end

## Self-Check: PASSED

All created files exist:
- ✓ src/lib/auth.ts
- ✓ src/lib/validations/auth.ts
- ✓ src/actions/auth.ts
- ✓ src/app/api/auth/[...nextauth]/route.ts

All commits exist:
- ✓ 99fc127 (Task 1)
- ✓ 376b01e (Task 2)
