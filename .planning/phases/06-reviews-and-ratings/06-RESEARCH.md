# Phase 6: Reviews & Ratings - Research

**Researched:** 2026-02-11
**Domain:** Review and rating systems for marketplace platforms
**Confidence:** HIGH

## Summary

Reviews and ratings are a critical trust-building feature for marketplace platforms. This research covers schema design, rating calculation strategies, verified purchase constraints, and common implementation pitfalls.

The standard approach for Phase 6 involves:
1. Creating an explicit many-to-many relationship between users and orders/gigs through a Review model
2. Using a composite unique constraint to prevent duplicate reviews (one review per buyer per order)
3. Storing aggregate ratings as denormalized fields on User and Gig models for performance
4. Implementing star rating display using existing React/Tailwind component libraries
5. Following the established server actions pattern with Zod validation

**Primary recommendation:** Use an explicit Prisma Review model with composite unique constraint on `(buyerId, orderId)`, denormalize aggregate ratings on User/Gig models, and implement review submission as a server action restricted to completed orders only.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma v7 | v7.x | Database ORM with explicit many-to-many relations | Already in project, supports composite unique constraints |
| PostgreSQL | 17 | Relational database for review data | Already in project, handles UNIQUE constraints efficiently |
| Zod | Latest | Form validation schema | Already used throughout project for validation |
| Next.js 15 | v15 | Server actions for review submission | Already in project, follows established pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Flowbite React | Latest | Pre-built star rating components | For display-only rating stars (profile, gig cards) |
| date-fns | Latest | Date formatting | Already used in project for timestamps |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Denormalized aggregates | Real-time computed | Real-time accurate but slower queries, adds computational load |
| Explicit Review model | Implicit many-to-many | Explicit allows storing rating, content, timestamps |
| Bayesian average | Simple arithmetic mean | Bayesian better for low review counts, but more complex |

**Installation:**
```bash
# No new packages required - Prisma, Zod, date-fns already installed
# Optional: Star rating component library
npm install flowbite-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── validations/
│       └── review.ts              # Zod schema for review validation
├── actions/
│   └── reviews.ts                 # Server actions: submitReview, deleteReview
├── components/
│   └── reviews/
│       ├── ReviewForm.tsx         # Review submission form (client)
│       ├── ReviewList.tsx         # Display reviews
│       ├── StarRating.tsx         # Reusable star display component
│       └── RatingInput.tsx        # Interactive rating selector
└── app/
    └── orders/
        └── [orderId]/
            └── page.tsx           # Add review form after COMPLETED status
```

### Pattern 1: Explicit Review Model with Composite Constraint

**What:** Review model as explicit junction between User and Order with unique constraint preventing duplicates

**When to use:** Review systems where each transaction should have at most one review

**Example:**
```typescript
// Prisma schema
model Review {
  id         String   @id @default(cuid())
  buyerId    String
  buyer      User     @relation("BuyerReviews", fields: [buyerId], references: [id], onDelete: Cascade)
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  providerId String
  provider   User     @relation("ProviderReviews", fields: [providerId], references: [id], onDelete: Cascade)
  gigId      String
  gig        Gig      @relation(fields: [gigId], references: [id], onDelete: Cascade)
  rating     Int      // 1-5 stars
  content    String?  @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([buyerId, orderId]) // ONE review per buyer per order
  @@index([providerId])
  @@index([gigId])
  @@index([createdAt])
}
```

**Source:** [Prisma Many-to-Many Relations Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)

### Pattern 2: Denormalized Aggregate Ratings

**What:** Store computed aggregate rating and review count directly on User and Gig models for fast queries

**When to use:** When displaying ratings on listings/cards (high read frequency, low write frequency)

**Example:**
```typescript
// Add to User model
model User {
  // ... existing fields
  averageRating    Float   @default(0.0)
  totalReviews     Int     @default(0)
  reviewsReceived  Review[] @relation("ProviderReviews")
}

// Add to Gig model
model Gig {
  // ... existing fields
  averageRating Float   @default(0.0)
  totalReviews  Int     @default(0)
  reviews       Review[]
}
```

**Update strategy:** When a review is submitted, use a transaction to:
1. Create the review
2. Recalculate and update aggregate on User
3. Recalculate and update aggregate on Gig

