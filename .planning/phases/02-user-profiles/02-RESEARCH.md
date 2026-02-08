# Phase 2: User Profiles - Research

**Researched:** 2026-02-08
**Domain:** Next.js 15 user profiles with file uploads, image handling, dynamic routes
**Confidence:** HIGH

## Summary

Phase 2 implements user profiles with avatar and portfolio image uploads, profile editing, username-based public URLs, and a buyer/provider dual-identity system. Research focused on Next.js 15 Server Actions for file uploads, dynamic route handling with username slugs, image processing, form validation with Zod, and UI patterns for avatar cropping and portfolio carousels.

The standard approach uses Next.js 15 Server Actions with `fs.promises.writeFile` for local file storage to `/public/uploads`, Prisma schema extensions for profile data with username uniqueness, dynamic routes with `[username]` slugs, react-easy-crop for client-side avatar cropping, and Swiper or Embla Carousel for portfolio image galleries. Sharp is recommended for server-side image optimization but is optional for MVP if file size constraints are not strict.

**Primary recommendation:** Use Server Actions for progressive enhancement (forms work without JavaScript), store images locally for MVP simplicity, implement username-based URLs with `/u/[username]` pattern, use react-easy-crop for avatar cropping UX, and extend Prisma User model with profile fields rather than separate Profile table to reduce join complexity.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Avatar & image uploads:**
- Images stored on **local filesystem** (`/public/uploads`) — simple for MVP
- Avatar upload includes a **circle crop UI** so users can position and crop
- Portfolio displayed as a **horizontal carousel/slider** — click through work samples
- Claude's discretion on portfolio image limit

**Provider vs buyer identity:**
- Profile is **buyer-focused by default** — provider sections (services, portfolio) only appear if user has created gigs
- Separate **"Become a provider" flow** to set up provider info — intentional step, not just fields on the edit page
- Provider fields include: **skills, bio, years of experience, certifications, professional summary**
- Other users' profiles show a **"View services" button** as the primary CTA (placeholder until Phase 3 gigs exist)

**Profile editing experience:**
- **Dedicated edit page** at `/profile/edit` — clear separation from viewing
- **One form** with all fields and a single save button — no tabs or sections
- **Username-based public URLs** — e.g., `/u/ahmed` — users pick a unique username
- Claude's discretion on save behavior (instant vs preview)

### Claude's Discretion

- Profile header design (cover image vs minimal, layout choices)
- Section ordering on profile page (services, portfolio, reviews, about)
- Stats visibility and placement (rating, completed orders, member since)
- Single scroll vs tabbed navigation
- Portfolio image count limit
- Save flow (instant save vs preview confirmation)
- Exact spacing, typography, and visual styling
- Error and empty states

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

The established libraries/tools for implementing user profiles with file uploads in Next.js 15:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | App Router, Server Actions, dynamic routes | Official framework for the project |
| Prisma | 7.x | Database schema, User model extensions | Already in use, requires schema extension for profiles |
| Zod | 3.x | Form validation (client + server) | Industry standard for type-safe validation |
| fs/promises | Node.js built-in | File I/O for saving uploads to `/public/uploads` | No dependencies, works with Server Actions |
| react-easy-crop | 5.x | Client-side avatar cropping with circle mask | Lightweight, hook-based, actively maintained |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sharp | 0.33.x | Server-side image optimization/resizing | Optional for MVP, recommended for production |
| Swiper | 11.x | Portfolio image carousel | Most popular, touch-friendly, mobile-responsive |
| Embla Carousel | 8.x | Lightweight carousel alternative | If bundle size is critical |
| file-type | 19.x | Magic byte validation for uploads | Server-side security validation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-easy-crop | react-avatar-editor | Avatar editor has more features but heavier bundle, may have React 19 compat issues |
| Swiper | React Slick | Slick is older, less maintained, but simpler API |
| Local fs storage | Cloud storage (S3, Cloudinary) | Cloud adds complexity but scales better; defer to future phase |
| Username slugs | Numeric IDs | IDs are simpler but URLs less friendly and not required by user |

