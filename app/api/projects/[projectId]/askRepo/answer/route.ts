import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Repository from "@/models/Repository";
import AskRepoMessages from "@/models/AskRepoMessages";
import { askRepo } from "../ai";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

/* =========================
   GET — fetch history
========================= */
export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const repository = await Repository.findOne({ projectId });
    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    const messages = await AskRepoMessages.find({
      repository: repository._id,
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching AI messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

/* =========================
   POST — ask a question
========================= */
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    // Read body FIRST — before anything else touches the request stream
    const { projectId } = await params;
    const body = await req.json();
    const question = body?.question;

    if (!question?.trim()) {
      console.log("Question not found");
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Resolve user via JWT token from cookies — does NOT read the request body
    const cookieStore = await cookies();
    const token = await getToken({
      req: {
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c) => [c.name, c.value])
        ),
        headers: Object.fromEntries(req.headers.entries()),
      } as any,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    const userEmail = token?.email ?? null;

    await connectDB();

    const result = await askRepo(projectId, question.trim(), userEmail);

    return NextResponse.json({
      answer: result.answer,
      askRepoMessageId: result.askRepoMessageId,
      user: result.user,
    });
  } catch (error) {
    console.error("Error in askRepo POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};