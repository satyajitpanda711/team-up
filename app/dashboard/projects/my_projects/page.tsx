import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Project from "@/models/Project";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Projects</h1>

        <Button asChild>
          <Link href="/dashboard/projects/new">New Project</Link>
        </Button>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          You haven’t created any projects yet.
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <Link
                key={String(project._id)}
                href={`/dashboard/projects/${project._id}`}
                className="transition hover:scale-[1.01]"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="truncate">
                      {project.name}
                    </CardTitle>

                    {project.repository && (
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {project.repository.provider ?? "Repo"}
                        </Badge>
                        <span className="truncate">
                          {project.repository.fullName}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </main>
  );
}
