import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileAbout from "@/components/profile/ProfileAbout"
import ProviderInfo from "@/components/profile/ProviderInfo"
import PortfolioCarousel from "@/components/profile/PortfolioCarousel"

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      displayName: true,
      username: true,
      bio: true,
    },
  })

  if (!user) {
    return { title: "User Not Found" }
  }

  return {
    title: `${user.displayName || user.username} - Herafi`,
    description:
      user.bio || `${user.displayName || user.username}'s profile on Herafi`,
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params

  // Fetch user with portfolio images
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      portfolioImages: {
        orderBy: { order: "asc" },
      },
    },
  })

  // Show 404 if user not found
  if (!user) {
    notFound()
  }

  // Get current session to determine if viewing own profile
  const session = await auth()
  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        <ProfileAbout bio={user.bio} />
        {user.isProvider && <ProviderInfo user={user} />}
        {user.portfolioImages.length > 0 && (
          <PortfolioCarousel images={user.portfolioImages} />
        )}
      </div>
    </div>
  )
}
