# Phase 1: Foundation & Authentication - Research

**Researched:** 2026-02-07
**Domain:** Next.js 15 App Router Authentication with Auth.js v5
**Confidence:** HIGH

## Summary

Phase 1 establishes the authentication foundation for Herafi using Next.js 15 App Router with Auth.js v5 (NextAuth.js v5 beta) and Prisma/PostgreSQL. The research confirms that Auth.js v5 is production-ready as of 2026, with a complete rewrite optimizing for App Router compatibility. The standard approach uses credentials-based authentication (email/password) with bcrypt for password hashing, HTTP-only cookies for session storage, and Prisma adapter for database persistence.

For a services marketplace MVP, the recommended stack centers on Auth.js v5 with database sessions for immediate revocation capability, Prisma adapter for PostgreSQL integration, and middleware-based route protection. This provides secure, scalable authentication that satisfies all Phase 1 requirements (AUTH-01, AUTH-02, AUTH-03) while setting up infrastructure for future phases.

**Primary recommendation:** Use Auth.js v5 with Prisma adapter, database sessions, credentials provider with bcrypt password hashing, and Next.js middleware for route protection. This balances security, developer experience, and future extensibility.

## Standard Stack

The established libraries/tools for Next.js 15 authentication in 2026:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **next-auth** | 5.x beta | Authentication framework | Auth.js v5 is the successor to NextAuth v4, fully rewritten for App Router with universal `auth()` function. Production-ready as of 2026. Zero-config Next.js integration. |
| **@auth/prisma-adapter** | Latest | Database adapter | Official Auth.js adapter for Prisma. Provides all required database models (User, Account, Session, VerificationToken). |
| **bcrypt** or **bcryptjs** | 5.x / 2.x | Password hashing | Industry-standard password hashing with salt rounds. bcrypt for Node.js, bcryptjs for edge/serverless compatibility. |
| **zod** | 3.x | Schema validation | Runtime validation for form inputs. Shares schemas between client and server. TypeScript-first with excellent error messages. |
| **prisma** | 5.x | ORM & migrations | Already project standard (from STACK.md). Type-safe database access, migration management. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-hook-form** | 7.x | Form state management | Complex forms with client-side validation. Integrates seamlessly with Zod via `@hookform/resolvers/zod`. |
| **@hookform/resolvers** | 3.x | RHF + Zod bridge | Connects React Hook Form with Zod schemas for unified validation. |
| **next-themes** | 0.3.x+ | Theme management (optional) | If implementing dark mode for login/register pages. Not critical for Phase 1. |
| **server-only** | Latest | Import protection | Prevents accidental import of server-only code (API keys, session logic) in client components. Essential for security. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auth.js v5 | Clerk | Managed auth with hosted UI. Faster setup but vendor lock-in, more expensive at scale ($25-$499/mo). Good for non-technical teams. |
| Auth.js v5 | Supabase Auth | Tight integration if using Supabase for database. Herafi uses Prisma/PostgreSQL stack, less synergy. |
| Auth.js v5 | Custom JWT auth | Maximum control but requires implementing session management, token rotation, security audits. Not recommended unless specific requirements. |
| bcrypt | argon2 | More modern algorithm, better security. Less ecosystem support in JavaScript, requires native bindings. |
| Database sessions | JWT sessions | No database queries on auth checks, infinite scalability. Cannot revoke before expiration (security risk). |

**Installation:**
```bash
# Core authentication
npm install next-auth@beta @auth/prisma-adapter

# Password hashing
npm install bcrypt
npm install -D @types/bcrypt

# Validation
npm install zod

# Form handling
npm install react-hook-form @hookform/resolvers

# Security utilities
npm install server-only
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/                  # Route group for auth pages
│   │   ├── login/
│   │   │   └── page.tsx         # Login form
│   │   ├── register/
│   │   │   └── page.tsx         # Registration form
│   │   └── layout.tsx           # Auth-specific layout (optional)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # Auth.js API handlers
│   ├── middleware.ts            # Route protection at edge
│   └── layout.tsx               # Root layout with session provider
├── lib/
│   ├── auth.ts                  # Auth.js configuration
│   ├── db.ts                    # Prisma client singleton
│   └── validations/
│       └── auth.ts              # Zod schemas for auth forms
├── actions/
│   └── auth.ts                  # Server actions for auth operations
└── types/
    └── auth.ts                  # TypeScript auth types
```

