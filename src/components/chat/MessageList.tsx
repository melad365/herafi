"use client"

import { useEffect, useRef } from "react"
import { formatDistanceToNow } from "date-fns"

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

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle empty state
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages yet. Say hello!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId
        const displayName = message.sender.displayName || message.sender.name || "Anonymous"
        const initials = displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end max-w-[70%]`}>
              {/* Avatar - only show for received messages */}
              {!isOwn && (
                <div className="flex-shrink-0 mr-2">
                  {message.sender.avatarUrl ? (
                    <img
                      src={message.sender.avatarUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy-500 flex items-center justify-center text-white font-bold text-xs">
                      {initials}
                    </div>
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div className="flex flex-col">
                {!isOwn && (
                  <span className="text-xs text-gray-600 mb-1 px-3">{displayName}</span>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-burgundy-800 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-3">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
