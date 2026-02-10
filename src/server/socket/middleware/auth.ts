import { Socket } from "socket.io"
import jwt from "jsonwebtoken"

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string
  }
}

export function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error("Authentication error: No token provided"))
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    console.error("AUTH_SECRET is not set")
    return next(new Error("Authentication error: Server configuration error"))
  }

  try {
    const decoded = jwt.verify(token, secret) as { sub?: string }

    if (!decoded.sub) {
      return next(new Error("Authentication error: Invalid token payload"))
    }

    // Attach userId to socket data for use in handlers
    socket.data.userId = decoded.sub
    next()
  } catch (error) {
    console.error("JWT verification failed:", error)
    return next(new Error("Authentication error: Invalid token"))
  }
}