### Pattern 1: Credentials Provider with Database Validation

**What:** Validate email/password credentials against database, hash passwords with bcrypt, return user object for session.

**When to use:** Email/password authentication for MVP. Foundation for all authenticated features.

**Example:**
```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { z } from "zod"

// Schema for credential validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" }, // Use database sessions for revocation
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input format
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.hashedPassword) return null

        // Verify password
        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) return null

        // Return user object (saved to session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Attach user ID to session for queries
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
```

**Source:** [Auth.js Credentials Provider Documentation](https://authjs.dev/getting-started/providers/credentials), [Medium Guide: Auth.js v5 Complete Guide](https://medium.com/@vetriselvan_11/auth-js-nextauth-v5-credentials-authentication-in-next-js-app-router-complete-guide-ef77aaae7fdf)

### Pattern 2: Server Actions for Registration

**What:** Use Next.js Server Actions for user registration, keeping business logic server-side with client-side form handling.

**When to use:** User registration forms. Preferred over API routes for form submissions in App Router.

**Example:**
```typescript
// actions/auth.ts
"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { z } from "zod"
import { signIn } from "@/lib/auth"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export async function registerUser(formData: FormData) {
  // Validate input
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { email, password, name } = parsed.data

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existingUser) {
    return { error: "User with this email already exists" }
  }

  // Hash password (10 salt rounds is standard)
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  try {
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        hashedPassword,
      },
    })

    // Auto-login after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    return { error: "Failed to create account. Please try again." }
  }
}
```

**Source:** [Medium: React Hook Form + Zod with Server Actions](https://medium.com/@ctrlaltmonique/how-to-use-react-hook-form-zod-with-next-js-server-actions-437aaca3d72d), [Next.js App Router Authentication Tutorial](https://nextjs.org/learn/dashboard-app/adding-authentication)

### Pattern 3: Middleware-Based Route Protection

**What:** Use Next.js middleware to protect routes at the edge, redirecting unauthenticated users before rendering.

**When to use:** Protect entire route groups (dashboard, profile, etc.). Runs before page renders for fast redirects.

**Example:**
```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register")
  const isProtectedPage = req.nextUrl.pathname.startsWith("/dashboard") ||
                          req.nextUrl.pathname.startsWith("/profile")

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

**Important:** Middleware provides fast redirects but should NOT be the only authorization check. Always verify sessions in Server Components and API routes as well.

**Source:** [Auth.js Protecting Routes Documentation](https://authjs.dev/getting-started/session-management/protecting), [Next.js Middleware Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

### Pattern 4: Client-Side Form with React Hook Form + Zod

**What:** Use React Hook Form for form state management with Zod for client-side validation, calling Server Actions on submit.

**When to use:** Login and registration forms. Provides instant feedback before server validation.

**Example:**
```typescript
// app/(auth)/register/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { registerUser } from "@/actions/auth"
import { useRouter } from "next/navigation"

// Same schema as server-side for consistency
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
    })

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("name", data.name)

    const result = await registerUser(formData)

    if (result.error) {
      // Handle error (show toast, set field errors, etc.)
      console.error(result.error)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input {...register("name")} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register("password")} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  )
}
```

**Source:** [AbstractAPI: Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form), [GitHub Discussion: Form Validation with RHF + Zod](https://github.com/orgs/react-hook-form/discussions/11209)

### Pattern 5: Session Access in Server Components

**What:** Retrieve authenticated user in Server Components without client-side state.

**When to use:** Any page that needs to display user-specific data or conditionally render based on auth status.

**Example:**
```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
    </div>
  )
}
```

**Source:** [Auth.js Documentation: Protecting Routes in Server Components](https://authjs.dev/getting-started/session-management/protecting)

### Anti-Patterns to Avoid

- **Storing auth tokens in localStorage:** Vulnerable to XSS attacks. Use HTTP-only cookies (Auth.js default).
- **Accepting user IDs from client:** Always derive user context from session, never trust client-provided IDs.
- **Skipping server-side validation:** Client validation can be bypassed. Always validate in Server Actions/API routes.
- **Using JWT sessions for marketplace:** Cannot revoke tokens before expiration. Use database sessions for immediate revocation.
- **Passing API keys to client components:** Leaks secrets. Use `server-only` package to prevent accidental imports.
- **Client-side only auth checks:** Render nothing if not authenticated, but still expose API routes. Protect at server/middleware level.
- **Hardcoding redirect URLs:** Use environment variables for redirect URLs to support multiple environments.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT implementation with token rotation, refresh logic, expiration | Auth.js with database sessions | Sessions have edge cases: multi-device, concurrent requests, token theft, revocation. Auth.js handles all of this. |
| Password hashing | Custom crypto.createHash() implementation | bcrypt or argon2 | Password hashing requires salt, proper rounds, timing attack resistance. Don't reinvent. |
| Password reset flow | Custom token generation, email templates, expiration logic | Auth.js Email Provider or dedicated service | Password reset has security pitfalls: timing attacks, token reuse, email verification. Use battle-tested solution. |
| Form validation | Manual regex patterns and error handling | Zod with shared schemas | Validation logic duplicated across client/server creates bugs. Zod provides single source of truth. |
| Route protection | Custom HOCs or client-side redirects | Next.js middleware + Auth.js | Client-side protection can be bypassed. Middleware runs at edge before rendering. |
| CSRF protection | Custom token generation in forms | Auth.js built-in CSRF protection | CSRF tokens need secure generation, validation, expiration. Auth.js handles automatically. |

**Key insight:** Authentication has decades of accumulated security knowledge. Every "simple" auth feature has edge cases that lead to vulnerabilities. Use Auth.js rather than building custom solutions.

## Common Pitfalls

### Pitfall 1: Storing Tokens in localStorage (XSS Vulnerability)

**What goes wrong:**
Storing JWT tokens or session IDs in localStorage makes them readable by any JavaScript code, including malicious scripts injected via XSS attacks. Attackers can steal tokens and impersonate users indefinitely.

**Why it happens:**
Developers prioritize convenience over security. localStorage is easy to use and persists across page refreshes, making it tempting for storing auth state.

**How to avoid:**
- Use HTTP-only cookies for session tokens (Auth.js default)
- Never store sensitive tokens in localStorage, sessionStorage, or cookies without HttpOnly flag
- Auth.js handles cookie management securely by default

**Warning signs:**
- Code includes `localStorage.setItem('token', ...)` or `localStorage.getItem('token')`
- Auth state managed entirely client-side
- Session retrieval doesn't use Auth.js `auth()` function

**Source:** [Medium: Robust Security & Authentication Best Practices](https://medium.com/@sureshdotariya/robust-security-authentication-best-practices-in-next-js-16-6265d2d41b13), [WorkOS: Top 5 Authentication Solutions 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026)

### Pitfall 2: Client-Side Authorization Checks Only

**What goes wrong:**
Protecting routes by returning `null` or redirecting in client components doesn't prevent direct API access. Attackers bypass UI protection by calling API routes directly, accessing unauthorized data.

**Why it happens:**
Teams assume UI-level protection is sufficient. Next.js has multiple entry points (pages, API routes, Server Actions), and client-side checks only protect one surface.

**How to avoid:**
- Always validate sessions in Server Components, API routes, and Server Actions
- Use middleware for initial route protection (fast redirects)
- Treat client-side checks as UX enhancement, not security
- Follow defense-in-depth: protect at multiple layers

**Warning signs:**
- Only checking `session` in client components
- API routes without `auth()` checks
- Server Actions without session validation
- Middleware marked as optional in security discussions

**Example of proper layered protection:**
```typescript
// Layer 1: Middleware (fast redirect)
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

