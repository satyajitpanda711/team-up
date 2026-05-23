// api/projects/[projectId]/askRepo/ai.ts

import { connectDB } from "@/lib/db";
import Commit from "@/models/Commit";
import Project from "@/models/Project";
import RepoFile from "@/models/RepoFile";
import Repository from "@/models/Repository";
import { Groq } from "groq-sdk";
import AskRepoMessages from "@/models/AskRepoMessages";
import User from "@/models/User";

import { retrieveRelevantFiles } from "@/lib/retrieve";

const API_KEY = process.env.GROQ_API || "";

const groq = new Groq({
  apiKey: API_KEY,
});

/* =========================================
   INGEST REPO CONTEXT
========================================= */

const ingestRepo = async (
  projectId: string,
  repoId: string
) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    const repository = await Repository.findById(repoId);

    if (!repository) {
      throw new Error("Repository not found");
    }

    console.log(
      "Repository found in ingestRepo:",
      repository._id
    );

    /* =========================
       README
    ========================= */

    const readme = await RepoFile.findOne({
      repository: repoId,
      path: "README.md",
    }).lean();

    const readmeContent =
      readme?.content?.slice(0, 3000) || "";

    /* =========================
       RECENT COMMITS
    ========================= */

    const commits = await Commit.find({
      repository: repoId,
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const commitContext = commits
      .map(
        (c: { message: string }) =>
          `• ${c.message}`
      )
      .join("\n");

    return {
      readme: readmeContent,
      commits: commitContext,
    };
  } catch (error) {
    console.error("Error in ingestRepo:", error);
    throw error;
  }
};

/* =========================================
   ASK REPO
========================================= */

const askRepo = async (
  projectId: string,
  question: string,
  userEmail?: string | null
) => {
  await connectDB();

  /* =========================
     PROJECT
  ========================= */

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  /* =========================
     REPOSITORY
  ========================= */

  const repository = await Repository.findOne({
    projectId,
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  /* =========================
     RETRIEVE RELEVANT FILES
  ========================= */

  const relevantFiles =
    await retrieveRelevantFiles(
      repository._id.toString(),
      question
    );

  console.log(
    "Relevant files:",
    relevantFiles.map((f: any) => f.path)
  );

  /* =========================
     GENERAL REPO CONTEXT
  ========================= */

  const repoContext = await ingestRepo(
    projectId,
    repository._id.toString()
  );

  /* =========================
     BUILD RETRIEVED CONTEXT
  ========================= */

  const relevantContext = relevantFiles
    .map(
      (chunk: any) => `
FILE: ${chunk.path}

${chunk.content}
`
    )
    .join("\n\n");

  /* =========================
     CHAT HISTORY
  ========================= */

  const history = await AskRepoMessages.find({
    repository: repository._id,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const historyContext = history
    .map(
      (h) =>
        `Q: ${h.question}\nA: ${h.answer}`
    )
    .reverse()
    .join("\n\n");

  /* =========================
     PROMPT
  ========================= */

  const prompt = `
You are a senior developer helping explain a GitHub repository.

## Context

README:
${repoContext.readme.slice(0, 1500)}

RELEVANT FILES:
${relevantContext}

COMMITS:
${repoContext.commits}

HISTORY:
${historyContext}

## Question
${question}

## Instructions
- Answer the user's question directly and concisely.
- ONLY use the provided repository context.
- If the answer is not found in the context, say:
"I couldn't find that information in the repository context."
- Use Markdown formatting.
- Explain code flow clearly when relevant.
- Do not hallucinate implementation details.
- Prefer retrieved files over assumptions.
`;


  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      max_tokens: 800,
      temperature: 0.5,
    });

  const rawAnswer =
    completion.choices?.[0]?.message
      ?.content || "";

  const answer =
    typeof rawAnswer === "string"
      ? rawAnswer
      : JSON.parse(JSON.stringify(rawAnswer));

  const userData = userEmail
    ? await User.findOne({
      email: userEmail,
    }).lean()
    : null;

  const username =
    userData?.name || "Anonymous";

  const askRepoMessage =
    new AskRepoMessages({
      projectId,

      repository: repository._id,

      user: userData?._id,

      username,

      question,

      answer,

      answered: true,
    });

  await askRepoMessage.save();

  return {
    answer: String(answer),

    askRepoMessageId:
      askRepoMessage._id.toString(),

    user: String(username),
  };
};

export { askRepo, ingestRepo };