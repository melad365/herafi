import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ConversationList from "@/components/chat/ConversationList"
import Link from "next/link"

export default async function MessagesPage() {
  const session = await auth()

  // Redirect if not authenticated (defense in depth)
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch all conversations for the current user
  const conversations = await prisma.conversation.findMany({
    where: {
      participantIds: {
        has: session.user.id,
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
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
              avatarUrl: true,
            },
          },
        },
      },
    },
  })

  // Enrich conversations with other participant info
  const enrichedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      // Find the other participant (the one that isn't the current user)
      const otherUserId = conversation.participantIds.find((id) => id !== session.user?.id)

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-burgundy-900">Messages</h1>
          <Link
            href="/dashboard"
            className="text-burgundy-600 hover:text-burgundy-700 font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-xl shadow-card p-6">
          {enrichedConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No conversations yet.</p>
              <p className="text-gray-500 text-sm">
                Start a conversation by clicking "Message" on a provider's profile or gig page.
              </p>
            </div>
          ) : (
            <ConversationList
              conversations={enrichedConversations}
              currentUserId={session.user.id}
            />
          )}
        </div>
      </div>
    </div>
  )
}
