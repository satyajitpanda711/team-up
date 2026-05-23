"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface IngestRepoButtonProps {
  projectId: string;
  repoUrl?: string;
}

export default function IngestRepoButton({ projectId, repoUrl }: IngestRepoButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleIngest = async () => {
    if (!repoUrl) {
      toast.error("No GitHub repository URL associated with this project.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Ingesting GitHub repository files, commits, PRs, and issues...");

    try {
      const res = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, repoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Ingestion failed");
      }

      toast.success(
        `Sync Complete! Processed ${data.treeNodes} files, ${data.commits?.new || 0} new commits, and ${data.pullRequests?.new || 0} new PRs.`,
        { id: toastId, duration: 6000 }
      );
      
      // Dynamic page refresh to load newly ingested data into active tabs
      router.refresh();
    } catch (error: any) {
      console.error("Ingestion failed:", error);
      toast.error(error.message || "Failed to ingest repository. Please check access token.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleIngest}
      disabled={loading}
      className="hover:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
      title={!repoUrl ? "No GitHub repository configured for this project" : "Sync GitHub repository"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
      ) : (
        <RefreshCw className="h-4 w-4 text-emerald-400" />
      )}
      {loading ? "Ingesting..." : "Ingest GitHub Repo"}
    </Button>
  );
}
