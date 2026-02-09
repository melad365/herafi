"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gigSchema } from "@/lib/validations/gig";
import { generateUniqueGigSlug } from "@/lib/slug";
import { deleteFile } from "@/lib/file-upload";
import { revalidatePath } from "next/cache";

export type GigActionState = {
  success: boolean;
  slug?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createGig(
  _prevState: GigActionState,
  formData: FormData
): Promise<GigActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify user is a provider
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProvider: true },
  });

  if (!user?.isProvider) {
    return { success: false, error: "Only providers can create gigs" };
  }

  // Extract form data
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    pricingTiers: JSON.parse(formData.get("pricingTiers") as string),
  };

  // Validate with gigSchema
  const parsed = gigSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // Generate unique slug
    const slug = await generateUniqueGigSlug(parsed.data.title);

    // Create gig
    await prisma.gig.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        pricingTiers: parsed.data.pricingTiers,
        slug,
        providerId: session.user.id,
      },
    });

    // Revalidate paths
    revalidatePath("/gigs");
    revalidatePath("/dashboard");

    return { success: true, slug };
  } catch (error) {
    return { success: false, error: "Failed to create gig" };
  }
}

export async function updateGig(
  gigSlug: string,
  _prevState: GigActionState,
  formData: FormData
): Promise<GigActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: { id: true, providerId: true, title: true },
  });

  if (!gig) {
    return { success: false, error: "Gig not found" };
  }

  if (gig.providerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this gig" };
  }

  // Extract form data
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    pricingTiers: JSON.parse(formData.get("pricingTiers") as string),
  };

  // Validate with gigSchema
  const parsed = gigSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // Check if title changed - if so, generate new slug
    let newSlug = gigSlug;
    if (parsed.data.title !== gig.title) {
      newSlug = await generateUniqueGigSlug(parsed.data.title, gig.id);
    }

    // Update gig
    await prisma.gig.update({
      where: { slug: gigSlug },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        pricingTiers: parsed.data.pricingTiers,
        slug: newSlug,
      },
    });

    // Revalidate old and new paths
    revalidatePath(`/gigs/${gigSlug}`);
    if (newSlug !== gigSlug) {
      revalidatePath(`/gigs/${newSlug}`);
    }
    revalidatePath("/gigs");
    revalidatePath("/dashboard");

    return { success: true, slug: newSlug };
  } catch (error) {
    return { success: false, error: "Failed to update gig" };
  }
}

export async function deleteGig(
  gigSlug: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership and get gig images
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: { providerId: true, images: true },
  });

  if (!gig) {
    return { success: false, error: "Gig not found" };
  }

  if (gig.providerId !== session.user.id) {
    return { success: false, error: "Not authorized to delete this gig" };
  }

  try {
    // Delete images from filesystem
    for (const imageUrl of gig.images) {
      await deleteFile(imageUrl);
    }

    // Delete gig from database
    await prisma.gig.delete({
      where: { slug: gigSlug },
    });

    // Revalidate paths
    revalidatePath("/gigs");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete gig" };
  }
}
