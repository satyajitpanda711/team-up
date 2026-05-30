import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import Image from "next/image";

import InviteTeammateButton from "./components/InviteTeammateButton";
import ProjectTabs from "./components/ProjectTabs";
import IngestRepoButton from "./components/IngestRepoButton";
import DeveloperActivity from "./components/DeveloperActivity";

import User from "@/models/User";
import Project from "@/models/Project";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ThemeToggleButton from "@/components/theme-button";

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
          <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-xs">Project workspace</p>
            </div>


            <div className="flex gap-3">
              <IngestRepoButton projectId={projectId} repoUrl={project.githubRepoUrl} />
              {project.githubRepoUrl && (
                <Button size="sm" asChild>
                  <a href={project.githubRepoUrl} target="_blank">
                    GitHub
                  </a>
                </Button>
              )}
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
            <Card className="p-5 border">
              <h2 className="text-xs uppercase tracking-wider">
                Project Metadata
              </h2>

              <code className="block mt-3 text-xs px-2 py-1 rounded break-all">
                {projectId}
              </code>
            </Card>

            {/* TEAM */}
            <Card className="p-5 border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs uppercase tracking-wider">
                  Collaborators
                </h2>
                <InviteTeammateButton />
              </div>

              {contributors.length === 0 ? (
                <p className="text-sm">No teammates yet</p>
              ) : (
                <ul className="space-y-2">
                  {contributors.map((c: any) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 p-2 rounded-md transition"
                    >
                      <Image
                        src={c.image}
                        alt={c.name}
                        width={28}
                        height={28}
                        className="rounded-full border"
                      />
                      <span className="text-sm">{c.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* ACTIVITY */}
            <DeveloperActivity projectId={projectId} />

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