"use client"

import React from "react"
import {
    MessageSquare,
    Loader2,
    CornerDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Question = {
    _id: string
    question: string
    answer?: string | null
    status: "pending" | "answered"
    createdAt: string
    askedBy?: {
        name?: string
        image?: string
    }
}

const QuestionsTab = ({ projectId }: { projectId: string }) => {
    const { data: session } = useSession()
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [loading, setLoading] = React.useState(true)
    const [asking, setAsking] = React.useState(false)
    const [questionText, setQuestionText] = React.useState("")
    const [answerDraft, setAnswerDraft] = React.useState<Record<string, string>>({})
    const [openAnswerBox, setOpenAnswerBox] = React.useState<string | null>(null)
    const [answeringIds, setAnsweringIds] = React.useState<Record<string, boolean>>({})

    React.useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/questions`)
                const data = await res.json()
                setQuestions(data)
            } catch (e) {
                console.error("Failed to load questions", e)
                toast.error("Failed to load questions")
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, [projectId])

    const submitQuestion = async () => {
        if (!questionText.trim()) return
        setAsking(true)

        try {
            const res = await fetch(`/api/projects/${projectId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: questionText }),
            })

            if (!res.ok) {
                throw new Error("Failed to submit question")
            }

            const newQuestion = await res.json()
            
            // Populate the askedBy client-side using dynamic session information for instant premium UX
            const populatedQuestion: Question = {
                ...newQuestion,
                askedBy: {
                    name: session?.user?.name || undefined,
                    image: session?.user?.image || undefined,
                }
            }

            setQuestions((prev) => [populatedQuestion, ...prev])
            setQuestionText("")
            toast.success("Question posted successfully!")
        } catch (e) {
            console.error("Failed to submit question", e)
            toast.error("Failed to post question. Please try again.")
        } finally {
            setAsking(false)
        }
    }

    const submitAnswer = async (questionId: string) => {
        const answer = answerDraft[questionId]
        if (!answer?.trim()) return

        setAnsweringIds((prev) => ({ ...prev, [questionId]: true }))

        try {
            const res = await fetch(`/api/projects/questions/${questionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer }),
            })

            if (!res.ok) {
                throw new Error("Failed to submit answer")
            }

            // Optimistic UI update
            setQuestions((prev) =>
                prev.map((q) =>
                    q._id === questionId
                        ? { ...q, answer, status: "answered" }
                        : q
                )
            )

            // Cleanup
            setAnswerDraft((prev) => ({ ...prev, [questionId]: "" }))
            setOpenAnswerBox(null)
            toast.success("Answer posted successfully!")
        } catch (error) {
            console.error("Answer submission failed", error)
            toast.error("Failed to submit answer. Please try again.")
        } finally {
            setAnsweringIds((prev) => ({ ...prev, [questionId]: false }))
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return ""
        }
    }

    /* ---------------- STATES ---------------- */

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 p-6 overflow-hidden bg-background/50">

            {/* Ask Box */}
            <Card className="p-4 space-y-3 border-emerald-500/10 bg-card/60 backdrop-blur-sm shadow-xl">
                <textarea
                    rows={3}
                    className="w-full resize-none rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 bg-background transition-all"
                    placeholder="Ask a question about this project..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                />
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        disabled={!questionText.trim() || asking}
                        onClick={submitQuestion}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center gap-2"
                    >
                        {asking && <Loader2 className="h-4 w-4 animate-spin" />}
                        Ask Question
                    </Button>
                </div>
            </Card>

            {/* Questions */}
            {questions.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                    <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 p-4 mb-3 animate-pulse">
                        <MessageSquare className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-lg">No questions yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                        Be the first to ask a question or raise a discussion point about this project.
                    </p>
                </div>
            ) : (
                <ul className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {questions.map((q) => (
                        <li 
                            key={q._id} 
                            className="rounded-xl border bg-card/40 backdrop-blur-sm p-4 space-y-4 hover:border-muted-foreground/30 transition-all shadow-md"
                        >
                            {/* Question Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={q.askedBy?.image || "/avatar-placeholder.png"}
                                        alt={q.askedBy?.name || "User"}
                                        className="h-8 w-8 rounded-full border bg-muted object-cover shadow-sm"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/avatar-placeholder.png"
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {q.askedBy?.name || "Anonymous"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDate(q.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${q.status === "answered"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}
                                >
                                    {q.status}
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="pl-1">
                                <p className="text-sm text-foreground font-medium whitespace-pre-wrap">{q.question}</p>
                            </div>

                            {/* Answer section */}
                            {q.answer && (
                                <div className="mt-3 flex gap-2 items-start pl-1">
                                    <CornerDownRight className="h-4 w-4 mt-2.5 text-emerald-400 flex-shrink-0" />
                                    <div className="rounded-md bg-emerald-500/5 border border-emerald-500/10 p-3 w-full shadow-inner">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Answer</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {q.answer}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Answer action */}
                            {q.status === "pending" && (
                                <div className="mt-3 pt-2 pl-1 border-t border-muted/30">
                                    {openAnswerBox === q._id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                rows={2}
                                                className="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 bg-background transition-all"
                                                placeholder="Write an answer..."
                                                value={answerDraft[q._id] || ""}
                                                onChange={(e) =>
                                                    setAnswerDraft((prev) => ({
                                                        ...prev,
                                                        [q._id]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setOpenAnswerBox(null)}
                                                    className="text-xs"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={!answerDraft[q._id]?.trim() || answeringIds[q._id]}
                                                    onClick={() => submitAnswer(q._id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2"
                                                >
                                                    {answeringIds[q._id] && <Loader2 className="h-3 w-3 animate-spin" />}
                                                    Submit Answer
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setOpenAnswerBox(q._id)}
                                            className="text-xs hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                                        >
                                            Answer Question
                                        </Button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default QuestionsTab
