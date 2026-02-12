import Link from "next/link"
import { format } from "date-fns"

interface MessagesTabProps {
  conversations: {
    id: string
    otherUser: {
      id: string
      name: string | null
      displayName: string | null
      avatarUrl: string | null
    } | null
    lastMessage: {
      content: string
      createdAt: Date
      sender: {
        id: string
        name: string | null
        displayName: string | null
      }
    } | null
    lastMessageAt: Date
  }[]
}

export default function MessagesTab({ conversations }: MessagesTabProps) {
  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No conversations yet.</p>
          <p className="text-gray-500 text-sm">
            When you chat with buyers, conversations will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Messages ({conversations.length})
        </h2>
        <Link
          href="/messages"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          View All Messages
        </Link>
      </div>

      {/* Conversation List */}
      <div className="space-y-3">
        {conversations.slice(0, 10).map((conversation) => {
          const displayName =
            conversation.otherUser?.displayName ||
            conversation.otherUser?.name ||
            "Anonymous"
          const initials = displayName.charAt(0).toUpperCase()
          const lastMessagePreview =
            conversation.lastMessage?.content.slice(0, 60) || "No messages yet"
          const showEllipsis =
            conversation.lastMessage && conversation.lastMessage.content.length > 60

          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conversation.otherUser?.avatarUrl ? (
                  <img
                    src={conversation.otherUser.avatarUrl}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-600 truncate">
                  {lastMessagePreview}
                  {showEllipsis && "..."}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-sm text-gray-500">
                {format(new Date(conversation.lastMessageAt), "MMM d")}
              </div>
            </Link>
          )
        })}
      </div>

      {/* View All Link (bottom) */}
      {conversations.length > 10 && (
        <div className="mt-4 text-center">
          <Link
            href="/messages"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View all messages
          </Link>
        </div>
      )}
    </div>
  )
}
