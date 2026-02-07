# Pitfalls Research

**Domain:** Services Marketplace (In-Person & Digital Services)
**Researched:** 2026-02-07
**Confidence:** MEDIUM (based on training knowledge; WebSearch unavailable for verification)

## Critical Pitfalls

### Pitfall 1: Cold Start Problem - Building Supply Before Demand

**What goes wrong:**
Launching with service providers but no buyers, or vice versa. The marketplace appears empty to whichever side arrives first, causing them to leave immediately. This creates a death spiral where neither side has a reason to stay.

**Why it happens:**
Teams underestimate the chicken-and-egg problem inherent to two-sided marketplaces. They assume "if we build it, they will come" without orchestrating initial liquidity on both sides.

**How to avoid:**
- Manually recruit initial providers before launch (10-20 quality gigs minimum)
- Seed marketplace with diverse service categories so no category looks empty
- Consider launching in a constrained niche first (e.g., one city, one service category)
- Use mock/demo providers initially if needed, clearly marked
- Never launch a marketplace with zero listings

**Warning signs:**
- Launch plan doesn't include provider recruitment strategy
- No target for "minimum viable liquidity" (minimum listings per category)
- Marketing plan focuses only on buyer acquisition
- Category pages showing "No services found" messages

**Phase to address:**
Phase 1 (Foundation) or pre-launch seeding phase. Must be resolved before any public launch.

---

### Pitfall 2: Inadequate Trust & Safety Mechanisms

**What goes wrong:**
For in-person services, users are inviting strangers into their homes or meeting them at locations. Without proper verification, background checks, or trust signals, users feel unsafe and won't transact. Bad actors exploit the platform, damaging reputation permanently.

**Why it happens:**
Teams treat in-person service marketplaces like digital product marketplaces, underestimating the physical safety concerns. Trust mechanisms are deferred as "nice to have" rather than table stakes.

**How to avoid:**
- Build identity verification from day one (ID upload, phone verification at minimum)
- Make provider profiles rich with trust signals: verified identity badge, completion count, response time, years on platform
- Implement review system that surfaces safety concerns (not just quality)
- Plan for background check integration even if mocked in MVP
- Show verification status prominently in search results and profiles
- Consider insurance/liability coverage messaging

**Warning signs:**
- No verification beyond email in auth flow
- Profile creation takes < 2 minutes
- No plan for handling safety complaints
- Reviews only capture star rating, not safety-specific feedback
- No way to report concerning behavior

**Phase to address:**
Phase 2 (Core Listings & Discovery) must include basic verification. Phase 3 should add review system with safety signals. Background checks are Phase 4+.

---

### Pitfall 3: Pricing Model That Breaks at Scale

**What goes wrong:**
Choosing a revenue model (commission structure, subscription, listing fees) without understanding marketplace economics causes problems at scale. Common issues: taking commission from mock payments (nothing to collect), commission rates that make services uncompetitive, or no revenue model preventing future monetization.

**Why it happens:**
Teams defer monetization decisions with "we'll figure it out later," then realize changing pricing models requires renegotiating with established providers and rebuilding payment logic.

**How to avoid:**
- Decide commission structure now, even if not collected in MVP (e.g., "15% commission" displayed in provider dashboard, but not charged during mock payment phase)
- Research competitive commission rates in service marketplaces (typically 10-20%)
- Build pricing model into order calculations from day one, just gate actual collection
- Document future monetization strategy in PROJECT.md
- Consider whether to charge buyers, providers, or both

**Warning signs:**
- Order total calculations don't include marketplace fee
- Provider dashboard doesn't show "your take-home" vs. "order total"
- No discussion of future revenue model in project docs
- Hard-coding prices without fee calculation logic

**Phase to address:**
Phase 3 (Order Flow & Mock Payments) should include commission calculations even if not collected. Prevents future rewrite.

---

### Pitfall 4: Real-Time Chat Without Performance Planning

**What goes wrong:**
Implementing real-time chat with WebSockets or polling without considering connection management, message persistence, or scaling leads to: memory leaks from unclosed connections, lost messages during disconnects, exponential database queries, and server crashes under load.

**Why it happens:**
Real-time features appear simple in demos but hide significant complexity. Teams implement basic Socket.io without planning for reconnection logic, message queuing, or delivery guarantees.

