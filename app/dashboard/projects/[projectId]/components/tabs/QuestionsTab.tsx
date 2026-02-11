"use client"

import React from "react"
import {
    MessageSquare,
    Loader2,
    CornerDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
    const [questions, setQuestions] = React.useState<Question[]>([])
    const [loading, setLoading] = React.useState(true)
    const [asking, setAsking] = React.useState(false)
    const [questionText, setQuestionText] = React.useState("")
    const [answerDraft, setAnswerDraft] = React.useState<Record<string, string>>({})
    const [openAnswerBox, setOpenAnswerBox] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/questions`)
                const data = await res.json()
                setQuestions(data)
            } catch (e) {
                console.error("Failed to load questions", e)
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

            const newQuestion = await res.json()
            setQuestions((prev) => [newQuestion, ...prev])
            setQuestionText("")
        } catch (e) {
            console.error("Failed to submit question", e)
        } finally {
            setAsking(false)
        }
    }

    const submitAnswer = async (questionId: string) => {
        const answer = answerDraft[questionId]
        if (!answer?.trim()) return

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
        } catch (error) {
            console.error("Answer submission failed", error)
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
        <div className="h-full flex flex-col gap-4 p-6 overflow-hidden">

            {/* Ask Box */}
            <Card className="p-4 space-y-3">
                <textarea
                    rows={3}
                    className="w-full resize-none rounded-md border p-3 text-sm"
                    placeholder="Ask a question about this project..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                />
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        disabled={!questionText.trim() || asking}
                        onClick={submitQuestion}
                    >
                        Ask Question
                    </Button>
                </div>
            </Card>

            {/* Questions */}
            {questions.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-4 mb-3">
                        <MessageSquare className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">No questions yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Be the first to ask about this project.
                    </p>
                </div>
            ) : (
                <ul className="flex-1 overflow-y-auto space-y-4">
                    {questions.map((q) => (
                        <li key={q._id} className="rounded-xl border bg-card p-4">

                            {/* Question */}
                            <div className="flex items-start justify-between gap-3">
                                <p className="font-medium">{q.question}</p>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full border ${q.status === "answered"
                                        ? "text-green-600 border-green-600/40"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    {q.status}
                                </span>
                            </div>

                            {/* Answer */}
                            {q.answer && (
                                <div className="mt-3 flex gap-2">
                                    <CornerDownRight className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div className="rounded-md bg-muted/50 p-3 w-full">
                                        <p className="text-sm text-muted-foreground">
                                            {q.answer}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Answer action */}
                            {q.status === "pending" && (
                                <div className="mt-3">
                                    {openAnswerBox === q._id ? (
                                        <>
                                            <textarea
                                                rows={2}
                                                className="w-full resize-none rounded-md border p-2 text-sm"
                                                placeholder="Write an answer..."
                                                value={answerDraft[q._id] || ""}
                                                onChange={(e) =>
                                                    setAnswerDraft((prev) => ({
                                                        ...prev,
                                                        [q._id]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <div className="mt-2 flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setOpenAnswerBox(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={!answerDraft[q._id]?.trim()}
                                                    onClick={() => submitAnswer(q._id)}
                                                >
                                                    Answer
                                                </Button>

                                            </div>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setOpenAnswerBox(q._id)}
                                        >
                                            Answer
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
