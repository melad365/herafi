import Link from "next/link"
import { CATEGORY_LABELS } from "@/components/forms/GigForm"
import type { PricingTiers } from "@/lib/validations/pricing"
import type { Prisma } from "@prisma/client"

interface GigsTabProps {
  gigs: {
    id: string
    slug: string
    title: string
    category: string
    pricingTiers: Prisma.JsonValue
    isActive: boolean
    createdAt: Date
    _count: {
      orders: number
    }
  }[]
}

export default function GigsTab({ gigs }: GigsTabProps) {
  // Empty state
  if (gigs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            You haven&apos;t created any gigs yet.
          </p>
          <Link
            href="/gigs/new"
            className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-200"
          >
            Create Your First Gig
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          My Gigs{" "}
          <span className="text-gray-500 text-lg font-normal">
            ({gigs.length})
          </span>
        </h2>
        <Link
          href="/gigs/new"
          className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Create New Gig
        </Link>
      </div>

      {/* Gig List */}
      <div className="space-y-3">
        {gigs.map((gig) => {
          const pricingTiers = gig.pricingTiers as PricingTiers
          const startingPrice = pricingTiers.basic?.price
          const categoryLabel = CATEGORY_LABELS[gig.category] || gig.category

          return (
            <div
              key={gig.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-burgundy-300 transition-colors duration-200"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                      gig.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gig.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="uppercase font-medium">{categoryLabel}</span>
                  {startingPrice && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Starting at ${startingPrice}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>
                    {gig._count.orders}{" "}
                    {gig._count.orders === 1 ? "order" : "orders"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/gigs/${gig.slug}`}
                  className="text-sm text-gray-600 hover:text-burgundy-700 font-medium px-3 py-1.5 rounded transition-colors duration-200"
                >
                  View
                </Link>
                <Link
                  href={`/gigs/${gig.slug}/edit`}
                  className="text-sm bg-burgundy-100 text-burgundy-800 hover:bg-burgundy-200 font-medium px-3 py-1.5 rounded transition-colors duration-200"
                >
                  Edit
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
