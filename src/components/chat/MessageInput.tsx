"use client"

import { useState, useRef, FormEvent, ChangeEvent } from "react"
import type { Socket } from "socket.io-client"

interface MessageInputProps {
  onSend: (content: string) => void
  socket: Socket | null
  conversationId: string
  disabled?: boolean
}

export default function MessageInput({ onSend, socket, conversationId, disabled }: MessageInputProps) {
  const [content, setContent] = useState("")
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!content.trim() || disabled) {
      return
    }

    onSend(content.trim())
    setContent("")

    // Stop typing indicator after send
    if (socket) {
      socket.emit("typing_stop", { conversationId })
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)

    // Emit typing_start when user starts typing
    if (socket && e.target.value.trim()) {
      socket.emit("typing_start", { conversationId })

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to emit typing_stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { conversationId })
        typingTimeoutRef.current = null
      }, 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={content}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  )
}
