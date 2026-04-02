/**
 * 🚀 GitHub Service — Production Grade
 */

const GITHUB_BASE = "https://api.github.com";

/* ======================
   TYPES
====================== */

export interface ParsedRepo {
  owner: string;
  repoName: string;
  fullName: string;
}

export interface RepoMeta {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  default_branch: string;
  owner: { login: string };
}

/* ======================
   CORE FETCH (UPGRADED)
====================== */

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function ghFetch(
  url: string,
  token: string,
  options: RequestInit = {},
  retry = 3
): Promise<Response> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    });

    /* 🔥 RATE LIMIT HANDLING */
    if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
      const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
      const wait = reset - Date.now();

      console.warn(`⏳ Rate limited. Waiting ${wait}ms`);
      if (wait > 0) await sleep(wait);
      return ghFetch(url, token, options, retry);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");

      /* 🔁 RETRY LOGIC */
      if (retry > 0 && res.status >= 500) {
        await sleep(500 * (4 - retry));
        return ghFetch(url, token, options, retry - 1);
      }

      throw new Error(
        `GitHub API error ${res.status} ${res.statusText}\n${url}\n${body}`
      );
    }

    return res;
  } catch (err) {
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

async function ghPaginate<T>(
  url: string,
  token: string,
  limit = 1000
): Promise<T[]> {
  let results: T[] = [];
  let page = 1;

  while (true) {
    const res = await ghFetch(`${url}&page=${page}`, token);
    const data = (await res.json()) as T[];

    if (!data.length) break;

    results = results.concat(data);

    if (data.length < 100 || results.length >= limit) break;

    page++;
  }

  return results;
}

/* ======================
   PARSER
====================== */

export function parseGitHubRepo(repoUrl: string): ParsedRepo {
  const cleaned = repoUrl.replace(/\/$/, "").replace(/\.git$/, "");
  const match = cleaned.match(/github\.com\/([^\/]+)\/([^\/]+)/);

  if (!match) throw new Error(`Invalid GitHub repo URL: "${repoUrl}"`);

  const owner = match[1];
  const repoName = match[2];

  return { owner, repoName, fullName: `${owner}/${repoName}` };
}

/* ======================
   META
====================== */

export async function fetchRepoMeta(
  owner: string,
  repo: string,
  token: string
): Promise<RepoMeta> {
  const res = await ghFetch(`${GITHUB_BASE}/repos/${owner}/${repo}`, token);
  return res.json();
}

export async function fetchRepoMetaById(
  repoId: number,
  token: string
): Promise<RepoMeta> {
  const res = await ghFetch(`${GITHUB_BASE}/repositories/${repoId}`, token);
  return res.json();
}

/* ======================
   TREE
====================== */

export async function fetchRepoTree(
  repoId: number,
  branch: string,
  token: string
) {
  const res = await ghFetch(
    `${GITHUB_BASE}/repositories/${repoId}/git/trees/${branch}?recursive=1`,
    token
  );

  return res.json();
}

/* ======================
   README
====================== */

export async function fetchReadme(
  repoId: number,
  token: string
): Promise<string | null> {
  try {
    const res = await ghFetch(
      `${GITHUB_BASE}/repositories/${repoId}/readme`,
      token,
      { headers: { Accept: "application/vnd.github.v3.raw" } }
    );
    return res.text();
  } catch {
    return null;
  }
}

/* ======================
   COMMITS (PAGINATED + SINCE)
====================== */

export async function fetchCommits(
  repoId: number,
  token: string,
  since?: Date
) {
  const params = new URLSearchParams({
    per_page: "100",
  });

  if (since) params.set("since", since.toISOString());

  return ghPaginate(
    `${GITHUB_BASE}/repositories/${repoId}/commits?${params}`,
    token
  );
}

/* ======================
   PRs (SMART FILTER)
====================== */

export async function fetchPullRequests(
  repoId: number,
  token: string,
  since?: Date
) {
  const params = new URLSearchParams({
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: "100",
  });

  const prs = await ghPaginate<any>(
    `${GITHUB_BASE}/repositories/${repoId}/pulls?${params}`,
    token
  );

  if (!since) return prs;

  return prs.filter((pr) => new Date(pr.updated_at) > since);
}

/* ======================
   ISSUES
====================== */

export async function fetchIssues(
  repoId: number,
  token: string,
  since?: Date
) {
  const params = new URLSearchParams({
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: "100",
  });

  if (since) params.set("since", since.toISOString());

  return ghPaginate<any>(
    `${GITHUB_BASE}/repositories/${repoId}/issues?${params}`,
    token
  );
}