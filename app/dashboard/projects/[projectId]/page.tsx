import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import Image from "next/image";

import InviteTeammateButton from "./components/InviteTeammateButton";
import ProjectTabs from "./components/ProjectTabs";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');
 
        .ri-root {
          --bg:              #05050a;
          --surface:         rgba(255,255,255,0.025);
          --surface-hover:   rgba(255,255,255,0.045);
          --border:          rgba(255,255,255,0.07);
          --border-hover:    rgba(255,255,255,0.16);
          --text:            #ffffff;
          --muted:           rgba(255,255,255,0.45);
          --hint:            rgba(255,255,255,0.22);
          --green:           #00ffa3;
          --blue:            #60a5fa;
          --sans:            'DM Sans', sans-serif;
          --mono:            'Space Mono', monospace;
          --code:            'JetBrains Mono', monospace;
          --r-sm:   8px;
          --r-md:  12px;
          --r-lg:  16px;
          --r-xl:  20px;
          --r-2xl: 24px;
 
          font-family: var(--sans);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
 
        /* noise grain */
        .ri-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
 
        /* grid lines */
        .ri-root::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: -1;
          background-image:
            linear-gradient(rgba(0,255,163,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,163,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
        }
 
        /* ambient blob */
        .ri-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
        }
 
        /* ── Header ── */
        .ri-header {
          position: sticky;
          top: 0;
          z-index: 40;
          border-bottom: 1px solid var(--border);
          background: rgba(5,5,10,0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
 
        .ri-header-inner {
          margin: 0 auto;
          max-width: 1280px;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
 
        .ri-logo-mark {
          width: 28px;
          height: 28px;
          border-radius: var(--r-sm);
          background: rgba(0,255,163,0.1);
          border: 1px solid rgba(0,255,163,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--green);
          font-size: 13px;
        }
 
        .ri-wordmark {
          font-family: var(--mono);
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
        }
        .ri-wordmark span { color: var(--green); }
 
        .ri-divider {
          width: 1px;
          height: 18px;
          background: var(--border);
          flex-shrink: 0;
        }
 
        .ri-project-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
 
        .ri-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 9999px;
          font-family: var(--mono);
          font-size: 10px;
          background: rgba(0,255,163,0.08);
          border: 1px solid rgba(0,255,163,0.22);
          color: var(--green);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ri-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--green);
          animation: ri-pulse 2s ease-in-out infinite;
        }
 
        .ri-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          border-radius: var(--r-md);
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 600;
          background: var(--green);
          color: #000;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .ri-btn-primary:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 0 22px rgba(0,255,163,0.32);
        }
 
        .ri-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: var(--r-md);
          font-size: 12px;
          font-weight: 500;
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .ri-btn-ghost:hover {
          border-color: var(--border-hover);
          color: var(--text);
        }
 
        /* ── Body layout ── */
        .ri-body {
          position: relative;
          z-index: 1;
          margin: 0 auto;
          max-width: 1280px;
          padding: 28px 24px 48px;
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 20px;
        }
 
        @media (max-width: 900px) {
          .ri-body { grid-template-columns: 1fr; }
        }
 
        /* ── Tab card (main area) ── */
        .ri-tab-card {
          border-radius: var(--r-2xl);
          border: 1px solid var(--border);
          background: var(--surface);
          overflow: hidden;
          height: calc(100vh - 116px);
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s;
          box-shadow: 0 0 60px rgba(0,255,163,0.03);
        }
        .ri-tab-card:hover { border-color: var(--border-hover); }
 
        /* ── Sidebar cards ── */
        .ri-card {
          border-radius: var(--r-xl);
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 18px 20px;
          transition: border-color 0.3s, background 0.3s;
        }
        .ri-card:hover {
          border-color: var(--border-hover);
          background: var(--surface-hover);
        }
 
        .ri-card-label {
          font-family: var(--mono);
          font-size: 9.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,255,163,0.55);
          margin-bottom: 14px;
        }
 
        /* ── Project metadata card ── */
        .ri-meta-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 12px;
        }
        .ri-meta-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ri-meta-key { color: var(--hint); flex-shrink: 0; }
        .ri-meta-val {
          color: var(--muted);
          font-family: var(--code);
          font-size: 10.5px;
          text-align: right;
          word-break: break-all;
        }
 
        /* ── Copy button ── */
        .ri-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: none;
          color: var(--hint);
          font-family: var(--code);
          font-size: 10px;
          cursor: pointer;
          margin-top: 8px;
          transition: border-color 0.2s, color 0.2s;
        }
        .ri-copy-btn:hover {
          border-color: rgba(0,255,163,0.3);
          color: var(--green);
        }
 
        /* ── Contributor ── */
        .ri-contributor {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: var(--r-md);
          transition: background 0.2s;
          cursor: default;
        }
        .ri-contributor:hover { background: rgba(255,255,255,0.04); }
 
        .ri-avatar-ring {
          border-radius: 50%;
          border: 1px solid rgba(0,255,163,0.2);
          padding: 1px;
          flex-shrink: 0;
        }
 
        .ri-contributor-name {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text);
        }
 
        .ri-contributor-role {
          font-size: 10px;
          color: var(--hint);
          font-family: var(--mono);
        }
 
        .ri-empty {
          text-align: center;
          padding: 24px 0 10px;
          color: var(--hint);
          font-size: 12px;
        }
        .ri-empty-icon {
          font-size: 22px;
          display: block;
          margin-bottom: 8px;
          opacity: 0.5;
        }
 
        /* ── GitHub link card ── */
        .ri-repo-card {
          border-radius: var(--r-xl);
          border: 1px solid rgba(0,255,163,0.14);
          background: rgba(0,255,163,0.04);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .ri-repo-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(0,255,163,0.07), transparent 70%);
          pointer-events: none;
        }
        .ri-repo-card:hover {
          border-color: rgba(0,255,163,0.3);
          background: rgba(0,255,163,0.07);
          transform: translateY(-1px);
        }
        .ri-repo-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--r-sm);
          background: rgba(0,255,163,0.1);
          border: 1px solid rgba(0,255,163,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--green);
          font-size: 15px;
          flex-shrink: 0;
          z-index: 1;
        }
        .ri-repo-text { z-index: 1; }
        .ri-repo-label { font-size: 11px; font-weight: 600; color: var(--text); }
        .ri-repo-url { font-family: var(--code); font-size: 9.5px; color: var(--muted); margin-top: 1px; word-break: break-all; }
        .ri-repo-arrow { margin-left: auto; color: var(--green); opacity: 0.5; z-index: 1; font-size: 14px; }
 
        /* ── Invite button wrapper (injects into sidebar header) ── */
        .ri-invite-wrap .ri-card-label {
          margin-bottom: 0;
        }
        .ri-team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
 
        /* ── Sidebar section: actions ── */
        .ri-actions { display: flex; flex-direction: column; gap: 8px; }
 
        /* ── Animations ── */
        @keyframes ri-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes ri-fade-up {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ri-fade-up-1 { animation: ri-fade-up 0.5s ease 0.05s both; }
        .ri-fade-up-2 { animation: ri-fade-up 0.5s ease 0.15s both; }
        .ri-fade-up-3 { animation: ri-fade-up 0.5s ease 0.25s both; }
        .ri-fade-up-4 { animation: ri-fade-up 0.5s ease 0.35s both; }
      `}</style>
      <main className="min-h-screen">

        {/* HEADER */}
        <div className="border-b backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-xs">Project workspace</p>
            </div>

            <div className="flex gap-3">
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