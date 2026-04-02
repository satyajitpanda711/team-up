import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Repository from "@/models/Repository";
import RepoFile from "@/models/RepoFile";
import Commit from "@/models/Commit";
import Issue from "@/models/Issue";
import PullRequest from "@/models/PullRequest";

import {
    parseGitHubRepo,
    fetchRepoMeta,
    fetchRepoTree,
    fetchReadme,
    fetchCommits,
    fetchPullRequests,
    fetchIssues,
} from "@/lib/services/github";

/* ======================
   TYPES
====================== */

interface IngestRequestBody {
    projectId: string;
    repoUrl: string;
    incremental?: boolean;
}

interface GitHubTreeNode {
    path: string;
    type: "tree" | "blob";
    size?: number;
    sha: string;
}

interface GitHubTreeResponse {
    tree: GitHubTreeNode[];
}

interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author?: {
            name: string;
            date: string;
        };
    };
}

interface GitHubPR {
    number: number;
    title: string;
    body: string | null;
    state: string;
    merged_at: string | null;
    updated_at: string;
}

interface GitHubIssue {
    number: number;
    title: string;
    body: string | null;
    state: string;
    updated_at: string;
    labels: { name: string }[];
    pull_request?: object;
}

/* ======================
   API
====================== */

export async function POST(req: NextRequest) {
    try {
        /* ======================
           AUTH
        ====================== */
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, repoUrl, incremental = true } =
            (await req.json()) as IngestRequestBody;

        if (!projectId || !repoUrl) {
            return NextResponse.json(
                { error: "Missing projectId or repoUrl" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            email: session.user.email,
        }).select("+githubAccessToken");

        if (!user?.githubAccessToken) {
            return NextResponse.json(
                { error: "GitHub access token missing" },
                { status: 403 }
            );
        }

        /* ======================
           PARSE + META
        ====================== */
        const { owner, repoName, fullName } = parseGitHubRepo(repoUrl);

        const repoMeta = await fetchRepoMeta(
            owner,
            repoName,
            user.githubAccessToken
        );

        const repoId: number = repoMeta.id;

        /* ======================
           EXISTING REPO
        ====================== */
        const existingRepo = await Repository.findOne({
            githubId: repoId,
            projectId,
        });

        const lastSyncedAt: Date | null =
            incremental && existingRepo?.lastSyncedAt
                ? existingRepo.lastSyncedAt
                : null;

        const syncStartedAt = new Date();

        /* ======================
           UPSERT REPO
        ====================== */
        const repository = await Repository.findOneAndUpdate(
            { githubId: repoId, projectId },
            {
                projectId,
                githubId: repoId,
                owner,
                name: repoName,
                fullName,
                url: repoMeta.html_url,
                isPrivate: repoMeta.private,
                defaultBranch: repoMeta.default_branch,
                lastSyncedAt: syncStartedAt,
            },
            { upsert: true, new: true }
        );

        /* ======================
           TREE
        ====================== */
        const tree = (await fetchRepoTree(
            repoId,
            repoMeta.default_branch,
            user.githubAccessToken
        )) as GitHubTreeResponse;

        const remotePaths = new Set<string>();

        for (const node of tree.tree) {
            if (
                node.path.startsWith(".git") ||
                node.path.includes("node_modules")
            )
                continue;

            remotePaths.add(node.path);

            await RepoFile.findOneAndUpdate(
                { repository: repository._id, path: node.path },
                {
                    repository: repository._id,
                    path: node.path,
                    type: node.type === "tree" ? "dir" : "file",
                    size: node.size ?? 0,
                    deletedAt: null,
                },
                { upsert: true }
            );
        }

        await RepoFile.updateMany(
            {
                repository: repository._id,
                path: { $nin: Array.from(remotePaths) },
                deletedAt: null,
            },
            { $set: { deletedAt: syncStartedAt } }
        );

        await Repository.findByIdAndUpdate(repository._id, {
            treeCount: remotePaths.size,
        });

        /* ======================
           README
        ====================== */
        const readmeContent = await fetchReadme(
            repoId,
            user.githubAccessToken
        );

        if (readmeContent) {
            await RepoFile.findOneAndUpdate(
                { repository: repository._id, path: "README.md" },
                {
                    repository: repository._id,
                    path: "README.md",
                    type: "file",
                    content: readmeContent,
                    language: "markdown",
                    size: readmeContent.length,
                    deletedAt: null,
                },
                { upsert: true }
            );
        }

        /* ======================
           COMMITS
        ====================== */
        const commits = (await fetchCommits(
            repoId,
            user.githubAccessToken,
            lastSyncedAt ?? undefined
        )) as GitHubCommit[];

        let newCommits = 0;

        for (const c of commits) {
            const existing = await Commit.findOneAndUpdate(
                { repository: repository._id, sha: c.sha },
                {
                    repository: repository._id,
                    sha: c.sha,
                    message: c.commit.message,
                    author: c.commit.author?.name,
                    date: c.commit.author?.date,
                },
                { upsert: true, new: false }
            );

            if (!existing) newCommits++;
        }

        /* ======================
           PRs
        ====================== */
        const prs = (await fetchPullRequests(
            repoId,
            user.githubAccessToken,
            lastSyncedAt ?? undefined
        )) as GitHubPR[];

        let newPRs = 0;
        let updatedPRs = 0;

        for (const pr of prs) {
            const existing = await PullRequest.findOneAndUpdate(
                { repository: repository._id, number: pr.number },
                {
                    repository: repository._id,
                    number: pr.number,
                    title: pr.title,
                    body: pr.body,
                    state: pr.state,
                    merged: Boolean(pr.merged_at),
                    updatedAt: pr.updated_at,
                },
                { upsert: true, new: false }
            );

            if (!existing) newPRs++;
            else updatedPRs++;
        }

        /* ======================
           ISSUES
        ====================== */
        const issues = (await fetchIssues(
            repoId,
            user.githubAccessToken,
            lastSyncedAt ?? undefined
        )) as GitHubIssue[];

        let newIssues = 0;
        let updatedIssues = 0;

        for (const issue of issues) {
            if (issue.pull_request) continue;

            const existing = await Issue.findOneAndUpdate(
                { repository: repository._id, number: issue.number },
                {
                    repository: repository._id,
                    number: issue.number,
                    title: issue.title,
                    body: issue.body,
                    state: issue.state,
                    labels: issue.labels.map((l) => l.name),
                    updatedAt: issue.updated_at,
                },
                { upsert: true, new: false }
            );

            if (!existing) newIssues++;
            else updatedIssues++;
        }

        /* ======================
           RESPONSE
        ====================== */
        const isFirstSync = !lastSyncedAt;

        return NextResponse.json({
            success: true,
            repositoryId: repository._id,
            syncType: isFirstSync ? "full" : "incremental",
            syncedSince: lastSyncedAt ?? null,
            treeNodes: remotePaths.size,
            commits: {
                fetched: commits.length,
                new: newCommits,
            },
            pullRequests: {
                fetched: prs.length,
                new: newPRs,
                updated: updatedPRs,
            },
            issues: {
                fetched: issues.length,
                new: newIssues,
                updated: updatedIssues,
            },
            readme: Boolean(readmeContent),
            syncedAt: syncStartedAt,
        });
    } catch (error) {
        console.error("🔥 Repo ingest error:", error);

        return NextResponse.json(
            {
                error: "Repository ingestion failed",
                details: (error as Error).message,
            },
            { status: 500 }
        );
    }
}