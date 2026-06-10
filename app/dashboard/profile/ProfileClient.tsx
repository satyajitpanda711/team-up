"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Github, User as UserIcon, Mail, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ActivityCalendar } from "react-activity-calendar";

type SafeUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  hasGithub: boolean;
};

export default function ProfileClient({ user: initialUser }: { user: SafeUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/user/commits");
        if (!res.ok) throw new Error("Failed to fetch activity");
        const json = await res.json();
        setActivityData(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const syncWithGithub = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/user/sync-github", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to sync");
      
      // Update local state immediately to reflect changes
      setUser((prev) => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
      }));

      toast.success("Profile successfully synced with GitHub!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>Your personal information and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <UserIcon className="w-4 h-4" /> Name
              </label>
              <p className="font-medium text-lg">{user.name}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Your commit history across all TeamUp repositories.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center overflow-x-auto py-4">
          {loadingActivity ? (
            <div className="flex h-32 items-center justify-center">
              <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
          ) : activityData.length > 0 ? (
            <div className="min-w-max">
              <ActivityCalendar 
                data={activityData} 
                theme={{
                  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                labels={{
                  totalCount: '{{count}} commits in the last year',
                }}
                colorScheme="dark"
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8">
              No commit activity found.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>Manage your connected accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-muted p-2 rounded-full">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">
                  {user.hasGithub 
                    ? "Your account is linked to GitHub." 
                    : "No GitHub account linked."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.hasGithub && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={syncWithGithub} 
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Profile
                </Button>
              )}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.hasGithub ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                {user.hasGithub ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Take actions that affect your session or account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">End your current session on this device.</p>
            </div>
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
