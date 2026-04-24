"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function InviteTeammateButton() {
    const params = useParams();
  const projectId = params.projectId as string;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email) return;

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/add_teammate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teammateEmail: email, role }),
    });

    if (!res.ok) {
      const {error} = await res.json();
      toast.error(error || "Failed to add teammate");
      setLoading(false);
      return;
    }

    toast.success("Teammate added successfully");
    setEmail("");
    setRole("member");
    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="p-3 bg-muted/50 text-xs text-muted-foreground">
            Invited teammates will receive an email with access
            to this project.
          </Card>

          <Button
            className="w-full"
            disabled={loading || !email}
            onClick={handleInvite}
          >
            {loading ? "Sending invite…" : "Send invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
