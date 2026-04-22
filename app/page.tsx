'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowRight, Github, Shield, Brain, GitPullRequest,
  GitCommit, Users, Zap, Lock, ChevronRight, Terminal,
  BarChart3, Star, GitBranch, Eye, Code2,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


function GrainOverlay() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] w-full h-full" aria-hidden>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

function Grid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-30"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,163,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,163,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
      }}
    />
  );
}

function CursorOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${pos.current.x - 300}px, ${pos.current.y - 300}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full z-0"
      style={{
        background: "radial-gradient(circle, rgba(0,255,163,0.07) 0%, transparent 70%)",
      }}
    />
  );
}

const LINES = [
  { prompt: "→", text: "Analyzing PR #312 · Refactored auth pipeline…", color: "#00ffa3" },
  { prompt: "→", text: "Impact: 3 files changed · latency ↓ 41% · 0 conflicts", color: "#60a5fa" },
  { prompt: "→", text: "Security scan: no critical vulnerabilities found", color: "#a78bfa" },
  { prompt: "→", text: "Suggested reviewers: @maya, @tariq, @lena", color: "#f59e0b" },
];

function TerminalDemo() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (lineIdx >= LINES.length) { setDone(true); return; }
    const line = LINES[lineIdx].text;
    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 22);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0); }, 420);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, done]);

  return (
    <div
      className="font-mono text-sm leading-7 space-y-1"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {LINES.slice(0, lineIdx).map((l, i) => (
        <div key={i} className="flex gap-3 opacity-70">
          <span style={{ color: l.color }}>{l.prompt}</span>
          <span className="text-white/60">{l.text}</span>
        </div>
      ))}
      {lineIdx < LINES.length && (
        <div className="flex gap-3">
          <span style={{ color: LINES[lineIdx].color }}>{LINES[lineIdx].prompt}</span>
          <span style={{ color: LINES[lineIdx].color }}>
            {LINES[lineIdx].text.slice(0, charIdx)}
            <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px] animate-pulse" />
          </span>
        </div>
      )}
    </div>
  );
}

