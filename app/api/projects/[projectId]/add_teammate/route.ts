import {connectDB} from "@/lib/db";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const body = await req.json();
        const { teammateEmail } = body;

        if (!teammateEmail) {
            return NextResponse.json({ error: "Teammate email is required" }, { status: 400 });
        }

        await connectDB();

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Add teammate to project
        project.members.push({
            user: teammateEmail,
            role: "developer",
        });

        await project.save();

        return NextResponse.json({ success: true, project});
    } catch (error) {
        console.error("Error adding teammate:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}