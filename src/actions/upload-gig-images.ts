"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/file-upload";
import { revalidatePath } from "next/cache";

const MAX_GIG_IMAGES = 6;

export async function uploadGigImages(gigSlug: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: { providerId: true, images: true },
  });

  if (!gig) {
    return { success: false, error: "Gig not found" };
  }

  if (gig.providerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this gig" };
  }

  // Get files from formData
  const files = formData.getAll("images") as File[];

  if (files.length === 0 || files[0].size === 0) {
    return { success: false, error: "No files provided" };
  }

  // Check total image count
  if (gig.images.length + files.length > MAX_GIG_IMAGES) {
    return {
      success: false,
      error: `Maximum ${MAX_GIG_IMAGES} images allowed. You can upload ${MAX_GIG_IMAGES - gig.images.length} more.`
    };
  }

  // Validate each file
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Each image must be under 5MB" };
    }
  }

  try {
    // Save files
    const newImageUrls: string[] = [];
    for (const file of files) {
      const imageUrl = await saveFile(file, "gigs");
      newImageUrls.push(imageUrl);
    }

    // Update gig with new images
    await prisma.gig.update({
      where: { slug: gigSlug },
      data: {
        images: {
          push: newImageUrls,
        },
      },
    });

    revalidatePath(`/gigs/${gigSlug}`);
    revalidatePath(`/gigs/${gigSlug}/edit`);

    return { success: true, imageUrls: newImageUrls };
  } catch (error) {
    return { success: false, error: "Failed to upload images" };
  }
}

export async function removeGigImage(gigSlug: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const gig = await prisma.gig.findUnique({
    where: { slug: gigSlug },
    select: { providerId: true, images: true },
  });

  if (!gig) {
    return { success: false, error: "Gig not found" };
  }

  if (gig.providerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this gig" };
  }

  if (!gig.images.includes(imageUrl)) {
    return { success: false, error: "Image not found in gig" };
  }

  try {
    // Remove image from array
    const updatedImages = gig.images.filter((url) => url !== imageUrl);

    // Update gig
    await prisma.gig.update({
      where: { slug: gigSlug },
      data: {
        images: updatedImages,
      },
    });

    // Delete file from filesystem
    await deleteFile(imageUrl);

    revalidatePath(`/gigs/${gigSlug}`);
    revalidatePath(`/gigs/${gigSlug}/edit`);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove image" };
  }
}
