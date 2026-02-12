---
phase: 08-ui-polish
plan: 01
subsystem: design-system
tags: [tailwind, design-tokens, ui-components, burgundy, sonner]
requires:
  phases: [07-provider-dashboard]
  context: "Phase 7 completed dashboard with orange/amber theming, now shifting to burgundy"
provides:
  - Burgundy design system foundation (color scale, shadows)
  - Warm cream background theme
  - Sonner toast notifications integration
  - Reusable UI primitives (Button, Skeleton, EmptyState)
affects:
  phases: [08-02, 08-03]
  rationale: "All subsequent UI polish plans depend on these design tokens and components"
tech-stack:
  added: ["sonner", "@heroicons/react", "clsx", "tailwind-merge"]
  patterns: ["Tailwind design tokens", "forwardRef pattern for Button", "CSS custom properties"]
key-files:
  created:
    - path: "src/lib/utils.ts"
      purpose: "cn() utility for className merging with clsx + tailwind-merge"
    - path: "src/components/ui/Button.tsx"
      purpose: "Reusable button with 4 variants, 3 sizes, loading state"
    - path: "src/components/ui/Skeleton.tsx"
      purpose: "Loading placeholders with GigCardSkeleton and GigGridSkeleton"
    - path: "src/components/ui/EmptyState.tsx"
      purpose: "Empty state component with icon, title, description, CTA"
  modified:
    - path: "tailwind.config.ts"
      changes: "Added burgundy (50-950), cream (50-200), custom shadows (soft, card, card-hover)"
    - path: "src/app/globals.css"
      changes: "Updated CSS vars to warm cream background (#fdfaf7), deep burgundy foreground (#420e1e), removed dark mode"
    - path: "src/app/layout.tsx"
      changes: "Integrated Sonner Toaster with burgundy theme styling"
    - path: "package.json"
      changes: "Added sonner, @heroicons/react, clsx, tailwind-merge"
decisions:
  - decision: "Burgundy as primary color replacing orange/amber"
    rationale: "Research showed burgundy conveys trust and craftsmanship for service marketplace"
    alternatives: ["Keep orange/amber", "Use multiple accent colors"]
    impact: "Complete visual rebrand, affects all subsequent UI work"
  - decision: "Warm cream (#fdfaf7) background instead of pure white"
    rationale: "Warmer tone feels approachable and reduces eye strain"
    alternatives: ["Pure white", "Light gray"]
    impact: "All pages get warm background, better contrast with burgundy"
  - decision: "Custom shadow scale (soft, card, card-hover)"
    rationale: "Consistent elevation system for cards and interactive elements"
    alternatives: ["Use Tailwind default shadows", "Material Design shadows"]
    impact: "All cards and elevated components use custom scale"
  - decision: "Sonner for toast notifications"
    rationale: "Lightweight, accessible, easy to theme"
    alternatives: ["react-hot-toast", "Custom toast implementation"]
    impact: "All future notifications use Sonner API"
  - decision: "forwardRef pattern for Button component"
    rationale: "Allows parent components to access button DOM node for focus management"
    alternatives: ["Simple function component"]
    impact: "Better accessibility and integration with forms/libraries"
metrics:
  duration: "2.6 min"
  completed: "2026-02-12"
---

# Phase 08 Plan 01: Design System Foundation Summary

**One-liner:** Established burgundy design system with color scale (50-950), warm cream backgrounds, custom shadows, Sonner toasts, and three reusable UI primitives (Button, Skeleton, EmptyState).

## What Was Built

