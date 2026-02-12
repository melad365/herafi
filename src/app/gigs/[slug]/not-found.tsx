import Link from "next/link"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { EmptyState } from "@/components/ui/EmptyState"

export default function GigNotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <EmptyState
        icon={ExclamationTriangleIcon}
        title="Gig not found"
        description="This service listing doesn't exist or has been removed."
        action={
          <Link
            href="/gigs"
            className="inline-block bg-burgundy-800 hover:bg-burgundy-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors duration-200"
          >
            Browse Services
          </Link>
        }
      />
    </div>
  )
}
