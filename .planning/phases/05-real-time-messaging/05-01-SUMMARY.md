---
phase: 05-real-time-messaging
plan: 01
subsystem: infra
tags: [socket.io, websockets, jwt, real-time, prisma, messaging]

# Dependency graph
requires:
  - phase: 01-auth-foundation
    provides: Auth.js JWT configuration and AUTH_SECRET for token verification
  - phase: 02-profile-provider
    provides: User model with profile data for messaging participants
provides:
  - Conversation and Message database models for chat persistence
  - Custom Next.js + Socket.IO server on single HTTP port
  - JWT authentication middleware for socket connections
  - Client-side socket factory and React hook for connection lifecycle
  - Token API endpoint for retrieving JWT from session cookie
affects: [05-02, 05-03, 05-04, real-time-features]

# Tech tracking
tech-stack:
  added: [socket.io@4.8.3, socket.io-client@4.8.3, jsonwebtoken@9.0.3, tsx@4.21.0]
  patterns: [custom-server-pattern, socket-auth-middleware, jwt-socket-handshake, client-hook-lifecycle]

key-files:
  created:
    - src/server/server.ts
    - src/server/socket/index.ts
    - src/server/socket/middleware/auth.ts
    - src/lib/socket.ts
    - src/hooks/useSocket.ts
    - src/app/api/auth/token/route.ts
    - tsconfig.server.json
  modified:
    - prisma/schema.prisma
    - package.json

key-decisions:
  - "Custom Next.js server with Socket.IO on same HTTP port (no separate WebSocket port)"
  - "JWT verification using jsonwebtoken library matching Auth.js secret"
  - "Token API endpoint to extract JWT from httpOnly cookie for socket handshake"
  - "tsx for running TypeScript server directly in dev mode"
  - "Socket factory pattern with manual connect control (autoConnect: false)"
  - "participantIds as sorted array for efficient two-party conversation lookup"

patterns-established:
  - "Socket authentication via middleware checking handshake token"
  - "useSocket hook manages connection lifecycle with session awareness"
  - "socket.data.userId attached by auth middleware for use in handlers"

# Metrics
duration: 4.2min
completed: 2026-02-10
---

# Phase 05 Plan 01: Real-Time Messaging Infrastructure Summary

**Custom Next.js + Socket.IO server with JWT-authenticated connections, Conversation/Message models, and React hook for real-time chat foundation**

## Performance

- **Duration:** 4.2 min
- **Started:** 2026-02-10T19:32:04Z
- **Completed:** 2026-02-10T19:36:18Z
- **Tasks:** 2/2
- **Files modified:** 9

## Accomplishments
- Database schema extended with Conversation and Message models for chat persistence
- Custom HTTP server running Next.js and Socket.IO on single port (3000)
- JWT authentication middleware validates tokens on socket connection
- Client-side utilities (socket factory + useSocket hook) ready for chat components
- Token API endpoint provides JWT from session cookie for socket handshake

## Task Commits

Each task was committed atomically:

1. **Task 1: Database schema + dependencies + custom server** - `708d7ba` (feat)
   - Added Conversation and Message models to Prisma schema
   - Installed socket.io, socket.io-client, jsonwebtoken, tsx dependencies
   - Created custom server with Socket.IO initialization
   - Implemented JWT auth middleware for socket connections
   - Updated package.json dev/start scripts

2. **Task 2: Client-side socket utilities** - `5aa7e22` (feat)
   - Created socket factory with token-based authentication
   - Implemented useSocket React hook for connection lifecycle
   - Added /api/auth/token endpoint for JWT extraction

## Files Created/Modified
- `prisma/schema.prisma` - Added Conversation (participantIds, lastMessageAt) and Message (content, readAt) models
- `src/server/server.ts` - Custom HTTP server running Next.js + Socket.IO on port 3000
- `src/server/socket/index.ts` - Socket.IO initialization with auth middleware registration
- `src/server/socket/middleware/auth.ts` - JWT verification middleware using Auth.js secret
- `src/lib/socket.ts` - Client socket factory with token-based auth
- `src/hooks/useSocket.ts` - React hook managing socket connection lifecycle with session awareness
- `src/app/api/auth/token/route.ts` - API endpoint to extract JWT from httpOnly session cookie
- `tsconfig.server.json` - TypeScript config for server files (separate from Next.js)
- `package.json` - Updated scripts: dev uses "tsx --watch", start uses "NODE_ENV=production tsx"

## Decisions Made

**1. Custom server pattern instead of Next.js default**
- Rationale: Socket.IO requires HTTP server access; custom server allows co-hosting on single port

**2. JWT extraction via API route**
- Rationale: Auth.js stores JWT in httpOnly cookie; socket handshake needs token in auth object; API route bridges the gap

**3. tsx for server execution**
- Rationale: Run TypeScript directly without separate build step; watch mode for dev experience

**4. participantIds as sorted string array**
- Rationale: Enables efficient two-party conversation lookup via `@@index([participantIds])`; sorted order ensures consistent queries

**5. Manual socket connection control (autoConnect: false)**
- Rationale: Let useSocket hook control connection timing after token fetch; prevents premature connection attempts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**1. Next.js build artifacts missing on first server start**
- Problem: Custom server needs `.next/` directory built before running
- Resolution: Ran `npm run build` to generate Next.js production artifacts
- Impact: Standard workflow - build before first dev run

**2. tsx watch mode aggressive restarts**
- Problem: tsx --watch restarts server frequently during file monitoring
- Resolution: Expected behavior for watch mode; server successfully initializes each time
- Impact: None - logs confirm "Ready on http://localhost:3000" and "Socket.IO initialized"

## User Setup Required

None - no external service configuration required. Auth.js AUTH_SECRET (already configured in Phase 1) is reused for JWT verification.

## Next Phase Readiness

**Ready for Plan 02:** Socket event handlers for messaging
- Socket.IO server running and authenticated
- Database models ready for message persistence
- Client hook available for chat components
- Authentication flow working (JWT verification in socket middleware)

**Foundation complete:**
- Real-time transport layer established
- Database schema for conversations and messages
- Client-side utilities for React integration
- JWT authentication securing socket connections

**Next steps:**
- Plan 02: Implement message send/receive event handlers
- Plan 03: Build chat UI components using useSocket hook
- Plan 04: Add typing indicators and read receipts

---
*Phase: 05-real-time-messaging*
*Completed: 2026-02-10*

## Self-Check: PASSED

All created files verified:
- ✓ src/server/server.ts
- ✓ src/server/socket/index.ts
- ✓ src/server/socket/middleware/auth.ts
- ✓ src/lib/socket.ts
- ✓ src/hooks/useSocket.ts
- ✓ src/app/api/auth/token/route.ts
- ✓ tsconfig.server.json

All commits verified:
- ✓ 708d7ba (Task 1)
- ✓ 5aa7e22 (Task 2)
