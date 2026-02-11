import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import OrderTimeline from "@/components/orders/OrderTimeline"
import ReviewForm from "@/components/reviews/ReviewForm"
import StarRating from "@/components/reviews/StarRating"
import Link from "next/link"
import { format } from "date-fns"
import { acceptOrder, startOrder, completeOrder, cancelOrder } from "@/actions/orders"
import { OrderStatus } from "@prisma/client"
import type { PricingTier } from "@/lib/validations/pricing"

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params

  const session = await auth()

  // Require auth
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch order with all related data including review
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      provider: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      gig: {
        select: {
          title: true,
          slug: true,
        },
      },
      review: true,
    },
  })

  if (!order) {
    notFound()
  }

  // Authorization check
  const isBuyer = order.buyerId === session.user.id
  const isProvider = order.providerId === session.user.id

  if (!isBuyer && !isProvider) {
    notFound()
  }

  // Get tier snapshot
  const tierSnapshot = order.tierSnapshot as PricingTier

  // Capitalize tier name
  const tierName =
    order.selectedTier.charAt(0).toUpperCase() + order.selectedTier.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>
              <p className="text-gray-600">
                Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Gig Info */}
          <div className="border-t pt-4">
            <Link
              href={`/gigs/${order.gig.slug}`}
              className="text-xl font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              {order.gig.title}
            </Link>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Buyer Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Buyer</h2>
            <div className="flex items-center gap-3">
              {order.buyer.avatarUrl ? (
                <img
                  src={order.buyer.avatarUrl}
                  alt={order.buyer.displayName || order.buyer.username || "Buyer"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-lg">
                    {(order.buyer.displayName || order.buyer.username || "A").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {order.buyer.displayName || order.buyer.username || "Anonymous"}
                </p>
                {order.buyer.username && (
                  <Link
                    href={`/u/${order.buyer.username}`}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    @{order.buyer.username}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Provider Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Provider</h2>
            <div className="flex items-center gap-3">
              {order.provider.avatarUrl ? (
                <img
                  src={order.provider.avatarUrl}
                  alt={order.provider.displayName || order.provider.username || "Provider"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-lg">
                    {(order.provider.displayName || order.provider.username || "P").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {order.provider.displayName || order.provider.username || "Anonymous"}
                </p>
                {order.provider.username && (
                  <Link
                    href={`/u/${order.provider.username}`}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    @{order.provider.username}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Information
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-600">Package:</span>
              <span className="font-semibold text-gray-900">{tierName} Tier</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-semibold text-gray-900 text-lg">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>

            {tierSnapshot && (
              <>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">Delivery Time:</span>
                  <span className="font-medium text-gray-900">
                    {tierSnapshot.deliveryDays}{" "}
                    {tierSnapshot.deliveryDays === 1 ? "day" : "days"}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">Revisions:</span>
                  <span className="font-medium text-gray-900">
                    {tierSnapshot.revisions === 0
                      ? "None"
                      : tierSnapshot.revisions}
                  </span>
                </div>
              </>
            )}

            {order.deliveryNotes && (
              <div className="pt-2">
                <h3 className="text-gray-900 font-medium mb-2">Delivery Notes:</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {order.deliveryNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Action Buttons */}
        {isProvider && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Provider Actions
            </h2>

            <div className="flex flex-wrap gap-3">
              {order.status === OrderStatus.PENDING && (
                <>
                  <form action={async () => {
                    "use server"
                    await acceptOrder(orderId)
                  }}>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                    >
                      Accept Order
                    </button>
                  </form>
                  <form action={async () => {
                    "use server"
                    await cancelOrder(orderId)
                  }}>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                    >
                      Decline
                    </button>
                  </form>
                </>
              )}

              {order.status === OrderStatus.ACCEPTED && (
                <form action={async () => {
                  "use server"
                  await startOrder(orderId)
                }}>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                  >
                    Start Working
                  </button>
                </form>
              )}

              {order.status === OrderStatus.IN_PROGRESS && (
                <form action={async () => {
                  "use server"
                  await completeOrder(orderId)
                }}>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                  >
                    Mark Complete
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Buyer Cancel Button */}
        {isBuyer &&
          (order.status === OrderStatus.PENDING ||
            order.status === OrderStatus.ACCEPTED) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Buyer Actions
              </h2>
              <form action={async () => {
                "use server"
                await cancelOrder(orderId)
              }}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
                >
                  Cancel Order
                </button>
              </form>
            </div>
          )}

        {/* Review section */}
        {isBuyer && order.status === OrderStatus.COMPLETED && (
          <div className="mb-6">
            {order.review ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Review
                </h2>
                <div className="mb-3">
                  <StarRating rating={order.review.rating} size="md" showNumber />
                </div>
                {order.review.content && (
                  <p className="text-gray-700 leading-relaxed">
                    {order.review.content}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Reviewed on {format(new Date(order.review.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            ) : (
              <ReviewForm orderId={orderId} />
            )}
          </div>
        )}

        {/* Timeline */}
        <OrderTimeline order={order} />
      </div>
    </div>
  )
}
