"use client"

import { useState, useActionState } from "react"
import { submitReview, type ReviewActionState } from "@/actions/reviews"
import RatingInput from "./RatingInput"

interface ReviewFormProps {
  orderId: string
}

export default function ReviewForm({ orderId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)

  const initialState: ReviewActionState = { success: false }
  const [state, formAction, isPending] = useActionState(
    submitReview.bind(null, orderId),
    initialState
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Leave a Review
      </h3>

      {state.success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 font-medium">
            Thank you for your review!
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {/* Rating input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <RatingInput
              name="rating"
              value={rating}
              onChange={setRating}
              error={state.fieldErrors?.rating?.[0]}
            />
          </div>

          {/* Content textarea */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Review
            </label>
            <textarea
              id="content"
              name="content"
              rows={4}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {state.fieldErrors?.content?.[0] && (
              <p className="mt-1 text-sm text-red-600">
                {state.fieldErrors.content[0]}
              </p>
            )}
          </div>

          {/* General error */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{state.error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-md transition-colors"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  )
}
