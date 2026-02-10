import { Server, Socket } from "socket.io"
import { prisma } from "../../../lib/db"

/**
 * Generate consistent conversation room name from two user IDs
 * Always sorts IDs to ensure same room regardless of who initiates
 */
function getConversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`
}

/**
 * Register message-related socket event handlers
 */
export function registerMessageHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId

  /**
   * Join a conversation room
   * Verifies user is a participant before allowing join
   */
  socket.on("join_conversation", async ({ conversationId }: { conversationId: string }) => {
    try {
      // Verify user is a participant of this conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { participantIds: true },
      })

      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" })
        return
      }

      if (!conversation.participantIds.includes(userId)) {
        socket.emit("error", { message: "Not a participant of this conversation" })
        return
      }

      // Join the room
      const room = getConversationRoom(conversationId)
      await socket.join(room)

      console.log(`[Socket.IO] User ${userId} joined conversation ${conversationId}`)
    } catch (error) {
      console.error("[Socket.IO] Error joining conversation:", error)
      socket.emit("error", { message: "Failed to join conversation" })
    }
  })

  /**
   * Send a message in a conversation
   * Validates, persists to DB, then broadcasts to room
   */
  socket.on(
    "send_message",
    async ({ conversationId, content }: { conversationId: string; content: string }) => {
      try {
        // Validate content
        if (!content || typeof content !== "string") {
          socket.emit("error", { message: "Message content is required" })
          return
        }

        if (content.length > 2000) {
          socket.emit("error", { message: "Message too long (max 2000 characters)" })
          return
        }

        const trimmedContent = content.trim()
        if (!trimmedContent) {
          socket.emit("error", { message: "Message cannot be empty" })
          return
        }

        // Verify user is a participant
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { participantIds: true },
        })

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" })
          return
        }

        if (!conversation.participantIds.includes(userId)) {
          socket.emit("error", { message: "Not a participant of this conversation" })
          return
        }

        // Save message to database with sender info
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: trimmedContent,
          },
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
        })

        // Update conversation's lastMessageAt
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        })

        // IMPORTANT: Wait for DB write to complete BEFORE broadcasting
        // This prevents race conditions where clients receive the event before DB is ready
        const room = getConversationRoom(conversationId)
        io.to(room).emit("new_message", {
          id: message.id,
          conversationId: message.conversationId,
          content: message.content,
          createdAt: message.createdAt,
          sender: {
            id: message.sender.id,
            name: message.sender.name,
            displayName: message.sender.displayName,
            avatarUrl: message.sender.avatarUrl,
          },
        })

        console.log(`[Socket.IO] Message sent in conversation ${conversationId} by user ${userId}`)
      } catch (error) {
        console.error("[Socket.IO] Error sending message:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    }
  )

  /**
   * Leave a conversation room
   */
  socket.on("leave_conversation", ({ conversationId }: { conversationId: string }) => {
    const room = getConversationRoom(conversationId)
    socket.leave(room)
    console.log(`[Socket.IO] User ${userId} left conversation ${conversationId}`)
  })
}
