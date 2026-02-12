import { format } from "date-fns"
import StarRating from "./StarRating"

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: Date
  buyer: {
    username: string | null
    displayName: string | null
    avatarUrl: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const buyerName =
          review.buyer.displayName || review.buyer.username || "Anonymous"
        const initials = buyerName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-soft border border-gray-200 p-6"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              {review.buyer.avatarUrl ? (
                <img
                  src={review.buyer.avatarUrl}
                  alt={buyerName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {initials}
                </div>
              )}

              {/* Review content */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{buyerName}</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>

                {review.content && (
                  <p className="text-gray-700 leading-relaxed mt-3">
                    {review.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
