import { connectDB } from "./db";
import Repository from "@/models/Repository";
import Project from "@/models/Project";

export const getRepositoriesForProject = async (projectId: string) => {
  await connectDB();
  const repo = await Project.findById(projectId).populate("repositories");
  if (!repo) throw new Error("Project not found");
  return repo;
}

export const getRepoIdfromProjectId = async (projectId: string) => {
  try {
    await connectDB();
    const project = await Project.findById(projectId);
    if(!project) {
      throw new Error("Project not found");
    }
    
    const repository = await Repository.findOne({ projectId: projectId });
    if(!repository) {
      throw new Error("Repository not found");
    }
    return repository._id;  

  } catch(e : any) {
    throw new Error("Project not found");
  } 
}