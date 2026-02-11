import { authOptions } from "@/lib/auth";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


interface CreateProjectBody {
    name: string;
    githubRepoUrl: string;
}


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, githubRepoUrl } = (await req.json()) as CreateProjectBody;

        if (!name || !githubRepoUrl) {
            return NextResponse.json(
                { error: "Missing name or githubRepoUrl" },
                { status: 400 }
            );
        }

        await connectDB();
        const existingProject = await Project.findOne({
            name,
        });

        if (existingProject) {
            return NextResponse.json(
                { error: "Project with this name already exists" },
                { status: 409 }
            );
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const project = await Project.create({
            name,
            owner: user._id,
            members: [{ user: user._id, role: "owner" }],
            githubRepoUrl,
        });

        return NextResponse.json(
            { projectId: project._id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to Create Project" },
            { status: 500 }
        );
    }

};