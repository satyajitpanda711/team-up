import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import RepoFile from "@/models/RepoFile";
import User from "@/models/User";
import Repository from "@/models/Repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user?.email }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const repository = await Repository.findOne({ projectId }).lean();
  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const files = await RepoFile.find({ repository: repository._id })
    .select("path language size lastCommitSha updatedAt")
    .sort({ path: 1 })
    .lean();

  return NextResponse.json(files);
}
