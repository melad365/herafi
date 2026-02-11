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
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  // Fetch order with related data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      buyerId: true,
      providerId: true,
      gigId: true,
      gig: {
        select: {
          slug: true,
        },
      },
      provider: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // Verify buyer is current user
  if (userId !== order.buyerId) {
    return { success: false, error: "Not authorized to review this order" };
  }

  // Verify order status is COMPLETED
  if (order.status !== OrderStatus.COMPLETED) {
    return {
      success: false,
      error: "Can only review completed orders",
    };
  }

  // Check for existing review
  const existingReview = await prisma.review.findUnique({
    where: {
      buyerId_orderId: {
        buyerId: userId,
        orderId: orderId,
      },
    },
  });

  if (existingReview) {
    return { success: false, error: "You have already reviewed this order" };
  }

  // Extract and parse form data
  const rating = parseInt(formData.get("rating") as string);
  const content = formData.get("content") as string | null;

  // Validate with reviewSchema
  const parsed = reviewSchema.safeParse({
    rating,
    content: content || null,
  });

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
    // Create review and update aggregates in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          buyerId: userId,
          orderId: order.id,
          providerId: order.providerId,
          gigId: order.gigId,
          rating: parsed.data.rating,
          content: parsed.data.content ?? null,
        },
      });

      // Fetch all provider reviews and recalculate average
      const providerReviews = await tx.review.findMany({
        where: { providerId: order.providerId },
        select: { rating: true },
      });

      const providerAvgRating =
        providerReviews.reduce((sum, r) => sum + r.rating, 0) /
        providerReviews.length;

      await tx.user.update({
        where: { id: order.providerId },
        data: {
          averageRating: providerAvgRating,
          totalReviews: providerReviews.length,
        },
      });

      // Fetch all gig reviews and recalculate average
      const gigReviews = await tx.review.findMany({
        where: { gigId: order.gigId },
        select: { rating: true },
      });

      const gigAvgRating =
        gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length;

      await tx.gig.update({
        where: { id: order.gigId },
        data: {
          averageRating: gigAvgRating,
          totalReviews: gigReviews.length,
        },
      });

      return newReview;
    });

    // Revalidate paths
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/gigs/${order.gig.slug}`);
    if (order.provider.username) {
      revalidatePath(`/u/${order.provider.username}`);
    }

    return { success: true, reviewId: review.id };
  } catch (error: any) {
    // Handle unique constraint violation (P2002)
    if (error.code === "P2002") {
      return { success: false, error: "You have already reviewed this order" };
    }

    return { success: false, error: "Failed to submit review" };
  }
}
