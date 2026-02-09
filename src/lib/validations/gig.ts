import { z } from "zod";
import { pricingTiersSchema } from "./pricing";

export const gigSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be at most 5000 characters"),
  category: z.enum([
    "PLUMBING",
    "PAINTING",
    "CLEANING",
    "CARPENTRY",
    "WELDING",
    "ELECTRICAL",
    "HVAC",
    "LANDSCAPING",
    "MOVING",
    "CAR_WASHING",
    "DIGITAL_DESIGN",
    "DIGITAL_WRITING",
    "OTHER",
  ]),
  pricingTiers: pricingTiersSchema,
});

export type GigFormData = z.infer<typeof gigSchema>;
