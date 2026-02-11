import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import ChatInterface from "@/components/chat/ChatInterface"
import Link from "next/link"

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth()

  // Redirect if not authenticated (defense in depth)
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Await params (Next.js 15 async params pattern)
  const { conversationId } = await params

  // Fetch conversation with last 50 messages
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        take: 50,
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

  // Return 404 if conversation not found
  if (!conversation) {
    notFound()
  }

  // Verify user is a participant
  if (!conversation.participantIds.includes(session.user.id)) {
    redirect("/messages")
  }

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  // Get other user's info for the header
  const otherUserId = conversation.participantIds.find((id) => id !== session.user!.id)
  const otherUser = otherUserId
    ? await prisma.user.findUnique({
        where: { id: otherUserId },
        select: {
          id: true,
          name: true,
          displayName: true,
          avatarUrl: true,
          username: true,
        },
      })
    : null

  const otherUserDisplayName = otherUser?.displayName || otherUser?.name || "Anonymous"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-5xl mx-auto">
        {/* Header bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/messages"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="flex items-center space-x-3">
                {otherUser?.avatarUrl ? (
                  <img
                    src={otherUser.avatarUrl}
                    alt={otherUserDisplayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {otherUserDisplayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {otherUserDisplayName}
                  </h1>
                  {otherUser?.username && (
                    <Link
                      href={`/u/${otherUser.username}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat interface */}
        <ChatInterface
          conversationId={conversation.id}
          initialMessages={conversation.messages}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  )
}
