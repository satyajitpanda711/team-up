import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const body = await req.json();
        const { teammateEmail, role } = body;

        if (!teammateEmail) {
            return NextResponse.json({ error: "Teammate email is required" }, { status: 400 });
        }

        await connectDB();

        const teammate = await User.findOne({ email: teammateEmail });
        if (!teammate) {
            return NextResponse.json({ error: "Teammate not found" }, { status: 404 });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Add teammate to project
        project.members.push({
            user: teammate._id,
            role: role || "developer",
        });

        await project.save();
        return NextResponse.json({ success: true, project });
    } catch (error) {
        console.error("Error adding teammate:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}