import OrderCard from "@/components/orders/OrderCard"
import type { OrderStatus } from "@prisma/client"

interface OrdersTabProps {
  orders: {
    id: string
    status: OrderStatus
    totalPrice: number
    selectedTier: string
    createdAt: Date
    gig: {
      title: string
      slug: string
    }
    buyer: {
      username: string | null
      displayName: string | null
      avatarUrl: string | null
    }
  }[]
}

export default function OrdersTab({ orders }: OrdersTabProps) {
  // Global empty state
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 text-center py-8">
          No orders yet. When customers order your services, they&apos;ll appear
          here.
        </p>
      </div>
    )
  }

  // Group orders by status
  const pendingOrders = orders.filter((order) => order.status === "PENDING")
  const activeOrders = orders.filter((order) =>
    ["ACCEPTED", "IN_PROGRESS"].includes(order.status)
  )
  const completedOrders = orders.filter((order) =>
    ["COMPLETED", "CANCELLED"].includes(order.status)
  )

  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Pending Orders{" "}
              <span className="text-gray-500 text-lg font-normal">
                ({pendingOrders.length})
              </span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              These orders need your attention
            </p>
          </div>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} viewAs="provider" />
            ))}
          </div>
        </div>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Active Orders{" "}
              <span className="text-gray-500 text-lg font-normal">
                ({activeOrders.length})
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} viewAs="provider" />
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Completed Orders{" "}
            <span className="text-gray-500 text-lg font-normal">
              ({completedOrders.length})
            </span>
          </h2>
        </div>
        {completedOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No completed orders yet
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {completedOrders.slice(0, 10).map((order) => (
                <OrderCard key={order.id} order={order} viewAs="provider" />
              ))}
            </div>
            {completedOrders.length > 10 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                Showing 10 of {completedOrders.length} completed orders
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
