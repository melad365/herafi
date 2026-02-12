import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { EmptyState } from "@/components/ui/EmptyState"

export default function GigNotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <EmptyState
        icon={<ExclamationTriangleIcon className="w-16 h-16" />}
        title="Gig not found"
        description="This service listing doesn't exist or has been removed."
        action={{
          label: "Browse Services",
          href: "/gigs"
        }}
      />
    </div>
  )
}
