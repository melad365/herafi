import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { CATEGORY_LABELS } from "@/components/forms/GigForm"
import type { PricingTiers } from "@/lib/validations/pricing"
import OrderCard from "@/components/orders/OrderCard"
import { OrderStatus } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()

  // Defense in depth - middleware should catch this first
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: {
      username: true,
      isProvider: true,
    },
  })

  // Get provider's gigs if user is a provider
  const gigs = user?.isProvider
    ? await prisma.gig.findMany({
        where: { providerId: session.user?.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          pricingTiers: true,
          isActive: true,
        },
      })
    : []

  // Get buyer's orders
  const buyerOrders = await prisma.order.findMany({
    where: { buyerId: session.user?.id },
    include: {
      gig: {
        select: {
          title: true,
          slug: true,
        },
      },
      provider: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Get provider's incoming order requests (only if user is provider)
  const providerOrders = user?.isProvider
    ? await prisma.order.findMany({
        where: {
          providerId: session.user?.id,
          status: {
            in: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS],
          },
        },
        include: {
          gig: {
            select: {
              title: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            Your account: <span className="font-medium">{session.user?.email}</span>
          </p>
          {user?.isProvider && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Provider
              </span>
            </div>
          )}
        </div>

        {/* Username Setup Prompt */}
        {!user?.username && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Complete your profile!
            </h2>
            <p className="text-amber-800 mb-4">
              Set up your username and profile info to get started on Herafi.
            </p>
            <Link
              href="/profile/edit"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              Set Up Profile
            </Link>
          </div>
        )}

        {/* My Orders Section */}
        {buyerOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                My Orders{" "}
                <span className="text-gray-500 text-lg font-normal">
                  ({buyerOrders.length})
                </span>
              </h2>
              <Link
                href="/orders"
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {buyerOrders.map((order) => (
                <OrderCard key={order.id} order={order} viewAs="buyer" />
              ))}
            </div>
          </div>
        )}

        {/* Order Requests Section - for providers */}
        {user?.isProvider && providerOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Requests{" "}
                <span className="text-gray-500 text-lg font-normal">
                  ({providerOrders.length})
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {providerOrders.map((order) => (
                <OrderCard key={order.id} order={order} viewAs="provider" />
              ))}
            </div>
          </div>
        )}

        {/* My Gigs Section - for providers */}
        {user?.isProvider && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                My Gigs{" "}
                <span className="text-gray-500 text-lg font-normal">
                  ({gigs.length})
                </span>
              </h2>
              <Link
                href="/gigs/new"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Create New Gig
              </Link>
            </div>

            {gigs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">
                  You haven&apos;t created any gigs yet.
                </p>
                <Link
                  href="/gigs/new"
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                >
                  Create Your First Gig
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {gigs.map((gig) => {
                  const pricingTiers = gig.pricingTiers as PricingTiers
                  const startingPrice = pricingTiers.basic?.price
                  const categoryLabel =
                    CATEGORY_LABELS[gig.category] || gig.category

                  return (
                    <div
                      key={gig.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {gig.title}
                          </h3>
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
                          <span className="uppercase font-medium">
                            {categoryLabel}
                          </span>
                          {startingPrice && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>Starting at ${startingPrice}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/gigs/${gig.slug}`}
                          className="text-sm text-gray-600 hover:text-orange-600 font-medium px-3 py-1.5 rounded transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/gigs/${gig.slug}/edit`}
                          className="text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium px-3 py-1.5 rounded transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Edit Profile Card */}
          <Link
            href="/profile/edit"
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-orange-300"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Edit Profile
            </h3>
            <p className="text-gray-600 text-sm">
              Update your username, bio, avatar, and portfolio images
            </p>
          </Link>

          {/* View My Profile Card - only if username is set */}
          {user?.username && (
            <Link
              href={`/u/${user.username}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-orange-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View My Profile
              </h3>
              <p className="text-gray-600 text-sm">
                See your public profile as others see it
              </p>
            </Link>
          )}

          {/* Become a Provider Card - only if NOT already a provider */}
          {!user?.isProvider && (
            <Link
              href="/provider/setup"
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-orange-200 hover:border-orange-400"
            >
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Become a Provider
              </h3>
              <p className="text-orange-800 text-sm">
                Share your expertise and start offering services
              </p>
            </Link>
          )}
        </div>

        {/* Sign out form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
