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

  console.log("Repository ID:", repositoryId);

  const count = await RepoFile.countDocuments({
    repository: repositoryId,
  });

  console.log("Total repo files:", count);

  const countWithContent = await RepoFile.countDocuments({
    repository: repositoryId,
    content: { $exists: true, $ne: "" },
  });

  console.log(
    "Repo files with content:",
    countWithContent
  );

  const relevantChunks: {
    path: string;
    content: string;
    score: number;
  }[] = [];


  console.log("Unique words: ", uniqueKeywords);

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
    const chunks = chunkText(
      file.content || ""
    );

    for (const chunk of chunks) {
      let score = 0;

      for (const keyword of expandedTerms) {
        const regex = new RegExp(
          keyword,
          "gi"
        );

        const matches =
          chunk.match(regex);

        if (matches) {
          score += matches.length;
        }

        if (
          file.path
            ?.toLowerCase()
            .includes(keyword)
        ) {
          score += 3;
        }

        const chunks = chunkText(
          file.content || ""
        );

        console.log(
          file.path,
          "chunks:",
          chunks.length
        );
      }

      if (score > 0) {
        relevantChunks.push({
          path: file.path,
          content: chunk,
          score,
        });
      }

      console.log("Repository ID:", repositoryId);

      const count = await RepoFile.countDocuments({
        repository: repositoryId,
      });

      console.log("Total repo files:", count);

      const countWithContent = await RepoFile.countDocuments({
        repository: repositoryId,
        content: { $exists: true, $ne: "" },
      });

      console.log(
        "Repo files with content:",
        countWithContent
      );
    }
  }
  console.log(
    "Files with content:",
    files.length
  );

  relevantChunks.sort(
    (a, b) => b.score - a.score
  );

  console.log("Question:", question);

  console.log(
    "Top chunks:",
    relevantChunks.slice(0, 5).map((c) => ({
      path: c.path,
      score: c.score,
      preview: c.content.slice(0, 100),
    }))
  );

  return relevantChunks.slice(0, 6);
}