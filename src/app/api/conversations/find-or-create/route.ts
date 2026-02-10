import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * POST /api/conversations/find-or-create
 * Find existing conversation between two users or create a new one
 * Body: { otherUserId: string }
 */
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { otherUserId } = body

    // Validate otherUserId
    if (!otherUserId || typeof otherUserId !== "string") {
      return NextResponse.json({ error: "otherUserId is required" }, { status: 400 })
    }

    // Prevent creating conversation with self
    if (otherUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      )
    }

    // Verify other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true },
    })

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Sort participant IDs for consistent lookup
    const participantIds = [session.user.id, otherUserId].sort()

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          equals: participantIds,
        },
      },
    })

    // If not found, create new conversation
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds,
        },
      })
    }

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error("Error finding or creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to find or create conversation" },
      { status: 500 }
    )
  }
}
