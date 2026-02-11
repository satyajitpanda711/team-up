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

interface IngestRequestBody {
    projectId: string;
    repoUrl: string;
}

export async function POST(req: NextRequest) {
    try {
        /* ======================
           AUTH
        ====================== */
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, repoUrl } =
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
           PARSE & FETCH META
        ====================== */
        const { owner, repoName, fullName } = parseGitHubRepo(repoUrl);

        const repoMeta = await fetchRepoMeta(
            owner,
            repoName,
            user.githubAccessToken
        );

        /* ======================
           UPSERT REPOSITORY
        ====================== */
        const repository = await Repository.findOneAndUpdate(
            { githubId: repoMeta.id, projectId },
            {
                projectId,
                githubId: repoMeta.id,
                owner,
                name: repoName,
                fullName,
                url: repoMeta.html_url,
                isPrivate: repoMeta.private,
                defaultBranch: repoMeta.default_branch,
                
                lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        /* ======================
           REPO TREE (PATHS ONLY)
        ====================== */
        const tree = await fetchRepoTree(
            owner,
            repoName,
            repoMeta.default_branch,
            user.githubAccessToken
        );

        for (const node of tree.tree) {
            if (
                node.path.startsWith(".git") ||
                node.path.includes("node_modules")
            ) continue;

            await RepoFile.findOneAndUpdate(
                {
                    repository: repository._id,
                    path: node.path,
                },
                {
                    repository: repository._id,
                    path: node.path,
                    type: node.type === "tree" ? "dir" : "file",
                    size: node.size ?? 0,
                },
                { upsert: true }
            );
        }
        console.log
        await Repository.findByIdAndUpdate(repository._id, {
            tree: tree,
        });

        /* ======================
           README (CONTENT ONLY)
        ====================== */
        const readmeContent = await fetchReadme(
            owner,
            repoName,
            user.githubAccessToken
        );

        if (readmeContent) {
            await RepoFile.findOneAndUpdate(
                {
                    repository: repository._id,
                    path: "README.md",
                },
                {
                    repository: repository._id,
                    path: "README.md",
                    type: "file",
                    content: readmeContent,
                    language: "markdown",
                    size: readmeContent.length,
                },
                { upsert: true }
            );
        }

        /* ======================
           COMMITS
        ====================== */
        const commits = await fetchCommits(
            owner,
            repoName,
            user.githubAccessToken
        );

        for (const c of commits) {
            await Commit.findOneAndUpdate(
                { repository: repository._id, sha: c.sha },
                {
                    repository: repository._id,
                    sha: c.sha,
                    message: c.commit.message,
                    author: c.commit.author?.name,
                    date: c.commit.author?.date,
                },
                { upsert: true }
            );
        }

        /* ======================
           PULL REQUESTS
        ====================== */
        const prs = await fetchPullRequests(
            owner,
            repoName,
            user.githubAccessToken
        );

        for (const pr of prs) {
            await PullRequest.findOneAndUpdate(
                { repository: repository._id, number: pr.number },
                {
                    repository: repository._id,
                    number: pr.number,
                    title: pr.title,
                    body: pr.body,
                    state: pr.state,
                    merged: Boolean(pr.merged_at),
                },
                { upsert: true }
            );
        }

        /* ======================
           ISSUES (FILTER PRs)
        ====================== */
        const issues = await fetchIssues(
            owner,
            repoName,
            user.githubAccessToken
        );

        for (const issue of issues) {
            if (issue.pull_request) continue;

            await Issue.findOneAndUpdate(
                { repository: repository._id, number: issue.number },
                {
                    repository: repository._id,
                    number: issue.number,
                    title: issue.title,
                    body: issue.body,
                    state: issue.state,
                    labels: issue.labels.map((l: any) => l.name),
                },
                { upsert: true }
            );
        }

        /* ======================
           DONE
        ====================== */
        return NextResponse.json(
            {
                success: true,
                repositoryId: repository._id,
                treeNodes: tree.tree.length,
                commits: commits.length,
                prs: prs.length,
                issues: issues.length,
                readme: Boolean(readmeContent),
                tree: tree,
                treeFetchedAt: new Date(),
            },
            { status: 200 }
        ); 
    } catch (error) {
        console.error("Repo ingest error:", error);
        return NextResponse.json(
            { error: "Repository ingestion failed" },
            { status: 500 }
        );
    }
}