**How to avoid:**
- Use proven real-time infrastructure (Socket.io, Pusher, Ably, or Supabase Realtime)
- Implement connection lifecycle management (connect, disconnect, reconnect)
- Store messages persistently before sending (don't rely on live connection)
- Add message delivery status (sent, delivered, read)
- Limit active connections per user
- Test reconnection scenarios explicitly
- Consider read receipts, typing indicators carefully (can 10x database writes)

**Warning signs:**
- Chat POC works in demo but has no reconnection handling
- Messages stored only in memory, not database
- No message delivery confirmation
- Every keystroke in "typing indicator" triggers database write
- No plan for message history pagination
- Connection management handled in component useEffect without cleanup

**Phase to address:**
Phase 4 (Real-Time Chat) — dedicate entire phase to getting this right. Don't combine with other features.

---

### Pitfall 5: Search/Filter Experience That Doesn't Match User Mental Model

**What goes wrong:**
Building generic search (keyword matching) when users need domain-specific filtering. For in-person services, users think in terms of "near me," "available this weekend," "budget range," but the search only supports keyword queries. Users can't find what they need and abandon the platform.

**Why it happens:**
Teams copy generic e-commerce search without understanding service marketplace patterns. In-person services have different discovery patterns than digital products.

**How to avoid:**
- Research how users think about finding services (even though location is out of scope for Herafi MVP, understand the mental model)
- Provide category-first navigation (plumbing, painting, etc.)
- Add faceted filtering: price range, delivery time, provider rating, verified status
- Support natural language queries ("cheap plumber," "fast painter")
- Consider "recently viewed" and "popular in category" to aid discovery
- Don't rely solely on keyword search

**Warning signs:**
- Search box with no category filtering
- Users must know exact service name to find it
- No way to browse within a category
- Search returns 0 results for common queries
- No sort options (price, rating, delivery time)

**Phase to address:**
Phase 2 (Core Listings & Discovery) — invest in rich filtering, not just search box.

---

### Pitfall 6: Order State Machine That Doesn't Handle Edge Cases

**What goes wrong:**
Implementing happy-path order flow (request → accept → complete) without handling: provider declining, user canceling, disputes, incomplete work, no-shows, etc. This leads to orders stuck in limbo, money locked in escrow (or mock limbo), and no way to resolve issues.

**Why it happens:**
Teams design for the success case, forgetting that 20-30% of service orders have some complication. State transitions are hard to reason about, so edge cases are deferred.

**How to avoid:**
- Map complete state machine before coding: requested, accepted, declined, canceled_by_buyer, canceled_by_provider, in_progress, completed, reviewed, disputed
- Define valid transitions (can't complete from requested, must accept first)
- Build cancellation flow from day one, not "later"
- Add "reason" field for declines/cancellations
- Consider timeout logic (auto-decline after 24h)
- Plan for refunds even in mock payment system
- Build order status history (audit log)

**Warning signs:**
- Order states defined as boolean flags (isAccepted, isComplete) instead of enum
- No decline or cancel actions in UI
- Order can transition to any state from any state
- No timestamp tracking for state changes
- Provider acceptance has no timeout/expiration

**Phase to address:**
Phase 3 (Order Flow & Mock Payments) — design full state machine, not just happy path.

---

### Pitfall 7: Review System That Encourages Gaming or Retaliation

**What goes wrong:**
Building reviews without considering gaming tactics: fake reviews, review-for-review exchanges, retaliatory reviews, review extortion, or only negative reviews being left. Marketplace trust degrades as review system becomes unreliable.

**Why it happens:**
Teams implement basic star rating + comment without researching review system design. Gaming tactics emerge after launch when fixing is harder.

**How to avoid:**
- Require completed transaction to leave review (verified purchase)
- Implement double-blind reviews (neither party sees other's review until both submitted or timeout)
- Add review helpfulness voting to surface quality reviews
- Show review distribution graph, not just average (many 5-star and many 1-star is different from all 3-star)
- Limit review editing window
- Don't allow providers to respond immediately (prevents retaliation)
- Consider hiding reviewer identity or allowing anonymous reviews
- Flag reviews with suspicious patterns (all 5-star, generic text)

**Warning signs:**
- Any user can review any service without ordering it
- Reviews visible immediately after one party submits
- Providers can see who left negative review before responding
- No spam/abuse detection
- Review score is simple average of all ratings

**Phase to address:**
Phase 5 (Reviews & Ratings) — research review system design patterns before implementation.

---

### Pitfall 8: Single-Account-Type System Without Proper Role Switching

**What goes wrong:**
While Herafi correctly uses single user type (anyone can buy or sell), poor UX for switching between "browsing to hire" and "managing my gigs" causes confusion. Users can't tell what mode they're in, see mixed contexts, or miss incoming orders.

**Why it happens:**
Teams implement unified account technically but don't design dual-mode UX. Navigation shows both buyer and provider actions simultaneously, overwhelming users.

**How to avoid:**
- Clearly distinguish "Buy Services" vs. "My Provider Dashboard" in navigation
- Use visual cues to indicate current mode (color, layout change)
- Separate notifications: "New order for your service" vs. "Your order updated"
- Provider dashboard is separate section, not mixed into browsing UI
- Consider toggle/switch to explicitly change modes (like Uber driver mode)
- Don't show "Create Gig" CTA when user is browsing to hire

**Warning signs:**
- Same navigation bar for browsing and managing gigs
- User profile shows both buyer history and provider stats on same page
- Notifications don't distinguish role context
- "My Orders" mixes orders placed and orders received

**Phase to address:**
Phase 6 (Provider Dashboard) — design clear mode separation, not just feature addition.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Mock payment with "auto-approve" instead of state machine | Fast to ship, no payment integration | Hard to add real payments later; no timeout logic, refunds, etc. | Never — implement proper state machine with mock execution |
| Client-side only search filtering | No backend query complexity | Can't scale beyond 100s of listings; no relevance ranking | Only for true MVP with guaranteed small catalog |
| Storing chat messages in Socket.io memory | No database schema needed | Lost on server restart; no message history | Never — messages are critical data |
| Using localStorage for user session instead of proper auth | Simple, no backend session management | Security risk; no session expiration; can't revoke access | Never — security fundamental |
| Hardcoding category list instead of making it data-driven | No admin panel needed | Adding categories requires code deploy | Acceptable for MVP if < 10 categories |
| No image optimization (storing full-res uploads) | Faster initial implementation | Storage costs explode; slow page loads | Only for true MVP with < 50 services |
| Polling for real-time chat instead of WebSockets | Simpler implementation | High server load; delayed messages; poor UX | Never for "real-time" chat — just call it async messaging |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Next.js API routes | Putting business logic in API routes instead of separate service layer | Create service modules that API routes and server components can both import |
| Image upload | Storing images in /public folder | Use cloud storage (Cloudinary, AWS S3, Vercel Blob) even for MVP |
| Real-time chat | Implementing custom WebSocket server with Next.js | Use managed service (Pusher, Ably, Supabase Realtime) or separate WS server |
| Authentication | Building custom auth from scratch | Use next-auth, Clerk, or Supabase Auth — auth is hard to secure |
| Database queries | Using ORM without understanding N+1 query problem | Learn to use includes/eager loading; monitor query counts in dev |
| Email sending | Using nodemailer with Gmail SMTP in production | Use transactional email service (SendGrid, Postmark, Resend) |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all services on homepage | Slow initial render, high memory usage | Implement pagination or infinite scroll; fetch only visible page | > 100 services |
| N+1 queries when loading services with provider data | Database CPU spikes; slow list pages | Use join queries or ORM includes/eager loading | > 20 services per page |
| Storing full chat history in component state | UI becomes sluggish; browser memory issues | Paginate message history; virtualize long message lists | > 100 messages in chat |
| Real-time connection per browser tab | Connection limit exhaustion | Detect duplicate tabs; share connection with BroadcastChannel or SharedWorker | > 500 concurrent users |
| No database indexes on filtered columns | Queries slow to seconds/minutes | Index foreign keys, filtered columns (category_id, rating, etc.) | > 1000 services |
| Loading all provider's gigs on dashboard | Dashboard takes 5+ seconds to load | Paginate gig list; show summary stats separately | Provider has > 10 gigs |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Allowing any user to mark any order as "completed" | Fraud: users mark incomplete work as done; providers mark unpaid orders as complete | Only allow provider to mark "work done" and buyer to confirm "completed"; both actions required |
| No rate limiting on service creation | Spam: bad actors flood marketplace with fake services | Limit new services per day (e.g., 5 gigs per 24h for new accounts, 20 for verified) |
| Storing chat messages without content moderation plan | Illegal content, harassment persists in database | Plan for reporting mechanism and content review (even if manual initially) |
| Public image upload URLs predictable (sequential IDs) | Enumeration attack: scrape all uploaded images | Use UUIDs or hashed filenames; don't expose internal IDs in URLs |
| No CSRF protection on order actions (accept, decline, complete) | Malicious site can trigger actions on behalf of logged-in user | Use Next.js built-in CSRF protection (API routes with POST) or tokens |
| Trusting client-side price calculations | User manipulates price before submitting order | Always calculate prices server-side from service tier prices in database |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing "verified" badge without explaining what it means | Badge meaningless; users don't trust it | Add tooltip or info modal explaining verification criteria |
| No empty states for new providers | New provider sees blank dashboard; feels broken | Show onboarding tips, "Create your first gig" CTA with preview |
| Category pages that show all services in flat list | Overwhelming; can't find relevant service | Group by subcategory; show featured/top-rated first; add filtering sidebar |
| Order status updates without notifications | User must manually check status; misses updates | Add in-app notification badge; plan for email notifications in v2 |
| No "draft" state for service creation | Provider loses progress if they leave page | Auto-save draft; allow publishing later; show saved vs. published indicator |
| Chat UI doesn't show delivery/read status | User doesn't know if message sent; re-sends creating duplicates | Show "sent" checkmark, "delivered" double-check, "read" timestamp |
| Price tiers without clear differentiation | User doesn't understand difference between Basic/Standard/Premium | Require providers to list specific deliverables per tier; show comparison table |
| No guidance on service listing quality | Providers create low-effort listings; marketplace looks unprofessional | Show listing "strength meter"; suggest improvements; provide examples |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Real-time chat:** Often missing reconnection logic — verify chat works after: closing/reopening tab, mobile sleep/wake, network disconnect/reconnect
- [ ] **Image upload:** Often missing file validation — verify max size check, file type validation, malicious file handling, image optimization
- [ ] **Order flow:** Often missing cancellation path — verify both buyer and provider can cancel at appropriate stages with reason capture
- [ ] **Search:** Often missing empty state handling — verify behavior when search returns 0 results, suggests alternative queries or categories
- [ ] **Reviews:** Often missing edit prevention — verify review can't be changed after submission window (24-48h typically)
- [ ] **Provider dashboard:** Often missing loading states — verify skeleton screens or spinners during data fetch, not just blank page
- [ ] **Authentication:** Often missing session expiration handling — verify graceful redirect to login when token expires during active use
- [ ] **Form validation:** Often missing server-side validation — verify client-side validation is duplicated on server (never trust client)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Launched with poor trust signals | HIGH | Pause marketing; add verification retroactively; email existing providers about verification benefits; may need PR recovery |
| Order state machine missing edge cases | MEDIUM | Add new states; write migration to fix stuck orders; provide manual override for support team |
| Chat messages stored incorrectly | HIGH | Data loss if messages only in memory; may need to inform users messages were lost; implement correct persistence going forward |
| No proper search implemented | MEDIUM | Add search index (Algolia, Elasticsearch, or Postgres full-text); reindex existing services; deploy with minimal downtime |
| Review system being gamed | MEDIUM | Flag suspicious reviews; add verification requirement; communicate policy change to users; may need to remove fake reviews |
| Single-account UX confusing | LOW | Add mode switching UI; improve navigation clarity; optional: user onboarding tour; doesn't require data migration |
| Poor empty state handling | LOW | Design and implement empty states; purely UI improvement; no data migration |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Cold start problem | Phase 0 (Pre-launch seeding) or Phase 1 | Homepage shows 10+ services across 3+ categories |
| Inadequate trust & safety | Phase 2 (identity verification) + Phase 5 (review safety signals) | Provider profile shows verification badges; reviews include safety feedback |
| Pricing model breaks at scale | Phase 3 (Order Flow) | Order calculations include commission; provider dashboard shows fees |
| Real-time chat performance issues | Phase 4 (Real-Time Chat) | Chat handles reconnection; messages persist; works on mobile sleep/wake cycle |
| Search doesn't match mental model | Phase 2 (Core Listings & Discovery) | Users can find services via category + filters without knowing exact keywords |
| Order state machine missing edge cases | Phase 3 (Order Flow) | Can test: provider decline, user cancel, timeout, all transitions work |
| Review system gaming | Phase 5 (Reviews) | Reviews require verified order; double-blind submission; no retaliation |
| Role switching confusion | Phase 6 (Provider Dashboard) | Clear visual distinction between "browsing" and "managing" modes |

## Sources

**Confidence note:** This research is based on training knowledge of marketplace platform patterns, common failure modes documented in blog posts and post-mortems through 2024, and understanding of two-sided marketplace challenges. WebSearch was unavailable to verify specific 2025-2026 sources or emerging patterns.

**Knowledge domains synthesized:**
- Two-sided marketplace economics and cold start problem (established literature)
- Service marketplace trust & safety patterns (Uber, TaskRabbit, Thumbtack case studies)
- Real-time feature implementation challenges (Socket.io documentation, scaling WebSocket patterns)
- Review system design (Amazon, Airbnb, eBay review system evolution)
- Next.js architecture patterns (official docs, performance best practices)

**Recommended follow-up:**
- Research specific commission rates in service marketplaces (2025-2026 data)
- Review recent platform launches for trust & safety innovations
- Check for new Next.js features relevant to real-time or marketplace features
- Validate assumptions about background check services and costs

---
*Pitfalls research for: Herafi Services Marketplace*
*Researched: 2026-02-07*
*Confidence: MEDIUM (training knowledge without current source verification)*
