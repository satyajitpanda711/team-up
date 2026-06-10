"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderGit2, Github, Loader2, ArrowRight, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CreateProjectForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          githubRepoUrl: repoUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success("Project created successfully");
      router.push(`/dashboard/projects/${data.projectId}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md w-full relative overflow-hidden shadow-xl shadow-primary/5">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
      
      <CardHeader className="space-y-3 pb-6 pt-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
          <FolderPlus className="w-6 h-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Workspace</CardTitle>
          <CardDescription className="text-sm mt-1.5 leading-relaxed">
            Connect a GitHub repository to unlock AI-powered codebase intelligence and team collaboration.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Name
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <FolderGit2 className="h-4 w-4" />
              </div>
              <Input
                placeholder="e.g. nextjs-dashboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              GitHub Repository URL
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </div>
              <Input
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Must be a valid GitHub URL. Private repositories are supported.
            </p>
          </div>

          {error && (
            <div className="p-3 text-[13px] text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            disabled={loading} 
            className="w-full gap-2 transition-all duration-200"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up workspace...
              </>
            ) : (
              <>
                Initialize Project
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
