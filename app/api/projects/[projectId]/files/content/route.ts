import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import RepoFile from "@/models/RepoFile";
import User from "@/models/User";
import Repository from "@/models/Repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const filePath = request.nextUrl.searchParams.get("path");
  if (!filePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

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

  const file = await RepoFile.findOne({
    repository: repository._id,
    path: filePath,
  }).lean();

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}
