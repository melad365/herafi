"use client";

import { useState, useEffect } from "react";
import type { PricingTier } from "@/lib/validations/pricing";

type PricingTierInputProps = {
  tierName: "Basic" | "Standard" | "Premium";
  required?: boolean;
  defaultValue?: PricingTier;
  onChange: (tier: PricingTier | null) => void;
};

export default function PricingTierInput({
  tierName,
  required = false,
  defaultValue,
  onChange,
}: PricingTierInputProps) {
  const [enabled, setEnabled] = useState(
    required || defaultValue !== undefined
  );
  const [price, setPrice] = useState(defaultValue?.price ?? 0);
  const [description, setDescription] = useState(
    defaultValue?.description ?? ""
  );
  const [deliveryDays, setDeliveryDays] = useState(
    defaultValue?.deliveryDays ?? 1
  );
  const [revisions, setRevisions] = useState(defaultValue?.revisions ?? 0);
  const [features, setFeatures] = useState(
    defaultValue?.features?.join(", ") ?? ""
  );

  // Determine border color based on tier
  const borderColors = {
    Basic: "border-gray-300 hover:border-gray-400",
    Standard: "border-burgundy-300 hover:border-burgundy-400",
    Premium: "border-burgundy-500 hover:border-burgundy-600",
  };

  const headerColors = {
    Basic: "bg-gray-50 border-b border-gray-200",
    Standard: "bg-burgundy-50 border-b border-burgundy-200",
    Premium: "bg-burgundy-100 border-b border-burgundy-300",
  };

  // Emit changes to parent
  useEffect(() => {
    if (!enabled) {
      onChange(null);
    } else {
      onChange({
        name: tierName,
        price,
        description,
        deliveryDays,
        revisions,
        features: features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
      });
    }
  }, [enabled, price, description, deliveryDays, revisions, features, onChange, tierName]);

  return (
    <div
      className={`border-2 rounded-lg overflow-hidden ${borderColors[tierName]}`}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${headerColors[tierName]}`}>
        <h3 className="font-semibold text-gray-900">{tierName}</h3>
        {!required && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">Enable</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-burgundy-800 rounded focus:ring-burgundy-500"
            />
          </label>
        )}
      </div>

      {/* Form fields - only show when enabled */}
      {enabled && (
        <div className="p-4 space-y-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              min="1"
              max="999999"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description ({description.length}/200)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500"
              required
              placeholder="Describe what's included in this tier..."
            />
          </div>

          {/* Delivery Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Days
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500"
              required
            />
          </div>

          {/* Revisions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revisions (0 for unlimited)
            </label>
            <input
              type="number"
              min="0"
              max="99"
              value={revisions}
              onChange={(e) => setRevisions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500"
              required
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (comma-separated, max 10)
            </label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500"
              placeholder="Feature 1, Feature 2, Feature 3"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {features.split(",").filter((f) => f.trim()).length}/10 features
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
