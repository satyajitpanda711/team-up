import { connectDB } from "./db";
import Repository from "@/models/Repository";
import Project from "@/models/Project";

export const getRepositoriesForProject = async (projectId: string) => {
  await connectDB();
  const repo = await Project.findById(projectId).populate("repositories");
  if (!repo) throw new Error("Project not found");
  return repo;
}