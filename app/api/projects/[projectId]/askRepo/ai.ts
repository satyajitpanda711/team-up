// api/projects/[projectId]/askRepo/ai.ts

import { connectDB } from "@/lib/db";
import Commit from "@/models/Commit";
import Project from "@/models/Project";
import RepoFile from "@/models/RepoFile";
import Repository from "@/models/Repository";
import { Groq } from "groq-sdk";
import AskRepoMessages from "@/models/AskRepoMessages";
import User from "@/models/User";

const API_KEY = process.env.GROQ_API || "";

const groq = new Groq({
  apiKey: API_KEY,
});

const ingestRepo = async (projectId: string, repoId: string) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const repository = await Repository.findById(repoId);
    if (!repository) {
      throw new Error("Repository not found");
    }

    console.log("Repository found in ingestRepo:", repository._id);

    /* README */

    const readme = await RepoFile.findOne({
      repository: repoId,
      path: "README.md",
    }).lean();

    // limit README size to avoid huge prompts
    const readmeContent = readme?.content?.slice(0, 3000) || "";

    /* Repo structure */

    const files = await RepoFile.find({
      repository: repoId,
      type: "file",
    })
      .limit(25)
      .lean();

    const structure = files.map((f) => `• ${f.path}`).join("\n");

    /* Recent commits */

    const commits = await Commit.find({
      repository: repoId,
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const commitContext = commits
      .map((c: { message: string }) => `• ${c.message}`)
      .join("\n");

    return {
      readme: readmeContent,
      structure,
      commits: commitContext,
    };
  } catch (error) {
    console.error("Error in ingestRepo:", error);
    throw error;
  }
};

const askRepo = async (projectId: string, question: string, userEmail?: string | null) => {
  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const repository = await Repository.findOne({ projectId });
  if (!repository) throw new Error("Repository not found");

  const repoContext = await ingestRepo(projectId, repository._id.toString());

  /* Chat history */

  const history = await AskRepoMessages.find({
    repository: repository._id,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const historyContext = history
    .map((h) => `Q: ${h.question}\nA: ${h.answer}`)
    .reverse()
    .join("\n\n");

  /* Prompt */

  const prompt = `
You are a senior developer helping explain a GitHub repository.

## Context
README:
${repoContext.readme.slice(0, 1500)}

FILES:
${repoContext.structure.slice(0, 800)}

COMMITS:
${repoContext.commits}

HISTORY:
${historyContext}

## Question
${question}

## Instructions
- Answer ONLY using the given context.
- If not found, say: "Not found in repository context."
- Be clear, concise, and structured.
- Mention exact file names or components when relevant.

## Output Format

Answer:
(3–5 sentences explanation in 250 characters only) 

How it works:
(optional steps or explanation)

Files:
- file: purpose
- file: purpose
`;

  /* AI call */

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 250,
    temperature: 0.3,
  });

  const rawAnswer = completion.choices?.[0]?.message?.content || "";

  const answer = typeof rawAnswer === "string"
    ? rawAnswer
    : JSON.parse(JSON.stringify(rawAnswer));

  /* User */

  const userData = userEmail
    ? await User.findOne({ email: userEmail }).lean()
    : null;

  const username = userData?.name || "Anonymous";

  /* Save message */

  const askRepoMessage = new AskRepoMessages({
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
    askRepoMessageId: askRepoMessage._id.toString(),
    user: String(username),
  };
};

export { askRepo, ingestRepo };