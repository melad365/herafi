import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/conversations/[conversationId]/messages
 * Load message history for a conversation
 * Supports cursor-based pagination with ?before=messageId
 * Automatically marks unread messages as read
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const before = searchParams.get("before")

    // Verify user is a participant of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participantIds: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (!conversation.participantIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Not a participant of this conversation" },
        { status: 403 }
      )
    }

    // Build query options
    const queryOptions: any = {
      where: { conversationId },
      orderBy: { createdAt: "asc" },
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
    }

    // Add cursor for pagination (load older messages)
    if (before) {
      queryOptions.cursor = { id: before }
      queryOptions.skip = 1 // Skip the cursor message itself
    }

    // Fetch messages
    const messages = await prisma.message.findMany(queryOptions)

    // Mark unread messages as read (messages sent by other user)
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
