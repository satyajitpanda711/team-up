'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  ArrowRight, Github, Shield, Brain, GitPullRequest,
  GitCommit, Users, Zap, Lock, ChevronRight, Terminal,
  BarChart3, Star, GitBranch, Eye, Code2, MessageSquare,
  Layers, Sparkles, ArrowUpRight, Search, FileCode,
  Activity, Globe, Cpu, ChevronDown,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useSmoothScroll() {
  useEffect(() => {
    let lenis: any;
    async function init() {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
        });
        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch {
        // lenis not installed — graceful fallback
        document.documentElement.style.scrollBehavior = 'smooth';
      }
    }
    init();
    return () => { if (lenis) lenis.destroy(); };
  }, []);
}

function useMousePosition() {
  const pos = useRef({ x: 0, y: 0 });
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setTick(t => t + 1);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return pos.current;
}

/* ═══════════════════════════════════════════════════════════════
   VISUAL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function GrainOverlay() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] w-full h-full" aria-hidden>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

function MagneticCursor() {
  const orbRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.06;
      pos.current.y += (target.current.y - pos.current.y) * 0.06;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${pos.current.x - 300}px, ${pos.current.y - 300}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 4}px, ${target.current.y - 4}px)`;
      }
      requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    requestAnimationFrame(tick);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div
        ref={orbRef}
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full z-0 hidden md:block"
        style={{
          background: "radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 rounded-full z-[60] hidden md:block mix-blend-difference"
        style={{ background: "#fff" }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED TEXT
   ═══════════════════════════════════════════════════════════════ */

