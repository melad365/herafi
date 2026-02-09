import slugify from "slugify";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function generateUniqueGigSlug(
  title: string,
  gigId?: string
): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = crypto.randomBytes(3).toString("hex");
  const slug = `${baseSlug}-${suffix}`;

  // Check if slug already exists
  const existing = await prisma.gig.findUnique({
    where: { slug },
    select: { id: true },
  });

  // If slug exists and it's not the same gig being updated, retry
  if (existing && existing.id !== gigId) {
    return generateUniqueGigSlug(title, gigId);
  }

  return slug;
}
