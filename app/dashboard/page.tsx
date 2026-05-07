import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Project from "@/models/Project";
import Commit from "@/models/Commit";
import Issue from "@/models/Issue";
import PullRequest from "@/models/PullRequest";
import Repository from "@/models/Repository";

import Dashboard from "./components/Dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  await connectDB();

  const userId = (session as any).user?.id;

  // ── Fetch user's projects ──
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { "members.user": userId },
    ],
  })
    .sort({ updatedAt: -1 })
    .lean();

  const projectIds = projects.map((p: any) => p._id);

  // ── Fetch repos tied to those projects ──
  const repos = await Repository.find({
    projectId: { $in: projectIds },
  }).lean();

  const repoIds = repos.map((r: any) => r._id);

  // ── Aggregate stats in parallel ──
  const [
    totalCommits,
    totalIssues,
    openIssues,
    totalPRs,
    openPRs,
    recentCommits,
  ] = await Promise.all([
    Commit.countDocuments({ repository: { $in: repoIds } }),
    Issue.countDocuments({ repository: { $in: repoIds } }),
    Issue.countDocuments({ repository: { $in: repoIds }, state: "open" }),
    PullRequest.countDocuments({ repository: { $in: repoIds } }),
    PullRequest.countDocuments({ repository: { $in: repoIds }, state: "open" }),
    Commit.find({ repository: { $in: repoIds } })
      .sort({ date: -1 })
      .limit(6)
      .lean(),
  ]);

  // ── Shape the data for the client component ──
  const dashboardData = {
    user: {
      name: session.user?.name ?? "User",
      email: session.user?.email ?? "",
      image: session.user?.image ?? null,
    },
    stats: {
      projects: projects.length,
      commits: totalCommits,
      issues: totalIssues,
      openIssues,
      pullRequests: totalPRs,
      openPRs,
    },
    projects: projects.slice(0, 6).map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      githubRepoUrl: p.githubRepoUrl,
      members: p.members?.length ?? 0,
      updatedAt: p.updatedAt?.toISOString() ?? new Date().toISOString(),
    })),
    recentCommits: recentCommits.map((c: any) => ({
      sha: c.sha?.slice(0, 7) ?? "",
      message: c.message ?? "",
      author: c.author ?? "Unknown",
      date: c.date?.toISOString() ?? new Date().toISOString(),
    })),
  };

  return <Dashboard data={dashboardData} />;
}
