import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import TabNavigation from "@/components/provider/TabNavigation"
import GigsTab from "./_components/GigsTab"
import OrdersTab from "./_components/OrdersTab"
import MessagesTab from "./_components/MessagesTab"

interface ProviderDashboardPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ProviderDashboardPage({
  searchParams,
}: ProviderDashboardPageProps) {
  const session = await auth()

  // Auth check
  if (!session) {
    redirect("/login")
  }

  // Provider check
  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { isProvider: true },
  })

  if (!user?.isProvider) {
    redirect("/provider/setup")
  }

  // Read search params
  const params = await searchParams
  const activeTab = params.tab || "gigs"

  // Parallel data fetching with Promise.all()
  const [gigs, orders, stats, conversations] = await Promise.all([
    // 1. Fetch provider's gigs with order count
    prisma.gig.findMany({
      where: { providerId: session.user?.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        pricingTiers: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    }),

    // 2. Fetch provider's orders
    prisma.order.findMany({
      where: { providerId: session.user?.id },
      include: {
        gig: {
          select: {
            title: true,
            slug: true,
          },
        },
        buyer: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // 3. Calculate aggregate stats
    prisma.order.aggregate({
      where: {
        providerId: session.user?.id,
        status: "COMPLETED",
      },
      _count: true,
      _sum: {
        totalPrice: true,
      },
    }),

    // 4. Fetch provider's conversations
    prisma.conversation.findMany({
      where: {
        participantIds: {
          has: session.user?.id,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      take: 10,
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    }),
  ])

  const activeGigsCount = gigs.filter((g) => g.isActive).length

  // Enrich conversations with other participant info
  const enrichedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      // Find the other participant (the one that isn't the current user)
      const otherUserId = conversation.participantIds.find(
        (id) => id !== session.user?.id
      )

      // Fetch other user's details
      const otherUser = otherUserId
        ? await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              name: true,
              displayName: true,
              avatarUrl: true,
            },
          })
        : null

      return {
        id: conversation.id,
        otherUser,
        lastMessage: conversation.messages[0] || null,
        lastMessageAt: conversation.lastMessageAt,
      }
    })
  )

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Header */}
        <div className="bg-white rounded-lg shadow-card p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Provider Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your services and orders
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-burgundy-700 transition-colors duration-200"
            >
              Switch to Buyer Mode
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex gap-8 mt-4">
            <div className="bg-burgundy-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats._count}
              </p>
            </div>
            <div className="bg-burgundy-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats._sum.totalPrice?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-burgundy-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600 mb-1">Active Gigs</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeGigsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} />

        {/* Tab Content */}
        {activeTab === "gigs" && <GigsTab gigs={gigs} />}
        {activeTab === "orders" && <OrdersTab orders={orders} />}
        {activeTab === "messages" && (
          <MessagesTab conversations={enrichedConversations} />
        )}
      </div>
    </div>
  )
}
