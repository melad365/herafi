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

export async function acceptOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch order with provider check
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { providerId: true, status: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify only provider can accept
    if (session.user.id !== order.providerId) {
      return { success: false, error: "Not authorized to accept this order" };
    }

    // Validate state transition
    if (!canTransition(order.status, OrderStatus.ACCEPTED)) {
      return { success: false, error: "Cannot accept this order" };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to accept order" };
  }
}

export async function startOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch order with provider check
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { providerId: true, status: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify only provider can start
    if (session.user.id !== order.providerId) {
      return { success: false, error: "Not authorized to start this order" };
    }

    // Validate state transition
    if (!canTransition(order.status, OrderStatus.IN_PROGRESS)) {
      return { success: false, error: "Cannot start this order" };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to start order" };
  }
}

export async function completeOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch order with provider check
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { providerId: true, status: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify only provider can complete
    if (session.user.id !== order.providerId) {
      return { success: false, error: "Not authorized to complete this order" };
    }

    // Validate state transition
    if (!canTransition(order.status, OrderStatus.COMPLETED)) {
      return { success: false, error: "Cannot complete this order" };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to complete order" };
  }
}

export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch order with buyer and provider check
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, providerId: true, status: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify either buyer or provider can cancel
    const isBuyer = session.user.id === order.buyerId;
    const isProvider = session.user.id === order.providerId;

    if (!isBuyer && !isProvider) {
      return { success: false, error: "Not authorized to cancel this order" };
    }

    // Validate state transition
    if (!canTransition(order.status, OrderStatus.CANCELLED)) {
      return { success: false, error: "Cannot cancel this order" };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to cancel order" };
  }
}
