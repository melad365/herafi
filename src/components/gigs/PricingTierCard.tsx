import type { PricingTier } from "@/lib/validations/pricing"

interface PricingTierCardProps {
  tier: PricingTier
  highlighted?: boolean
}

export default function PricingTierCard({
  tier,
  highlighted = false,
}: PricingTierCardProps) {
  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-6 flex flex-col h-full ${
        highlighted
          ? "border-burgundy-500 shadow-lg"
          : "border-gray-200 shadow"
      }`}
    >
      {/* Popular badge for highlighted tier */}
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block bg-burgundy-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

      {/* Tier name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">{tier.description}</p>

      {/* Delivery and Revisions */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {tier.deliveryDays} {tier.deliveryDays === 1 ? "day" : "days"}{" "}
            delivery
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            {tier.revisions === 0
              ? "No revisions"
              : `${tier.revisions} ${
                  tier.revisions === 1 ? "revision" : "revisions"
                }`}
          </span>
        </div>
      </div>

      {/* Features list */}
      {tier.features && tier.features.length > 0 && (
        <div className="mb-6 flex-grow">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Features included:
          </h4>
          <ul className="space-y-2">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Select button */}
      <button
        type="button"
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          highlighted
            ? "bg-burgundy-600 hover:bg-burgundy-700 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
        }`}
      >
        Continue
      </button>
    </div>
  )
}
