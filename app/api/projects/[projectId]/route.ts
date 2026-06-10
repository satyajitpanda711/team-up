import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Repository from "@/models/Repository";
import RepoFile from "@/models/RepoFile";
import Commit from "@/models/Commit";
import PullRequest from "@/models/PullRequest";
import Issue from "@/models/Issue";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await params;

        if (!projectId || !Types.ObjectId.isValid(projectId)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }

        await connectDB();

        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Find the repository linked to the project
        const repository = await Repository.findOne({ projectId });
        
        if (repository) {
            // Delete all associated repository records
            await RepoFile.deleteMany({ repository: repository._id });
            await Commit.deleteMany({ repository: repository._id });
            await PullRequest.deleteMany({ repository: repository._id });
            await Issue.deleteMany({ repository: repository._id });
            
            // Delete repository
            await Repository.findByIdAndDelete(repository._id);
        }

        // Delete project
        await Project.findByIdAndDelete(projectId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
