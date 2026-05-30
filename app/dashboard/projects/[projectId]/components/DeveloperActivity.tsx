import { connectDB } from "@/lib/db";
import Repository from "@/models/Repository";
import Commit from "@/models/Commit";
import PullRequest from "@/models/PullRequest";
import Issue from "@/models/Issue";
import { GitCommit, GitPullRequest, CircleDot } from "lucide-react";
import { Card } from "@/components/ui/card";

type ActivityItem = {
  id: string;
  type: "commit" | "pr" | "issue";
  title: string;
  author: string;
  date: Date;
  status?: string;
};

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default async function DeveloperActivity({ projectId }: { projectId: string }) {
  await connectDB();
  
  const repository = await Repository.findOne({ projectId }).lean();
  
  if (!repository) {
    return (
      <Card className="p-5 border">
        <h2 className="text-xs uppercase tracking-wider mb-4">Developer Activity</h2>
        <p className="text-sm text-muted-foreground">No repository connected.</p>
      </Card>
    );
  }

  const [commits, prs, issues] = await Promise.all([
    Commit.find({ repository: repository._id }).sort({ date: -1 }).limit(5).lean(),
    PullRequest.find({ repository: repository._id }).sort({ updatedAt: -1 }).limit(5).lean(),
    Issue.find({ repository: repository._id }).sort({ updatedAt: -1 }).limit(5).lean(),
  ]);

  const activities: ActivityItem[] = [
    ...commits.map((c: any) => ({
      id: `commit-${c._id}`,
      type: "commit" as const,
      title: c.message.split("\n")[0],
      author: c.author || "Unknown",
      date: new Date(c.date || c.createdAt),
    })),
    ...prs.map((pr: any) => ({
      id: `pr-${pr._id}`,
      type: "pr" as const,
      title: pr.title,
      author: `PR #${pr.number}`,
      date: new Date(pr.updatedAt || pr.createdAt),
      status: pr.merged ? "Merged" : pr.state,
    })),
    ...issues.map((issue: any) => ({
      id: `issue-${issue._id}`,
      type: "issue" as const,
      title: issue.title,
      author: `Issue #${issue.number}`,
      date: new Date(issue.updatedAt || issue.createdAt),
      status: issue.state,
    }))
  ];

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivities = activities.slice(0, 7);

  return (
    <Card className="p-5 border">
      <h2 className="text-xs uppercase tracking-wider mb-4">Developer Activity</h2>
      
      {recentActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity found.</p>
      ) : (
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                {activity.type === "commit" && <GitCommit className="w-4 h-4 text-green-500" />}
                {activity.type === "pr" && <GitPullRequest className="w-4 h-4 text-purple-500" />}
                {activity.type === "issue" && <CircleDot className="w-4 h-4 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground/90">
                  {activity.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-medium">{activity.author}</span>
                    {activity.status && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{activity.status}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 shrink-0">
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
