import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  // Defense in depth - middleware should catch this first
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: {
      username: true,
      isProvider: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            Your account: <span className="font-medium">{session.user?.email}</span>
          </p>
          {user?.isProvider && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Provider
              </span>
            </div>
          )}
        </div>

        {/* Username Setup Prompt */}
        {!user?.username && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Complete your profile!
            </h2>
            <p className="text-amber-800 mb-4">
              Set up your username and profile info to get started on Herafi.
            </p>
            <Link
              href="/profile/edit"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              Set Up Profile
            </Link>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Edit Profile Card */}
          <Link
            href="/profile/edit"
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-orange-300"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Edit Profile
            </h3>
            <p className="text-gray-600 text-sm">
              Update your username, bio, avatar, and portfolio images
            </p>
          </Link>

          {/* View My Profile Card - only if username is set */}
          {user?.username && (
            <Link
              href={`/u/${user.username}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-orange-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View My Profile
              </h3>
              <p className="text-gray-600 text-sm">
                See your public profile as others see it
              </p>
            </Link>
          )}

          {/* Become a Provider Card - only if NOT already a provider */}
          {!user?.isProvider && (
            <Link
              href="/provider/setup"
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-orange-200 hover:border-orange-400"
            >
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Become a Provider
              </h3>
              <p className="text-orange-800 text-sm">
                Share your expertise and start offering services
              </p>
            </Link>
          )}
        </div>

        {/* Sign out form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
