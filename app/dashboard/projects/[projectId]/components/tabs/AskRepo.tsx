"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Bot, Loader2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type QAPair = {
  _id: string
  question: string
  answer: string
  username: string
  createdAt: string
}

export default function AskRepo({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const [history, setHistory] = useState<QAPair[]>([])
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/askRepo/answer`)
        if (!res.ok) return
        const data: QAPair[] = await res.json()
        setHistory(data)
      } catch (err) {
        console.error("Failed to fetch AskRepo history:", err)
      } finally {
        setIsFetching(false)
      }
    }
    fetchHistory()
  }, [projectId])

  // Scroll to bottom when history or pending question changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, pendingQuestion])

  const handleAsk = async () => {
    const q = question.trim()
    if (!q || isLoading) return

    setQuestion("")
    setPendingQuestion(q)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/projects/${projectId}/askRepo/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })

      if (!res.ok) throw new Error("Failed to get answer")

      const data = await res.json()

      // Optimistically add to history with a temp id
      setHistory((prev) => [
        ...prev,
        {
          _id: data.askRepoMessageId || crypto.randomUUID(),
          question: q,
          answer: data.answer,
          username: session?.user?.name || "You",
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error("AskRepo error:", err)
    } finally {
      setPendingQuestion(null)
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {history.length === 0 && !pendingQuestion ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <div className="rounded-full bg-muted p-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium">Ask anything about this repo</p>
            <p className="text-xs max-w-xs">
              I can answer questions about the codebase, recent commits, file structure, and more.
            </p>
          </div>
        ) : (
          <>
            {history.map((item) => (
              <div key={item._id} className="space-y-3">

                {/* Question bubble — right aligned */}
                <div className="flex justify-end">
                  <div className="max-w-[75%] space-y-1">
                    <p className="text-xs text-muted-foreground text-right">{item.username}</p>
                    <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm bg-primary text-primary-foreground">
                      {item.question}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Answer bubble — left aligned */}
                <div className="flex justify-start gap-2">
                  <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="max-w-[80%] space-y-1">
                    <p className="text-xs text-muted-foreground">AskRepo AI</p>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm bg-muted prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownAnswer content={item.answer} />
                    </div>
                  </div>
                </div>

              </div>
            ))}

            {/* Pending question (optimistic) */}
            {pendingQuestion && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm bg-primary text-primary-foreground">
                      {pendingQuestion}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start gap-2">
                  <div className="mt-1 w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none bg-background"
          placeholder="Ask anything about the repo…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
          disabled={isLoading}
        />
        <Button size="sm" onClick={handleAsk} disabled={isLoading || !question.trim()}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

    </div>
  )
}

// Lightweight markdown renderer — handles bold, code, headers, bullets
function MarkdownAnswer({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return <p key={i} className="font-semibold text-sm mt-2">{line.slice(3)}</p>
        }
        if (line.startsWith("# ")) {
          return <p key={i} className="font-bold text-sm mt-2">{line.slice(2)}</p>
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-1.5 text-sm">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        if (line.startsWith("```")) {
          return null // skip code fences — handled below
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1" />
        }
        return <p key={i} className="text-sm">{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="text-xs bg-background/60 rounded px-1 py-0.5 font-mono">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}