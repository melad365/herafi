"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveFile, deleteFile } from "@/lib/file-upload";
import { revalidatePath } from "next/cache";

export async function uploadAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Avatar must be under 2MB" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true, username: true },
    });

    const avatarUrl = await saveFile(file, "avatars");

    if (user?.avatarUrl) {
      await deleteFile(user.avatarUrl);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    revalidatePath("/profile/edit");
    if (user?.username) {
      revalidatePath(`/u/${user.username}`);
    }

    return { success: true, avatarUrl };
  } catch (error) {
    return { success: false, error: "Failed to upload avatar" };
  }
}
