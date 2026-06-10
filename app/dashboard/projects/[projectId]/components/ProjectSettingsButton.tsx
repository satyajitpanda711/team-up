"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ProjectSettingsButton({ projectId, projectName }: { projectId: string, projectName: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmDelete = window.prompt(`Type "${projectName}" to confirm deletion of this project. This action cannot be undone.`);
        
        if (confirmDelete !== projectName) {
            if (confirmDelete !== null) {
                toast.error("Project name did not match.");
            }
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete project");
            }

            toast.success("Project deleted successfully");
            router.push("/dashboard/projects/my_projects");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Project Settings">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Project Settings</DialogTitle>
                    <DialogDescription>
                        Manage settings for {projectName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <div className="flex items-center gap-2 text-red-500 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <h4 className="font-semibold text-sm">Danger Zone</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Deleting this project will remove all associated files, commits, pull requests, issues, and intelligence reports.
                        </p>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete Project
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
