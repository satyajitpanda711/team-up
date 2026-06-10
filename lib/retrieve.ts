// lib/retrieve.ts

import RepoFile from "@/models/RepoFile";
import { chunkText } from "./chunking";

export async function retrieveRelevantFiles(
  repositoryId: string,
  question: string
) {
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const uniqueKeywords = [...new Set(keywords)];

  const files = await RepoFile.find({
    repository: repositoryId,
    content: { $exists: true, $ne: "" },
  }).lean();

  const relevantChunks: {
    path: string;
    content: string;
    score: number;
  }[] = [];

  const expandedTerms = [
    ...uniqueKeywords,
  ];

  if (uniqueKeywords.includes("authentication")) {
    expandedTerms.push(
      "auth",
      "nextauth",
      "jwt",
      "session",
      "login",
      "signin"
    );
  }

  for (const file of files) {
    if (!file.content) continue;
    
    const chunks = chunkText(file.content);
    const lowerPath = file.path?.toLowerCase() || "";

    for (const chunk of chunks) {
      let score = 0;

      for (const keyword of expandedTerms) {
        const regex = new RegExp(keyword, "gi");
        const matches = chunk.match(regex);

        if (matches) {
          score += matches.length;
        }

        if (lowerPath.includes(keyword)) {
          score += 3;
        }
      }

      if (score > 0) {
        relevantChunks.push({
          path: file.path,
          content: chunk,
          score,
        });
      }
    }
  }

  relevantChunks.sort(
    (a, b) => b.score - a.score
  );

  return relevantChunks.slice(0, 6);
}