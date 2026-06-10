import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Project from "@/models/Project";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderGit2, Plus, Github, Users, ArrowRight, Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects",
};

export default async function Page() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user?.email) redirect("/");

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect("/");

  const projects = await Project.find({ owner: user._id })
    .populate("repository")
    .lean();

  return (
    <main className="min-h-screen p-8 bg-background/50 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and monitor your connected repositories.
            </p>
          </div>

          <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
            <Link href="/dashboard/projects/new">
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl border-dashed bg-card/30">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <FolderGit2 className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven't created any projects. Connect a GitHub repository to get started with intelligence tracking.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/projects/new">
                Create your first project
              </Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-14rem)] pr-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {projects.map((project: any) => (
                <Link
                  key={String(project._id)}
                  href={`/dashboard/projects/${project._id}`}
                  className="group block relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative h-full flex flex-col p-6 rounded-2xl border bg-card/40 backdrop-blur-sm hover:bg-card/80 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10">
                    
                    {/* Top Row: Icon + Name */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-110 transition-transform duration-300">
                          <FolderGit2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg leading-tight truncate max-w-[180px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {project.name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="p-1.5 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:group-hover:bg-indigo-500/10 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Repo Detail */}
                    <div className="mt-2 mb-6">
                      {project.repository ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 w-fit px-2.5 py-1 rounded-md border border-border/50">
                          <Github className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">{project.repository.fullName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 w-fit px-2.5 py-1 rounded-md border border-border/50">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Not Connected</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Stats */}
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{project.members?.length || 1} Member{project.members?.length !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {project.updatedAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </main>
  );
}