**Installation:**
```bash
npm install react-easy-crop zod
npm install sharp --save-optional # for image optimization (optional for MVP)
npm install swiper # for portfolio carousel
npm install file-type # for upload security
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── u/
│   │   └── [username]/
│   │       ├── page.tsx              # Public profile view
│   │       └── not-found.tsx         # Custom 404 for invalid usernames
│   ├── profile/
│   │   └── edit/
│   │       └── page.tsx              # Profile edit form
│   ├── provider/
│   │   └── setup/
│   │       └── page.tsx              # "Become a provider" flow
│   └── actions/
│       ├── profile.ts                # Profile update Server Actions
│       ├── upload-avatar.ts          # Avatar upload + crop processing
│       └── upload-portfolio.ts       # Portfolio image uploads
├── components/
│   ├── profile/
│   │   ├── ProfileHeader.tsx         # Avatar, name, stats
│   │   ├── ProfileAbout.tsx          # Bio section
│   │   ├── ProviderInfo.tsx          # Provider-only sections
│   │   └── PortfolioCarousel.tsx     # Portfolio image slider
│   └── forms/
│       ├── AvatarCropModal.tsx       # react-easy-crop integration
│       ├── ProfileEditForm.tsx       # Main edit form
│       └── ProviderSetupForm.tsx     # Provider onboarding form
├── lib/
│   ├── validations/
│   │   ├── profile.ts                # Zod schemas for profile data
│   │   └── username.ts               # Username validation rules
│   ├── file-upload.ts                # Shared upload utilities
│   └── image-processing.ts           # Sharp integration (if used)
└── public/
    └── uploads/
        ├── avatars/                  # User avatars
        └── portfolio/                # Portfolio images
```

### Pattern 1: Server Action File Upload

**What:** Handle file uploads in Server Actions using FormData, validate, generate unique filenames, and save to `/public/uploads`.

**When to use:** All file upload flows (avatar, portfolio).

**Example:**
```typescript
// Source: https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' }
  }

  // Generate unique filename: timestamp + random + original extension
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(7)
  const ext = file.name.split('.').pop()
  const filename = `avatar-${timestamp}-${randomStr}.${ext}`

  // Save to /public/uploads/avatars/
  const path = join(process.cwd(), 'public', 'uploads', 'avatars', filename)
  await writeFile(path, buffer)

  // Update user in database
  const imageUrl = `/uploads/avatars/${filename}`
  // ... update user.image field

  revalidatePath('/profile/edit')
  return { success: true, imageUrl }
}
```

### Pattern 2: Dynamic Username Routes with Validation

**What:** Use `[username]` dynamic segments, validate usernames exist in database, return 404 for invalid users.

**When to use:** Public profile pages at `/u/[username]`.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
// app/u/[username]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  // Fetch user by username
  const user = await prisma.user.findUnique({
    where: { username },
  })

  // Return 404 if user not found
  if (!user) {
    notFound()
  }

  return (
    <div>
      <h1>{user.name || user.username}</h1>
      {/* Profile content */}
    </div>
  )
}

// Optional: Pre-generate known usernames for performance
export async function generateStaticParams() {
  const users = await prisma.user.findMany({
    select: { username: true },
    take: 100, // Limit to popular profiles
  })
  return users.map((user) => ({ username: user.username }))
}
```

### Pattern 3: Form Validation with Zod + Server Actions

**What:** Use Zod schemas for type-safe validation on both client and server, return errors via `useActionState`.

**When to use:** Profile edit form, provider setup form.

**Example:**
```typescript
// Source: https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/
// lib/validations/profile.ts
import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be under 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores')
    .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
    .regex(/[a-zA-Z0-9]$/, 'Username must end with a letter or number'),
})

// app/actions/profile.ts
'use server'

import { revalidatePath } from 'next/cache'
import { profileSchema } from '@/lib/validations/profile'

export async function updateProfile(prevState: any, formData: FormData) {
  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio'),
    username: formData.get('username'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Check username uniqueness
  const existing = await prisma.user.findUnique({
    where: { username: validatedFields.data.username },
  })
  if (existing && existing.id !== session.user.id) {
    return {
      errors: { username: ['Username already taken'] },
    }
  }

  // Update profile
  await prisma.user.update({
    where: { id: session.user.id },
    data: validatedFields.data,
  })

  revalidatePath('/profile/edit')
  revalidatePath(`/u/${validatedFields.data.username}`)
  return { success: true }
}
```

### Pattern 4: Avatar Crop UI with react-easy-crop

**What:** Client-side avatar cropping with circle mask, export cropped area as blob for upload.

**When to use:** Avatar upload flow.

**Example:**
```typescript
// Source: https://www.npmjs.com/package/react-easy-crop
'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Point, Area } from 'react-easy-crop'

export function AvatarCropModal({ imageSrc, onComplete }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
    onComplete(croppedBlob)
  }

  return (
    <div className="relative h-96">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1} // Square crop
        cropShape="round" // Circle mask
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
      <button onClick={handleSave}>Save Avatar</button>
    </div>
  )
}

