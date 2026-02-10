import { Server, Socket } from "socket.io"

/**
 * Track online users in memory
 * Map structure: userId -> Set of socket IDs
 * Multiple socket IDs per user handle multiple browser tabs/devices
 */
export const onlineUsers = new Map<string, Set<string>>()

/**
 * Register presence-related socket event handlers
 * Tracks online/offline status and typing indicators
 */
export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId

  /**
   * Handle user connection - mark as online
   */
  function handleConnect() {
    // Add socket ID to user's set
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
      // User was offline, now online - broadcast to everyone
      io.emit("user_online", { userId })
      console.log(`[Socket.IO] User ${userId} is now online`)
    }
    onlineUsers.get(userId)!.add(socket.id)
  }

  /**
   * Handle user disconnection - mark as offline if no more sockets
   */
  function handleDisconnect() {
    const userSockets = onlineUsers.get(userId)
    if (userSockets) {
      userSockets.delete(socket.id)
      // If no more sockets for this user, they're offline
      if (userSockets.size === 0) {
        onlineUsers.delete(userId)
        io.emit("user_offline", { userId })
        console.log(`[Socket.IO] User ${userId} is now offline`)
      }
    }
  }

  /**
   * Typing indicator - user started typing
   * Volatile event: won't be queued if recipient is offline
   */
  socket.on("typing_start", ({ conversationId }: { conversationId: string }) => {
    const room = `conversation:${conversationId}`
    socket.to(room).volatile.emit("user_typing", {
      userId,
      conversationId,
    })
  })

  /**
   * Typing indicator - user stopped typing
   */
  socket.on("typing_stop", ({ conversationId }: { conversationId: string }) => {
    const room = `conversation:${conversationId}`
    socket.to(room).emit("user_stopped_typing", {
      userId,
      conversationId,
    })
  })

  // Register connection/disconnection handlers
  handleConnect()
  socket.on("disconnect", handleDisconnect)
}
