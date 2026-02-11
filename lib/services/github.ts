export function parseGitHubRepo(repoUrl: string) {
  const match = repoUrl.replace(/\/$/, "").match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error("Invalid GitHub repo URL");

  return {
    owner: match[1],
    repoName: match[2].replace(".git", ""),
    fullName: `${match[1]}/${match[2].replace(".git", "")}`,
  };
}

export async function fetchRepoMeta(owner: string, repo: string, token: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error("Repo not accessible");

  return res.json();
}

export async function fetchCommits(owner: string, repo: string, token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch commits");
  return res.json();
}

export async function fetchPullRequests(owner: string, repo: string, token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch PRs");
  return res.json();
}

export async function fetchIssues(owner: string, repo: string, token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string,
  token: string
) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(`Fetching repo tree from ${owner}/${repo} at branch ${branch}`);
  //tree
  console.log(res);

  if (!res.ok) throw new Error("Failed to fetch tree");
  return res.json();
}

export async function fetchReadme(
  owner: string,
  repo: string,
  token: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
    }
  );

  if (!res.ok) return null;
  return res.text();
}

