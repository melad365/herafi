import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/components/forms/GigForm";
import type { PricingTiers } from "@/lib/validations/pricing";

export default async function ProviderGigsPage() {
  const session = await auth();

  // Require authentication
  if (!session) {
    redirect("/login");
  }

  // Check if user is a provider
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProvider: true },
  });

  if (!user?.isProvider) {
    redirect("/provider/setup");
  }

  // Fetch ALL provider's gigs (no limit)
  const gigs = await prisma.gig.findMany({
    where: { providerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      pricingTiers: true,
      isActive: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header card */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900">
              My Gigs{" "}
              <span className="text-gray-500 text-lg font-normal">
                ({gigs.length})
              </span>
            </h1>
            <Link
              href="/gigs/new"
              className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Create New Gig
            </Link>
          </div>
        </div>

        {/* Gig list */}
        {gigs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-8">
            <div className="text-center py-8 bg-cream-50 rounded-lg">
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
        ) : (
          <div className="space-y-4">
            {gigs.map((gig) => {
              const pricingTiers = gig.pricingTiers as PricingTiers;
              const startingPrice = pricingTiers.basic?.price;
              const categoryLabel = CATEGORY_LABELS[gig.category] || gig.category;

              return (
                <div
                  key={gig.id}
                  className="bg-white rounded-xl shadow-card p-6 border border-gray-200 hover:border-burgundy-300 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Gig info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {gig.title}
                        </h2>
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

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="uppercase font-medium">
                          {categoryLabel}
                        </span>
                        {startingPrice && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>Starting at ${startingPrice}</span>
                          </>
                        )}
                        {gig.totalReviews > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              ⭐ {gig.averageRating.toFixed(1)}{" "}
                              <span className="text-gray-500">
                                ({gig.totalReviews}{" "}
                                {gig.totalReviews === 1 ? "review" : "reviews"})
                              </span>
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        Created: {new Date(gig.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
