import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import OrderCard from "@/components/orders/OrderCard"
import Link from "next/link"

export default async function OrdersPage() {
  const session = await auth()

  // Require auth
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch buyer's orders
  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
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
  })

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track all your service orders in one place
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/gigs"
              className="inline-block bg-burgundy-600 hover:bg-burgundy-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} viewAs="buyer" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
