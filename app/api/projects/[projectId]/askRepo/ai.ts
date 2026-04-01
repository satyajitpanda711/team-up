// api/projects/[projectId]/askRepo/ai.ts

import { connectDB } from "@/lib/db";
import Commit from "@/models/Commit";
import Project from "@/models/Project";
import RepoFile from "@/models/RepoFile";
import Repository from "@/models/Repository";
import { Groq } from "groq-sdk";
import AskRepoMessage from "@/models/AskRepoMessage";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

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

const askRepo = async (projectId: string, question: string) => {
  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const repository = await Repository.findOne({ projectId });
  if (!repository) throw new Error("Repository not found");

  const repoContext = await ingestRepo(projectId, repository._id.toString());

  /* Chat history */

  const history = await AskRepoMessage.find({
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
You are an AI assistant helping developers understand a GitHub repository.

Use ONLY the repository context provided below to answer the question.

-------------------------
REPOSITORY README
${repoContext.readme}

REPOSITORY STRUCTURE
${repoContext.structure}

RECENT COMMITS
${repoContext.commits}

PREVIOUS QUESTIONS
${historyContext}
-------------------------

USER QUESTION
${question}

-------------------------
RULES
- Respond ONLY in valid Markdown.
- Do NOT write plain text outside Markdown sections.
- Be concise (maximum 5–7 sentences).
- Use bullet points when helpful.
- Mention relevant file paths if possible.
- If the answer cannot be found in the repository context, write:
  "Not found in repository context."

-------------------------
RESPONSE FORMAT

## Answer
Brief explanation of the answer.

## Related Files
- path/to/file.ts
- another/file.js

Only output the Markdown above. Do not include explanations outside this structure.
`;

  /* AI call */

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
    temperature: 0.3,
  });

  const answer = completion.choices?.[0]?.message?.content || "";

  /* User */

  const session = await getServerSession(authOptions);

  const userData = await User.findOne({
    email: session?.user?.email,
  }).lean();

  const username = userData?.name || "Anonymous";

  /* Save message */

  const askRepoMessage = new AskRepoMessage({
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
    answer,
    askRepoMessageId: askRepoMessage._id,
    user: username,
  };
};

export { askRepo, ingestRepo };