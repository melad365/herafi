import Link from "next/link"

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600">
            The profile you're looking for doesn't exist.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
