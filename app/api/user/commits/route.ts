import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Commit from "@/models/Commit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name;

    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Calculate the date exactly one year ago from today
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Fetch all commits authored by the user in the last year
    const commits = await Commit.find({
      author: userName,
      date: { $gte: oneYearAgo },
    }).lean();

    // Map counts by date string (YYYY-MM-DD)
    const commitCounts: Record<string, number> = {};
    for (const commit of commits) {
      if (!commit.date) continue;
      const dateStr = new Date(commit.date).toISOString().split("T")[0];
      commitCounts[dateStr] = (commitCounts[dateStr] || 0) + 1;
    }

    // Generate continuous days for the last year
    const data = [];
    const currentDate = new Date(oneYearAgo);
    
    // Calculate levels based on counts
    // Level 0: 0
    // Level 1: 1-2
    // Level 2: 3-5
    // Level 3: 6-9
    // Level 4: 10+
    const getLevel = (count: number) => {
      if (count === 0) return 0;
      if (count <= 2) return 1;
      if (count <= 5) return 2;
      if (count <= 9) return 3;
      return 4;
    };

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = commitCounts[dateStr] || 0;
      data.push({
        date: dateStr,
        count,
        level: getLevel(count),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch user commits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