**Source:** [Data Denormalization Best Practices](https://hevodata.com/learn/data-denormalization/)

### Pattern 3: Server Action with Verified Purchase Check

**What:** Review submission restricted to COMPLETED orders only, preventing reviews before service delivery

**When to use:** All marketplace review systems requiring verified purchases

**Example:**
```typescript
// src/actions/reviews.ts
"use server";

export async function submitReview(
  orderId: string,
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify order exists and is COMPLETED
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      buyerId: true,
      providerId: true,
      gigId: true
    },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  if (order.buyerId !== session.user.id) {
    return { success: false, error: "Not authorized" };
  }

  if (order.status !== OrderStatus.COMPLETED) {
    return {
      success: false,
      error: "Can only review completed orders"
    };
  }

  // Check for existing review (duplicate prevention)
  const existingReview = await prisma.review.findUnique({
    where: {
      buyerId_orderId: {
        buyerId: session.user.id,
        orderId
      }
    },
  });

  if (existingReview) {
    return { success: false, error: "You have already reviewed this order" };
  }

  // Validate and create review...
}
```

**Source:** Derived from existing order action patterns in `/Users/anas/CodeV2/Herafi/src/actions/orders.ts`

### Pattern 4: Zod Validation Schema

**What:** Single source of truth for review validation, used on both client and server

**When to use:** All forms in Next.js 15 with server actions

**Example:**
```typescript
// src/lib/validations/review.ts
import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be under 1000 characters")
    .optional()
    .nullable(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
```

**Source:** [Next.js 15 Forms with Zod Validation](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/)

### Anti-Patterns to Avoid

- **Don't use implicit many-to-many** - You need to store rating value and content, requiring an explicit Review model
- **Don't compute ratings on-the-fly for listings** - Denormalize aggregates to avoid expensive JOIN queries on every card render
- **Don't allow reviews before order completion** - Always verify OrderStatus.COMPLETED before accepting review
- **Don't skip the unique constraint** - Database-level constraint prevents race conditions better than application logic

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Star rating UI | Custom SVG stars with click handlers | Flowbite React Rating, shadcn/ui rating | Handle fractional stars, accessibility, hover states |
| Unique constraint validation | Application-level duplicate checking | PostgreSQL composite UNIQUE constraint | Prevents race conditions, enforced at database level |
| Rating aggregation | Manual average calculation in code | PostgreSQL AVG() with transaction | Atomic updates, prevents drift between review and aggregate |
| Form validation | Custom validation functions | Zod schema with shared client/server validation | Type-safe, single source of truth, already used in project |

**Key insight:** Rating systems have subtle edge cases (duplicate submissions, rating drift, fractional display, accessibility) that component libraries and database constraints handle better than custom implementations.

## Common Pitfalls

### Pitfall 1: Missing Verified Purchase Constraint

**What goes wrong:** Users can review gigs they never purchased, or review before service completion, enabling spam and fraudulent reviews

**Why it happens:** Developers focus on schema design and forget business logic validation in the submission flow

**How to avoid:**
- Add explicit check in server action: `if (order.status !== OrderStatus.COMPLETED)`
- Consider adding a database constraint: `CHECK (orderId IS NOT NULL)` to enforce review-order linkage
- Display review form only when order status is COMPLETED in UI

**Warning signs:** Reviews appearing immediately after order placement, reviews from users with no completed orders

**Source:** [AWS Marketplace Review System](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-product-reviews.html)

### Pitfall 2: Rating Aggregation Drift

**What goes wrong:** Displayed aggregate rating doesn't match actual average of reviews due to non-atomic updates

**Why it happens:** Review creation and aggregate update happen in separate queries, or aggregate is never updated when review is deleted

**How to avoid:**
- Use Prisma transactions for review submission:
  ```typescript
  await prisma.$transaction([
    prisma.review.create({ ... }),
    prisma.user.update({
      where: { id: providerId },
      data: {
        averageRating: newAverage,
        totalReviews: { increment: 1 }
      }
    }),
    prisma.gig.update({ ... })
  ]);
  ```
- Recalculate aggregates on review delete
- Consider a periodic batch job to verify and fix drift

**Warning signs:** `SELECT AVG(rating) FROM reviews WHERE providerId = X` doesn't match `user.averageRating`

**Source:** [Database Denormalization Best Practices](https://hevodata.com/learn/data-denormalization/)

### Pitfall 3: Duplicate Review Submissions

**What goes wrong:** Same user submits multiple reviews for the same order due to race conditions or UI allowing re-submission

**Why it happens:** Relying only on application-level checking without database-level constraint

**How to avoid:**
- Add composite unique constraint in Prisma schema: `@@unique([buyerId, orderId])`
- Handle Prisma error code P2002 (unique constraint violation) gracefully
- Disable submit button after first click (client-side optimization, not security)
- Check for existing review before showing form in UI

**Warning signs:** Duplicate reviews in database with same `buyerId` + `orderId`, Prisma errors in logs

**Source:** [PostgreSQL UNIQUE Constraint Guide](https://neon.com/postgresql/postgresql-tutorial/postgresql-unique-constraint)

### Pitfall 4: Poor Rating Display on Low Review Counts

**What goes wrong:** Gigs with one 5-star review rank higher than gigs with 100 reviews averaging 4.8 stars

**Why it happens:** Using simple arithmetic mean without considering review volume

**How to avoid:**
- For v1, display review count alongside rating: "★ 5.0 (1 review)" vs "★ 4.8 (100 reviews)"
- For v2, implement Bayesian average for sorting/ranking (deferred per success criteria)
- Consider minimum review threshold for "verified" badge

**Warning signs:** Users complaining about misleading ratings, new gigs with single 5-star review dominating search

**Source:** [Algolia Bayesian Average Ranking](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking/how-to/bayesian-average)

### Pitfall 5: Recency Bias in Displayed Reviews

**What goes wrong:** Only showing most recent reviews can misrepresent overall service quality if provider had a bad week

**Why it happens:** Simple `ORDER BY createdAt DESC` without considering rating distribution

**How to avoid:**
- For v1, show most recent reviews with aggregate rating prominently displayed
- Consider showing highest and lowest rated reviews for balance
- Allow buyers to filter/sort reviews (most recent, highest rated, lowest rated)

**Warning signs:** Aggregate rating significantly different from visible reviews

**Source:** [Performance Review Common Mistakes](https://www.thehrdigest.com/5-common-performance-review-mistakes-that-you-can-fix-in-2026)

## Code Examples

Verified patterns from official sources and existing codebase:

### Example 1: Review Model in Prisma Schema

```typescript
// prisma/schema.prisma

enum OrderStatus {
  PENDING
  ACCEPTED
  IN_PROGRESS
  COMPLETED  // Only this status allows reviews
  CANCELLED
}

model Review {
  id         String   @id @default(cuid())

  // Reviewer (buyer)
  buyerId    String
  buyer      User     @relation("BuyerReviews", fields: [buyerId], references: [id], onDelete: Cascade)

  // Order being reviewed (verified purchase)
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Provider being reviewed
  providerId String
  provider   User     @relation("ProviderReviews", fields: [providerId], references: [id], onDelete: Cascade)

  // Gig being reviewed
  gigId      String
  gig        Gig      @relation(fields: [gigId], references: [id], onDelete: Cascade)

  // Review content
  rating     Int      // 1-5 stars
  content    String?  @db.Text

  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Constraints
  @@unique([buyerId, orderId]) // ONE review per buyer per order
  @@index([providerId])        // Fast lookup of provider reviews
  @@index([gigId])             // Fast lookup of gig reviews
  @@index([createdAt])         // For sorting by date
}

model User {
  // ... existing fields

  // Denormalized aggregates (as provider)
  averageRating       Float   @default(0.0)
  totalReviews        Int     @default(0)

  // Relations
  reviewsWritten  Review[] @relation("BuyerReviews")
  reviewsReceived Review[] @relation("ProviderReviews")
}

model Gig {
  // ... existing fields

  // Denormalized aggregates
  averageRating Float   @default(0.0)
  totalReviews  Int     @default(0)

  // Relations
  reviews       Review[]
}

model Order {
  // ... existing fields

  // Relation
  review Review?  // One-to-one: order can have at most one review
}
```

**Source:** Derived from existing schema at `/Users/anas/CodeV2/Herafi/prisma/schema.prisma` and [Prisma Relations Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)

### Example 2: Review Submission Server Action

```typescript
// src/actions/reviews.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validations/review";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export type ReviewActionState = {
  success: boolean;
  reviewId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitReview(
  orderId: string,
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch order with relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      buyerId: true,
      providerId: true,
      gigId: true,
    },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // Authorization: only buyer can review
  if (order.buyerId !== session.user.id) {
    return { success: false, error: "Not authorized to review this order" };
  }

  // Business rule: only completed orders can be reviewed
  if (order.status !== OrderStatus.COMPLETED) {
    return {
      success: false,
      error: "Can only review completed orders"
    };
  }

  // Check for existing review (additional safety, DB constraint is primary)
  const existingReview = await prisma.review.findUnique({
    where: {
      buyerId_orderId: {
        buyerId: session.user.id,
        orderId: orderId,
      },
    },
  });

  if (existingReview) {
    return {
      success: false,
      error: "You have already reviewed this order"
    };
  }

  // Validate form data
  const raw = {
    rating: parseInt(formData.get("rating") as string),
    content: formData.get("content") as string | null,
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.review.create({
        data: {
          buyerId: session.user.id,
          orderId: orderId,
          providerId: order.providerId,
          gigId: order.gigId,
          rating: parsed.data.rating,
          content: parsed.data.content,
        },
      });

      // Recalculate provider aggregate rating
      const providerReviews = await tx.review.findMany({
        where: { providerId: order.providerId },
        select: { rating: true },
      });

      const providerAverage =
        providerReviews.reduce((sum, r) => sum + r.rating, 0) /
        providerReviews.length;

      await tx.user.update({
        where: { id: order.providerId },
        data: {
          averageRating: providerAverage,
          totalReviews: providerReviews.length,
        },
      });

      // Recalculate gig aggregate rating
      const gigReviews = await tx.review.findMany({
        where: { gigId: order.gigId },
        select: { rating: true },
      });

      const gigAverage =
        gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length;

      await tx.gig.update({
        where: { id: order.gigId },
        data: {
          averageRating: gigAverage,
          totalReviews: gigReviews.length,
        },
      });

      return review;
    });

    // Revalidate relevant paths
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/gigs/${order.gigId}`);
    revalidatePath(`/u/[username]`, "page"); // Provider profile

    return { success: true, reviewId: result.id };
  } catch (error: any) {
    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return {
        success: false,
        error: "Review already exists for this order",
      };
    }

    console.error("Review submission error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}
```

**Source:** Derived from existing action patterns at `/Users/anas/CodeV2/Herafi/src/actions/orders.ts` and `/Users/anas/CodeV2/Herafi/src/actions/profile.ts`

### Example 3: Review Display Component

```typescript
// src/components/reviews/ReviewList.tsx
import { format } from "date-fns";
import StarRating from "./StarRating";

interface ReviewListProps {
  reviews: {
    id: string;
    rating: number;
    content: string | null;
    createdAt: Date;
    buyer: {
      username: string | null;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const displayName =
          review.buyer.displayName || review.buyer.username || "Anonymous";
        const initials = displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={review.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar */}
              {review.buyer.avatarUrl ? (
                <img
                  src={review.buyer.avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
              )}

              {/* Name and date */}
              <div className="flex-grow">
                <p className="font-semibold text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), "MMMM d, yyyy")}
                </p>
              </div>

              {/* Star rating */}
              <StarRating rating={review.rating} />
            </div>

            {/* Review content */}
            {review.content && (
              <p className="text-gray-700 leading-relaxed">{review.content}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Source:** Derived from existing component patterns at `/Users/anas/CodeV2/Herafi/src/components/orders/OrderCard.tsx` and `/Users/anas/CodeV2/Herafi/src/components/gigs/ProviderCard.tsx`

### Example 4: Star Rating Display Component

```typescript
// src/components/reviews/StarRating.tsx
interface StarRatingProps {
  rating: number; // 1-5 or fractional like 4.5
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

export default function StarRating({
  rating,
  size = "md",
  showNumber = false
}: StarRatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Full star
      stars.push(
        <span key={i} className="text-yellow-500">
          ★
        </span>
      );
    } else if (i - 0.5 <= rating) {
      // Half star (for fractional ratings)
      stars.push(
        <span key={i} className="text-yellow-500 relative">
          <span className="absolute text-gray-300">★</span>
          <span className="overflow-hidden inline-block w-1/2">★</span>
        </span>
      );
    } else {
      // Empty star
      stars.push(
        <span key={i} className="text-gray-300">
          ★
        </span>
      );
    }
  }

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      {stars}
      {showNumber && (
        <span className="ml-1 text-gray-600 font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
```

**Source:** Derived from placeholder at `/Users/anas/CodeV2/Herafi/src/components/gigs/ProviderCard.tsx` (lines 68-72)

### Example 5: Interactive Rating Input

```typescript
// src/components/reviews/RatingInput.tsx
"use client";

import { useState } from "react";

interface RatingInputProps {
  name: string;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
}

export default function RatingInput({
  name,
  value = 0,
  onChange,
  error
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || value;

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl transition-colors ${
              star <= displayRating
                ? "text-yellow-500"
                : "text-gray-300"
            } hover:text-yellow-400`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
```

**Source:** Derived from [Flowbite React Rating Component](https://flowbite-react.com/docs/components/rating)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Computed ratings on-the-fly | Denormalized aggregates with transactional updates | ~2020 | 10-100x faster listing queries, became standard for marketplace platforms |
| Simple arithmetic mean | Bayesian average for low review counts | ~2021 | More fair ranking for new items, used by Uber, Amazon |
| Implicit many-to-many | Explicit junction models | Prisma v2+ (2020) | Enables storing review content, timestamps, metadata |
| Manual duplicate checking | Database composite unique constraints | Always available, widely adopted ~2018 | Prevents race conditions, enforces data integrity |
| useFormState | useActionState | Next.js 15 (2024) | Cleaner API, better TypeScript support |

**Deprecated/outdated:**
- **Implicit many-to-many for reviews**: Can't store rating value, content, or timestamps without explicit model
- **Real-time computed aggregates for listings**: Too slow for high-traffic pages, denormalization is standard
- **Client-only duplicate validation**: Race conditions can bypass, database constraint required

## Open Questions

Things that couldn't be fully resolved:

1. **Should reviews be editable after submission?**
   - What we know: Success criteria don't mention edit functionality, AWS Marketplace and Google Reviews allow limited editing within timeframes
   - What's unclear: User expectations for Herafi marketplace
   - Recommendation: v1 should NOT allow editing (simpler, immutable, reduces moderation complexity). Defer to v2 if users request.

2. **Should providers be able to respond to reviews?**
   - What we know: Many marketplaces (Airbnb, Amazon) allow provider responses, builds trust and accountability
   - What's unclear: Not in Phase 6 requirements or success criteria
   - Recommendation: Defer to v2. Provider responses add complexity (schema changes, UI changes, moderation) without being required for MVP.

3. **What happens to reviews when an order is cancelled?**
   - What we know: Order model has CANCELLED status, reviews should only exist for COMPLETED orders
   - What's unclear: If a review exists and order is somehow retroactively cancelled (edge case)
   - Recommendation: Add migration to delete orphaned reviews where `order.status != COMPLETED`, add check in UI to hide review form if order becomes cancelled.

4. **Should review content be required or optional?**
   - What we know: Success criteria mention "written review", suggesting optional text content is acceptable
   - What's unclear: User experience implications
   - Recommendation: Make content optional (star rating required, text optional). Validation: `content.min(10)` if provided, prevents low-effort spam while allowing star-only reviews.

## Sources

### Primary (HIGH confidence)
- [Prisma Many-to-Many Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations) - Official Prisma v7 documentation
- [PostgreSQL UNIQUE Constraint](https://www.postgresql.org/docs/current/ddl-constraints.html) - Official PostgreSQL documentation
- [PostgreSQL UNIQUE Constraint Tutorial](https://neon.com/postgresql/postgresql-tutorial/postgresql-unique-constraint) - Composite constraint patterns
- Existing codebase at `/Users/anas/CodeV2/Herafi` (schema, actions, components)

### Secondary (MEDIUM confidence)
- [Next.js 15 Forms with Server Actions and Zod](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/) - Form validation patterns
- [Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - useActionState patterns
- [Data Denormalization Best Practices](https://hevodata.com/learn/data-denormalization/) - Aggregate rating storage strategies
- [Flowbite React Rating Component](https://flowbite-react.com/docs/components/rating/) - Star rating UI patterns
- [AWS Marketplace Product Reviews](https://docs.aws.amazon.com/marketplace/latest/buyerguide/buyer-product-reviews.html) - Verified purchase patterns
- [Algolia Bayesian Average Ranking](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking/how-to/bayesian-average) - Advanced rating calculations

### Tertiary (LOW confidence)
- [Performance Review Common Mistakes](https://www.thehrdigest.com/5-common-performance-review-mistakes-that-you-can-fix-in-2026) - Recency bias in reviews (general guidance)
- [Google Review Policy 2026](https://wiserreview.com/blog/google-review-policy/) - Review moderation principles (out of scope for v1)
- [Social Media Moderation Tools](https://statusbrew.com/insights/social-media-comment-moderation-tools) - Spam prevention (future consideration)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Prisma v7, PostgreSQL, Zod, Next.js 15 already in project, patterns verified in official docs
- Architecture: HIGH - Schema patterns verified in Prisma docs, composite unique constraints verified in PostgreSQL docs, server action pattern matches existing codebase
- Pitfalls: MEDIUM - Common pitfalls derived from general database best practices and marketplace review system research, some inferred from edge cases

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable domain)
