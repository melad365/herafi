"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface MessageButtonProps {
  otherUserId: string
  variant?: "primary" | "secondary"
}

export default function MessageButton({ otherUserId, variant = "secondary" }: MessageButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hide if not authenticated
  if (!session?.user?.id) {
    return null
  }

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/conversations/find-or-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create conversation")
      }

      const data = await response.json()
      router.push(`/messages/${data.conversationId}`)
    } catch (err) {
      console.error("Error creating conversation:", err)
      setError(err instanceof Error ? err.message : "Failed to create conversation")
      setIsLoading(false)
    }
  }

  const baseClasses = "flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variantClasses = variant === "primary"
    ? "bg-orange-600 text-white hover:bg-orange-700"
    : "border border-orange-600 text-orange-600 hover:bg-orange-50"

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses} w-full`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{isLoading ? "Loading..." : "Message"}</span>
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
