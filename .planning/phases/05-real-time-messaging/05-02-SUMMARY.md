---
phase: 05-real-time-messaging
plan: 02
subsystem: messaging
completed: 2026-02-10
duration: 3.3 min

requires:
  - 05-01-PLAN.md (Socket.IO infrastructure, auth middleware, custom server)
  - 01-01-PLAN.md (Prisma schema with Conversation and Message models)

provides:
  - Socket event handlers for messaging (send_message, join_conversation, leave_conversation)
  - Socket event handlers for presence (online/offline tracking, typing indicators)
  - REST API for conversation listing with last message preview
  - REST API for paginated message history with auto-read marking
  - REST API for finding or creating conversations between users

affects:
  - 05-03-PLAN.md (will consume these APIs and socket events for UI)

decisions:
  - db-write-before-broadcast: Complete database write before socket emit to prevent race conditions
  - volatile-typing-events: Typing indicators use volatile emit (not queued if offline)
  - in-memory-presence: Online users tracked in Map<userId, Set<socketId>> for multi-device support
  - consistent-room-naming: Conversation rooms named `conversation:{id}` for consistency
  - auto-read-on-fetch: Messages marked as read when fetching history
  - sorted-participant-ids: Participant IDs sorted for consistent conversation lookup
  - cursor-pagination: Message history supports cursor-based pagination with ?before=messageId

tech-stack:
  added: []
  patterns:
    - Socket.IO room broadcasting for real-time message delivery
    - In-memory Map for online presence tracking
    - Cursor-based pagination for efficient message loading
    - Auto-read marking on message fetch

key-files:
  created:
    - src/server/socket/handlers/message.ts
    - src/server/socket/handlers/presence.ts
    - src/app/api/conversations/route.ts
    - src/app/api/conversations/[conversationId]/messages/route.ts
    - src/app/api/conversations/find-or-create/route.ts
  modified:
    - src/server/socket/index.ts

tags: [socket.io, messaging, real-time, rest-api, websockets, presence]
---

# Phase 5 Plan 02: Message Handlers & API Summary

**One-liner:** Socket handlers persist and broadcast messages with presence tracking; REST API serves conversation list and message history with pagination.

## What Was Built

### Socket Event Handlers

**Message Handlers (src/server/socket/handlers/message.ts):**
- `join_conversation`: Verifies participant membership, joins Socket.IO room
- `send_message`: Validates content (max 2000 chars), saves to PostgreSQL, updates lastMessageAt, broadcasts `new_message` to room
- `leave_conversation`: Leaves Socket.IO room
- DB write completes BEFORE socket emit to prevent race conditions (Pitfall 4 from research)
- Includes sender info (id, name, displayName, avatarUrl) in broadcast

**Presence Handlers (src/server/socket/handlers/presence.ts):**
- Online/offline tracking with `Map<userId, Set<socketId>>` for multi-device support
- Broadcasts `user_online` when first socket connects, `user_offline` when last socket disconnects
- `typing_start`: Emits volatile `user_typing` to conversation room (not queued if offline)
- `typing_stop`: Emits `user_stopped_typing` to conversation room
- Exported `onlineUsers` Map for external queries

**Integration (src/server/socket/index.ts):**
- Registers both handler sets on socket connection
- Presence handlers called on connect/disconnect events

### REST API Endpoints

**GET /api/conversations:**
- Lists user's conversations sorted by lastMessageAt (most recent first)
- Includes last message preview with sender info
- Resolves "other participant" info (id, name, displayName, avatarUrl)
- Returns 401 if unauthenticated

**GET /api/conversations/[conversationId]/messages:**
- Loads 50 messages per request, ordered by createdAt (oldest first)
- Supports cursor-based pagination with `?before=messageId` for loading older messages
- Verifies user is participant (403 if not)
- Auto-marks unread messages as read (sets readAt timestamp)
- Returns 401 if unauthenticated, 404 if conversation not found

**POST /api/conversations/find-or-create:**
- Finds existing conversation between two users or creates new one
- Validates `otherUserId` exists and is not current user (400 for self, 404 for non-existent)
- Sorts participant IDs for consistent lookup (`[userId1, userId2].sort()`)
- Returns `{ conversationId }` for found or created conversation
- Returns 401 if unauthenticated

## Task Commits

| Task | Description                          | Commit  | Files                                                  |
| ---- | ------------------------------------ | ------- | ------------------------------------------------------ |
| 1    | Socket event handlers                | 2c0ef24 | message.ts, presence.ts, socket/index.ts               |
| 2    | REST API endpoints for conversations | d77dc53 | conversations/route.ts, [id]/messages/route.ts, find-or-create/route.ts |

## Verification Results

### Must-Have Truths
- ✅ Messages sent via socket are persisted to PostgreSQL (prisma.message.create in message.ts:93)
- ✅ Both sender and receiver see new messages in real-time via socket events (io.to(room).emit("new_message") in message.ts:120)
- ✅ Conversation history is retrievable via API (GET /api/conversations/[id]/messages)
- ✅ User can find or create a conversation with another user (POST /api/conversations/find-or-create)

### Must-Have Artifacts
- ✅ src/server/socket/handlers/message.ts: 149 lines (required 30+) ✓
- ✅ src/server/socket/handlers/presence.ts: 73 lines (required 20+) ✓
- ✅ src/app/api/conversations/route.ts: Exports GET ✓
- ✅ src/app/api/conversations/[conversationId]/messages/route.ts: Exports GET ✓
- ✅ src/app/api/conversations/find-or-create/route.ts: Exports POST ✓

