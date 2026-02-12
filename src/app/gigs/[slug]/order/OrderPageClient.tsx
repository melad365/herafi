"use client"

import { useEffect, useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { placeOrder } from "@/actions/orders"
import type { PricingTier } from "@/lib/validations/pricing"
import { toast } from "sonner"

interface OrderPageClientProps {
  gig: {
    id: string
    title: string
    slug: string
    pricingTiers: {
      basic: PricingTier
      standard?: PricingTier
      premium?: PricingTier
    }
  }
}

export default function OrderPageClient({ gig }: OrderPageClientProps) {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // useActionState for form submission
  const [state, formAction, isPending] = useActionState(
    placeOrder.bind(null, gig.slug),
    { success: false }
  )

  // Show toast and redirect on success/error
  useEffect(() => {
    if (state.success && state.orderId) {
      toast.success("Order placed successfully!")
      router.push(`/orders/${state.orderId}`)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state.success, state.orderId, state.error, router])

  // Collect active tiers
  const tiers = [
    { key: "basic", tier: gig.pricingTiers.basic },
    { key: "standard", tier: gig.pricingTiers.standard },
    { key: "premium", tier: gig.pricingTiers.premium },
  ].filter((t) => t.tier !== undefined) as Array<{
    key: string
    tier: PricingTier
  }>

  // Get selected tier details
  const selectedTierDetails = tiers.find((t) => t.key === selectedTier)?.tier

  const handleContinueToPayment = () => {
    if (!selectedTier) {
      alert("Please select a pricing tier")
      return
    }
    setShowPaymentModal(true)
  }

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("selectedTier", selectedTier)
    if (deliveryNotes) {
      formData.append("deliveryNotes", deliveryNotes)
    }
    formAction(formData)
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Place an Order
          </h1>
          <p className="text-gray-600">
            Service: <span className="font-semibold">{gig.title}</span>
          </p>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Tier Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select a Package
          </h2>
          <div
            className={`grid gap-4 ${
              tiers.length === 1
                ? "grid-cols-1 max-w-md"
                : tiers.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {tiers.map(({ key, tier }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTier(key)}
                className={`text-left p-5 rounded-lg border-2 transition-all ${
                  selectedTier === key
                    ? "border-burgundy-500 bg-burgundy-50 shadow-md"
                    : "border-gray-200 hover:border-burgundy-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {tier.name}
                  </h3>
                  {selectedTier === key && (
                    <svg
                      className="w-6 h-6 text-burgundy-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  ${tier.price}
                </p>
                <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    {tier.deliveryDays}{" "}
                    {tier.deliveryDays === 1 ? "day" : "days"} delivery
                  </p>
                  <p>
                    {tier.revisions === 0
                      ? "No revisions"
                      : `${tier.revisions} ${
                          tier.revisions === 1 ? "revision" : "revisions"
                        }`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Notes */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Delivery Notes (Optional)
          </h2>
          <textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Any special instructions or requirements for the provider..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-2">
            {deliveryNotes.length}/1000 characters
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleContinueToPayment}
            disabled={!selectedTier || isPending}
            className="bg-burgundy-600 hover:bg-burgundy-700 text-white font-semibold py-3 px-8 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </div>

        {/* Mock Payment Modal */}
        {showPaymentModal && selectedTierDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Payment
              </h2>

              {/* MVP Notice */}
              <div className="bg-burgundy-50 border border-burgundy-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-burgundy-900 font-medium">
                  This is a simulated payment
                </p>
                <p className="text-sm text-burgundy-800 mt-1">
                  No actual payment will be processed. This is for demonstration
                  purposes only.
                </p>
              </div>

              {/* Order Summary */}
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{gig.title}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium text-gray-900">
                    {selectedTierDetails.name}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-burgundy-600">
                    ${selectedTierDetails.price}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <form onSubmit={handleConfirmPayment}>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 bg-burgundy-600 hover:bg-burgundy-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
