import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findById(userId).select("+githubAccessToken");

    if (!dbUser || !dbUser.githubAccessToken) {
      return NextResponse.json({ error: "GitHub account not linked" }, { status: 400 });
    }

    // Fetch latest profile from GitHub
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${dbUser.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
         return NextResponse.json({ error: "GitHub token expired. Please sign out and sign in again." }, { status: 401 });
      }
      return NextResponse.json({ error: "Failed to fetch from GitHub" }, { status: 500 });
    }

    const githubData = await res.json();
    
    // Also fetch email if not primary in user object
    let email = githubData.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${dbUser.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find((e: any) => e.primary);
        if (primary) email = primary.email;
      }
    }

    // Update DB user with latest details
    dbUser.name = githubData.name || githubData.login;
    if (email) dbUser.email = email;
    dbUser.image = githubData.avatar_url;
    
    await dbUser.save();

    return NextResponse.json({ 
      success: true, 
      user: {
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
      }
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
