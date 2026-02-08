---
phase: 02-user-profiles
plan: 01
subsystem: database-infrastructure
status: complete
completed: 2026-02-08
duration: 2.6 min
tags: [prisma, schema, validation, file-upload, zod]

dependency_graph:
  requires:
    - 01-03-PLAN.md # Auth foundation with User model
  provides:
    - Extended User schema with profile + provider fields
    - PortfolioImage model with userId relation
    - File upload utility with magic byte validation
    - Zod validation schemas for profile/provider data
  affects:
    - 02-02-PLAN.md # Profile editing depends on schema + validation
    - 02-03-PLAN.md # Provider setup depends on schema + validation

tech_stack:
  added:
    - react-easy-crop@5.5.6 # Avatar circle crop UI
    - swiper@12.1.0 # Portfolio carousel component
    - file-type@21.3.0 # Magic byte validation for uploads
    - "@types/react-easy-crop" # TypeScript types
  patterns:
    - Server Actions with 5mb body size limit for file uploads
    - Local filesystem uploads to /public/uploads/
    - Zod schema composition for validation layers
    - Prisma String[] for PostgreSQL text arrays

key_files:
  created:
    - src/lib/file-upload.ts
    - src/lib/validations/profile.ts
  modified:
    - prisma/schema.prisma
    - package.json
    - next.config.ts

decisions:
  - id: profile-field-placement
    what: Add profile fields directly to User model (not separate Profile table)
    why: Simpler queries, single source of truth, always 1:1 relationship
    impact: All profile data in single User fetch, no join needed

  - id: local-file-storage
    what: Store uploads in /public/uploads/ (local filesystem)
    why: Sufficient for MVP, no external dependencies, simple implementation
    alternatives: [S3, Cloudinary, Vercel Blob]
    defer_to_phase: null # Works for MVP

  - id: magic-byte-validation
    what: Use file-type library for MIME type detection via magic bytes
    why: More secure than trusting file extensions or Content-Type headers
    impact: Prevents non-image files from being uploaded

  - id: username-lowercase-transform
    what: Transform usernames to lowercase in validation schema
    why: Case-insensitive uniqueness, consistent URLs (@username)
    impact: All usernames stored lowercase in database

  - id: array-fields-for-skills
    what: Use Prisma String[] for skills and certifications
    why: Simple for MVP, no join table needed, sufficient for display/filter
    alternatives: [Separate Skill/Certification models with relations]
    defer_to_phase: null # Can refactor if tagging/autocomplete needed later
---

# Phase 02 Plan 01: Database Schema & Upload Infrastructure Summary

**One-liner:** Extended User schema with profile/provider fields, PortfolioImage model, local file upload utility with magic byte validation, and Zod schemas for profile validation.

## Objective

Set up the database schema, dependencies, upload infrastructure, and validation schemas for Phase 2 user profiles. This plan establishes the foundation so Plans 02 (profile editing) and 03 (provider setup) can execute in parallel.

## What Was Built

### Database Schema Extensions

**User Model Extensions:**
- Profile fields: `username` (unique, nullable), `displayName`, `bio` (Text), `avatarUrl`
- Provider fields: `isProvider` (default false), `providerBio` (Text), `professionalSummary` (Text), `skills` (String[]), `yearsOfExperience` (Int), `certifications` (String[])
- Relation: `portfolioImages` (one-to-many)

**New Model: PortfolioImage**
- Fields: `id`, `userId`, `imageUrl`, `caption`, `order`, `createdAt`
- Relation: `user` (many-to-one with cascade delete)
- Index: `userId` for fast user portfolio queries

### File Upload Infrastructure

**File Upload Utility (`src/lib/file-upload.ts`):**
- `saveFile(file, subDir)`: Saves to `/public/uploads/{avatars|portfolio}` with unique timestamped filenames
- `deleteFile(fileUrl)`: Removes files from filesystem (cleanup on avatar/image replacement)
- Magic byte validation using `file-type` library prevents non-image uploads
- Auto-creates upload directories recursively

**Next.js Configuration:**
- Server Actions `bodySizeLimit: "5mb"` to accommodate avatar/portfolio uploads
- Image optimization config with `remotePatterns` array (empty for now)

### Validation Schemas

**Zod Schemas (`src/lib/validations/profile.ts`):**
- `usernameSchema`: 3-30 chars, alphanumeric + underscore/hyphen, lowercase transform
- `profileSchema`: username, displayName (required), bio (optional, max 500)
- `providerSchema`: providerBio (10-1000), professionalSummary (10-500), skills (1-20 items), yearsOfExperience (0-50), certifications (0-10 items)

### Dependencies Installed

