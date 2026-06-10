"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

export default function RemoveTeammateButton({ projectId, teammateId, teammateName }: { projectId: string, teammateId: string, teammateName: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${teammateName} from this project?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/remove_teammate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ teammateId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to remove teammate");
            }

            toast.success(`${teammateName} removed from project`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove teammate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRemove}
            disabled={loading}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Remove teammate"
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
        </button>
    );
}
