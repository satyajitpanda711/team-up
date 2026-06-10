"use strict";
/**
 * 🚀 GitHub Service — Production Grade
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFileContent = void 0;
exports.parseGitHubRepo = parseGitHubRepo;
exports.fetchRepoMeta = fetchRepoMeta;
exports.fetchRepoMetaById = fetchRepoMetaById;
exports.fetchRepoTree = fetchRepoTree;
exports.fetchReadme = fetchReadme;
exports.fetchCommits = fetchCommits;
exports.fetchPullRequests = fetchPullRequests;
exports.fetchIssues = fetchIssues;
exports.fetchCommitFiles = fetchCommitFiles;
const GITHUB_BASE = "https://api.github.com";
/* ======================
   CORE FETCH (UPGRADED)
====================== */
async function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
async function ghFetch(url, token, options = {}, retry = 3) {
    try {
        const res = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, options.headers) }));
        /* 🔥 RATE LIMIT HANDLING */
        if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
            const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
            const wait = reset - Date.now();
            console.warn(`⏳ Rate limited. Waiting ${wait}ms`);
            if (wait > 0)
                await sleep(wait);
            return ghFetch(url, token, options, retry);
        }
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            /* 🔁 RETRY LOGIC */
            if (retry > 0 && res.status >= 500) {
                await sleep(500 * (4 - retry));
                return ghFetch(url, token, options, retry - 1);
            }
            throw new Error(`GitHub API error ${res.status} ${res.statusText}\n${url}\n${body}`);
        }
        return res;
    }
    catch (err) {
        if (retry > 0) {
            await sleep(500);
            return ghFetch(url, token, options, retry - 1);
        }
        throw err;
    }
}
/* ======================
   PAGINATION HELPER
====================== */
async function ghPaginate(url, token, limit = 1000) {
    let results = [];
    let page = 1;
    while (true) {
        const res = await ghFetch(`${url}&page=${page}`, token);
        const data = (await res.json());
        if (!data.length)
            break;
        results = results.concat(data);
        if (data.length < 100 || results.length >= limit)
            break;
        page++;
    }
    return results;
}
/* ======================
   PARSER
====================== */
function parseGitHubRepo(repoUrl) {
    const cleaned = repoUrl.replace(/\/$/, "").replace(/\.git$/, "");
    const match = cleaned.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match)
        throw new Error(`Invalid GitHub repo URL: "${repoUrl}"`);
    const owner = match[1];
    const repoName = match[2];
    return { owner, repoName, fullName: `${owner}/${repoName}` };
}
/* ======================
   META
====================== */
async function fetchRepoMeta(owner, repo, token) {
    const res = await ghFetch(`${GITHUB_BASE}/repos/${owner}/${repo}`, token);
    return res.json();
}
async function fetchRepoMetaById(repoId, token) {
    const res = await ghFetch(`${GITHUB_BASE}/repositories/${repoId}`, token);
    return res.json();
}
/* ======================
   TREE
====================== */
async function fetchRepoTree(repoId, branch, token) {
    const res = await ghFetch(`${GITHUB_BASE}/repositories/${repoId}/git/trees/${branch}?recursive=1`, token);
    return res.json();
}
/* ======================
   README
====================== */
async function fetchReadme(repoId, token) {
    try {
        const res = await ghFetch(`${GITHUB_BASE}/repositories/${repoId}/readme`, token, { headers: { Accept: "application/vnd.github.v3.raw" } });
        return res.text();
    }
    catch (_a) {
        return null;
    }
}
/* ======================
   COMMITS (PAGINATED + SINCE)
====================== */
async function fetchCommits(repoId, token, since) {
    const params = new URLSearchParams({
        per_page: "100",
    });
    if (since)
        params.set("since", since.toISOString());
    return ghPaginate(`${GITHUB_BASE}/repositories/${repoId}/commits?${params}`, token);
}
/* ======================
   PRs (SMART FILTER)
====================== */
async function fetchPullRequests(repoId, token, since) {
    const params = new URLSearchParams({
        state: "all",
        sort: "updated",
        direction: "desc",
        per_page: "100",
    });
    const prs = await ghPaginate(`${GITHUB_BASE}/repositories/${repoId}/pulls?${params}`, token);
    if (!since)
        return prs;
    return prs.filter((pr) => new Date(pr.updated_at) > since);
}
/* ======================
   ISSUES
====================== */
async function fetchIssues(repoId, token, since) {
    const params = new URLSearchParams({
        state: "all",
        sort: "updated",
        direction: "desc",
        per_page: "100",
    });
    if (since)
        params.set("since", since.toISOString());
    return ghPaginate(`${GITHUB_BASE}/repositories/${repoId}/issues?${params}`, token);
}
const fetchFileContent = async (owner, repo, path, token) => {
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            },
        });
        if (!res.ok) {
            return null;
        }
        const data = await res.json();
        if (!data.content) {
            return null;
        }
        return Buffer.from(data.content, "base64").toString("utf-8");
    }
    catch (error) {
        console.error("Failed to fetch file content:", error);
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
};
exports.fetchFileContent = fetchFileContent;
async function fetchCommitFiles(owner, repo, sha, token) {
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            },
        });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        return data.files || [];
    }
    catch (error) {
        console.error("fetchCommitFiles error:", error);
        return [];
    }
}