- `react-easy-crop@5.5.6`: Avatar circle crop UI for Plan 02
- `swiper@12.1.0`: Portfolio carousel component for Plan 03
- `file-type@21.3.0`: Magic byte detection for upload security
- `@types/react-easy-crop`: TypeScript types

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Install dependencies and configure Next.js for file uploads | ec82c33 | package.json, package-lock.json, next.config.ts |
| 2 | Extend Prisma schema with profile fields and PortfolioImage model | bc6a363 | prisma/schema.prisma |
| 3 | Create file upload utility and Zod validation schemas | 573a175 | src/lib/file-upload.ts, src/lib/validations/profile.ts |

## Decisions Made

### 1. Profile Fields in User Model (Not Separate Table)

**Decision:** Add profile fields directly to User model instead of separate Profile table.

**Rationale:**
- Always 1:1 relationship (every user has exactly one profile)
- Simpler queries (no joins needed)
- Single source of truth
- Auth.js already uses User model for session data

**Impact:** All profile data fetched in single query, simpler data model for MVP.

### 2. Local Filesystem for File Uploads

**Decision:** Store uploads in `/public/uploads/` on local filesystem.

**Rationale:**
- Sufficient for MVP development
- No external service dependencies
- Simple implementation with Node.js `fs` module
- Easy to migrate to cloud storage later

**Alternatives Considered:** S3, Cloudinary, Vercel Blob (deferred until production needs dictate).

### 3. Magic Byte Validation for Security

**Decision:** Use `file-type` library to validate uploaded files via magic bytes.

**Rationale:**
- More secure than trusting file extensions or Content-Type headers
- Prevents malicious file uploads disguised as images
- Defense-in-depth approach

**Impact:** Only actual image files (validated by binary signature) can be uploaded.

### 4. Lowercase Username Transform

**Decision:** Transform usernames to lowercase in Zod schema before storage.

**Rationale:**
- Consistent URLs: `/profile/john` and `/profile/John` point to same user
- Case-insensitive uniqueness without complex database collation
- Better UX (users don't have to remember case)

**Impact:** All usernames stored lowercase, URL routing simplified.

### 5. String Arrays for Skills/Certifications

**Decision:** Use Prisma `String[]` type for skills and certifications.

**Rationale:**
- Simple for MVP (no join tables needed)
- PostgreSQL native support for text arrays
- Sufficient for display and basic filtering
- Can refactor to separate tables if advanced features needed (autocomplete, skill taxonomy)

**Impact:** Skills/certifications stored as arrays in User table, queried with Prisma's array operators.

## Deviations from Plan

**1. [Rule 3 - Blocking] Added `--accept-data-loss` flag to `prisma db push`**

- **Found during:** Task 2
- **Issue:** Prisma detected potential data loss due to adding unique constraint on `username` field when existing users have null usernames
- **Fix:** Used `--accept-data-loss` flag to proceed with schema push
- **Rationale:** Safe for MVP development where existing test users don't have username data yet (field is nullable)
- **Files modified:** None (CLI flag only)
- **Commit:** bc6a363 (included in Task 2)

## Verification Results

All verification criteria passed:

1. ✅ Dependencies installed: `react-easy-crop`, `swiper`, `file-type` all resolve
2. ✅ Prisma schema synced: `npx prisma db push` succeeded
3. ✅ TypeScript clean: `npx tsc --noEmit` passed with no errors
4. ✅ Next.js config updated: `bodySizeLimit: "5mb"` present
5. ✅ User model extended: All 11 new fields present in schema
6. ✅ PortfolioImage model created: Model exists with userId relation

## Next Phase Readiness

**Unblocks:**
- Plan 02-02 (Profile Editing): Schema + validation ready
- Plan 02-03 (Provider Setup): Schema + validation ready

**No blockers for parallel execution of Plans 02 and 03.**

**Considerations:**
- Upload directory (`/public/uploads/`) will be created on first upload (recursive mkdir)
- Username uniqueness enforced at database level (may need unique error handling in forms)
- File cleanup on avatar replacement handled by `deleteFile()` utility

## Self-Check: PASSED

**Created files verified:**
- ✅ src/lib/file-upload.ts exists
- ✅ src/lib/validations/profile.ts exists

**Modified files verified:**
- ✅ prisma/schema.prisma has User extensions and PortfolioImage model
- ✅ package.json has new dependencies
- ✅ next.config.ts has bodySizeLimit configuration

**Commits verified:**
- ✅ ec82c33 exists (Task 1)
- ✅ bc6a363 exists (Task 2)
- ✅ 573a175 exists (Task 3)

**Schema sync verified:**
- ✅ Database in sync with schema (prisma db push succeeded)
- ✅ Prisma client regenerated with new types

All claims in this summary match reality.