// Layer 2: Server Component (data fetching)
export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login") // Should never hit if middleware works
  // Fetch user-specific data
}

// Layer 3: Server Action (mutations)
export async function updateProfile(data: FormData) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  // Perform update using session.user.id
}
```

**Source:** [Next.js Official Guide: Authentication](https://nextjs.org/docs/app/guides/authentication), [JavaScript Plain English: Stop Crying Over Auth](https://javascript.plainenglish.io/stop-crying-over-auth-a-senior-devs-guide-to-next-js-15-auth-js-v5-42a57bc5b4ce)

### Pitfall 3: Weak Password Requirements

**What goes wrong:**
Accepting short or simple passwords (e.g., "password123") allows attackers to compromise accounts via brute force or dictionary attacks. Users lose access to accounts, attackers gain unauthorized access to marketplace.

**Why it happens:**
Teams want to reduce signup friction and avoid annoying users with strict requirements. Security is traded for perceived UX improvement.

**How to avoid:**
- Require minimum 8 characters (industry standard as of 2026)
- Require at least one uppercase, one number (basic complexity)
- Consider password strength meter instead of hard rules
- Use zxcvbn or similar library to estimate password strength
- Reject common passwords (123456, password, etc.)
- Focus on length over complexity (passphrases are stronger)

**Warning signs:**
- No minimum password length validation
- Password schema accepts any string
- No feedback on password strength during registration
- Users can set "12345678" as password

**Recommended validation:**
```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .refine(
    (password) => !["password", "12345678", "qwerty"].includes(password.toLowerCase()),
    "Password is too common"
  )
