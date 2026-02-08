"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { providerSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export type ProviderActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function becomeProvider(
  _prevState: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const skillsRaw = formData.get("skills") as string;
  const certsRaw = formData.get("certifications") as string;

  const raw = {
    providerBio: formData.get("providerBio") as string,
    professionalSummary: formData.get("professionalSummary") as string,
    skills: skillsRaw ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
    yearsOfExperience: Number(formData.get("yearsOfExperience")),
    certifications: certsRaw ? certsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
  };

  const parsed = providerSchema.safeParse(raw);
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
        isProvider: true,
        providerBio: parsed.data.providerBio,
        professionalSummary: parsed.data.professionalSummary,
        skills: parsed.data.skills,
        yearsOfExperience: parsed.data.yearsOfExperience,
        certifications: parsed.data.certifications,
      },
    });
  } catch (error) {
    return { success: false, error: "Failed to set up provider profile" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/provider/setup");
  return { success: true };
}