// Helper to extract cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
  })
}
```

### Pattern 5: Portfolio Carousel with Swiper

**What:** Horizontal image slider for portfolio work samples.

**When to use:** Profile page portfolio section (provider profiles only).

**Example:**
```typescript
// Source: https://www.bacancytechnology.com/blog/react-carousel
'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Image from 'next/image'

export function PortfolioCarousel({ images }: { images: string[] }) {
  if (!images.length) return null

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={16}
      slidesPerView={1}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {images.map((image, idx) => (
        <SwiperSlide key={idx}>
          <div className="relative aspect-video">
            <Image
              src={image}
              alt={`Portfolio ${idx + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
```

### Pattern 6: Conditional Provider Sections

**What:** Show provider-specific sections (services, portfolio, years of experience) only if user has created gigs.

**When to use:** Public profile page rendering.

**Example:**
```typescript
// app/u/[username]/page.tsx
export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { gigs: true }, // Count gigs (Phase 3)
      },
    },
  })

  if (!user) notFound()

  const isProvider = user._count.gigs > 0

  return (
    <div>
      <ProfileHeader user={user} />
      <ProfileAbout bio={user.bio} />

      {isProvider && (
        <>
          <ProviderInfo
            skills={user.skills}
            yearsExperience={user.yearsExperience}
            certifications={user.certifications}
            professionalSummary={user.professionalSummary}
          />
          <PortfolioCarousel images={user.portfolioImages} />
          {/* Services section (Phase 3) */}
        </>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Don't trust client-provided filenames:** Always generate unique server-side filenames to prevent path traversal attacks and collisions
- **Don't skip server-side validation:** Client-side validation is for UX; server-side is for security
- **Don't store images in database as blobs:** Use filesystem or cloud storage and store URLs in database
- **Don't use static paths for user-uploaded content:** Always validate file existence before rendering to avoid 404s on image tags
- **Don't skip `revalidatePath` after mutations:** Cache will serve stale data without explicit revalidation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image cropping UI | Custom canvas cropper | react-easy-crop | Touch gestures, zoom, circle mask, mobile-friendly, edge cases handled |
| File type validation | Check extension only | file-type (magic bytes) | Extensions can be spoofed; magic bytes validate actual file format |
| Username validation | Simple regex | Comprehensive Zod schema | Handles start/end chars, length, reserved words, database uniqueness |
| Image carousel | Custom slider | Swiper or Embla | Touch/swipe gestures, accessibility, keyboard nav, lazy loading |
| Unique filename generation | Timestamp only | Timestamp + random string + original ext | Prevents collisions from simultaneous uploads |
| Form state management | Manual useState for errors | useActionState hook | Progressive enhancement, handles pending states, integrates with Server Actions |

**Key insight:** File uploads and image handling have numerous security and UX edge cases. Modern libraries handle MIME type spoofing, path traversal, race conditions, touch gestures, accessibility, and progressive loading—all of which are easy to miss in custom implementations.

## Common Pitfalls

### Pitfall 1: Username Conflicts During Registration

**What goes wrong:** User completes registration but hasn't chosen a username yet; username is required for `/u/[username]` URLs.

**Why it happens:** Phase 1 (authentication) doesn't collect usernames; users need to set username post-registration.

**How to avoid:**
- Allow nullable `username` field in Prisma schema during Phase 2 migration
- Redirect users to "Complete Profile" flow after first login if `username` is null
- Alternatively, add username field to registration form in Phase 1 (requires backfill)
- For public URLs, fallback to `/u/[userId]` if username not set (graceful degradation)

**Warning signs:** Attempting to navigate to `/u/undefined` or database constraint errors on profile creation.

### Pitfall 2: Public Directory File Persistence on Vercel

**What goes wrong:** Files uploaded to `/public/uploads` disappear after deployment or serverless function execution.

**Why it happens:** Vercel and other serverless platforms have read-only filesystems; `/public` is immutable after build.

**How to avoid:**
- For MVP, document that local filesystem uploads require persistent server (VPS, AWS EC2, Railway)
- Plan migration path to cloud storage (Vercel Blob, S3, Cloudinary) for production
- Test file uploads in production-like environment early
- Consider environment variable flag to switch between local and cloud storage

**Warning signs:** Files upload successfully locally but 404 in production; re-deployment clears uploaded images.

### Pitfall 3: Missing `revalidatePath` After Profile Updates

**What goes wrong:** User updates profile, form shows success, but public profile page shows stale data.

**Why it happens:** Next.js caches page data; mutations don't automatically invalidate cache.

**How to avoid:**
- Call `revalidatePath('/profile/edit')` after edit form submission
- Call `revalidatePath('/u/[username]')` after username or profile changes
- If username changes, revalidate both old and new username paths
- For global changes (avatar), consider `revalidatePath('/', 'layout')` to clear all caches

**Warning signs:** User reports "changes didn't save" but database shows updated values; hard refresh fixes the issue.

### Pitfall 4: Race Conditions on Simultaneous Username Changes

**What goes wrong:** Two users claim the same username simultaneously; database accepts both due to timing.

**Why it happens:** Check-then-update pattern has time gap between uniqueness check and database write.

**How to avoid:**
- Rely on Prisma `@unique` constraint to enforce uniqueness at database level
- Catch `PrismaClientKnownRequestError` with code `P2002` (unique constraint violation)
- Return user-friendly error: "Username already taken, please try another"
- Don't trust application-level checks alone; always enforce at database level

**Warning signs:** Rare duplicate username errors in logs; users report "username taken" after validation passed.

### Pitfall 5: Large File Uploads Timing Out Server Actions

**What goes wrong:** User uploads 10MB avatar or multiple portfolio images; request times out or fails silently.

**Why it happens:** Server Actions have default payload size limits; large files exceed Next.js body size limit (default 4.5MB).

**How to avoid:**
- Configure `serverActions.bodySizeLimit` in `next.config.js` (e.g., `'10mb'`)
- Validate file size client-side before upload (instant feedback)
- Validate file size server-side as well (security)
- Consider chunked uploads or direct-to-cloud patterns for portfolio (multiple images)
- Compress images client-side before upload using browser-image-compression

**Warning signs:** Larger files fail to upload; no error message shown; timeout errors in server logs.

### Pitfall 6: Avatar Crop Losing Quality

**What goes wrong:** User uploads high-res photo, crops it, but saved avatar looks pixelated.

**Why it happens:** Canvas export uses low JPEG quality or crops at wrong resolution.

**How to avoid:**
- Export cropped canvas at full resolution (not downscaled preview size)
- Use high JPEG quality (0.95) or PNG for lossless export
- Optionally resize server-side with Sharp after upload for consistent sizing
- Store original uploaded file separately if user wants to re-crop later

**Warning signs:** Users complain avatars look "blurry" or "low quality" compared to original.

### Pitfall 7: Portfolio Images Not Loading on Profile Page

**What goes wrong:** Portfolio images uploaded successfully but don't render on profile; broken image icons appear.

**Why it happens:** `portfolioImages` stored as JSON string in database but accessed as array; or file paths incorrect.

**How to avoid:**
- Use Prisma `String[]` type for portfolio images (Postgres array)
- Store relative paths (`/uploads/portfolio/filename.jpg`) not absolute URLs
- Verify file exists in filesystem before rendering `<Image>` tag
- Handle empty portfolio gracefully (don't render carousel if no images)

**Warning signs:** Console errors `Failed to load resource: 404`; portfolio section renders but images broken.

## Code Examples

Verified patterns from official sources:

### Username Validation Schema

```typescript
// Source: Aggregated best practices from validation research
import { z } from 'zod'

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be under 20 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, dashes, and underscores'
  )
  .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
  .regex(/[a-zA-Z0-9]$/, 'Username must end with a letter or number')
  .refine(
    async (username) => {
      const existing = await prisma.user.findUnique({ where: { username } })
      return !existing
    },
    { message: 'Username already taken' }
  )
```

### Prisma Schema Extension for Profiles

```prisma
// Source: Project schema + research on profile patterns
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?   // Avatar URL
  hashedPassword String?
  accounts       Account[]
  sessions       Session[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Phase 2: Profile fields
  username       String?   @unique  // For /u/[username] URLs
  bio            String?   @db.Text

  // Provider-specific fields (nullable, only set if user becomes provider)
  isProvider             Boolean   @default(false)
  skills                 String[]  // Array of skill tags
  yearsExperience        Int?
  certifications         String[]
  professionalSummary    String?   @db.Text
  portfolioImages        String[]  // Array of image URLs

  // Phase 3: Gigs (for conditional provider sections)
  // gigs           Gig[]    // Uncomment in Phase 3
}
```

### File Type Validation with Magic Bytes

```typescript
// Source: https://www.npmjs.com/package/file-type
import { fileTypeFromBuffer } from 'file-type'

export async function validateImageUpload(file: File): Promise<{ valid: boolean; error?: string }> {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  // Check file size
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be under 5MB' }
  }

  // Check MIME type (client-provided, not trusted)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, or WebP' }
  }

  // Verify actual file type using magic bytes
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileType = await fileTypeFromBuffer(buffer)

  if (!fileType || !ALLOWED_TYPES.includes(fileType.mime)) {
    return { valid: false, error: 'Invalid file format detected' }
  }

  return { valid: true }
}
```

### Progressive Enhancement Profile Edit Form

```typescript
// Source: https://nextjs.org/docs/app/guides/forms
'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/profile'

export function ProfileEditForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name">Display Name</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={user.name || ''}
          required
          disabled={pending}
        />
        {state?.errors?.name && (
          <p className="text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          defaultValue={user.username || ''}
          pattern="[a-zA-Z0-9_-]+"
          minLength={3}
          maxLength={20}
          required
          disabled={pending}
        />
        <p className="text-sm text-gray-600">
          Your profile will be at herafi.com/u/your-username
        </p>
        {state?.errors?.username && (
          <p className="text-red-600">{state.errors.username[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ''}
          maxLength={500}
          rows={4}
          disabled={pending}
        />
        {state?.errors?.bio && (
          <p className="text-red-600">{state.errors.bio[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
      >
        {pending ? 'Saving...' : 'Save Profile'}
      </button>

      {state?.success && (
        <p className="text-green-600">Profile updated successfully!</p>
      )}
    </form>
  )
}
```

### Image Optimization with Sharp (Optional)

```typescript
// Source: https://sharp.pixelplumbing.com/api-resize/
import sharp from 'sharp'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function processAndSaveAvatar(
  buffer: Buffer,
  userId: string
): Promise<string> {
  const filename = `avatar-${userId}-${Date.now()}.jpg`
  const outputPath = join(process.cwd(), 'public', 'uploads', 'avatars', filename)

  // Resize to 250x250, convert to JPEG, optimize
  await sharp(buffer)
    .resize(250, 250, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 90, progressive: true })
    .toFile(outputPath)

  return `/uploads/avatars/${filename}`
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API routes for uploads | Server Actions | Next.js 13+ (2023) | Progressive enhancement, simpler code, no separate API layer |
| Pages Router dynamic routes | App Router `[slug]` | Next.js 13+ (2023) | Async params, better TypeScript support, nested layouts |
| `getServerSideProps` | `async` Server Components | Next.js 13+ (2023) | Fetch data directly in components, less boilerplate |
| react-avatar-editor | react-easy-crop | 2024-2025 | Lighter, better mobile support, modern hooks API |
| ImageMagick/GraphicsMagick | Sharp | 2020+ | 4-5x faster, better quality, Node.js native |
| Separate Profile model | Extended User model | Varies | For 1:1 relationships, embedding reduces joins; separate table for optional data |
| Manual form state | `useActionState` hook | React 19 (2024) | Progressive enhancement, integrates with Server Actions |

**Deprecated/outdated:**
- react-avatar-editor: Still functional but less maintained; React 19 compatibility unclear; heavier bundle
- API routes for mutations: Server Actions are now preferred for form handling
- `useFormState`: Renamed to `useActionState` in React 19

## Open Questions

Things that couldn't be fully resolved:

1. **Should we pre-create `/public/uploads/avatars` and `/public/uploads/portfolio` directories?**
   - What we know: Node.js `fs.writeFile` will fail if parent directory doesn't exist
   - What's unclear: Whether to create dirs in schema migration, startup script, or handle dynamically
   - Recommendation: Create directories in setup script or check/create in upload action using `fs.mkdir({ recursive: true })`

2. **Portfolio image limit for MVP?**
   - What we know: User decided carousel UI but deferred image count limit to Claude's discretion
   - What's unclear: Balance between showcase value and performance (file size, loading)
   - Recommendation: Limit to 5-8 images for MVP (Fiverr uses 3-10); increase in future phase if needed

3. **Should username be required or optional initially?**
   - What we know: Public URLs need username (`/u/[username]`); Phase 1 registration doesn't collect it
   - What's unclear: Whether to block profile viewing until username set or allow fallback to ID
   - Recommendation: Make username required before user can view their profile; prompt on first dashboard visit

4. **Sharp installation for MVP?**
   - What we know: Sharp is optional but recommended; adds ~15MB to node_modules
   - What's unclear: Whether MVP performance requires optimization or if raw uploads are acceptable
   - Recommendation: Skip Sharp for Phase 2 MVP; add in Phase 8 (UI polish) if image sizes become a concern

5. **How to handle username changes and URL redirects?**
   - What we know: Old `/u/old-username` URLs will 404 after username change
   - What's unclear: Whether to track previous usernames and redirect, or accept 404s
   - Recommendation: For MVP, accept 404s (simpler); in future, add `previousUsernames: String[]` field and redirect

## Sources

### Primary (HIGH confidence)

- [Next.js Dynamic Routes Official Docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Dynamic [slug] parameters, accessing params in Server Components
- [Next.js Forms and Server Actions Official Docs](https://nextjs.org/docs/app/guides/forms) - Form handling, validation, useActionState hook
- [Next.js revalidatePath Official Docs](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) - Cache invalidation after mutations
- [Strapi: Next.js 15 File Upload Tutorial](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions) - Server Actions file upload pattern
- [Sharp Official Docs](https://sharp.pixelplumbing.com/) - Image optimization and resizing

### Secondary (MEDIUM confidence)

- [LogRocket: React Image Cropping Libraries](https://blog.logrocket.com/top-react-image-cropping-libraries/) - react-easy-crop comparison
- [Bacancy: React Carousel Libraries 2026](https://www.bacancytechnology.com/blog/react-carousel) - Swiper and carousel options
- [Enstacked: React Carousel Comparison](https://enstacked.com/react-carousel-component-libraries/) - Carousel library benchmarks
- [FreeCodeCamp: Next.js Forms with Zod](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/) - Zod validation patterns
- [OneUpTime: Next.js File Uploads Guide](https://oneuptime.com/blog/post/2026-01-24-nextjs-file-uploads/view) - File upload best practices
- [TheLinuxCode: Next.js Dynamic Routes 2026 Guide](https://thelinuxcode.com/nextjs-dynamic-route-segments-in-the-app-router-2026-guide/) - 2026 dynamic route patterns
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) - Security best practices
- [Transloadit: Magic Numbers Security](https://transloadit.com/devtips/secure-api-file-uploads-with-magic-numbers/) - Magic byte validation

### Tertiary (LOW confidence)

- [GitHub: react-avatar-editor](https://github.com/mosch/react-avatar-editor) - Avatar editor library
- [npm: react-easy-crop](https://www.npmjs.com/package/react-easy-crop) - Avatar cropper library
- [npm: file-type](https://github.com/sindresorhus/file-type) - Magic byte validation library
- [Prisma Discussions: File Uploads](https://github.com/prisma/prisma/discussions/11795) - Community patterns for file references

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs, established libraries with recent updates
- Architecture: HIGH - Patterns verified in Next.js 15 official docs and recent tutorials
- Pitfalls: MEDIUM-HIGH - Drawn from community discussions and production experience reports
- Security: HIGH - OWASP guidelines and security-focused research

**Research date:** 2026-02-08
**Valid until:** ~30 days (stable stack, Next.js 15 mature, libraries updated recently)