```

**Source:** [FreeCodeCamp: How to Hash Passwords with bcrypt](https://www.freecodecamp.org/news/how-to-hash-passwords-with-bcrypt-in-nodejs/), [Clerk: Password-Based Authentication](https://clerk.com/blog/password-based-authentication-nextjs)

### Pitfall 4: bcrypt in Edge/Serverless Without Fallback

**What goes wrong:**
bcrypt uses native Node.js bindings that don't work in edge runtime or some serverless environments. Auth fails at runtime with cryptic errors about missing modules.

**Why it happens:**
Developers test locally (Node.js runtime) where bcrypt works fine, then deploy to Vercel Edge or Cloudflare Workers where it fails.

**How to avoid:**
- Use bcryptjs (pure JavaScript implementation) for edge compatibility
- Or detect runtime and use bcrypt (Node.js) vs bcryptjs (edge)
- Test deployment on actual edge runtime before production
- Auth.js documentation notes edge runtime considerations

**Warning signs:**
- Using bcrypt with middleware (middleware runs on edge)
- Deploying to Vercel Edge Functions without testing
- Build succeeds but auth fails in production

**Recommended approach:**
```typescript
// lib/password.ts
let bcryptModule: typeof import('bcrypt') | typeof import('bcryptjs')

if (process.env.NEXT_RUNTIME === 'edge') {
  bcryptModule = await import('bcryptjs')
} else {
  bcryptModule = await import('bcrypt')
}

export const hashPassword = (password: string) =>
  bcryptModule.hash(password, 10)

export const comparePassword = (password: string, hash: string) =>
  bcryptModule.compare(password, hash)
```

**Source:** [npm bcrypt documentation](https://www.npmjs.com/package/bcrypt), [LogRocket: Password Hashing with bcrypt](https://blog.logrocket.com/password-hashing-node-js-bcrypt/)

### Pitfall 5: Not Normalizing Email Addresses

**What goes wrong:**
User signs up with "User@Example.com", tries to log in with "user@example.com", gets "invalid credentials" error. Duplicate accounts created for same person with different casing.

**Why it happens:**
Email fields are case-sensitive by default in PostgreSQL. "User@Example.com" ≠ "user@example.com" in database lookups.

**How to avoid:**
- Normalize emails to lowercase before database operations (both registration and login)
- Add unique constraint on lowercase email in database
- Use Zod transform to lowercase emails automatically

**Warning signs:**
- Email field in database without lowercase normalization
- Users reporting "email already exists" but can't log in
- Same user has multiple accounts with different email casing

**Recommended implementation:**
```typescript
// Zod schema with normalization
const emailSchema = z.string()
  .email("Invalid email address")
  .transform(email => email.toLowerCase())

