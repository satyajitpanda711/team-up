import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Fingerprint, Users, Github } from "lucide-react";

import InviteTeammateButton from "./components/InviteTeammateButton";
import RemoveTeammateButton from "./components/RemoveTeammateButton";
import ProjectSettingsButton from "./components/ProjectSettingsButton";
import ProjectTabs from "./components/ProjectTabs";
import IngestRepoButton from "./components/IngestRepoButton";
import DeveloperActivity from "./components/DeveloperActivity";

import User from "@/models/User";
import Project from "@/models/Project";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ThemeToggleButton from "@/components/theme-button";

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  if (!Types.ObjectId.isValid(projectId)) return { title: "Invalid Project" };

  await connectDB();
  const project = await Project.findById(projectId).lean();

  return {
    title: project ? project.name : "Project Not Found",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { projectId } = await params;

  if (!Types.ObjectId.isValid(projectId)) {
    return <State title="Invalid Project ID" />;
  }

  await connectDB();
  const project = await Project.findById(projectId).lean();

  if (!project) {
    return <State title="Project Not Found" />;
  }

  const contributors = await getContributors(projectId);


  return (
    <>
      <main className="h-screen">

        {/* HEADER */}
        <div className="border-b backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Github className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                  Project Workspace
                  {project.githubRepoUrl && (
                    <>
                      <span>•</span>
                      <a href={project.githubRepoUrl} target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                        <Github className="w-3 h-3" />
                        Repository linked
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>


            <div className="flex gap-3">
              <Link href={`/dashboard/projects/${projectId}/intelligence`}>
                <Button variant="default" className="gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
                  <Sparkles className="w-4 h-4" />
                  Intelligence Report
                </Button>
              </Link>
              <IngestRepoButton projectId={projectId} repoUrl={project.githubRepoUrl} />
              <ProjectSettingsButton projectId={projectId} projectName={project.name} />
              <ThemeToggleButton />
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[1fr_300px] gap-8">

          {/* MAIN */}
          <section className="space-y-6">


            {/* TABS */}
            <Card className="p-0 overflow-hidden h-[calc(100vh-9rem)]">
              <ProjectTabs projectId={projectId} />
            </Card>

          </section>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* META */}
            <Card className="p-5 border bg-card/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Fingerprint className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Project ID
                </h2>
              </div>
              <code className="block mt-3 text-xs px-3 py-2 rounded-md bg-muted/50 border border-border/50 break-all font-mono text-muted-foreground">
                {projectId}
              </code>
            </Card>

            {/* TEAM */}
            <Card className="p-5 border bg-card/40 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Team
                  </h2>
                </div>
                <InviteTeammateButton />
              </div>

              {contributors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg border-dashed bg-muted/30">
                  <Users className="w-6 h-6 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No teammates yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {contributors.map((c: any) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition border border-transparent hover:border-border/50 group"
                    >
                      <Image
                        src={c.image}
                        alt={c.name}
                        width={32}
                        height={32}
                        className="rounded-full border border-border group-hover:border-indigo-500/30 transition-colors"
                      />
                      <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                      
                      {session?.user?.email && (
                        <RemoveTeammateButton 
                          projectId={projectId} 
                          teammateId={c.id} 
                          teammateName={c.name} 
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* ACTIVITY */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl blur-xl"></div>
              <div className="relative">
                <DeveloperActivity projectId={projectId} />
              </div>
            </div>

          </aside>
        </div>
      </main>
    </>
  );
}

function State({ title }: { title: string }) {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2">Check URL and try again</p>
    </div>
  );
}

const getContributors = async (projectId: string) => {
  await connectDB();

  const project = await Project.findById(projectId).lean();
  if (!project?.members?.length) return [];

  const contributors = await Promise.all(
    project.members.map(async (member: any) => {
      const user = await User.findById(member.user)
        .select("name image githubId")
        .lean();

      if (!user) return null;

      return {
        id: user.githubId ?? user._id.toString(),
        name: user.name ?? "Unknown",
        image: user.image ?? "/avatar-placeholder.png",
      };
    })
  );

  return contributors.filter(Boolean);
};