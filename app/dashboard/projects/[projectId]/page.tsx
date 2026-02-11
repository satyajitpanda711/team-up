import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import Image from "next/image";
import InviteTeammateButton from "./components/InviteTeammateButton";

import User from "@/models/User";
import Project from "@/models/Project";

import ProjectTabs from "./components/ProjectTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <main className="min-h-[calc(100vh-5.5rem)] bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Project workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" disabled>
              Ask AI
            </Button>

            {project.githubRepoUrl && (
              <Button size="sm" asChild>
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* ======================
            MAIN WORKSPACE
        ====================== */}
        <section className="space-y-6">

          {/* AI PANEL */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-fuchsia-500/10" />
            <div className="relative p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">Ask your repository</p>
                <p className="text-sm text-muted-foreground">
                  Understand code, commits, and architecture instantly
                </p>
              </div>
              <Button size="sm" disabled>
                Coming soon
              </Button>
            </div>
          </Card>

          {/* TABS */}
          <Card className="p-0 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
            <ProjectTabs projectId={projectId} />
          </Card>

        </section>

        {/* ======================
            CONTEXT SIDEBAR
        ====================== */}
        <aside className="space-y-6">

          {/* PROJECT META */}
          <Card className="p-5 space-y-2">
            <h2 className="text-sm font-medium">Project Metadata</h2>
            <div className="text-xs text-muted-foreground">
              <p>ID</p>
              <code className="block mt-1 bg-muted px-2 py-1 rounded break-all">
                {projectId}
              </code>
            </div>
          </Card>

          {/* CONTRIBUTORS */}
          {/* TEAMMATES */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Collaborators</h2>
              <InviteTeammateButton />
            </div>

            {contributors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teammates yet
              </p>
            ) : (
              <ul className="space-y-3">
                {contributors.map((c: any) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <Image
                      src={c.image}
                      alt={c.name}
                      width={28}
                      height={28}
                      className="rounded-full border"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{c.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </aside>
      </div>
    </main>
  );
}

function State({ title }: { title: string }) {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        Please check the URL and try again.
      </p>
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
        name: user.name ?? "Unknown user",
        image: user.image ?? "/avatar-placeholder.png",
      };
    })
  );

  return contributors.filter(Boolean);
};