### Design Tokens Configuration
1. **Tailwind Color Scale**
   - Added burgundy scale (50-950) with 11 shades from light pink (#fdf4f5) to deep burgundy (#420e1e)
   - Added cream scale (50-200) for warm backgrounds
   - Kept existing CSS variable colors for backward compatibility

2. **Custom Shadow Scale**
   - `shadow-soft`: Subtle elevation (0 2px 8px / 0.06)
   - `shadow-card`: Standard card elevation (0 4px 12px / 0.08)
   - `shadow-card-hover`: Hover state elevation (0 8px 20px / 0.12)

3. **CSS Variables Update**
   - Changed `--background` from pure white (#ffffff) to warm cream (#fdfaf7)
   - Changed `--foreground` from neutral gray (#171717) to deep burgundy (#420e1e)
   - Removed dark mode media query (no dark mode in MVP)

### Toast Notifications
- Integrated Sonner Toaster in root layout
- Configured with burgundy theme styling (cream background, burgundy text, burgundy border)
- Position: top-right, duration: 4000ms, richColors enabled

### UI Primitive Components

#### Button Component (`src/components/ui/Button.tsx`)
- **Variants:** primary (burgundy-800), secondary (cream-100), outline (burgundy border), ghost (text only)
- **Sizes:** sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3)
- **Loading State:** Shows spinner and "Processing..." text when `isLoading={true}`
- **Pattern:** forwardRef for DOM access
- **Accessibility:** Disabled state with opacity-50 and cursor-not-allowed

#### Skeleton Component (`src/components/ui/Skeleton.tsx`)
- **Base Skeleton:** Animated pulse with gray-200 background, accessible with role="status"
- **GigCardSkeleton:** Matches GigCard layout (image h-48, title, description, price)
- **GigGridSkeleton:** Renders 6 GigCardSkeleton in responsive grid (1-4 columns)
- **Motion:** Respects `prefers-reduced-motion` with `motion-reduce:animate-none`

#### EmptyState Component (`src/components/ui/EmptyState.tsx`)
- **Props:** icon (ReactNode), title, optional description, optional action (href or onClick)
- **Layout:** Centered flex column with burgundy icon, title, description, CTA button
- **Action:** Supports both Next.js Link (href) and button (onClick)

### Utilities
- Created `cn()` utility in `src/lib/utils.ts` using clsx + tailwind-merge for className merging

## Task Commits

| # | Task | Commit | Type | Files Changed |
|---|------|--------|------|---------------|
| 1 | Install dependencies and configure Tailwind design tokens | ac39d6c | chore | tailwind.config.ts, globals.css, utils.ts, package.json |
| 2 | Create UI primitives and integrate Sonner | 6a3454c | feat | layout.tsx, Button.tsx, Skeleton.tsx, EmptyState.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blockers:** None

**Concerns:** None - design system foundation is complete and ready for use

**Recommended Next Steps:**
1. Apply burgundy theme to existing components (Phase 08 Plan 02)
2. Enhance gig cards and detail pages with new design system
3. Polish dashboard and profile pages with new components

## Verification Results

All must-haves verified ✓

**Truths:**
- ✓ Burgundy color scale (50-950) available in Tailwind classes
- ✓ Warm cream background (#fdfaf7) replaces pure white
- ✓ Custom shadow scale (soft, card, card-hover) available
- ✓ Toast notifications available app-wide via Sonner
- ✓ Button component supports loading state with inline spinner
- ✓ Skeleton component provides reusable loading placeholders
- ✓ EmptyState component renders icon, message, and CTA

**Artifacts:**
- ✓ `tailwind.config.ts` contains burgundy scale
- ✓ `src/app/globals.css` has --background: #fdfaf7
- ✓ `src/app/layout.tsx` imports and renders Toaster from sonner
- ✓ `src/components/ui/Button.tsx` exports default Button component
- ✓ `src/components/ui/Skeleton.tsx` exports Skeleton, GigCardSkeleton, GigGridSkeleton
- ✓ `src/components/ui/EmptyState.tsx` exports EmptyState component
- ✓ `src/lib/utils.ts` exports cn() utility

**Build:** `npm run build` passes without errors ✓

---

## Self-Check: PASSED

All created files exist:
- ✓ src/lib/utils.ts
- ✓ src/components/ui/Button.tsx
- ✓ src/components/ui/Skeleton.tsx
- ✓ src/components/ui/EmptyState.tsx

All commits exist:
- ✓ ac39d6c
- ✓ 6a3454c

---

**Status:** ✅ Complete - Design system foundation established, all components ready for use across application
