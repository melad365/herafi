interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showNumber?: boolean
  reviewCount?: number
}

export default function StarRating({
  rating,
  size = "md",
  showNumber = false,
  reviewCount,
}: StarRatingProps) {
  // Size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  // Render 5 stars
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= Math.floor(rating)
    const isPartial = i === Math.ceil(rating) && rating % 1 !== 0

    stars.push(
      <span
        key={i}
        className={`${
          isFilled || isPartial ? "text-burgundy-600" : "text-gray-300"
        } ${sizeClasses[size]}`}
        style={
          isPartial
            ? {
                background: `linear-gradient(90deg, rgb(87 13 30) ${
                  (rating % 1) * 100
                }%, rgb(209 213 219) ${(rating % 1) * 100}%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }
            : undefined
        }
      >
        ★
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
      {showNumber && (
        <span className={`ml-1 font-medium text-gray-700 ${sizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="ml-1 text-sm text-gray-500">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  )
}
