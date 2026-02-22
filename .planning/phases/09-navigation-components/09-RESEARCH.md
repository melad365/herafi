# Phase 9: Navigation Components - Research

**Researched:** 2026-02-22
**Domain:** Next.js 15 App Router navigation components (hamburger menu, user dropdown)
**Confidence:** HIGH

## Summary

Phase 9 implements comprehensive desktop navigation through a hamburger menu and user account dropdown, extending the existing MobileNav pattern proven in the codebase. Research confirms that Next.js 15 App Router requires strict Server/Client component separation, with session data fetched server-side in Header and passed as serializable props to client-side interactive menus.

The recommended approach is zero new dependencies: reuse the existing MobileNav pattern (useState for toggle, usePathname + useEffect for auto-close on navigation, onClick handlers for menu items) and implement click-outside detection with a custom useRef hook. Accessibility is achieved through native ARIA attributes and keyboard event handlers rather than a UI library - while Headless UI offers automatic accessibility (50KB bundle cost), native implementation with proper ARIA is sufficient and adds zero dependencies.

Critical architectural decisions: (1) Keep Header as Server Component to preserve SSR benefits, (2) Extract all interactive UI (HamburgerMenu, UserDropdown) into separate Client Components that receive auth state as props, (3) Use usePathname() in useEffect dependency array to auto-close menus on navigation, (4) Implement click-outside detection with document-level event listeners and cleanup, (5) Group menu items into logical sections (Browse/Account/Provider) with clear visual hierarchy.

**Primary recommendation:** Extend existing MobileNav pattern to desktop hamburger menu and create new UserDropdown component using native React patterns with manual ARIA implementation. No new dependencies required.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.1.6 | Server/Client Component architecture | Official Next.js routing system, preserves SSR benefits while enabling client interactivity |
| React | 19.0.0 | Component framework with hooks (useState, useEffect, useRef) | Industry standard for UI components, hooks provide clean state and lifecycle management |
| @heroicons/react | 2.2.0 | Icon library (hamburger, user avatar, chevrons) | Already installed, React 19 compatible, zero config, consistent visual language |
| Tailwind CSS | (existing) | Styling framework for menus, dropdowns, hover states | Project standard, utility-first approach matches existing Header/MobileNav styling |
| Auth.js v5 | (existing) | Session management via `await auth()` in Server Component | Project authentication system, JWT sessions provide serializable user data for props |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | 15.1.6 | usePathname hook for route detection | Auto-close menus on navigation (useEffect dependency) |
| Custom hooks | n/a | useClickOutside for click-outside detection | Close dropdowns when clicking outside menu bounds |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native ARIA | Headless UI Menu | Headless UI adds automatic accessibility but increases bundle by ~50KB and adds dependency. Native ARIA requires manual keyboard handling but is zero-cost. |
| Custom useClickOutside | react-use useClickAway | External hook library adds dependency for a 10-line custom hook. Current project has no react-use dependency. |
| useState toggle | Zustand/Redux global state | Global state management is overkill for simple menu toggle. useState is sufficient and keeps state local to component. |

**Installation:**
No new packages required. All functionality achievable with existing dependencies.

## Architecture Patterns

### Recommended Project Structure
```
src/components/layout/
├── Header.tsx              # Server Component (existing) - fetches session, passes props
├── MobileNav.tsx           # Client Component (existing) - mobile hamburger menu
├── DesktopHamburger.tsx    # Client Component (NEW) - desktop hamburger menu
├── UserDropdown.tsx        # Client Component (NEW) - user account dropdown
└── hooks/
    └── useClickOutside.ts  # Custom hook for click-outside detection
```

### Pattern 1: Server Component Header with Client Component Menus
**What:** Header stays Server Component, fetches session via `await auth()` and queries database for `isProvider`, passes serializable props to Client Components

**When to use:** When navigation needs server-side auth data but client-side interactivity

