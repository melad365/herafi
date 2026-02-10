import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/conversations
 * List all conversations for the authenticated user
 * Returns conversations sorted by most recent message
 */
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find all conversations where user is a participant
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
          createdAt: conversation.createdAt,
        }
      })
    )

    return NextResponse.json(enrichedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
