"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Bot, Loader2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
      toast.error("Failed to get answer. Please try again.")
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

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownAnswer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm break-words
                    prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-border
                    prose-code:text-primary prose-code:bg-muted-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm
                    prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-a:no-underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ node, ...props }) => (
            <div className="overflow-auto w-full my-2 bg-black/50 rounded-md border border-border/50 line-height-2">
              <pre {...props} className="p-3 text-xs bg-transparent m-0" />
            </div>
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;
            return isInline ? (
              <code className="text-[12px] bg-background/50 text-foreground px-1 py-0.5 rounded-sm font-mono border border-border/50" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}