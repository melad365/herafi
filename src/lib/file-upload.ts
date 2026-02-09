import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFile(
  file: File,
  subDir: "avatars" | "portfolio" | "gigs"
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const filePath = path.join(dir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate file is an image by checking magic bytes
  const { fileTypeFromBuffer } = await import("file-type");
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !type.mime.startsWith("image/")) {
    throw new Error("Invalid file type. Only images are allowed.");
  }

  await fs.writeFile(filePath, buffer);
  return `/uploads/${subDir}/${uniqueName}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", fileUrl);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist, ignore
  }
}
