"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/file-upload";
import { revalidatePath } from "next/cache";

const MAX_PORTFOLIO_IMAGES = 6;

export async function uploadPortfolioImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const file = formData.get("image") as File;
  const caption = formData.get("caption") as string | null;

  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Image must be under 5MB" };
  }

  const count = await prisma.portfolioImage.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_PORTFOLIO_IMAGES) {
    return { success: false, error: `Maximum ${MAX_PORTFOLIO_IMAGES} portfolio images allowed` };
  }

  try {
    const imageUrl = await saveFile(file, "portfolio");

    const image = await prisma.portfolioImage.create({
      data: {
        userId: session.user.id,
        imageUrl,
        caption: caption || null,
        order: count,
      },
    });

    revalidatePath("/profile/edit");
    return { success: true, image };
  } catch (error) {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deletePortfolioImage(imageId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const image = await prisma.portfolioImage.findFirst({
    where: { id: imageId, userId: session.user.id },
  });

  if (!image) {
    return { success: false, error: "Image not found" };
  }

  await deleteFile(image.imageUrl);
  await prisma.portfolioImage.delete({ where: { id: imageId } });

  revalidatePath("/profile/edit");
  return { success: true };
}
