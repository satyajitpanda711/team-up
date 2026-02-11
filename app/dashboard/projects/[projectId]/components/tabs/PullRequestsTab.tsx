"use client";

import { useEffect, useState } from "react";
import { GitPullRequest, Clock, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type PullRequest = {
  _id: string;
  title: string;
  status: "open" | "merged" | "closed";
  author?: string;
  createdAt?: string;
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function PullRequestSkeleton() {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="w-0.5 h-full bg-border absolute top-10" />
      </div>
      <div className="flex-1 pb-8 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PullRequest["status"] }) {
  if (status === "merged") {
    return (
      <Badge variant="secondary" className="gap-1 text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Merged
      </Badge>
    );
  }

  if (status === "closed") {
    return (
      <Badge variant="secondary" className="gap-1 text-red-500">
        <XCircle className="h-3.5 w-3.5" />
        Closed
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 text-blue-500">
      <Loader2 className="h-3.5 w-3.5" />
      Open
    </Badge>
  );
}

export default function PullRequestsTab({ projectId }: { projectId: string }) {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/prs`);
        const data = await res.json();
        setPullRequests(data);
      } catch (err) {
        console.error("Failed to load pull requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <PullRequestSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <GitPullRequest className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No pull requests</h3>
        <p className="text-sm text-muted-foreground">
          Pull requests will appear here once contributors start opening them
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-0">
        {pullRequests.map((pr, index) => {
          const isLast = index === pullRequests.length - 1;

          return (
            <div key={pr._id} className="flex gap-4 relative">
              <div className="relative flex flex-col items-center shrink-0">
                <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-border">
                  <AvatarFallback className="text-xs font-semibold">
                    {getInitials(pr.author)}
                  </AvatarFallback>
                </Avatar>

                {!isLast && (
                  <div className="w-0.5 h-full bg-border absolute top-10 bottom-0" />
                )}
              </div>

              <Card
                className={`flex-1 p-4 border-l-4 border-l-primary/50 hover:border-l-primary transition-colors ${!isLast ? "mb-6" : ""
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-base leading-tight flex-1">
                      {pr.title}
                    </h4>
                    <StatusBadge status={pr.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {pr.author || "Unknown"}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(pr.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