function CommitHeatmap() {
  const weeks = 26;
  const days = 7;
  const cells = Array.from({ length: weeks * days }, () => Math.random());
  const getColor = (v: number) => {
    if (v < 0.2) return "rgba(255,255,255,0.05)";
    if (v < 0.4) return "rgba(0,255,163,0.15)";
    if (v < 0.6) return "rgba(0,255,163,0.35)";
    if (v < 0.8) return "rgba(0,255,163,0.6)";
    return "rgba(0,255,163,0.9)";
  };
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {Array.from({ length: days }).map((_, d) => (
            <div
              key={d}
              className="w-[10px] h-[10px] rounded-[2px] transition-all duration-300 hover:scale-150 cursor-default"
              style={{ background: getColor(cells[w * days + d]) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent }: {
  icon: React.ReactNode; title: string; desc: string; accent: string;
}) {
  return (
    <div
      className="group relative p-7 rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-500 hover:border-white/20 cursor-default"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{ background: `radial-gradient(circle at 30% 30%, ${accent}10, transparent 70%)` }}
      />
      <div
        className="inline-flex p-2.5 rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
      <div
        className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
      />
    </div>
  );
}

function StatPill({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm">
      <div className="text-[#00ffa3]/70">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-xs text-white/40 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Step({ n, title, desc, last }: { n: string; title: string; desc: string; last?: boolean }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
          style={{
            background: "rgba(0,255,163,0.08)",
            borderColor: "rgba(0,255,163,0.3)",
            color: "#00ffa3",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {n}
        </div>
        {!last && <div className="w-px flex-1 mt-3" style={{ background: "rgba(0,255,163,0.12)" }} />}
      </div>
      <div className="pb-10">
        <div className="text-white font-semibold mb-1">{title}</div>
        <div className="text-sm text-white/45 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-5 px-6 transition-all duration-300"
      style={{ paddingTop: scrolled ? "12px" : "20px" }}
    >
      <nav
        className="w-full max-w-6xl flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,5,10,0.85)" : "rgba(5,5,10,0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: scrolled ? "0 0 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,255,163,0.15)", border: "1px solid rgba(0,255,163,0.3)" }}
          >
            <GitBranch className="w-3.5 h-3.5" style={{ color: "#00ffa3" }} />
          </div>
          <span
            className="font-semibold tracking-tight"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: "15px" }}
          >
            repo<span style={{ color: "#00ffa3" }}>intel</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {["Features", "How it works", "Pricing", "Docs"].map(l => (
            <a key={l} href="#" className="hover:text-white transition-colors duration-200">{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="text-sm text-white/60 hover:text-white transition-colors duration-200 hidden md:block"
            onClick={() => signIn("github")}
          >
            Sign in
          </button>
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(0,255,163,0.12)",
              border: "1px solid rgba(0,255,163,0.3)",
              color: "#00ffa3",
            }}
          >
            <Github className="w-3.5 h-3.5" />
            Connect GitHub
          </button>
        </div>
      </nav>
    </header>
  );
}

export default function Page() {

  const { data : session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    <main
      className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: "#05050a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        ::selection { background: rgba(0,255,163,0.25); color: white; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .anim-slide-up { animation: slide-up 0.7s ease forwards; }
        .anim-fade { animation: fade-in 1s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }
        .delay-4 { animation-delay: 0.55s; opacity: 0; }
        .delay-5 { animation-delay: 0.7s; opacity: 0; }

        .glow-btn {
          box-shadow: 0 0 0 0 rgba(0,255,163,0);
          transition: box-shadow 0.3s, transform 0.2s, background 0.2s;
        }
        .glow-btn:hover {
          box-shadow: 0 0 30px rgba(0,255,163,0.3), 0 0 60px rgba(0,255,163,0.1);
          transform: translateY(-1px) scale(1.02);
        }
      `}</style>

      <GrainOverlay />
      <Grid />
      <CursorOrb />

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            top: "-200px", right: "-200px",
            background: "radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 70%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            bottom: "10%", left: "-150px",
            background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)",
            animation: "glow-pulse 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400,
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)",
            animation: "glow-pulse 10s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
      </div>

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-44 pb-28">
        {/* Badge */}
        <div
          className="anim-slide-up delay-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs mb-8"
          style={{
            background: "rgba(0,255,163,0.07)",
            border: "1px solid rgba(0,255,163,0.2)",
            color: "#00ffa3",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
          AI-Powered Repository Intelligence · v2.0
        </div>

        {/* Headline */}
        <h1
          className="anim-slide-up delay-2 font-bold leading-[1.1] tracking-tight mb-6"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            maxWidth: 900,
          }}
        >
          Your codebase,
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00ffa3 0%, #60a5fa 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            finally understood.
          </span>
        </h1>

        <p
          className="anim-slide-up delay-3 text-white/45 mb-10 leading-relaxed"
          style={{ maxWidth: 560, fontSize: "1.1rem" }}
        >
          Connect your GitHub repos and get instant AI analysis of commits, pull requests,
          contributors, and architecture — in plain English.
        </p>

        {/* CTAs */}
        <div className="anim-slide-up delay-4 flex flex-col sm:flex-row items-center gap-4 mb-20">
          <button
            onClick={() => signIn("github")}
            className="glow-btn flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-black"
            style={{ background: "#00ffa3" }}
          >
            <Github className="w-4 h-4" />
            Connect GitHub — it's free
          </button>
          <button
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm text-white/60 hover:text-white transition-colors duration-200 border border-white/[0.07] hover:border-white/20"
          >
            <Eye className="w-4 h-4" />
            View live demo
          </button>
        </div>

        {/* Terminal card */}
        <div
          className="anim-slide-up delay-5 w-full rounded-2xl overflow-hidden"
          style={{
            maxWidth: 780,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 0 80px rgba(0,255,163,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div
              className="text-xs text-white/25"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              repointel — analysis
            </div>
            <div className="flex items-center gap-1.5 text-white/25">
              <Terminal className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-7 space-y-6">
            {/* repo info row */}
            <div className="flex items-center gap-3 pb-5 border-b border-white/[0.05]">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.2)" }}
              >
                <Code2 className="w-4 h-4" style={{ color: "#00ffa3" }} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white">vercel / next.js</div>
                <div className="text-xs text-white/35 mt-0.5">TypeScript · 47,291 commits · 8,204 PRs</div>
              </div>
              <div
                className="ml-auto text-xs px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(0,255,163,0.1)", color: "#00ffa3", fontFamily: "'Space Mono', monospace" }}
              >
                synced 2s ago
              </div>
            </div>

            {/* Terminal output */}
            <TerminalDemo />

            {/* Heatmap */}
            <div className="pt-5 border-t border-white/[0.05]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>
                  commit activity · last 26 weeks
                </span>
                <span className="text-xs text-white/20">less ── more</span>
              </div>
              <CommitHeatmap />
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-14 flex flex-col items-center gap-4">
          <div className="flex -space-x-2.5">
            {["#00ffa3", "#60a5fa", "#a78bfa", "#f59e0b", "#f87171"].map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{ borderColor: "#05050a", background: c + "33", color: c }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30">
            Trusted by <span className="text-white/60">12,000+</span> developers at 800+ companies
          </p>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatPill value="10K+" label="Repos analyzed" icon={<Github className="w-5 h-5" />} />
          <StatPill value="500K+" label="PRs summarized" icon={<GitPullRequest className="w-5 h-5" />} />
          <StatPill value="98.4%" label="Accuracy rate" icon={<BarChart3 className="w-5 h-5" />} />
          <StatPill value="< 1.8s" label="Avg. response" icon={<Zap className="w-5 h-5" />} />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="mb-14">
            <div
              className="text-xs text-white/30 mb-3 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for serious
              <br />
              <span className="text-white/40">engineering teams.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Brain className="w-5 h-5" />}
              title="Deep Code Understanding"
              desc="Semantic analysis goes beyond syntax — understands intent, patterns, and architectural decisions across your entire codebase."
              accent="#00ffa3"
            />
            <FeatureCard
              icon={<GitPullRequest className="w-5 h-5" />}
              title="PR Intelligence"
              desc="Auto-summarize PRs, predict merge conflicts, detect breaking changes, and get smart reviewer suggestions instantly."
              accent="#60a5fa"
            />
            <FeatureCard
              icon={<GitCommit className="w-5 h-5" />}
              title="Commit Archaeology"
              desc="Trace why any line of code exists. Understand contribution patterns and identify hotspots across your history."
              accent="#a78bfa"
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Team Analytics"
              desc="Visualize velocity, identify bottlenecks, and surface collaboration patterns to make your team more effective."
              accent="#f59e0b"
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Security Signals"
              desc="Catch risky patterns, secret exposure, and dependency vulnerabilities before they reach production."
              accent="#f87171"
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="Enterprise Controls"
              desc="SOC 2 Type II, SSO, audit logs, granular RBAC, and private deployment options for regulated industries."
              accent="#34d399"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="px-6 py-24 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-20">
          <div className="md:w-2/5">
            <div
              className="text-xs text-white/30 mb-3 tracking-widest uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Up and running
              <br />
              <span className="text-white/40">in 60 seconds.</span>
            </h2>
            <p className="text-sm text-white/40 leading-relaxed">
              No configuration files. No deployment overhead. Connect your GitHub account
              and start getting insights immediately.
            </p>
          </div>
          <div className="md:w-3/5">
            <Step n="01" title="Connect your GitHub account" desc="OAuth in one click. We request only the minimum scopes needed to read your repositories — nothing more." />
            <Step n="02" title="Select repositories to analyze" desc="Pick any public or private repo. Our engine indexes commits, PRs, issues, and your full file tree." />
            <Step n="03" title="Ask anything in plain English" desc={`"What changed in auth last month?" · "Who owns the payment service?" · Any question, instant answer.`} />
            <Step n="04" title="Get continuous insights" desc="Enable auto-sync and RepoIntel updates in the background — always current, always ready." last />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-6 py-28 flex justify-center">
        <div
          className="w-full max-w-4xl rounded-3xl p-14 text-center relative overflow-hidden"
          style={{
            background: "rgba(0,255,163,0.04)",
            border: "1px solid rgba(0,255,163,0.15)",
            boxShadow: "0 0 100px rgba(0,255,163,0.06)",
          }}
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(0,255,163,0.07) 0%, transparent 70%)",
            }}
          />
          <div
            className="text-xs text-[#00ffa3]/60 mb-5 tracking-widest uppercase"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Get started today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Stop guessing.
            <br />Start understanding.
          </h2>
          <p className="text-white/40 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            Join 12,000+ developers who use RepoIntel to understand their codebases
            faster, ship safer, and onboard in days not weeks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => signIn("github")}
              className="glow-btn flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-black"
              style={{ background: "#00ffa3" }}
            >
              <Github className="w-4 h-4" />
              Start for free — no card needed
            </button>
            <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-200">
              Read the docs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/25">
            {["Free forever tier", "No credit card", "SOC 2 compliant", "GDPR ready"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span style={{ color: "#00ffa3" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.25)" }}
            >
              <GitBranch className="w-3 h-3" style={{ color: "#00ffa3" }} />
            </div>
            <span
              className="text-sm font-semibold text-white/60"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              repo<span style={{ color: "#00ffa3" }}>intel</span>
            </span>
          </div>
          <div className="text-xs text-white/20">© 2026 RepoIntel · All rights reserved</div>
          <div className="flex gap-7 text-xs text-white/35">
            {["Privacy", "Terms", "Security", "Docs", "Status"].map(l => (
              <a key={l} href="#" className="hover:text-white/70 transition-colors duration-200">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}