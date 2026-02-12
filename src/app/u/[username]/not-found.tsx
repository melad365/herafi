import { UserCircleIcon } from "@heroicons/react/24/outline"
import { EmptyState } from "@/components/ui/EmptyState"

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 sm:px-6">
      <EmptyState
        icon={<UserCircleIcon className="w-16 h-16" />}
        title="User Not Found"
        description="The profile you're looking for doesn't exist."
        action={{
          label: "Go Home",
          href: "/"
        }}
      />
    </div>
  )
}
