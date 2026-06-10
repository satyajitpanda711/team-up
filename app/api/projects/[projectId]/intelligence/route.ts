import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Project from "@/models/Project";
import Repository from "@/models/Repository";
import RepoFile from "@/models/RepoFile";
import Commit from "@/models/Commit";
import IntelligenceReport from "@/models/IntelligenceReport";
import { Groq } from "groq-sdk";

const API_KEY = process.env.GROQ_API || "";
const groq = new Groq({ apiKey: API_KEY });

// GET: Fetch the history of generated intelligence reports for a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    await connectDB();

    const reports = await IntelligenceReport.find({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Fetch Intelligence Reports Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Generate a new intelligence report and save it to the database
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const repository = await Repository.findOne({ projectId });
    if (!repository) return NextResponse.json({ error: "Repository not found" }, { status: 404 });

    // Fetch paths of all files
    const files = await RepoFile.find({ repository: repository._id })
      .select("path")
      .lean();
    
    // Get README content if exists
    const readmeFile = await RepoFile.findOne({ repository: repository._id, path: "README.md" }).lean();
    
    // Fetch recent commits
    const commits = await Commit.find({ repository: repository._id })
      .sort({ date: -1 })
      .limit(30)
      .select("message date author")
      .lean();

    const filePaths = files.map((f: any) => f.path).join("\n");
    const commitMessages = commits.map((c: any) => `[${c.date}] ${c.author}: ${c.message}`).join("\n");
    const readmeContent = readmeFile?.content?.slice(0, 3000) || "No README found.";

    const prompt = `You are a world-class AI CTO Assistant. Analyze the following repository metadata and generate a structured JSON "Intelligence Report".

## Context
Project Name: ${project.name}

README (truncated):
${readmeContent}

File Paths:
${filePaths}

Recent Commits:
${commitMessages}

## Instructions
Generate a JSON object with the exact following schema:
{
  "overview": "A high-level cinematic summary of what this repository is.",
  "techStack": ["list", "of", "inferred", "technologies"],
  "architectureStyle": "Short description of the architectural pattern (e.g., Next.js App Router, MVC, Microservices).",
  "criticalAreas": [
    { "name": "Folder/Module Name", "reason": "Why it's critical or active" }
  ],
  "timeline": [
    { "phase": "Brief name (e.g., Authentication Setup)", "description": "What happened based on commits" }
  ],
  "onboardingNotes": "2-3 sentences of advice for a new developer starting on this codebase.",
  "risks": ["list", "of", "potential", "risks", "or", "tech debt"]
}
Only return valid JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.2,
    });

    const rawContent = completion.choices?.[0]?.message?.content || "{}";
    const reportData = JSON.parse(rawContent);

    // Save to database
    const newReport = await IntelligenceReport.create({
      repository: repository._id,
      projectId: project._id,
      reportData,
    });

    return NextResponse.json(newReport);
  } catch (error: any) {
    console.error("Generate Intelligence Report Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