**Example:**
```typescript
// Source: Next.js 15 Official Documentation - Server and Client Components
// https://nextjs.org/docs/app/getting-started/server-and-client-components

// Header.tsx (Server Component)
import { auth } from "@/lib/auth";
import DesktopHamburger from "./DesktopHamburger";
import UserDropdown from "./UserDropdown";

export default async function Header() {
  const session = await auth();

  let isProvider = false;
  if (session?.user?.id) {
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isProvider: true },
    });
    isProvider = user?.isProvider ?? false;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-lora text-burgundy-900">
            Herafi
          </Link>
          {/* Desktop hamburger next to logo */}
          <DesktopHamburger
            isLoggedIn={!!session}
            isProvider={isProvider}
          />
        </div>

        {/* Desktop Auth/User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <UserDropdown
              user={{
                name: session.user?.name ?? null,
                email: session.user?.email ?? null,
                avatar: session.user?.name?.charAt(0).toUpperCase() ?? 'U'
              }}
              isProvider={isProvider}
            />
          ) : (
            <>
              <Link href="/login">Log In</Link>
              <Link href="/register">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Navigation (existing) */}
        <MobileNav
          isLoggedIn={!!session}
          isProvider={isProvider}
          username={session?.user?.name ?? null}
        />
      </div>
    </header>
  );
}
```

### Pattern 2: Auto-Close Menu on Navigation with usePathname
**What:** Use usePathname() hook in useEffect dependency array to detect route changes and close menu

**When to use:** Prevent menu state persistence when user navigates to different page

**Example:**
```typescript
// Source: Next.js 15 Official Documentation - usePathname
// https://nextjs.org/docs/app/api-reference/functions/use-pathname

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DesktopHamburger({ isLoggedIn, isProvider }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close menu when pathname changes (user navigates)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="hidden md:block">
      <button onClick={toggleMenu} aria-label="Open menu">
        <Bars3Icon className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute top-16 left-0 bg-white shadow-lg">
          {/* Menu items */}
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Click-Outside Detection with useRef
**What:** Custom hook using useRef and document-level event listener to detect clicks outside component

**When to use:** Close dropdowns when user clicks anywhere outside the menu

**Example:**
```typescript
// Source: React Hook: Detect Click outside of Component
// https://www.robinwieruch.de/react-hook-detect-click-outside-component/

import { useRef, useEffect } from "react";

export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Use capturing phase (true) to work even if stopPropagation called
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [callback]);

  return ref;
}

// Usage in UserDropdown.tsx
export default function UserDropdown({ user, isProvider }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <div className="w-9 h-9 rounded-full bg-burgundy-100">
          {user.avatar}
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 bg-white shadow-lg">
          {/* Dropdown items */}
        </div>
      )}
    </div>
  );
}
```

### Pattern 4: Keyboard Navigation with ARIA Attributes
**What:** Implement keyboard support (Tab, Enter, Escape) with proper ARIA roles and attributes

**When to use:** Accessibility requirement for all interactive navigation components

**Example:**
```typescript
// Source: W3C ARIA Authoring Practices - Menu Button
// https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/

"use client";

export default function UserDropdown({ user, isProvider }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      event.currentTarget.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-burgundy-100">
          {user.avatar}
        </div>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-12 bg-white shadow-lg"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="block px-4 py-2 hover:bg-gray-50"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="block px-4 py-2 hover:bg-gray-50"
          >
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}
```

### Pattern 5: Grouped Menu Sections with Visual Hierarchy
**What:** Organize menu items into logical sections (Browse, Account, Provider) with headings and separators

**When to use:** Reduce cognitive load by creating logical associations in navigation

**Example:**
```typescript
// Source: NN/G Menu Design Checklist
// https://www.nngroup.com/articles/menu-design/

