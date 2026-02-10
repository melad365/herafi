import { Server } from "socket.io"
import { Server as HTTPServer } from "node:http"
import { authMiddleware } from "./middleware/auth"
import { registerMessageHandlers } from "./handlers/message"
import { registerPresenceHandlers } from "./handlers/presence"

export function initSocket(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
  })

  // Register authentication middleware
  io.use(authMiddleware)

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.userId
    console.log(`[Socket.IO] User ${userId} connected (socket: ${socket.id})`)

    // Register event handlers
    registerMessageHandlers(io, socket)
    registerPresenceHandlers(io, socket)

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] User ${userId} disconnected (reason: ${reason})`)
    })
  })

  return io
}
