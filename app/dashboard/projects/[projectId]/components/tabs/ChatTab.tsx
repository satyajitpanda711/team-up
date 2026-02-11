"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useChatStore } from "@/store/useChatStore"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare } from "lucide-react"

type ChatTabProps = {
  projectId: string
}

const ChatTab = ({ projectId }: ChatTabProps) => {
  const { data: session } = useSession()
  const userEmail = session?.user?.email
  const currentUserName = session?.user?.name

  const { messages, connect, disconnect, sendMessage, fetchMessages, isLoading } = useChatStore()
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!userEmail) return

    fetchMessages(projectId)

    connect(projectId, userEmail)
    return () => disconnect()
  }, [projectId, userEmail])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(text)
    setText("")
  }

  return (
    <>
    {!isLoading?<div className="flex h-full flex-col">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation</p>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender.name === currentUserName
            const prev = messages[idx - 1]
            const showSender = !prev || prev.sender.name !== m.sender.name

            return (
              <div
                key={m._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[75%] space-y-1">
                  {showSender && !isMe && (
                    <span className="text-xs text-muted-foreground">
                      {m.sender.name}
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.content}
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="Message the project…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="sm" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div> : <>
    <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" size={30}/>
    </div>
    </>}
    </>
  )
}

export default ChatTab
