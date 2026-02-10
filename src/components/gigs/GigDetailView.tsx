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
  isAuthenticated: boolean
}

export default function GigDetailView({ gig, isOwner, isAuthenticated }: GigDetailViewProps) {
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
                  <div className="relative bg-white rounded-lg border-2 border-gray-200 shadow p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{gig.pricingTiers.basic.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${gig.pricingTiers.basic.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{gig.pricingTiers.basic.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{gig.pricingTiers.basic.deliveryDays} {gig.pricingTiers.basic.deliveryDays === 1 ? "day" : "days"} delivery</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{gig.pricingTiers.basic.revisions === 0 ? "No revisions" : `${gig.pricingTiers.basic.revisions} ${gig.pricingTiers.basic.revisions === 1 ? "revision" : "revisions"}`}</span>
                      </div>
                    </div>
                    {gig.pricingTiers.basic.features && gig.pricingTiers.basic.features.length > 0 && (
                      <div className="mb-6 flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Features included:</h4>
                        <ul className="space-y-2">
                          {gig.pricingTiers.basic.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isOwner ? (
                      <div className="w-full py-3 px-4 rounded-md font-medium text-center bg-gray-100 text-gray-600">Your Gig</div>
                    ) : isAuthenticated ? (
                      <Link href={`/gigs/${gig.slug}/order`} className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        Order Now
                      </Link>
                    ) : (
                      <Link href="/login" className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        Sign in to Order
                      </Link>
                    )}
                  </div>
                )}
                {gig.pricingTiers.standard && (
                  <div className="relative bg-white rounded-lg border-2 border-orange-500 shadow-lg p-6 flex flex-col h-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{gig.pricingTiers.standard.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${gig.pricingTiers.standard.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{gig.pricingTiers.standard.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{gig.pricingTiers.standard.deliveryDays} {gig.pricingTiers.standard.deliveryDays === 1 ? "day" : "days"} delivery</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{gig.pricingTiers.standard.revisions === 0 ? "No revisions" : `${gig.pricingTiers.standard.revisions} ${gig.pricingTiers.standard.revisions === 1 ? "revision" : "revisions"}`}</span>
                      </div>
                    </div>
                    {gig.pricingTiers.standard.features && gig.pricingTiers.standard.features.length > 0 && (
                      <div className="mb-6 flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Features included:</h4>
                        <ul className="space-y-2">
                          {gig.pricingTiers.standard.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isOwner ? (
                      <div className="w-full py-3 px-4 rounded-md font-medium text-center bg-gray-100 text-gray-600">Your Gig</div>
                    ) : isAuthenticated ? (
                      <Link href={`/gigs/${gig.slug}/order`} className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-600 hover:bg-orange-700 text-white transition-colors">
                        Order Now
                      </Link>
                    ) : (
                      <Link href="/login" className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-600 hover:bg-orange-700 text-white transition-colors">
                        Sign in to Order
                      </Link>
                    )}
                  </div>
                )}
                {gig.pricingTiers.premium && (
                  <div className="relative bg-white rounded-lg border-2 border-gray-200 shadow p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{gig.pricingTiers.premium.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${gig.pricingTiers.premium.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{gig.pricingTiers.premium.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{gig.pricingTiers.premium.deliveryDays} {gig.pricingTiers.premium.deliveryDays === 1 ? "day" : "days"} delivery</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{gig.pricingTiers.premium.revisions === 0 ? "No revisions" : `${gig.pricingTiers.premium.revisions} ${gig.pricingTiers.premium.revisions === 1 ? "revision" : "revisions"}`}</span>
                      </div>
                    </div>
                    {gig.pricingTiers.premium.features && gig.pricingTiers.premium.features.length > 0 && (
                      <div className="mb-6 flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Features included:</h4>
                        <ul className="space-y-2">
                          {gig.pricingTiers.premium.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isOwner ? (
                      <div className="w-full py-3 px-4 rounded-md font-medium text-center bg-gray-100 text-gray-600">Your Gig</div>
                    ) : isAuthenticated ? (
                      <Link href={`/gigs/${gig.slug}/order`} className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        Order Now
                      </Link>
                    ) : (
                      <Link href="/login" className="w-full py-3 px-4 rounded-md font-semibold text-center bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                        Sign in to Order
                      </Link>
                    )}
                  </div>
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
