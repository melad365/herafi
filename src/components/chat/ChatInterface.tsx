"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import TypingIndicator from "./TypingIndicator"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
  sender: {
    id: string
    name: string | null
    displayName: string | null
    avatarUrl: string | null
  }
}

interface User {
  id: string
  name: string | null
  displayName: string | null
}

interface ChatInterfaceProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string
}

export default function ChatInterface({
  conversationId,
  initialMessages,
  currentUserId,
}: ChatInterfaceProps) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<User[]>([])

  // Join conversation on mount
  useEffect(() => {
    if (!socket || !isConnected) return

    socket.emit("join_conversation", { conversationId })

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        // Deduplicate by message ID
        if (prev.some((m) => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    }

    // Listen for typing events
    const handleUserTyping = (data: { user: User }) => {
      setTypingUsers((prev) => {
        // Add user if not already in the list
        if (prev.some((u) => u.id === data.user.id)) {
          return prev
        }
        return [...prev, data.user]
      })
    }

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId))
    }

    socket.on("new_message", handleNewMessage)
    socket.on("user_typing", handleUserTyping)
    socket.on("user_stopped_typing", handleUserStoppedTyping)

    // Cleanup on unmount
    return () => {
      socket.emit("leave_conversation", { conversationId })
      socket.off("new_message", handleNewMessage)
      socket.off("user_typing", handleUserTyping)
      socket.off("user_stopped_typing", handleUserStoppedTyping)
    }
  }, [socket, isConnected, conversationId])

  const handleSend = (content: string) => {
    if (!socket || !isConnected) {
      console.error("Socket not connected")
      return
    }

    socket.emit("send_message", {
      conversationId,
      content,
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-white">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        onSend={handleSend}
        socket={socket}
        conversationId={conversationId}
        disabled={!isConnected}
      />
    </div>
  )
}