// Prisma model with unique constraint
model User {
  id             String  @id @default(cuid())
  email          String  @unique @map("email")
  // ...
}

// Always use lowercase in queries
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
})
```

**Source:** Developer best practice (common pattern across authentication systems)

### Pitfall 6: Session Doesn't Persist After Browser Refresh

**What goes wrong:**
User logs in successfully, but refreshing the page or reopening browser logs them out. Fails AUTH-03 requirement.

**Why it happens:**
- Using JWT strategy without proper cookie configuration
- Session cookie set as "session-only" (no maxAge)
- Middleware not configured to refresh session
- Missing session callback in Auth.js config

**How to avoid:**
- Use database sessions (default with Prisma adapter)
- Configure session maxAge (default 30 days is reasonable)
- Add middleware to keep session fresh
- Test browser refresh and "reopen browser" scenarios explicitly

**Warning signs:**
- Session lost on page refresh
- Users must re-login frequently
- Session exists but `auth()` returns null after refresh

**Recommended configuration:**
```typescript
// lib/auth.ts
export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
})

// middleware.ts - keeps session alive
export { auth as middleware } from "@/auth"
```

**Source:** [Clerk: NextAuth Session Persistence Issues](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues), [NextAuth Options Documentation](https://next-auth.js.org/configuration/options)

### Pitfall 7: Exposing Detailed Error Messages to Client

**What goes wrong:**
Returning "No user found with that email" vs "Invalid credentials" tells attackers which emails are registered. Enables account enumeration attacks.

**Why it happens:**
Developers want to provide helpful error messages to users. Security implications aren't obvious.

**How to avoid:**
- Return generic "Invalid email or password" for failed login
- Use same timing for "user not found" vs "wrong password" (prevent timing attacks)
- Log detailed errors server-side for debugging
- Never expose database errors or stack traces to client

**Warning signs:**
- Different error messages for "email not found" vs "wrong password"
- Registration returns "Email already exists" (enables enumeration)
- Error responses include stack traces or database errors

**Recommended approach:**
```typescript
// BAD - reveals whether email exists
if (!user) return { error: "No account with this email" }
if (!isValidPassword) return { error: "Incorrect password" }

// GOOD - generic message
if (!user || !isValidPassword) {
  return { error: "Invalid email or password" }
}

// For registration - consider NOT revealing if email exists
const existingUser = await prisma.user.findUnique({ where: { email } })
if (existingUser) {
  // Option 1: Generic error
  return { error: "Unable to create account" }

  // Option 2: Send email to existing user (don't tell attacker)
  // await sendEmail(email, "Someone tried to register with your email...")
  // return { success: true } // Pretend it worked
}
```

**Source:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), security best practices

### Pitfall 8: No Rate Limiting on Auth Endpoints

**What goes wrong:**
Attackers perform brute force attacks on login endpoint, trying thousands of password combinations. Server resources exhausted, legitimate users locked out.

**Why it happens:**
Rate limiting is seen as "nice to have" rather than essential security. MVP launches without it.

**How to avoid:**
- Implement rate limiting from day one
- Limit login attempts per IP (e.g., 5 attempts per 15 minutes)
- Limit registration attempts per IP
- Consider account lockout after multiple failures
- Use Upstash Rate Limit or similar service

**Warning signs:**
- No rate limiting code in auth actions
- Load testing shows login endpoint accepts unlimited requests
- No IP-based tracking in logs

**Recommended implementation:**
```typescript
// Using @upstash/ratelimit (Vercel-friendly)
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
})

export async function loginUser(formData: FormData) {
  const ip = headers().get("x-forwarded-for") ?? "unknown"
  const { success } = await ratelimit.limit(`login_${ip}`)

  if (!success) {
    return { error: "Too many login attempts. Please try again in 15 minutes." }
  }

  // Proceed with login logic...
}
```

**Note:** Rate limiting is critical but may be deferred to Phase 1.1 or Phase 2 if time is constrained. Document as technical debt.

**Source:** Security best practice, [Upstash Rate Limit documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

## Code Examples

Verified patterns from official sources:

### Complete Auth.js Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email().transform(email => email.toLowerCase()),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
```

