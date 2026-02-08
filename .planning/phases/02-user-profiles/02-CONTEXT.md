# Phase 2: User Profiles - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can establish identity and showcase provider credentials. This includes setting display name, uploading avatar, writing bio, viewing profile pages with services and ratings, and uploading portfolio images. Profile changes persist across sessions. Creating gigs, messaging, and reviews are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Profile page layout
- Claude's discretion on header design, section ordering, stats visibility, and page navigation pattern
- User trusts Claude to pick what fits the warm marketplace aesthetic

### Avatar & image uploads
- Images stored on **local filesystem** (`/public/uploads`) — simple for MVP
- Avatar upload includes a **circle crop UI** so users can position and crop
- Portfolio displayed as a **horizontal carousel/slider** — click through work samples
- Claude's discretion on portfolio image limit

### Provider vs buyer identity
- Profile is **buyer-focused by default** — provider sections (services, portfolio) only appear if user has created gigs
- Separate **"Become a provider" flow** to set up provider info — intentional step, not just fields on the edit page
- Provider fields include: **skills, bio, years of experience, certifications, professional summary**
- Other users' profiles show a **"View services" button** as the primary CTA (placeholder until Phase 3 gigs exist)

### Profile editing experience
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

</decisions>

<specifics>
## Specific Ideas

- Warm marketplace aesthetic — orange/amber color scheme established in Phase 1
- "Become a provider" should feel like an intentional step, not accidental
- Provider sections appear organically when user has gigs — no empty provider sections on buyer-only profiles
- Username-based URLs suggest the need for a username field during registration or profile setup

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-user-profiles*
*Context gathered: 2026-02-08*
