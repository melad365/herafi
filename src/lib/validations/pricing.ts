import { z } from "zod";

export const pricingTierSchema = z.object({
  name: z.enum(["Basic", "Standard", "Premium"]),
  price: z
    .number()
    .positive("Price must be positive")
    .max(999999, "Price must be at most 999,999"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be at most 200 characters"),
  deliveryDays: z
    .number()
    .int("Delivery days must be a whole number")
    .positive("Delivery days must be positive")
    .max(365, "Delivery days must be at most 365"),
  revisions: z
    .number()
    .int("Revisions must be a whole number")
    .nonnegative("Revisions cannot be negative")
    .max(99, "Revisions must be at most 99"),
  features: z
    .array(
      z
        .string()
        .min(1, "Feature cannot be empty")
        .max(100, "Feature must be at most 100 characters")
    )
    .max(10, "Maximum 10 features per tier"),
});

export const pricingTiersSchema = z.object({
  basic: pricingTierSchema,
  standard: pricingTierSchema.optional(),
  premium: pricingTierSchema.optional(),
});

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type PricingTiers = z.infer<typeof pricingTiersSchema>;
