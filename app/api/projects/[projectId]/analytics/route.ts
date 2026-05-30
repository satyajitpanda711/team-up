import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Repository from "@/models/Repository";
import Commit from "@/models/Commit";
import RepoFile from "@/models/RepoFile";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await connectDB();

    const repository = await Repository.findOne({ projectId }).lean();
    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // 1. Commits by day (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const commits = await Commit.find({
      repository: repository._id,
      date: { $gte: fourteenDaysAgo }
    }).lean();

    const commitMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      commitMap[dateStr] = 0;
    }

    commits.forEach((c: any) => {
      const dateStr = new Date(c.date || c.createdAt).toISOString().split("T")[0];
      if (commitMap[dateStr] !== undefined) {
        commitMap[dateStr]++;
      }
    });

    const commitVelocity = Object.keys(commitMap).map((date) => ({
      date,
      commits: commitMap[date],
    }));

    // 2. Language distribution
    const files = await RepoFile.find({ repository: repository._id }).lean();
    
    const langMap: Record<string, number> = {};
    files.forEach((f: any) => {
      if (f.language) {
        langMap[f.language] = (langMap[f.language] || 0) + 1;
      }
    });

    const languageDistribution = Object.keys(langMap)
      .map((name) => ({ name, value: langMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 languages

    return NextResponse.json({
      commitVelocity,
      languageDistribution
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