**Source:** [Auth.js Installation Guide](https://authjs.dev/getting-started/installation?framework=next.js), [Auth.js Credentials Provider](https://authjs.dev/getting-started/providers/credentials)

### Prisma Schema for Auth.js

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?   // For credentials auth

  accounts       Account[]
  sessions       Session[]

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**Source:** [Auth.js Prisma Adapter Documentation](https://authjs.dev/getting-started/adapters/prisma)

### Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/herafi?schema=public"

# Auth.js
AUTH_SECRET="..." # Generate with: npx auth secret
AUTH_URL="http://localhost:3000" # Update for production

# Optional: For development
NEXTAUTH_URL="http://localhost:3000"
```

**Source:** [Auth.js Installation Guide](https://authjs.dev/getting-started/installation?framework=next.js)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v4 with Pages Router | Auth.js v5 with App Router | 2024-2025 | Universal `auth()` function works across all Next.js contexts. Better DX, simpler API. |
| Separate API routes for auth actions | Server Actions for mutations | Next.js 13+ (2023) | Reduces boilerplate, type-safe by default, better error handling. |
| JWT sessions only | Database sessions preferred | 2025+ | Better security (revocation), user tracking, compliance requirements. |
| Custom middleware for every route | Single middleware.ts with matcher | Next.js 12+ (2022) | Centralized logic, runs at edge, better performance. |
| Client-side session checking | Server Component session access | Next.js 13+ (2023) | No hydration mismatch, no loading states, SSR-friendly. |
| Manual password hashing implementation | bcrypt/bcryptjs standard | Always best practice | Security audits, timing attack resistance, proper salt rounds. |

**Deprecated/outdated:**
- **NextAuth.js v4:** Use Auth.js v5 for new projects (v4 still maintained but not recommended)
- **NEXTAUTH_ environment variables:** Auth.js v5 uses AUTH_ prefix
- **Pages Router patterns:** App Router is production-ready and preferred
- **JWT-only sessions for marketplaces:** Database sessions provide better security for sensitive transactions

## Open Questions

Things that couldn't be fully resolved:

1. **Should we implement email verification in Phase 1 or defer to Phase 2?**
   - What we know: Email verification adds signup friction but improves security. Auth.js supports email provider out of the box.
   - What's unclear: Whether marketplace trust/safety requires verified emails from day one, or if we can launch with basic auth.
   - Recommendation: Defer to Phase 2 (User Profiles). Focus Phase 1 on core auth flow (AUTH-01, AUTH-02, AUTH-03). Add verification as part of trust/safety features.

2. **Rate limiting implementation: Upstash vs custom solution?**
   - What we know: Upstash Rate Limit is Vercel-friendly, Redis-based, easy to implement. Custom solution gives control but more complexity.
   - What's unclear: Cost at scale (Upstash pricing), whether MVP traffic justifies paid service.
   - Recommendation: Start with Upstash free tier (good for MVP). Custom solution if costs become prohibitive later. Don't skip rate limiting entirely.

3. **Database session performance at scale: when do we need caching?**
   - What we know: Database sessions query on every authenticated request. At scale (10k+ concurrent users), this can be bottleneck.
   - What's unclear: Whether early optimization is needed, when to add Redis session cache.
   - Recommendation: Use database sessions for Phase 1 (simplicity). Monitor query performance in production. Add Redis caching only when metrics show bottleneck (likely 5k+ users).

4. **OAuth providers: should we structure for easy addition later?**
   - What we know: Project defers OAuth to v2. Auth.js supports adding providers easily.
   - What's unclear: Whether to create placeholder provider config now vs add later.
   - Recommendation: Don't add placeholder code. Auth.js makes adding providers trivial when needed. Keep Phase 1 focused on credentials auth.

## Sources

### Primary (HIGH confidence)

- [Auth.js Installation Guide](https://authjs.dev/getting-started/installation?framework=next.js) - Official installation steps for Next.js
- [Auth.js Credentials Provider](https://authjs.dev/getting-started/providers/credentials) - Official credentials provider documentation
- [Auth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma) - Official Prisma adapter setup
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) - Official route protection patterns
- [Next.js Official Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Next.js 15 App Router authentication
- [Next.js App Router Authentication Tutorial](https://nextjs.org/learn/dashboard-app/adding-authentication) - Official Next.js Learn tutorial

### Secondary (MEDIUM confidence)

- [Medium: Auth.js v5 Complete Guide (Jan 2026)](https://medium.com/@vetriselvan_11/auth-js-nextauth-v5-credentials-authentication-in-next-js-app-router-complete-guide-ef77aaae7fdf) - Recent comprehensive guide
- [WorkOS: Top 5 Authentication Solutions for Next.js 2026](https://workos.com/blog/top-authentication-solutions-nextjs-2026) - 2026 authentication landscape
- [JavaScript Plain English: Stop Crying Over Auth](https://javascript.plainenglish.io/stop-crying-over-auth-a-senior-devs-guide-to-next-js-15-auth-js-v5-42a57bc5b4ce) - Practical Auth.js v5 guide
- [Medium: React Hook Form + Zod with Server Actions](https://medium.com/@ctrlaltmonique/how-to-use-react-hook-form-zod-with-next-js-server-actions-437aaca3d72d) - Form validation patterns
- [AbstractAPI: Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Zod + RHF integration
- [Clerk: NextAuth Session Persistence Issues (2025)](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) - Session troubleshooting
- [Clerk: Complete Guide to Session Management](https://clerk.com/blog/complete-guide-session-management-nextjs) - Session management overview
- [Clerk: Password-Based Authentication in Next.js](https://clerk.com/blog/password-based-authentication-nextjs) - Password security patterns
- [FreeCodeCamp: How to Hash Passwords with bcrypt](https://www.freecodecamp.org/news/how-to-hash-passwords-with-bcrypt-in-nodejs/) - bcrypt implementation guide
- [LogRocket: Password Hashing with bcrypt](https://blog.logrocket.com/password-hashing-node-js-bcrypt/) - bcrypt best practices
- [Medium: Robust Security & Authentication Best Practices in Next.js 16](https://medium.com/@sureshdotariya/robust-security-authentication-best-practices-in-next-js-16-6265d2d41b13) - Security patterns
- [Nehalist.io: React Hook Form with Next.js Server Actions](https://nehalist.io/react-hook-form-with-nextjs-server-actions/) - Form handling patterns
- [Medium: Handling Forms with RHF, Zod, and Server Actions](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1) - Complete form guide

### Tertiary (LOW confidence)

- [GitHub: React Hook Form + Zod Discussion](https://github.com/orgs/react-hook-form/discussions/11209) - Community discussion on validation strategies
- [GitHub: NextAuth Session False on Refresh](https://github.com/nextauthjs/next-auth/discussions/704) - Community troubleshooting
- [GitHub: JWT vs Database Session Benefits](https://github.com/nextauthjs/next-auth/discussions/1571) - Community discussion on session strategies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Auth.js v5 is production-ready as of 2026, official documentation is comprehensive
- Architecture patterns: HIGH - Patterns verified with official Auth.js and Next.js documentation, multiple 2026 tutorials confirm approach
- Security pitfalls: HIGH - Based on OWASP guidelines, official documentation warnings, and recent 2026 articles on Next.js security
- Implementation details: HIGH - Code examples sourced from official documentation and verified 2026 tutorials

**Research date:** 2026-02-07
**Valid until:** 2026-04-07 (60 days - authentication patterns are stable, but check for Auth.js v5 GA release)

**Key takeaways for planner:**
1. Auth.js v5 is production-ready for Phase 1 implementation
2. Use database sessions (not JWT) for marketplace security requirements
3. Protect at multiple layers: middleware + Server Components + Server Actions
4. Validate on both client (UX) and server (security) with shared Zod schemas
5. bcrypt for password hashing, normalize emails to lowercase, generic error messages
6. Rate limiting is critical but can be deferred slightly if time-constrained
7. Email verification not needed in Phase 1, defer to Phase 2 for trust/safety features
