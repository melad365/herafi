import Link from "next/link"

interface ProviderCardProps {
  provider: {
    id: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
    createdAt: Date
  }
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  // Format member since date
  const memberSince = new Date(provider.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  // Get display name (fallback to username or "Anonymous")
  const displayName = provider.displayName || provider.username || "Anonymous"

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Truncate bio to 100 characters
  const shortBio = provider.bio
    ? provider.bio.length > 100
      ? provider.bio.slice(0, 100) + "..."
      : provider.bio
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        About the Provider
      </h3>

      {/* Avatar */}
      <div className="flex items-start mb-4">
        {provider.avatarUrl ? (
          <img
            src={provider.avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="ml-3 flex-grow">
          <h4 className="font-semibold text-gray-900">{displayName}</h4>
          <p className="text-sm text-gray-500">Member since {memberSince}</p>
        </div>
      </div>

      {/* Rating placeholder */}
      <div className="flex items-center mb-4">
        <span className="text-yellow-500 text-lg mr-1">★</span>
        <span className="text-gray-600 font-medium">0.0</span>
        <span className="text-gray-400 text-sm ml-1">(No reviews yet)</span>
      </div>

      {/* Bio excerpt */}
      {shortBio && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{shortBio}</p>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        {provider.username && (
          <Link
            href={`/u/${provider.username}`}
            className="block w-full text-center py-2 px-4 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors font-medium"
          >
            View Profile
          </Link>
        )}
        <button
          type="button"
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          disabled
        >
          Contact
        </button>
      </div>
    </div>
  )
}
