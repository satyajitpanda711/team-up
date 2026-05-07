"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FolderKanban,
  GitCommitHorizontal,
  CircleDot,
  GitPullRequest,
  Users,
  ArrowUpRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";

type DashboardData = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  stats: {
    projects: number;
    commits: number;
    issues: number;
    openIssues: number;
    pullRequests: number;
    openPRs: number;
  };
  projects: {
    _id: string;
    name: string;
    githubRepoUrl: string;
    members: number;
    updatedAt: string;
  }[];
  recentCommits: {
    sha: string;
    message: string;
    author: string;
    date: string;
  }[];
};

const STAT_CARDS = [
  {
    key: "projects" as const,
    label: "Projects",
    icon: FolderKanban,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "commits" as const,
    label: "Commits",
    icon: GitCommitHorizontal,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "issues" as const,
    label: "Issues",
    icon: CircleDot,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    subKey: "openIssues" as const,
    subLabel: "open",
  },
  {
    key: "pullRequests" as const,
    label: "Pull Requests",
    icon: GitPullRequest,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    subKey: "openPRs" as const,
    subLabel: "open",
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const { user, stats, projects, recentCommits } = data;
  const greeting = getGreeting();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* ── Welcome header ── */}
      <div className="flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full border-2 border-primary/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your workspace overview
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, subKey, subLabel }) => (
          <Card
            key={key}
            className="p-5 flex flex-col gap-3 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
              <div className={`${bg} ${color} p-2 rounded-lg`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold tabular-nums">{stats[key]}</span>
              {subKey && (
                <span className="text-xs text-muted-foreground mb-1">
                  {stats[subKey]} {subLabel}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Two-column: Projects + Activity ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Projects list */}
        <Card className="lg:col-span-3 p-0 overflow-hidden border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Your Projects</h2>
            </div>
            <Link
              href="/dashboard/projects"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground text-sm">
              <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No projects yet</p>
              <p className="text-xs mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.githubRepoUrl.replace("https://github.com/", "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {project.members}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(project.updatedAt)}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden border">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent Commits</h2>
          </div>

          {recentCommits.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground text-sm">
              <GitCommitHorizontal className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No recent commits</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentCommits.map((commit, i) => (
                <div
                  key={`${commit.sha}-${i}`}
                  className="px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <GitCommitHorizontal className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{commit.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                          {commit.sha}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {commit.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(commit.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick actions ── */}
      <Card className="p-5 border flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Get started</p>
            <p className="text-xs text-muted-foreground">
              Create a new project or explore existing ones
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/projects"
            className="text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Browse Projects
          </Link>
        </div>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}