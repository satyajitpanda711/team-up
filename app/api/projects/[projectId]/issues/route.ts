import { NextResponse, NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import Project from "@/models/Project"
import Issue from "@/models/Issue"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { Types } from "mongoose"

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
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

    const project = await Project.findById(projectId)
      .select("members")
      .lean()

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const isMember = project.members?.some(
      (m: any) => m.user.toString() === user._id.toString()
    )

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const issues = await Issue.find({ project: projectId })
      .sort({ createdAt: -1 })
      .select("number title body state labels createdAt")
      .lean()

    return NextResponse.json(issues, { status: 200 })
  } catch (error) {
    console.error("GET /issues error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
