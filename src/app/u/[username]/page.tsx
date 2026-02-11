import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileAbout from "@/components/profile/ProfileAbout"
import ProviderInfo from "@/components/profile/ProviderInfo"
import PortfolioCarousel from "@/components/profile/PortfolioCarousel"
import StarRating from "@/components/reviews/StarRating"
import ReviewList from "@/components/reviews/ReviewList"

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

  // Fetch user with portfolio images and reviews
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      portfolioImages: {
        orderBy: { order: "asc" },
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
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
        {user.isProvider && user.reviewsReceived.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
            {user.totalReviews > 0 && (
              <div className="mb-6">
                <StarRating
                  rating={user.averageRating}
                  size="lg"
                  showNumber
                  reviewCount={user.totalReviews}
                />
              </div>
            )}
            <ReviewList reviews={user.reviewsReceived} />
          </div>
        )}
      </div>
    </div>
  )
}
