import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import Question from "@/models/Question"
import Project from "@/models/Project"
import User from "@/models/User"
import { Types } from "mongoose"

export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) => {
    try {
        const { projectId } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!Types.ObjectId.isValid(projectId)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
        }

        const { question } = await req.json()
        if (!question?.trim()) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 }
            )
        }

        await connectDB()

        const user = await User.findOne({ email: session.user?.email })
            .select("_id")
            .lean()

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const project = await Project.findById(projectId).select("_id").lean()
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        const newQuestion = await Question.create({
            project: projectId,
            askedBy: user._id,
            question,
        })

        return NextResponse.json(newQuestion, { status: 201 })
    } catch (error) {
        console.error("POST question error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export const GET = async (
    _req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) => {
    const { projectId } = await params

    await connectDB()

    const questions = await Question.find({ project: projectId })
        .sort({ createdAt: -1 })
        .populate("askedBy", "name image")
        .lean()

    if (!questions) {
        return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(questions)
}

