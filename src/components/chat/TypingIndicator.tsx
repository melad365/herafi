"use client"

interface User {
  id: string
  name: string | null
  displayName: string | null
}

interface TypingIndicatorProps {
  typingUsers: User[]
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null
  }

  const displayName = typingUsers[0].displayName || typingUsers[0].name || "Someone"

  return (
    <div className="px-4 py-2 text-sm text-gray-600">
      <span>{displayName} is typing</span>
      <span className="typing-dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
      <style jsx>{`
        .typing-dots {
          display: inline-block;
          margin-left: 2px;
        }
        .dot {
          animation: typing 1.4s infinite;
          opacity: 0;
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
