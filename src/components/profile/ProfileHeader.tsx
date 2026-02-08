import Link from "next/link"
import { User } from "@prisma/client"

interface ProfileHeaderProps {
  user: Pick<
    User,
    | "id"
    | "displayName"
    | "username"
    | "avatarUrl"
    | "createdAt"
    | "isProvider"
  >
  isOwnProfile: boolean
}

export default function ProfileHeader({
  user,
  isOwnProfile,
}: ProfileHeaderProps) {
  const displayName = user.displayName || user.username || "Anonymous"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center border-4 border-orange-100">
              <span className="text-4xl font-bold text-white">{initials}</span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {displayName}
          </h1>
          <p className="text-lg text-gray-600 mb-4">@{user.username}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-700 mb-4">
            <div className="flex items-center gap-1">
              <span className="font-medium">Member since:</span>
              <span>{memberSince}</span>
            </div>
            {user.isProvider && (
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                Provider
              </div>
            )}
          </div>

          {/* Rating Placeholder */}
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-4">
            <span className="text-yellow-500 text-xl">★</span>
            <span className="font-medium">0.0</span>
            <span className="text-sm text-gray-500">(No reviews yet)</span>
          </div>

          {/* CTA Button */}
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="inline-block px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <Link
              href="#"
              className="inline-block px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
            >
              View Services
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
