import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import type { PricingTiers } from "@/lib/validations/pricing"
import OrderPageClient from "./OrderPageClient"

interface OrderPageProps {
  params: Promise<{ slug: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { slug } = await params

  // Check auth
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch gig with provider info
  const gig = await prisma.gig.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      pricingTiers: true,
      providerId: true,
    },
  })

  if (!gig) {
    notFound()
  }

  // Prevent self-ordering
  if (gig.providerId === session.user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Cannot Order Your Own Service
          </h1>
          <p className="text-gray-600 mb-6">
            You cannot place an order for your own gig.
          </p>
          <a
            href={`/gigs/${slug}`}
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors"
          >
            Back to Gig
          </a>
        </div>
      </div>
    )
  }

  // Cast pricingTiers
  const gigData = {
    ...gig,
    pricingTiers: gig.pricingTiers as PricingTiers,
  }

  return <OrderPageClient gig={gigData} />
}
