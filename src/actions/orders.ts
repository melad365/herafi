"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validations/order";
import { revalidatePath } from "next/cache";
import { canTransition } from "@/lib/order-state-machine";
import { OrderStatus } from "@prisma/client";
import type { PricingTiers } from "@/lib/validations/pricing";

export type OrderActionState = {
  success: boolean;
  orderId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function placeOrder(
  gigSlug: string,
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch gig with provider info
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: {
      id: true,
      providerId: true,
      pricingTiers: true,
    },
  });

  if (!gig) {
    return { success: false, error: "Gig not found" };
  }

  // Prevent self-ordering
  if (gig.providerId === session.user.id) {
    return { success: false, error: "Cannot order from yourself" };
  }

  // Extract form data
  const raw = {
    selectedTier: formData.get("selectedTier") as string,
    deliveryNotes: formData.get("deliveryNotes") as string | null,
  };

  // Validate with orderSchema
  const parsed = orderSchema.safeParse(raw);
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
    // Cast pricingTiers and extract tier
    const pricingTiers = gig.pricingTiers as PricingTiers;
    const tierName = parsed.data.selectedTier;

    let tier;
    if (tierName === "basic") {
      tier = pricingTiers.basic;
    } else if (tierName === "standard") {
      tier = pricingTiers.standard;
    } else if (tierName === "premium") {
      tier = pricingTiers.premium;
    }

    // Check if tier exists (standard/premium might be undefined if not enabled)
    if (!tier) {
      return { success: false, error: "Selected tier is not available" };
    }

    // Create order with tier snapshot
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        providerId: gig.providerId,
        gigId: gig.id,
        selectedTier: tierName,
        tierSnapshot: tier,
        totalPrice: tier.price,
        deliveryNotes: parsed.data.deliveryNotes,
        status: OrderStatus.PENDING,
        paymentConfirmed: true, // Mock payment auto-approval
      },
    });

    // Revalidate paths
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath(`/gigs/${gigSlug}`);

    return { success: true, orderId: order.id };
  } catch (error) {
    return { success: false, error: "Failed to place order" };
  }
}
