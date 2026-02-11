import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import Commit from "@/models/Commit";
import User from "@/models/User";

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

  const commits = await Commit.find({ projectId: projectId })
    .sort({ date: -1 })
    .limit(20)
    .lean();

  if (!commits) {
    return NextResponse.json({ error: "Commits not found" }, { status: 404 });
  }

  return NextResponse.json(commits);
}
