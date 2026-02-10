import Link from "next/link"
import { format } from "date-fns"
import OrderStatusBadge from "./OrderStatusBadge"
import type { OrderStatus } from "@prisma/client"

interface OrderCardProps {
  order: {
    id: string
    status: OrderStatus
    totalPrice: number
    selectedTier: string
    createdAt: Date
    gig: {
      title: string
      slug: string
    }
    buyer?: {
      username: string | null
      displayName: string | null
      avatarUrl: string | null
    }
    provider?: {
      username: string | null
      displayName: string | null
      avatarUrl: string | null
    }
  }
  viewAs: "buyer" | "provider"
}

export default function OrderCard({ order, viewAs }: OrderCardProps) {
  // Determine counterparty based on view role
  const counterparty = viewAs === "buyer" ? order.provider : order.buyer
  const counterpartyLabel = viewAs === "buyer" ? "Provider" : "Buyer"
  const counterpartyName =
    counterparty?.displayName || counterparty?.username || "Anonymous"

  // Format tier name (capitalize first letter)
  const tierName =
    order.selectedTier.charAt(0).toUpperCase() + order.selectedTier.slice(1)

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 mb-1">{order.gig.title}</h3>
          <p className="text-sm text-gray-600">
            {counterpartyLabel}: {counterpartyName}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-900">
            ${order.totalPrice.toFixed(2)}
          </span>
          <span className="text-gray-500">•</span>
          <span>{tierName} Tier</span>
        </div>
        <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
      </div>
    </Link>
  )
}
