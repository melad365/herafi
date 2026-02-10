import { OrderStatus } from "@prisma/client"

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; colorClass: string }
> = {
  PENDING: {
    label: "Pending",
    colorClass: "bg-yellow-100 text-yellow-800",
  },
  ACCEPTED: {
    label: "Accepted",
    colorClass: "bg-blue-100 text-blue-800",
  },
  IN_PROGRESS: {
    label: "In Progress",
    colorClass: "bg-purple-100 text-purple-800",
  },
  COMPLETED: {
    label: "Completed",
    colorClass: "bg-green-100 text-green-800",
  },
  CANCELLED: {
    label: "Cancelled",
    colorClass: "bg-red-100 text-red-800",
  },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.colorClass}`}
    >
      {config.label}
    </span>
  )
}
