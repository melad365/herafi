"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteGig } from "@/actions/gigs"
import GigImageGallery from "./GigImageGallery"
import PricingTierCard from "./PricingTierCard"
import ProviderCard from "./ProviderCard"
import { CATEGORY_LABELS } from "@/components/forms/GigForm"
import type { PricingTiers } from "@/lib/validations/pricing"

interface GigDetailViewProps {
  gig: {
    id: string
    title: string
    slug: string
    description: string
    category: string
    pricingTiers: PricingTiers
    images: string[]
    provider: {
      id: string
      username: string | null
      displayName: string | null
      avatarUrl: string | null
      bio: string | null
      createdAt: Date
    }
  }
  isOwner: boolean
}

export default function GigDetailView({ gig, isOwner }: GigDetailViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this gig? This action cannot be undone."
      )
    ) {
      return
    }

    setIsDeleting(true)
    const result = await deleteGig(gig.slug)

    if (result.success) {
      router.push("/dashboard")
    } else {
      alert(result.error || "Failed to delete gig")
      setIsDeleting(false)
    }
  }

  // Get category label
  const categoryLabel = CATEGORY_LABELS[gig.category] || gig.category

  // Collect active pricing tiers
  const activeTiers = [
    gig.pricingTiers.basic,
    gig.pricingTiers.standard,
    gig.pricingTiers.premium,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <GigImageGallery images={gig.images} title={gig.title} />

            {/* Title and Category */}
            <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-900 flex-grow">
                  {gig.title}
                </h1>
              </div>
              <div>
                <span className="inline-block uppercase text-xs font-semibold bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About This Service
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {gig.description}
              </p>
            </div>

            {/* Pricing Tiers */}
            <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Compare Packages
              </h2>
              <div
                className={`grid gap-6 ${
                  activeTiers.length === 1
                    ? "grid-cols-1 max-w-md"
                    : activeTiers.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {gig.pricingTiers.basic && (
                  <PricingTierCard
                    tier={gig.pricingTiers.basic}
                    highlighted={!gig.pricingTiers.standard}
                  />
                )}
                {gig.pricingTiers.standard && (
                  <PricingTierCard
                    tier={gig.pricingTiers.standard}
                    highlighted={true}
                  />
                )}
                {gig.pricingTiers.premium && (
                  <PricingTierCard tier={gig.pricingTiers.premium} />
                )}
              </div>
            </div>

            {/* Reviews placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews
              </h2>
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to order and review this service!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Provider Card */}
            <ProviderCard provider={gig.provider} />

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Gig
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/gigs/${gig.slug}/edit`}
                    className="block w-full text-center py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                  >
                    Edit Gig
                  </Link>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400"
                  >
                    {isDeleting ? "Deleting..." : "Delete Gig"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
