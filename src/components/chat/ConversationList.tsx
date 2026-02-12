"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string | null
    displayName: string | null
    avatarUrl: string | null
  } | null
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: Date
  } | null
  lastMessageAt: Date
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
}

export default function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const pathname = usePathname()

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isActive = pathname === `/messages/${conversation.id}`
        const otherUser = conversation.otherUser
        const displayName = otherUser?.displayName || otherUser?.name || "Anonymous"
        const initials = displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        // Check if last message is unread (sent by other user)
        const isUnread = conversation.lastMessage?.senderId !== currentUserId

        // Truncate last message content
        const lastMessagePreview = conversation.lastMessage
          ? conversation.lastMessage.content.length > 50
            ? conversation.lastMessage.content.slice(0, 50) + "..."
            : conversation.lastMessage.content
          : "No messages yet"

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`block p-4 rounded-lg border transition-colors ${
              isActive
                ? "bg-burgundy-50 border-burgundy-300"
                : "bg-white border-gray-200 hover:border-burgundy-200 hover:bg-burgundy-50/50"
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              {otherUser?.avatarUrl ? (
                <img
                  src={otherUser.avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
              )}

              {/* Conversation info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold text-gray-900 truncate ${isUnread ? "font-bold" : ""}`}>
                    {displayName}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <p className={`text-sm text-gray-600 truncate ${isUnread ? "font-semibold" : ""}`}>
                  {lastMessagePreview}
                </p>
              </div>

              {/* Unread indicator */}
              {isUnread && conversation.lastMessage && (
                <div className="w-2 h-2 bg-burgundy-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
