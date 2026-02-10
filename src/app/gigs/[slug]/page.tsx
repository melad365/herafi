import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import GigDetailView from "@/components/gigs/GigDetailView"
import type { Metadata } from "next"
import type { PricingTiers } from "@/lib/validations/pricing"

interface GigDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: GigDetailPageProps): Promise<Metadata> {
  const { slug } = await params

  const gig = await prisma.gig.findUnique({
    where: { slug, isActive: true },
    select: {
      title: true,
      description: true,
    },
  })

  if (!gig) {
    return {
      title: "Gig not found",
    }
  }

  return {
    title: gig.title,
    description: gig.description.slice(0, 160),
  }
}

export default async function GigDetailPage({ params }: GigDetailPageProps) {
  const { slug } = await params

  // Query gig with provider data
  const gig = await prisma.gig.findUnique({
    where: { slug, isActive: true },
    include: {
      provider: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      },
    },
  })

  // Return 404 if gig not found
  if (!gig) {
    notFound()
  }

  // Check if current user is the owner
  const session = await auth()
  const isOwner = session?.user?.id === gig.providerId
  const isAuthenticated = !!session?.user?.id

  // Cast pricingTiers from JsonValue to PricingTiers
  const gigData = {
    ...gig,
    pricingTiers: gig.pricingTiers as PricingTiers,
  }

  return <GigDetailView gig={gigData} isOwner={isOwner} isAuthenticated={isAuthenticated} />
}
