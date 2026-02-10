import { z } from "zod";

export const orderSchema = z.object({
  selectedTier: z.enum(["basic", "standard", "premium"], {
    message: "Please select a pricing tier",
  }),
  deliveryNotes: z
    .string()
    .max(1000, "Delivery notes must be under 1000 characters")
    .optional()
    .nullable(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
