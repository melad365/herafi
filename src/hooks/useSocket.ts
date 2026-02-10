"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Socket } from "socket.io-client"
import { getSocket } from "@/lib/socket"

export function useSocket() {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Don't attempt connection if no session
    if (status !== "authenticated" || !session) {
      return
    }

    let socketInstance: Socket | null = null

    // Fetch JWT token from API route
    const connectSocket = async () => {
      try {
        const response = await fetch("/api/auth/token")
        if (!response.ok) {
          console.error("Failed to fetch auth token")
          return
        }

        const { token } = await response.json()

        // Get socket instance with token
        socketInstance = getSocket(token)

        // Set up event listeners
        socketInstance.on("connect", () => {
          console.log("[useSocket] Connected to Socket.IO server")
          setIsConnected(true)
        })

        socketInstance.on("disconnect", (reason) => {
          console.log("[useSocket] Disconnected from Socket.IO server:", reason)
          setIsConnected(false)
        })

        socketInstance.on("connect_error", (error) => {
          console.error("[useSocket] Connection error:", error.message)
          setIsConnected(false)
        })

        // Connect the socket
        socketInstance.connect()
        setSocket(socketInstance)
      } catch (error) {
        console.error("[useSocket] Failed to connect:", error)
      }
    }

    connectSocket()

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log("[useSocket] Cleaning up socket connection")
        socketInstance.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [session, status])

  return { socket, isConnected }
}
