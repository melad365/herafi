import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  // Defense in depth - middleware should catch this first
  if (!session) {
    redirect("/login")
  }

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
        </div>

        {/* Dashboard content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            You're successfully authenticated! This is a protected page.
          </p>

          {/* Sign out form */}
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
