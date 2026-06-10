import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await params;
        if (!projectId || !Types.ObjectId.isValid(projectId)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }
        const body = await req.json();
        const { teammateId } = body;

        if (!teammateId) {
            return NextResponse.json({ error: "Teammate ID is required" }, { status: 400 });
        }

        await connectDB();

        // The teammateId passed from the frontend is usually githubId or _id. We check both safely.
        let teammate = null;
        if (Types.ObjectId.isValid(teammateId)) {
            teammate = await User.findById(teammateId);
        }
        
        if (!teammate) {
            teammate = await User.findOne({ githubId: teammateId });
        }
        
        if (!teammate) {
            return NextResponse.json({ error: "Teammate not found" }, { status: 404 });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Remove teammate from project
        const initialLength = project.members.length;
        project.members = project.members.filter(
            (m: any) => m.user.toString() !== teammate._id.toString()
        );

        if (project.members.length === initialLength) {
            return NextResponse.json({ error: "User is not a member of this project" }, { status: 400 });
        }

        await project.save();
        return NextResponse.json({ success: true, project });
    } catch (error) {
        console.error("Error removing teammate:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
