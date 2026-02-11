import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import PullRequest from "@/models/PullRequest";
import { getServerSession } from "next-auth/next";
import User from "@/models/User";

export async function GET(
    _req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const user = await User.findOne({ email: session.user?.email }).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const pullRequests = await PullRequest.find({ projectId: params.projectId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        if (!pullRequests) {
            return NextResponse.json({ error: "Pull Requests not found" }, { status: 404 });
        }
        return NextResponse.json(pullRequests);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}