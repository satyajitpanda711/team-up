
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import Question from "@/models/Question"
import Project from "@/models/Project"
import User from "@/models/User"
import { Types } from "mongoose"



export const PATCH = async (
    req: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) => {
    try {
        const { questionId } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!Types.ObjectId.isValid(questionId)) {
            return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
        }

        const { answer } = await req.json()
        if (!answer?.trim()) {
            return NextResponse.json(
                { error: "Answer is required" },
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

        const question = await Question.findById(questionId)
        if (!question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 })
        }

        const project = await Project.findById(question.project)
            .select("members owner")
            .lean()

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        const isAuthorized =
            project.owner?.toString() === user._id.toString() ||
            project.members?.some(
                (m: any) => m.user.toString() === user._id.toString()
            )

        if (!isAuthorized) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        question.answer = answer
        question.status = "answered"
        await question.save()

        return NextResponse.json(question, { status: 200 })
    } catch (error) {
        console.error("Answer question error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

