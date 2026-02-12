"use client"

import { useState } from "react"

interface RatingInputProps {
  name: string
  value: number
  onChange: (value: number) => void
  error?: string
}

export default function RatingInput({
  name,
  value,
  onChange,
  error,
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const displayRating = hoverRating || value

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} stars`}
            className={`text-3xl transition-colors duration-200 ${
              star <= displayRating
                ? hoverRating > 0
                  ? "text-burgundy-400"
                  : "text-burgundy-600"
                : "text-gray-300"
            } hover:text-burgundy-400`}
          >
            ★
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
