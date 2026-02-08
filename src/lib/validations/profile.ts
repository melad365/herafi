import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .transform((val) => val.toLowerCase());

export const profileSchema = z.object({
  username: usernameSchema,
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export const providerSchema = z.object({
  providerBio: z
    .string()
    .min(10, "Provider bio must be at least 10 characters")
    .max(1000, "Provider bio must be at most 1000 characters"),
  professionalSummary: z
    .string()
    .min(10, "Professional summary must be at least 10 characters")
    .max(500, "Professional summary must be at most 500 characters"),
  skills: z
    .array(z.string().min(1).max(50))
    .min(1, "Add at least one skill")
    .max(20, "Maximum 20 skills"),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Maximum 50 years"),
  certifications: z
    .array(z.string().min(1).max(100))
    .max(10, "Maximum 10 certifications")
    .optional()
    .default([]),
});
