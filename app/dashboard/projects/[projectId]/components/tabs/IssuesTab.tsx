"use client"

import React from "react"
import { AlertCircle, Loader2 } from "lucide-react"

type Issue = {
  number: number
  title: string
  body: string
  state: "open" | "closed"
  labels: { name: string; color?: string }[]
}

const IssuesTab = ({ projectId }: { projectId: string }) => {
  const [issues, setIssues] = React.useState<Issue[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    const fetchIssues = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/projects/${projectId}/issues`)
        if (!res.ok) throw new Error("Failed to fetch")

        const data = await res.json()
        if (mounted) setIssues(data)
      } catch (err) {
        console.error("Failed to load issues", err)
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchIssues()
    return () => {
      mounted = false
    }
  }, [projectId])

  /* ------------------ STATES ------------------ */

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-3" />
        <h3 className="text-lg font-semibold">Failed to load issues</h3>
        <p className="text-sm text-muted-foreground">
          Please try again later.
        </p>
      </div>
    )
  }

  if (issues.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No issues found</h3>
        <p className="text-sm text-muted-foreground">
          There are no issues for this project yet.
        </p>
      </div>
    )
  }

  /* ------------------ LIST ------------------ */

  return (
    <div className="h-full overflow-y-auto p-6">
      <ul className="space-y-4">
        {issues.map((issue) => (
          <li
            key={issue.number}
            className="rounded-xl border bg-card p-4 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-semibold text-base leading-tight">
                #{issue.number} {issue.title}
              </h4>

              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  issue.state === "open"
                    ? "text-green-600 border-green-600/40"
                    : "text-muted-foreground"
                }`}
              >
                {issue.state}
              </span>
            </div>

            {issue.body && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {issue.body}
              </p>
            )}

            {issue.labels?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {issue.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="text-xs rounded-full bg-muted px-2 py-0.5"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default IssuesTab
