"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export type ProfileActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const raw = {
    username: formData.get("username") as string,
    displayName: formData.get("displayName") as string,
    bio: formData.get("bio") as string,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio || null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return {
        success: false,
        fieldErrors: { username: ["This username is already taken"] },
      };
    }
    return { success: false, error: "Failed to update profile" };
  }

  revalidatePath("/profile/edit");
  revalidatePath(`/u/${parsed.data.username}`);
  return { success: true };
}