function SplitText({ children, className = "", delay = 0 }: {
  children: string; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView(0.3);
  const words = children.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span
            className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: inView ? "translateY(0)" : "translateY(110%)",
              transitionDelay: `${delay + i * 60}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

function RevealBlock({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(50px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ScaleReveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView(0.15);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1) translateY(0)" : "scale(0.95) translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL DEMO
   ═══════════════════════════════════════════════════════════════ */

const LINES = [
  { prompt: "$", text: "repointel connect vercel/next.js", color: "#00ffa3" },
  { prompt: "→", text: "Authenticating with GitHub OAuth...", color: "#60a5fa" },
  { prompt: "→", text: "Ingesting 47,291 commits, 8,204 PRs, 3,912 issues...", color: "#a78bfa" },
  { prompt: "→", text: "Analyzing architecture via Groq Llama3...", color: "#f59e0b" },
  { prompt: "✓", text: "Intelligence Report ready. AskRepo online.", color: "#00ffa3" },
];

function TerminalDemo() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const { ref, inView } = useInView(0.5);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  useEffect(() => {
    if (!started || done) return;
    if (lineIdx >= LINES.length) { setDone(true); return; }
    const line = LINES[lineIdx].text;
    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 18);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0); }, 350);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, done, started]);

  return (
    <div
      ref={ref}
      className="font-mono text-sm leading-7 space-y-1"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {LINES.slice(0, lineIdx).map((l, i) => (
        <div key={i} className="flex gap-3 opacity-70">
          <span style={{ color: l.color }}>{l.prompt}</span>
          <span className="text-white/60">{l.text}</span>
        </div>
      ))}
      {lineIdx < LINES.length && started && (
        <div className="flex gap-3">
          <span style={{ color: LINES[lineIdx].color }}>{LINES[lineIdx].prompt}</span>
          <span style={{ color: LINES[lineIdx].color }}>
            {LINES[lineIdx].text.slice(0, charIdx)}
            <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px] animate-pulse" />
          </span>
        </div>
      )}
      {done && (
        <div className="flex gap-3 mt-2 opacity-50">
          <span style={{ color: "#00ffa3" }}>$</span>
          <span className="inline-block w-[2px] h-[1em] bg-[#00ffa3] align-middle animate-pulse" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMIT HEATMAP
   ═══════════════════════════════════════════════════════════════ */

function CommitHeatmap() {
  const weeks = 26;
  const days = 7;
  const cells = useMemo(() => Array.from({ length: weeks * days }, () => Math.random()), []);

  const getColor = (v: number) => {
    if (v < 0.2) return "rgba(255,255,255,0.04)";
    if (v < 0.4) return "rgba(0,255,163,0.15)";
    if (v < 0.6) return "rgba(0,255,163,0.3)";
    if (v < 0.8) return "rgba(0,255,163,0.55)";
    return "rgba(0,255,163,0.85)";
  };

  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {Array.from({ length: days }).map((_, d) => (
            <div
              key={d}
              className="w-[10px] h-[10px] rounded-[2px] transition-all duration-300 hover:scale-[2] cursor-default"
              style={{ background: getColor(cells[w * days + d]) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURE CARD (Bento-style)
   ═══════════════════════════════════════════════════════════════ */

function FeatureCard({ icon, title, desc, accent, size = "normal", visual }: {
  icon: React.ReactNode; title: string; desc: string; accent: string;
  size?: "normal" | "wide" | "tall"; visual?: React.ReactNode;
}) {
  const sizeClasses = {
    normal: "",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
  };

  return (
    <div
      className={`group relative p-8 rounded-3xl border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-white/[0.15] cursor-default ${sizeClasses[size]}`}
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      {/* hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
        style={{ background: `radial-gradient(ellipse at 30% 20%, ${accent}0d, transparent 70%)` }}
      />

      {/* top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `linear-gradient(to right, transparent, ${accent}40, transparent)` }}
      />

      <div
        className="inline-flex p-3 rounded-2xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-3deg]"
        style={{ background: `${accent}12`, color: accent }}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2.5 tracking-tight">{title}</h3>
      <p className="text-[15px] text-white/40 leading-relaxed">{desc}</p>

      {visual && (
        <div className="mt-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          {visual}
        </div>
      )}

      {/* bottom glow line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700 ease-out"
        style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USE CASE CARD
   ═══════════════════════════════════════════════════════════════ */

function UseCaseCard({ icon, title, desc, number, accent }: {
  icon: React.ReactNode; title: string; desc: string; number: string; accent: string;
}) {
  return (
    <div className="group relative flex gap-8 items-start py-12 px-8 border-b border-white/[0.04] last:border-b-0 transition-all duration-500 hover:bg-white/[0.015] rounded-2xl cursor-default">
      {/* Number */}
      <div
        className="text-[80px] font-bold leading-none tracking-tighter opacity-[0.06] group-hover:opacity-[0.15] transition-opacity duration-700 select-none flex-shrink-0 hidden md:block"
        style={{ fontFamily: "'Space Mono', monospace", color: accent }}
      >
        {number}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110"
            style={{ background: `${accent}12`, color: accent }}
          >
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        </div>
        <p className="text-[15px] text-white/40 leading-relaxed max-w-xl">{desc}</p>
      </div>

      <ArrowUpRight
        className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 flex-shrink-0 mt-2"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOW-IT-WORKS STEP
   ═══════════════════════════════════════════════════════════════ */

function Step({ n, title, desc, accent, isLast }: {
  n: string; title: string; desc: string; accent: string; isLast?: boolean;
}) {
  return (
    <RevealBlock delay={parseInt(n) * 120}>
      <div className="group flex gap-6 cursor-default">
        {/* Timeline */}
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 border transition-all duration-500 group-hover:scale-110"
            style={{
              background: `${accent}10`,
              borderColor: `${accent}30`,
              color: accent,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {n}
          </div>
          {!isLast && (
            <div className="w-px flex-1 mt-3 min-h-[40px]" style={{ background: `${accent}15` }} />
          )}
        </div>

        {/* Content */}
        <div className="pb-12">
          <div className="text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-[#00ffa3] transition-colors duration-300">
            {title}
          </div>
          <div className="text-[15px] text-white/40 leading-relaxed max-w-md">{desc}</div>
        </div>
      </div>
    </RevealBlock>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════════════════ */

function Marquee() {
  const items = ["AI Architecture Reports", "Context-Aware Chat", "GitHub Sync", "Code Explorer", "Team Workspaces", "Developer Activity", "PR Analytics", "Issue Tracking"];

  return (
    <div className="overflow-hidden py-6 border-y border-white/[0.04]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm text-white/15 uppercase tracking-[0.2em] flex items-center gap-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT COUNTER
   ═══════════════════════════════════════════════════════════════ */

function AnimatedStat({ value, label, suffix = "" }: {
  value: number; label: string; suffix?: string;
}) {
  const { ref, inView } = useInView(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 2000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/30 uppercase tracking-[0.15em]" style={{ fontFamily: "'Space Mono', monospace" }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-5 px-6 transition-all duration-500"
      style={{ paddingTop: scrolled ? "12px" : "20px" }}
    >
      <nav
        className="w-full max-w-6xl flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all duration-500"
        style={{
          background: scrolled ? "rgba(5,5,10,0.9)" : "rgba(5,5,10,0.3)",
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          border: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
          boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,255,163,0.12)", border: "1px solid rgba(0,255,163,0.25)" }}
          >
            <GitBranch className="w-4 h-4" style={{ color: "#00ffa3" }} />
          </div>
          <span
            className="font-semibold tracking-tight text-base"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            repo<span style={{ color: "#00ffa3" }}>intel</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-white/40">
          {[
            { label: "Features", id: "features" },
            { label: "Use Cases", id: "usecases" },
            { label: "How it works", id: "howitworks" },
          ].map(l => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="hover:text-white transition-colors duration-300 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00ffa3] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="text-[13px] text-white/50 hover:text-white transition-colors duration-300 hidden md:block"
            onClick={() => signIn("github")}
          >
            Sign in
          </button>
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "rgba(0,255,163,0.1)",
              border: "1px solid rgba(0,255,163,0.25)",
              color: "#00ffa3",
            }}
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Started</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  useSmoothScroll();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  return (
    <main
      className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: "#05050a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        ::selection { background: rgba(0,255,163,0.25); color: white; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dash-offset {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes hero-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .glow-btn {
          position: relative;
          transition: box-shadow 0.4s, transform 0.25s, background 0.3s;
        }
        .glow-btn::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, #00ffa3, #60a5fa, #a78bfa);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s;
          filter: blur(20px);
        }
        .glow-btn:hover {
          box-shadow: 0 0 40px rgba(0,255,163,0.3), 0 0 80px rgba(0,255,163,0.1);
          transform: translateY(-2px) scale(1.02);
        }
        .glow-btn:hover::after {
          opacity: 0.4;
        }

        .hero-badge {
          animation: float 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <GrainOverlay />
      <MagneticCursor />

      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,163,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,163,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Blobs */}
        <div
          className="absolute rounded-full"
          style={{
            width: 900, height: 900,
            top: "-350px", right: "-300px",
            background: "radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 65%)",
            animation: "glow-pulse 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            bottom: "5%", left: "-200px",
            background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 65%)",
            animation: "glow-pulse 10s ease-in-out infinite",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500,
            top: "40%", left: "50%",
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle, rgba(167,139,250,0.03) 0%, transparent 65%)",
            animation: "glow-pulse 12s ease-in-out infinite",
            animationDelay: "5s",
          }}
        />
      </div>

      <Navbar />

      {/* ════════════════════════════════════════════════════════════
         HERO
         ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center text-center px-6 pt-48 md:pt-56 pb-20">
        {/* Badge */}
        <RevealBlock delay={0}>
          <div
            className="hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs mb-10 cursor-default"
            style={{
              background: "rgba(0,255,163,0.06)",
              border: "1px solid rgba(0,255,163,0.15)",
              color: "#00ffa3",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffa3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffa3]" />
            </span>
            AI-Powered Repository Intelligence
          </div>
        </RevealBlock>

        {/* Headline */}
        <h1
          className="font-extrabold leading-[1.05] tracking-[-0.03em] mb-7"
          style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", maxWidth: 1000 }}
        >
          <SplitText delay={100}>Your codebase,</SplitText>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00ffa3 0%, #60a5fa 40%, #a78bfa 70%, #00ffa3 100%)",
              backgroundSize: "200% 200%",
              animation: "hero-gradient 6s ease infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <SplitText delay={300}>finally understood.</SplitText>
          </span>
        </h1>

        {/* Sub */}
        <RevealBlock delay={500}>
          <p
            className="text-white/40 mb-12 leading-relaxed"
            style={{ maxWidth: 580, fontSize: "1.15rem" }}
          >
            Connect any GitHub repository and get instant AI architecture reports,
            a built-in code explorer, and a smart assistant that answers anything about your codebase.
          </p>
        </RevealBlock>

        {/* CTAs */}
        <RevealBlock delay={650}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <button
              onClick={() => signIn("github")}
              className="glow-btn flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-[15px] text-black"
              style={{ background: "#00ffa3" }}
            >
              <Github className="w-4.5 h-4.5" />
              Connect GitHub — it&apos;s free
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-medium text-[15px] text-white/50 hover:text-white transition-all duration-300 border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03]"
            >
              <Eye className="w-4 h-4" />
              View live demo
            </button>
          </div>
        </RevealBlock>

        {/* Scroll indicator */}
        <RevealBlock delay={900}>
          <div className="flex flex-col items-center gap-2 mt-4 opacity-40">
            <span className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: "'Space Mono', monospace" }}>
              Scroll to explore
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </RevealBlock>
      </section>

      {/* ─── TERMINAL SHOWCASE ─── */}
      <section className="px-6 pb-32 flex justify-center">
        <ScaleReveal className="w-full max-w-[850px]">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 0 100px rgba(0,255,163,0.04), 0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Chrome */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
              </div>
              <div className="text-xs text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                repointel — analysis
              </div>
              <Terminal className="w-3.5 h-3.5 text-white/20" />
            </div>

            <div className="p-8 space-y-6">
              {/* Repo info */}
              <div className="flex items-center gap-3 pb-5 border-b border-white/[0.04]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.2)" }}
                >
                  <Code2 className="w-4.5 h-4.5" style={{ color: "#00ffa3" }} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">vercel / next.js</div>
                  <div className="text-xs text-white/30 mt-0.5">TypeScript · 47,291 commits · 8,204 PRs</div>
                </div>
                <div
                  className="ml-auto text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(0,255,163,0.08)", color: "#00ffa3", fontFamily: "'Space Mono', monospace" }}
                >
                  ● synced
                </div>
              </div>

              <TerminalDemo />

              {/* Heatmap */}
              <div className="pt-5 border-t border-white/[0.04]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-white/25" style={{ fontFamily: "'Space Mono', monospace" }}>
                    commit activity · 26w
                  </span>
                  <span className="text-xs text-white/15">less ── more</span>
                </div>
                <CommitHeatmap />
              </div>
            </div>
          </div>
        </ScaleReveal>
      </section>

      {/* ─── MARQUEE ─── */}
      <Marquee />

      {/* ─── STATS ─── */}
      <section className="px-6 py-32 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <RevealBlock delay={0}><AnimatedStat value={12} label="Repositories synced" suffix="K+" /></RevealBlock>
          <RevealBlock delay={150}><AnimatedStat value={1} label="Click ingestion" suffix="" /></RevealBlock>
          <RevealBlock delay={300}><AnimatedStat value={50} label="Faster onboarding" suffix="x" /></RevealBlock>
          <RevealBlock delay={450}><AnimatedStat value={800} label="Teams worldwide" suffix="+" /></RevealBlock>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
         FEATURES (Bento Grid)
         ════════════════════════════════════════════════════════════ */}
      <section id="features" className="px-6 py-28 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="mb-16">
            <RevealBlock>
              <div
                className="text-xs text-[#00ffa3]/50 mb-4 tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ◆ Capabilities
              </div>
            </RevealBlock>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1]">
              <SplitText>Everything you need to</SplitText>
              <br />
              <span className="text-white/30"><SplitText delay={300}>understand any codebase.</SplitText></span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <RevealBlock delay={0}>
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title="AskRepo Assistant"
                desc="Chat with your entire codebase. Our context-aware AI reads your files, commits, and PRs to answer complex architectural questions instantly."
                accent="#00ffa3"
                visual={
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <MessageSquare className="w-4 h-4 text-[#00ffa3]/50" />
                    <span className="text-xs text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      &quot;How does auth middleware work?&quot;
                    </span>
                  </div>
                }
              />
            </RevealBlock>
            <RevealBlock delay={100}>
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Intelligence Reports"
                desc="One-click AI-generated architecture summaries. Get instant technical breakdowns of any project including stack analysis, key patterns, and dependency mapping."
                accent="#60a5fa"
              />
            </RevealBlock>
            <RevealBlock delay={200}>
              <FeatureCard
                icon={<FileCode className="w-6 h-6" />}
                title="Code Explorer"
                desc="Browse your entire repository tree with syntax-highlighted file previews. Navigate architecture without leaving the browser."
                accent="#a78bfa"
              />
            </RevealBlock>
            <RevealBlock delay={300}>
              <FeatureCard
                icon={<Activity className="w-6 h-6" />}
                title="Developer Activity"
                desc="Visualize commit patterns, contribution heatmaps, and team velocity across every repository in your workspace."
                accent="#f59e0b"
                size="wide"
                visual={
                  <div className="flex gap-2 opacity-60">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 rounded-md" style={{
                        height: `${20 + Math.random() * 40}px`,
                        background: `rgba(245,158,11,${0.15 + Math.random() * 0.4})`,
                      }} />
                    ))}
                  </div>
                }
              />
            </RevealBlock>
            <RevealBlock delay={400}>
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Secure by Design"
                desc="Read-only OAuth scopes. Code context is retrieved dynamically and never persisted beyond your session."
                accent="#34d399"
              />
            </RevealBlock>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
         USE CASES
         ════════════════════════════════════════════════════════════ */}
      <section id="usecases" className="px-6 py-28 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="mb-16">
            <RevealBlock>
              <div
                className="text-xs text-[#a78bfa]/60 mb-4 tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ◆ Use Cases
              </div>
            </RevealBlock>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1]">
              <SplitText>Built for how</SplitText>
              <br />
              <span className="text-white/30"><SplitText delay={300}>engineers actually work.</SplitText></span>
            </h2>
          </div>

          <div>
            <RevealBlock delay={0}>
              <UseCaseCard
                icon={<Sparkles className="w-5 h-5" />}
                title="Onboard to new codebases in minutes"
                desc="Joining a new team? Generate an Intelligence Report to instantly grasp the architecture, key dependencies, and how everything connects — without reading thousands of lines of code."
                number="01"
                accent="#00ffa3"
              />
            </RevealBlock>
            <RevealBlock delay={100}>
              <UseCaseCard
                icon={<Search className="w-5 h-5" />}
                title="Debug faster with contextual AI"
                desc="Ask the AskRepo assistant about specific functions, data flows, or error patterns. It reads your actual code and gives answers grounded in your real implementation — not generic StackOverflow snippets."
                number="02"
                accent="#60a5fa"
              />
            </RevealBlock>
            <RevealBlock delay={200}>
              <UseCaseCard
                icon={<GitPullRequest className="w-5 h-5" />}
                title="Review PRs with full project context"
                desc="Before reviewing a pull request, run a quick AI query to understand the affected components, downstream dependencies, and potential side effects across the entire repository."
                number="03"
                accent="#a78bfa"
              />
            </RevealBlock>
            <RevealBlock delay={300}>
              <UseCaseCard
                icon={<Users className="w-5 h-5" />}
                title="Align your team on architecture decisions"
                desc="Share Intelligence Reports and workspace context with your entire team. Everyone operates from the same understanding — perfect for architecture reviews, sprint planning, and technical discussions."
                number="04"
                accent="#f59e0b"
              />
            </RevealBlock>
            <RevealBlock delay={400}>
              <UseCaseCard
                icon={<Cpu className="w-5 h-5" />}
                title="Audit open-source projects before adopting"
                desc="Evaluating a library or framework? Connect the repo and get a full breakdown of its architecture, code quality patterns, test coverage approach, and maintenance health — in seconds."
                number="05"
                accent="#f87171"
              />
            </RevealBlock>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
         HOW IT WORKS
         ════════════════════════════════════════════════════════════ */}
      <section id="howitworks" className="px-6 py-28 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-20">
          <div className="md:w-2/5 md:sticky md:top-32 md:self-start">
            <RevealBlock>
              <div
                className="text-xs text-[#60a5fa]/60 mb-4 tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ◆ Process
              </div>
            </RevealBlock>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-5">
              <SplitText>Up and running</SplitText>
              <br />
              <span className="text-white/30"><SplitText delay={300}>in 60 seconds.</SplitText></span>
            </h2>
            <RevealBlock delay={400}>
              <p className="text-[15px] text-white/35 leading-relaxed">
                No config files. No CLI setup. No deployment overhead.
                Connect your GitHub account and start getting AI-powered insights immediately.
              </p>
            </RevealBlock>
          </div>

          <div className="md:w-3/5">
            <Step
              n="01"
              title="Authenticate with GitHub"
              desc="One-click OAuth. We request read-only access to your repositories — nothing else. Your credentials are never stored."
              accent="#00ffa3"
            />
            <Step
              n="02"
              title="Select & ingest a repository"
              desc="Pick any public or private repo. Our incremental sync engine fetches your entire file tree, commit history, pull requests, and issues in seconds."
              accent="#60a5fa"
            />
            <Step
              n="03"
              title="Generate an Intelligence Report"
              desc="With one click, our AI analyzes the entire codebase and produces a detailed architecture breakdown — frameworks, patterns, key files, and project structure."
              accent="#a78bfa"
            />
            <Step
              n="04"
              title="Ask anything with AskRepo"
              desc="Open the AI assistant and start asking questions. It has full context of your repository and can help debug, explain, and navigate your code."
              accent="#f59e0b"
              isLast
            />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE 2 ─── */}
      <Marquee />

      {/* ════════════════════════════════════════════════════════════
         CTA
         ════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-36 flex justify-center">
        <ScaleReveal className="w-full max-w-5xl">
          <div
            className="relative rounded-[2rem] p-16 md:p-20 text-center overflow-hidden"
            style={{
              background: "rgba(0,255,163,0.03)",
              border: "1px solid rgba(0,255,163,0.1)",
            }}
          >
            {/* Glow orbs */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full -z-10"
              style={{ background: "radial-gradient(circle, rgba(0,255,163,0.08) 0%, transparent 60%)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full -z-10"
              style={{ background: "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 60%)" }}
            />

            <div
              className="text-xs text-[#00ffa3]/50 mb-6 tracking-[0.25em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Get started today
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-5">
              Stop guessing.
              <br />
              <span className="text-white/35">Start understanding.</span>
            </h2>
            <p className="text-white/35 text-[15px] mb-12 max-w-lg mx-auto leading-relaxed">
              Join thousands of developers who use RepoIntel to understand codebases
              faster, collaborate with AI, and onboard in record time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                onClick={() => signIn("github")}
                className="glow-btn flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-[15px] text-black"
                style={{ background: "#00ffa3" }}
              >
                <Github className="w-4.5 h-4.5" />
                Start for free
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button className="flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors duration-300">
                Read the docs <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/20">
              {["Lightning Fast AI", "GitHub Sync", "Secure OAuth", "Team Workspaces"].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <span className="text-[#00ffa3]">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </ScaleReveal>
      </section>

      {/* ════════════════════════════════════════════════════════════
         FOOTER
         ════════════════════════════════════════════════════════════ */}
      <footer
        className="px-6 py-12 border-t"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.2)" }}
              >
                <GitBranch className="w-3.5 h-3.5" style={{ color: "#00ffa3" }} />
              </div>
              <span
                className="text-sm font-semibold text-white/50"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                repo<span style={{ color: "#00ffa3" }}>intel</span>
              </span>
            </div>

            <div className="text-xs text-white/15">
              © {new Date().getFullYear()} RepoIntel · Built with Next.js & AI
            </div>

            <div className="flex gap-8 text-xs text-white/25">
              {["Privacy", "Terms", "Security", "Docs", "Status"].map(l => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-white/60 transition-colors duration-300 relative group"
                >
                  {l}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/30 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}