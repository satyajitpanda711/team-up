'use client';

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Github,
  Shield,
  Brain,
  GitPullRequest,
  GitCommit,
  Users,
  Zap,
  Lock,
} from "lucide-react";

function useCursorGlow() {
  useEffect(() => {
    const glow = document.getElementById("cursor-glow");
    const move = (e: MouseEvent) => {
      if (!glow) return;
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function TypingEffect() {
  const text =
    "Summarizing PR #142 → Refactored auth middleware, reduced API latency by 32%, optimized database queries.";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-emerald-400">{displayed}</span>;
}

function ActivityGraph() {
  return (
    <div className="flex items-end gap-[3px] h-24">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="w-2 bg-cyan-500/70 animate-pulse rounded-t"
          style={{
            height: `${Math.random() * 80 + 10}px`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

function Particles() {
  return (
    <>
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/20 rounded-full animate-pulse"
          style={{
            width: Math.random() > 0.5 ? "2px" : "3px",
            height: Math.random() > 0.5 ? "2px" : "3px",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group p-8 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
      <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatsCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
      <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

function App() {
  useCursorGlow();

  return (
    <main className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-cyan-600/40 via-blue-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/40 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div
        id="cursor-glow"
        className="pointer-events-none fixed w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-10"
      />

      <Particles />

      <header className="flex justify-center pt-8 px-6">
        <div className="w-full max-w-6xl px-6 py-3 flex items-center justify-between rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Github className="w-6 h-6 text-cyan-400" />
            RepoIntel
          </div>
          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105">
            Sign in
          </button>
        </div>
      </header>

      <section className="flex flex-col items-center text-center px-6 pt-28 pb-32">
        <div className="mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 flex items-center gap-2 hover:bg-white/10 transition-all duration-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI-powered GitHub Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-5xl leading-tight">
          Your repository.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
            Fully understood by AI.
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
          Understand commits, PRs, contributors, and architecture instantly with advanced AI analysis.
        </p>

        <button className="group flex items-center gap-2 rounded-full mt-10 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105">
          Connect GitHub
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        <div className="mt-20 w-full max-w-5xl bg-black/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 text-left space-y-6 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="text-sm text-white/40 font-mono">terminal</div>
          </div>
          <div className="text-sm text-cyan-400 font-mono">$ ask repo</div>
          <div className="font-mono text-sm leading-relaxed">
            <TypingEffect />
          </div>
          <div className="pt-6 border-t border-white/10">
            <div className="text-sm text-white/40 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Activity (Last 30 days)
            </div>
            <ActivityGraph />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
          <StatsCard value="10K+" label="Repositories Analyzed" />
          <StatsCard value="500K+" label="PRs Summarized" />
          <StatsCard value="98%" label="Accuracy Rate" />
          <StatsCard value="< 2s" label="Average Response" />
        </div>
      </section>

      <section className="px-6 py-24 flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-white/60 text-lg">
              Everything you need to understand your codebase at a glance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={<Brain className="w-8 h-8" />}
              title="AI Code Understanding"
              desc="Deep semantic analysis of your codebase. Get instant summaries, architecture insights, and intelligent code explanations."
            />
            <Feature
              icon={<GitPullRequest className="w-8 h-8" />}
              title="PR Intelligence"
              desc="Automatically summarize pull requests, detect impact on existing features, and predict merge conflicts before they happen."
            />
            <Feature
              icon={<GitCommit className="w-8 h-8" />}
              title="Commit Insights"
              desc="Track contribution patterns, identify code hotspots, and understand the evolution of your project over time."
            />
            <Feature
              icon={<Users className="w-8 h-8" />}
              title="Contributor Analytics"
              desc="Visualize team velocity, identify key contributors, and understand collaboration patterns across your organization."
            />
            <Feature
              icon={<Shield className="w-8 h-8" />}
              title="Security Signals"
              desc="Detect risky changes, potential vulnerabilities, and security anti-patterns before they reach production."
            />
            <Feature
              icon={<Lock className="w-8 h-8" />}
              title="Enterprise Ready"
              desc="SOC 2 compliant, SSO integration, audit logs, and granular access controls for your entire organization."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-white/60 text-lg">
              Get started in minutes, not hours
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Connect GitHub", desc: "Link your repositories with one click" },
              { step: "02", title: "AI Indexes", desc: "We analyze and understand your code" },
              { step: "03", title: "Ask Questions", desc: "Natural language queries about your repo" },
              { step: "04", title: "Get Insights", desc: "Instant, actionable intelligence" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center border-t border-white/10 bg-gradient-to-b from-transparent to-cyan-950/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start understanding your codebase today
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join thousands of developers who are building better software with AI-powered insights
          </p>
          <button className="group flex items-center gap-2 mx-auto rounded-full px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </section>

      <footer className="px-6 py-12 text-center text-white/40 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white/60">
            <Github className="w-5 h-5 text-cyan-400" />
            RepoIntel
          </div>
          <div className="text-sm">
            © 2026 RepoIntel · Built with React · Powered by AI
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