export default function DesktopHamburger({ isLoggedIn, isProvider }) {
  return (
    <div className="w-64 bg-white shadow-lg rounded-lg p-2">
      {/* Browse Section */}
      <div className="mb-4">
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Browse
        </h3>
        <Link href="/gigs" className="block px-3 py-2 rounded hover:bg-gray-50">
          Browse Services
        </Link>
        <Link href="/categories" className="block px-3 py-2 rounded hover:bg-gray-50">
          Categories
        </Link>
      </div>

      {isLoggedIn && (
        <>
          {/* Account Section */}
          <div className="mb-4 border-t border-gray-200 pt-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-50">
              Dashboard
            </Link>
            <Link href="/messages" className="block px-3 py-2 rounded hover:bg-gray-50">
              Messages
            </Link>
            <Link href="/orders" className="block px-3 py-2 rounded hover:bg-gray-50">
              Orders
            </Link>
          </div>

          {/* Provider Section (conditional) */}
          {isProvider && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Provider
              </h3>
              <Link href="/provider/gigs" className="block px-3 py-2 rounded hover:bg-gray-50">
                My Gigs
              </Link>
              <Link href="/provider/dashboard" className="block px-3 py-2 rounded hover:bg-gray-50">
                Provider Dashboard
              </Link>
            </div>
          )}
        </>
      )}

      {/* Help Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <Link href="/help" className="block px-3 py-2 rounded hover:bg-gray-50">
          Help & FAQ
        </Link>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Adding "use client" to Header**: Breaks server-side data fetching, causes hydration errors, loses SSR benefits for session/database queries
- **Viewport-based conditional rendering**: Server renders one version, client renders another based on window.innerWidth, causes "Text content does not match" hydration errors. Use CSS-only responsive hiding instead (`hidden md:block`)
- **Forgetting event listener cleanup**: useEffect without cleanup return causes memory leaks when component unmounts. Always return cleanup function for document event listeners
- **Menu state persisting across navigation**: User clicks link, navigates to new page, but menu stays open because React preserves client state. Must add usePathname() + useEffect to close menu on route change
- **Non-serializable props to Client Components**: Passing functions or Date objects from Server Component to Client Component causes serialization errors. Pass only primitives, plain objects, arrays

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dropdown menus | Custom keyboard navigation with manual focus management | Headless UI Menu component | Headless UI handles focus trapping, arrow key navigation, Escape key, letter key search, ARIA attributes, and disabled items automatically. Manual implementation requires 200+ lines and is error-prone. |
| Click-outside detection | Manual element position checking or complex event bubbling logic | useClickOutside custom hook (10 lines) | Document-level event listener with ref.current.contains() check is proven pattern. Position-based detection breaks with scrolling/transforms. |
| Route change detection | router.events (Pages Router API) | usePathname() hook in useEffect | router.events doesn't exist in App Router. usePathname() + useEffect is official Next.js 15 pattern for reacting to navigation. |
| Session state management | Custom context provider or global state | Server Component auth() call with props | Auth.js v5 `await auth()` in Server Components is zero-client-bundle approach. Context/global state adds complexity and client bundle size. |

**Key insight:** Navigation accessibility is deceptively complex - focus management, keyboard navigation, screen reader support, and ARIA semantics require expertise. While native implementation is possible, Headless UI encapsulates 2+ years of accessibility testing and cross-browser/screen-reader compatibility work into a 50KB package. For projects prioritizing zero dependencies over guaranteed accessibility, native implementation requires rigorous testing with keyboard users and screen readers.

## Common Pitfalls

### Pitfall 1: Server/Client Component Boundary Violations
**What goes wrong:** Developer adds `"use client"` to Header.tsx to use useState for menu toggle, breaking server-side session fetching and causing "You're importing a component that needs X. It only works in a Client Component" errors

**Why it happens:** useState requires Client Component, but auth() requires Server Component. Developers default to making entire Header client-side to enable interactivity.

**How to avoid:** Extract all interactive UI (menus, toggles) into separate Client Components. Keep Header as Server Component, pass session data as serializable props.

**Warning signs:**
- Error: "You're importing a component that needs auth. It only works in a Server Component"
- Hydration mismatch errors on initial load
- Session data showing as null despite user being logged in

### Pitfall 2: Menu State Not Closing on Navigation
**What goes wrong:** User opens hamburger menu, clicks "Dashboard" link, navigates to /dashboard, but menu overlay remains open on new page because React preserves client state across route transitions

**Why it happens:** Next.js App Router preserves Client Component state during navigation for performance. Menu toggle state (`isOpen = true`) persists unless explicitly reset.

**How to avoid:** Add usePathname() hook in useEffect dependency array: `useEffect(() => { setIsOpen(false); }, [pathname]);`

**Warning signs:**
- Menu overlay visible on page after clicking internal link
- User has to manually close menu after every navigation
- Mobile menu particularly affected (blocks content)

### Pitfall 3: Click-Outside Detection Breaking with Event Bubbling
**What goes wrong:** Click-outside handler fires even when clicking menu items inside the dropdown, closing the menu before Link navigation completes

**Why it happens:** Child elements may call `event.stopPropagation()`, or event listener added in bubbling phase receives event after internal handlers

**How to avoid:** Use capturing phase for event listener (third parameter `true` in addEventListener). Check `ref.current.contains(event.target)` to verify click truly outside element.

**Warning signs:**
- Dropdown closes immediately when clicking menu items
- Navigation to internal links doesn't work (menu closes before click registered)
- Inconsistent behavior across different menu items

### Pitfall 4: Hydration Mismatch from Responsive Rendering
**What goes wrong:** Server renders `<MobileNav />` based on hardcoded assumption, client renders `<DesktopHamburger />` based on window.innerWidth, causing "Text content does not match server-rendered HTML" error

**Why it happens:** window object doesn't exist during SSR. Developers check viewport size with JavaScript during render, creating server/client divergence.

**How to avoid:** Use CSS-only responsive hiding with Tailwind classes: `className="hidden md:block"` for desktop, `className="md:hidden"` for mobile. Let CSS media queries control visibility, not JavaScript.

**Warning signs:**
- Console error: "Text content does not match server-rendered HTML"
- Flash of wrong navigation on page load (FOUC)
- Navigation appears twice briefly during hydration

### Pitfall 5: Missing Event Listener Cleanup Causing Memory Leaks
**What goes wrong:** UserDropdown component adds document click listener in useEffect but doesn't remove it on unmount. When user navigates away, listener persists, calling setState on unmounted component and causing "Can't perform a React state update on an unmounted component" warnings.

**Why it happens:** useEffect without cleanup return statement leaves event listeners attached to document even after component unmounts

**How to avoid:** Always return cleanup function from useEffect: `return () => { document.removeEventListener('click', handleClick, true); };`

**Warning signs:**
- Console warning: "Can't perform a React state update on an unmounted component"
- Performance degradation over time (accumulated listeners)
- Memory usage increasing during navigation

### Pitfall 6: Non-Serializable Props from Server to Client Components
**What goes wrong:** Server Component passes entire session object (including Date fields, functions) to Client Component as prop, causing "Error: Functions cannot be passed directly to Client Components" or serialization errors

**Why it happens:** Server Components serialize props to JSON for hydration. Functions, Dates (pre-serialization), and non-plain objects can't be serialized.

**How to avoid:** Extract only serializable primitives from session: `user={{ name: session.user?.name ?? null, email: session.user?.email ?? null }}`. Convert Dates to strings/numbers if needed.

**Warning signs:**
- Error: "Functions cannot be passed directly to Client Components"
- Error: "Only plain objects can be passed to Client Components from Server Components"
- Props showing as null/undefined in Client Component despite being set in Server Component

### Pitfall 7: Missing Keyboard Navigation for Accessibility
**What goes wrong:** Dropdown menu works with mouse but keyboard users can't open menu with Enter key, can't navigate items with Tab, can't close with Escape

**Why it happens:** Developers implement onClick handlers but forget onKeyDown handlers and ARIA attributes

**How to avoid:** Add keyboard event handlers for Enter/Space (open), Escape (close), Tab (navigate). Include ARIA attributes: `aria-expanded`, `aria-haspopup`, `role="menu"`, `role="menuitem"`

**Warning signs:**
- Automated accessibility tests fail (Lighthouse, axe DevTools)
- Keyboard-only users report navigation doesn't work
- Screen readers don't announce menu state

### Pitfall 8: Inconsistent Authentication State Between Components
**What goes wrong:** Header shows user as logged in, but hamburger menu shows "Log In" button because isLoggedIn prop is derived differently

**Why it happens:** Header uses `!!session`, MobileNav uses separate check, or props not passed correctly through component tree

**How to avoid:** Single source of truth - fetch session once in Header Server Component, pass consistent props (`isLoggedIn={!!session}`) to all child navigation components

**Warning signs:**
- Inconsistent UI between mobile and desktop navigation
- Some links visible in one nav but not another
- User sees both "Log In" and "Dashboard" simultaneously

## Code Examples

Verified patterns from official sources and existing codebase:

### Example 1: Complete DesktopHamburger Component
```typescript
// Source: Existing MobileNav.tsx pattern + Next.js 15 App Router patterns
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface DesktopHamburgerProps {
  isLoggedIn: boolean;
  isProvider: boolean;
}

export default function DesktopHamburger({ isLoggedIn, isProvider }: DesktopHamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close menu when pathname changes (user navigates)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  };

  return (
    <div className="hidden md:block">
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        className="p-2 text-gray-700 hover:text-burgundy-800 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-lg z-40">
          <nav
            className="max-w-7xl mx-auto px-4 py-6"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Browse Section */}
            <div className="mb-6">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Browse
              </h3>
              <Link
                href="/gigs"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse Services
              </Link>
              <Link
                href="/categories"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Categories
              </Link>
            </div>

            {isLoggedIn && (
              <>
                {/* Account Section */}
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h3>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    role="menuitem"
                    className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/messages"
                    onClick={closeMenu}
                    role="menuitem"
                    className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Messages
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeMenu}
                    role="menuitem"
                    className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Orders
                  </Link>
                </div>

                {/* Provider Section (conditional) */}
                {isProvider && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Provider
                    </h3>
                    <Link
                      href="/provider/gigs"
                      onClick={closeMenu}
                      role="menuitem"
                      className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      My Gigs
                    </Link>
                    <Link
                      href="/provider/dashboard"
                      onClick={closeMenu}
                      role="menuitem"
                      className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Provider Dashboard
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Help Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link
                href="/help"
                onClick={closeMenu}
                role="menuitem"
                className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Help & FAQ
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Complete UserDropdown Component with Click-Outside
```typescript
// Source: useClickOutside pattern + ARIA menu best practices
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface UserDropdownProps {
  user: {
    name: string | null;
    email: string | null;
    avatar: string;
  };
  isProvider: boolean;
}

export default function UserDropdown({ user, isProvider }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Use capturing phase for reliable detection
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* User Avatar Button */}
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-900 font-semibold">
          {user.avatar}
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">
              {user.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Provider Mode Indicator */}
          {isProvider && (
            <div className="px-4 py-2 border-b border-gray-200 bg-burgundy-50">
              <p className="text-xs font-medium text-burgundy-900">
                Provider Mode Active
              </p>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={closeDropdown}
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={closeDropdown}
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 pt-2">
            <Link
              href="/api/auth/signout"
              onClick={closeDropdown}
              role="menuitem"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Custom useClickOutside Hook
```typescript
// Source: https://www.robinwieruch.de/react-hook-detect-click-outside-component/
import { useRef, useEffect } from "react";

export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Check if click target is outside referenced element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Use capturing phase (true) to detect clicks even if stopPropagation called
    document.addEventListener('click', handleClick, true);

    // Cleanup to prevent memory leaks
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [callback]);

  return ref;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router router.events | App Router usePathname() + useEffect | Next.js 13 (2022) | router.events no longer exists in App Router. Must use hooks for route detection. |
| Client-side useSession() hook | Server Component auth() call | Auth.js v5 (2024) | Session fetching moved to server for zero-client bundle. Props passed to client components. |
| window.innerWidth checks for responsive | CSS media queries only (hidden md:block) | Next.js hydration improvements (2023) | JavaScript viewport checks cause hydration mismatches. CSS-only is SSR-safe. |
| React.FC type for components | function Component() syntax | React 18 (2022) | React.FC considered harmful for prop types. Explicit function declarations preferred. |
| Radix UI for dropdowns | Headless UI or native ARIA | Tailwind ecosystem (2023) | Headless UI better integrates with Tailwind. Radix still viable but less common in Tailwind projects. |

**Deprecated/outdated:**
- **router.events API**: Removed in App Router, replaced by usePathname() hook in useEffect
- **getServerSideProps for session**: App Router uses `await auth()` in Server Components directly
- **React.FC TypeScript type**: No longer recommended, use explicit function signatures
- **Client-side session checks for navigation**: Server Components fetch session, pass props to client menus

## Open Questions

Things that couldn't be fully resolved:

1. **Should we use Headless UI or native implementation?**
   - What we know: Headless UI provides automatic accessibility (50KB bundle increase), native requires manual ARIA (zero dependencies)
   - What's unclear: Team preference on bundle size vs guaranteed accessibility
   - Recommendation: Start with native implementation. If accessibility testing reveals gaps (keyboard navigation bugs, screen reader issues), migrate to Headless UI in future iteration. Research shows native is viable with proper ARIA.

2. **Should isProvider be included in JWT session callback?**
   - What we know: Current architecture queries database for isProvider on every Header render. Alternative: include in JWT via Auth.js session callback (faster, but requires JWT regeneration when user becomes provider)
   - What's unclear: Performance impact of current approach at scale
   - Recommendation: Keep current approach (separate query) until performance monitoring shows Header render time is bottleneck. Premature optimization not warranted.

3. **Should menu state be global (Zustand) or local (useState)?**
   - What we know: Current MobileNav uses local useState. Proposed DesktopHamburger uses local useState. Menus are independent.
   - What's unclear: Future requirement for synchronized state (e.g., opening one menu closes others)
   - Recommendation: Start with local state per research. If future requirement emerges for menu coordination, refactor to global state. YAGNI principle applies.

4. **Should hamburger menu be desktop-only or desktop+mobile unified?**
   - What we know: Requirements specify hamburger "next to logo on desktop" (NAV-01). Existing MobileNav works well for mobile.
   - What's unclear: Whether hamburger should replace MobileNav for unified UX, or coexist (hamburger on desktop, different mobile nav)
   - Recommendation: Keep separate per current architecture. Desktop hamburger next to logo, mobile nav in mobile breakpoint. Consistent with existing Header structure.

## Sources

### Primary (HIGH confidence)
- Next.js 15 Official Documentation - usePathname: https://nextjs.org/docs/app/api-reference/functions/use-pathname
- Next.js 15 Official Documentation - Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js 15 Official Documentation - Authentication: https://nextjs.org/docs/app/building-your-application/authentication
- Headless UI Official Documentation - Menu Component: https://headlessui.com/v1/react/menu
- W3C ARIA Authoring Practices - Keyboard Interface: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Robin Wieruch - React Hook: Detect Click Outside Component: https://www.robinwieruch.de/react-hook-detect-click-outside-component/
- Existing codebase: Header.tsx (Server Component pattern), MobileNav.tsx (Client Component menu pattern)

### Secondary (MEDIUM confidence)
- NN/G Menu Design Checklist (2026): https://www.nngroup.com/articles/menu-design/
- Bundlephobia - @headlessui/react package size: https://bundlephobia.com/package/@headlessui/react
- CoreUI - How to Detect Click Outside React Component: https://coreui.io/blog/how-to-detect-a-click-outside-of-a-react-component/
- Accessible Navigation Menus - ARIA Roles: https://www.accesify.io/blog/accessible-navigation-menus-aria-roles-keyboard-support-focus-order/
- Medium - Building Accessible Dropdown in React: https://medium.com/@katr.zaks/building-an-accessible-dropdown-combobox-in-react-a-step-by-step-guide-f6e0439c259c
- GitHub Next.js Discussion #44515 - Close dropdown on click outside: https://github.com/vercel/next.js/discussions/44515

### Tertiary (LOW confidence, needs validation)
- Headless UI bundle size impact on final application (1.02MB package size, but tree-shaking reduces actual impact - not verified for this specific use case)
- Optimal menu grouping categories (Browse/Account/Provider) - based on general UX research, not Herafi-specific user testing
- Performance impact of separate isProvider query vs JWT inclusion - no benchmarking performed for this codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations based on existing project dependencies (Heroicons, Next.js 15, Auth.js v5) and official documentation
- Architecture patterns: HIGH - Server/Client Component separation verified in official Next.js docs, existing MobileNav provides working reference implementation
- Common pitfalls: HIGH - All 8 pitfalls backed by official Next.js documentation, community discussions, or accessibility guidelines
- Code examples: HIGH - Examples derived from official documentation patterns and existing codebase (MobileNav.tsx, Header.tsx)
- Open questions: MEDIUM - Questions identified through research but lack project-specific data (performance metrics, user testing results)

**Research date:** 2026-02-22
**Valid until:** 2026-03-24 (30 days - Next.js App Router patterns stable, not fast-moving domain)