### Must-Have Key Links
- ✅ message.ts → prisma.message.create (line 93)
- ✅ message.ts → io.to(room).emit("new_message") (line 120)
- ✅ socket/index.ts → registerMessageHandlers (line 24)

**All 11 must-haves verified ✓**

## Decisions Made

### Technical Decisions

**DB Write Before Broadcast (db-write-before-broadcast)**
- Complete database write before socket emit
- Prevents race conditions where clients receive event before DB is ready
- Aligns with Pitfall 4 from research: "Ensure DB write completes before emitting"

**Volatile Typing Events (volatile-typing-events)**
- Typing indicators use `.volatile.emit()` instead of regular emit
- Not queued if recipient is offline (ephemeral nature of typing status)
- Reduces unnecessary message queue buildup

**In-Memory Presence Tracking (in-memory-presence)**
- `Map<userId, Set<socketId>>` tracks online users
- Supports multiple devices/tabs per user (Set of socket IDs)
- User considered offline only when all sockets disconnect
- Trade-off: Resets on server restart (acceptable for MVP, production would use Redis)

**Consistent Room Naming (consistent-room-naming)**
- Conversation rooms named `conversation:{conversationId}`
- Simple, predictable pattern for debugging and monitoring
- Avoids ambiguity with user-based room names

**Auto-Read on Fetch (auto-read-on-fetch)**
- Messages marked as read when fetching conversation history
- Simplifies client logic (no separate "mark as read" API call)
- Uses `readAt: null` for unread, `new Date()` for read

**Sorted Participant IDs (sorted-participant-ids)**
- Participant IDs always sorted: `[userId1, userId2].sort()`
- Enables consistent lookup regardless of who initiates conversation
- Prevents duplicate conversations between same two users
- Used in both find-or-create API and schema storage

**Cursor-Based Pagination (cursor-pagination)**
- Message history uses `?before=messageId` for loading older messages
- More efficient than offset-based pagination for large datasets
- Cursor points to specific message ID with `skip: 1` to exclude cursor itself
- Returns 50 messages per request (balanced load)

### Implementation Decisions

**Participant Verification on All Operations**
- Every socket event and API endpoint verifies user is participant
- Prevents unauthorized access to conversation data
- Returns specific error codes: 403 for forbidden, 404 for not found, 401 for unauthenticated

**Sender Info in Message Broadcast**
- New message events include sender details (id, name, displayName, avatarUrl)
- Eliminates need for client to make additional user lookup requests
- Uses Prisma include: `{ sender: { select: {...} } }` for efficient fetching

**Self-Conversation Prevention**
- Find-or-create endpoint rejects `otherUserId === session.user.id`
- Returns 400 error with clear message
- Prevents UI bugs and database clutter

## Deviations from Plan

None - plan executed exactly as written.

## Performance Notes

**Database Queries:**
- Conversation listing: Single query with include for last message + Promise.all for other participants
- Message history: Single query with cursor pagination
- Find-or-create: Uses `findFirst` with `equals` for efficient array lookup on indexed field

**Socket Broadcasting:**
- Room-based broadcasting (`io.to(room)`) only sends to conversation participants
- Volatile events reduce queue buildup for ephemeral data (typing)
- In-memory presence Map provides O(1) lookup for online status

**Potential Optimizations (for future):**
- Cache other participant info to reduce Promise.all overhead in conversation listing
- Batch read receipts instead of updating on every message fetch
- Use Redis for distributed presence tracking in production

## Testing Notes

**TypeScript Compilation:**
- All handlers and API routes compile without errors
- Proper type safety with Prisma generated types

**Build Verification:**
- Next.js build successful, all API routes registered:
  - ƒ /api/conversations
  - ƒ /api/conversations/[conversationId]/messages
  - ƒ /api/conversations/find-or-create

**Manual Testing Recommendations:**
1. Socket events: Connect with valid JWT, emit send_message, verify new_message broadcast
2. API endpoints: Test with curl/Postman to verify authentication and data flow
3. Presence tracking: Open multiple tabs, verify online/offline events
4. Pagination: Create 60+ messages, verify cursor-based loading of older messages

## Next Phase Readiness

**Ready for Phase 5 Plan 03 (Chat UI):**
- ✅ Socket handlers ready to broadcast messages in real-time
- ✅ API endpoints ready to serve conversation list and history
- ✅ Presence data available for online/offline indicators
- ✅ Typing events ready for UI consumption
- ✅ Authentication integrated across all endpoints and socket events

**Integration Points for Plan 03:**
- Use `useSocket()` hook to connect and listen for `new_message`, `user_typing`, `user_online`, `user_offline` events
- Call `GET /api/conversations` to list conversations in sidebar
- Call `GET /api/conversations/[id]/messages` to load message history
- Call `POST /api/conversations/find-or-create` to start new conversation
- Emit `send_message` socket event to send messages
- Emit `typing_start`/`typing_stop` for typing indicators

**No blockers or concerns.**

---

**Plan completed:** 2026-02-10
**Execution time:** 3.3 minutes
**Tasks completed:** 2/2
**Commits:** 2 (2c0ef24, d77dc53)

## Self-Check: PASSED

All created files verified:
- ✅ src/server/socket/handlers/message.ts
- ✅ src/server/socket/handlers/presence.ts
- ✅ src/app/api/conversations/route.ts
- ✅ src/app/api/conversations/[conversationId]/messages/route.ts
- ✅ src/app/api/conversations/find-or-create/route.ts

All commits verified:
- ✅ 2c0ef24
- ✅ d77dc53
