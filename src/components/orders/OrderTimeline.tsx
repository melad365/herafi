import { format } from "date-fns"
import type { OrderStatus } from "@prisma/client"

interface OrderTimelineProps {
  order: {
    status: OrderStatus
    createdAt: Date
    acceptedAt?: Date | null
    startedAt?: Date | null
    completedAt?: Date | null
    cancelledAt?: Date | null
  }
}

interface TimelineEvent {
  label: string
  timestamp: Date
  color: string
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  // Build events array from non-null timestamps
  const events: TimelineEvent[] = []

  events.push({
    label: "Order Placed",
    timestamp: order.createdAt,
    color: "bg-blue-500",
  })

  if (order.acceptedAt) {
    events.push({
      label: "Order Accepted",
      timestamp: order.acceptedAt,
      color: "bg-green-500",
    })
  }

  if (order.startedAt) {
    events.push({
      label: "Work Started",
      timestamp: order.startedAt,
      color: "bg-burgundy-800",
    })
  }

  if (order.completedAt) {
    events.push({
      label: "Order Completed",
      timestamp: order.completedAt,
      color: "bg-green-600",
    })
  }

  if (order.cancelledAt) {
    events.push({
      label: "Order Cancelled",
      timestamp: order.cancelledAt,
      color: "bg-red-500",
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-lg font-semibold text-burgundy-900 mb-6">
        Order Timeline
      </h2>
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex items-start">
            {/* Circle indicator */}
            <div className="flex flex-col items-center mr-4">
              <div className={`w-4 h-4 rounded-full ${event.color}`} />
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-burgundy-200 mt-2" />
              )}
            </div>

            {/* Event details */}
            <div className="flex-grow pb-6">
              <p className="font-medium text-gray-900">{event.label}</p>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(event.timestamp), "PPpp")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
