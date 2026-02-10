"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { GigActionState } from "@/actions/gigs";
import type { GigFormData } from "@/lib/validations/gig";
import type { PricingTier } from "@/lib/validations/pricing";
import PricingTierInput from "./PricingTierInput";
import ImageUploadSection from "./ImageUploadSection";

// Category labels mapping
export const CATEGORY_LABELS: Record<string, string> = {
  PLUMBING: "Plumbing",
  PAINTING: "Painting",
  CLEANING: "Cleaning",
  CARPENTRY: "Carpentry",
  WELDING: "Welding",
  ELECTRICAL: "Electrical",
  HVAC: "HVAC",
  LANDSCAPING: "Landscaping",
  MOVING: "Moving",
  CAR_WASHING: "Car Washing",
  DIGITAL_DESIGN: "Digital Design",
  DIGITAL_WRITING: "Digital Writing",
  OTHER: "Other",
};

type GigFormProps = {
  mode: "create" | "edit";
  initialData?: GigFormData & { slug?: string; images?: string[] };
  action: (
    prevState: GigActionState,
    formData: FormData
  ) => Promise<GigActionState>;
};

export default function GigForm({ mode, initialData, action }: GigFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });

  // Form fields state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [category, setCategory] = useState(initialData?.category ?? "");

  // Pricing tiers state
  const [basicTier, setBasicTier] = useState<PricingTier | null>(
    initialData?.pricingTiers?.basic ?? null
  );
  const [standardTier, setStandardTier] = useState<PricingTier | null>(
    initialData?.pricingTiers?.standard ?? null
  );
  const [premiumTier, setPremiumTier] = useState<PricingTier | null>(
    initialData?.pricingTiers?.premium ?? null
  );

  // Redirect on success
  useEffect(() => {
    if (state.success && state.slug) {
      if (mode === "create") {
        router.push(`/gigs/${state.slug}/edit`);
      } else {
        router.push(`/gigs/${state.slug}`);
      }
    }
  }, [state.success, state.slug, mode, router]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {mode === "create" ? "Create a New Gig" : "Edit Gig"}
      </h1>

      <form action={formAction} className="space-y-8">
        {/* Error message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {state.error}
          </div>
        )}

        {/* Basic Information Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gig Title ({title.length}/100)
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={10}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="I will..."
              required
            />
            {state.fieldErrors?.title && (
              <p className="mt-1 text-sm text-red-600">
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Select a category...</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {state.fieldErrors?.category && (
              <p className="mt-1 text-sm text-red-600">
                {state.fieldErrors.category[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description ({description.length}/5000)
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={50}
              maxLength={5000}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your service in detail..."
              required
            />
            {state.fieldErrors?.description && (
              <p className="mt-1 text-sm text-red-600">
                {state.fieldErrors.description[0]}
              </p>
            )}
          </div>
        </section>

        {/* Pricing Tiers Section */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pricing Tiers
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Create up to 3 pricing tiers. Basic tier is required, Standard and
            Premium are optional.
          </p>

          <div className="space-y-4">
            <PricingTierInput
              tierName="Basic"
              required
              defaultValue={basicTier ?? undefined}
              onChange={setBasicTier}
            />
            <PricingTierInput
              tierName="Standard"
              defaultValue={standardTier ?? undefined}
              onChange={setStandardTier}
            />
            <PricingTierInput
              tierName="Premium"
              defaultValue={premiumTier ?? undefined}
              onChange={setPremiumTier}
            />
          </div>

          {/* Hidden input for pricing tiers JSON */}
          <input
            type="hidden"
            name="pricingTiers"
            value={JSON.stringify({
              basic: basicTier,
              standard: standardTier ?? undefined,
              premium: premiumTier ?? undefined,
            })}
          />

          {state.fieldErrors?.pricingTiers && (
            <p className="mt-2 text-sm text-red-600">
              {state.fieldErrors.pricingTiers[0]}
            </p>
          )}
        </section>

        {/* Image Gallery Section - Edit Mode Only */}
        {mode === "edit" && initialData?.slug && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Image Gallery
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Upload up to 6 images to showcase your service. Images help buyers understand what you offer.
            </p>
            <ImageUploadSection
              gigSlug={initialData.slug}
              initialImages={initialData.images ?? []}
            />
          </section>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            {isPending
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Gig"
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
