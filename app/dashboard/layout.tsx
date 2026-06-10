'use client'
import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard, FolderKanban, Settings,
  LogOut, Bell, Search, ChevronDown,
  BarChart3, Users, Sparkles,
  User
} from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ThemeToggleButton from "@/components/theme-button";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
  { href: "/dashboard/projects/my_projects", icon: FolderKanban, label: "Projects", badge: "4" },
  { href: "/dashboard/profile", icon: Users, label: "Profile", badge: null },
];

/** Find which NAV item best matches the current path */
function resolveNav(path: string) {
  // Check for a project detail page: /dashboard/projects/<id>
  const projectMatch = path.match(/^\/dashboard\/projects\/(?!my_projects)([^/]+)/);
  if (projectMatch) {
    return { active: "/dashboard/projects/my_projects", tab: projectMatch[1] };
  }

  // Match longest NAV href first (most specific wins)
  const sorted = [...NAV].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find((n) => path.startsWith(n.href));

  return {
    active: match?.href ?? "/dashboard",
    tab: match?.label ?? "Dashboard",
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  const { active, tab } = useMemo(() => resolveNav(path), [path]);
  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground font-sans">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">

        {/* ── Sidebar panel ── */}
        <ResizablePanel
          defaultSize={200}
          minSize={200}
          maxSize={200}
          className="flex flex-col bg-card border-r"
        >
          {/* Logo */}
          <div className="h-14 flex items-center gap-2.5 px-4 border-b shrink-0">
            <span className="font-semibold text-sm tracking-tight text-foreground">RepoIntel</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-2 mt-1">
              Workspace
            </p>
            {NAV.map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium
                  transition-all duration-150
                  ${active === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                
              </Link>
            ))}
          </nav>

          {/* User footer */}
          
        </ResizablePanel>

        {/* ── Drag handle ── */}
        <ResizableHandle
          withHandle
          className="w-px bg-border hover:bg-primary/60 transition-colors data-[resize-handle-active]:bg-primary"
        />

        {/* ── Main area ── */}
        <ResizablePanel defaultSize={12} minSize={120}>
          <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Topbar */}
            <header className="h-14 flex items-center gap-3 px-5 border-b bg-background/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <span>RepoIntel</span>
                <span>›</span>
                <span className="text-foreground/80 font-medium">{tab}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground px-2.5 py-1 bg-muted border border-border rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />
                  Workspace active
                </div>
                <ThemeToggleButton />
              </div>
            </header>

            {/* Content with inner resizable panels */}
            <div className="flex-1 overflow-hidden p-4 bg-card/30">
              <ResizablePanelGroup orientation="horizontal" className="h-full rounded-xl border-2">
                <ResizablePanel defaultSize={100} minSize={100}>
                  <div className="h-full overflow-y-auto pr-4 bg-card">
                    {children}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}