import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();

  // Require authentication
  if (!session) {
    redirect("/login");
  }

  // Query user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      username: true,
      isProvider: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900">
            Account Settings
          </h1>
        </div>

        {/* Account Information section */}
        <section className="bg-white rounded-xl shadow-card p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <p className="text-gray-900">{user.name || "Not set"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex items-center gap-4">
                <p className="text-gray-900">
                  {user.username ? `@${user.username}` : "Not set"}
                </p>
                <Link
                  href="/profile/edit"
                  className="text-sm text-burgundy-700 hover:text-burgundy-800 font-medium transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.isProvider
                    ? "bg-burgundy-100 text-burgundy-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.isProvider ? "Provider" : "Buyer"}
              </span>
            </div>
          </div>
        </section>

        {/* Provider Status section */}
        <section className="bg-white rounded-xl shadow-card p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Provider Status
          </h2>
          {user.isProvider ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 font-medium">Active Provider</span>
              </div>
              <p className="text-gray-600 text-sm">
                You can create and manage service listings (gigs) on Herafi.
              </p>
              <Link
                href="/provider/dashboard"
                className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Go to Provider Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                You're currently a buyer on Herafi. Become a provider to offer your services
                and start earning.
              </p>
              <Link
                href="/provider/setup"
                className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-200"
              >
                Become a Provider
              </Link>
            </div>
          )}
        </section>

        {/* Danger Zone section */}
        <section className="bg-red-50 rounded-xl shadow-card p-8 border border-red-200">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-900 mb-1">Delete Account</h3>
              <p className="text-sm text-red-800 mb-4">
                Permanently delete your account and all data. This cannot be undone.
              </p>
              <button
                disabled
                className="bg-gray-200 text-gray-500 font-medium py-2 px-4 rounded-md cursor-not-allowed"
              >
                Delete Account
              </button>
              <p className="text-xs text-gray-500 mt-2">(Feature coming soon)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
