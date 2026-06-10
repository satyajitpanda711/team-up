"use client";

import { useEffect, useState } from "react";

const ANIMATION_STEPS = [
  "→ initializing AI core...",
  "→ scanning repository structure...",
  "→ mapping file dependencies...",
  "→ analyzing commit patterns...",
  "→ identifying architectural boundaries...",
  "→ inferring technology stack...",
  "→ looking for critical modules...",
  "→ synthesizing intelligence report...",
  "→ report generation complete.",
];

export default function TerminalAnimation({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < ANIMATION_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 600 + Math.random() * 400); // Random delay between 600ms and 1000ms
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Wait half a second after the last step before completing
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center font-mono text-sm">
      <div className="w-full max-w-2xl bg-black/90 text-green-400 p-8 rounded-lg shadow-2xl border border-green-900/50 overflow-hidden relative">
        {/* Decorative terminal top bar */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-black/40 border-b border-green-900/30 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="ml-4 text-xs text-green-600">ai_cto_assistant.sh</span>
        </div>

        <div className="mt-8 space-y-2">
          {ANIMATION_STEPS.slice(0, currentStep).map((step, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {step}
            </div>
          ))}
          {currentStep < ANIMATION_STEPS.length && (
            <div className="flex items-center gap-2">
              <span className="text-green-500">_</span>
              <span className="w-2 h-4 bg-green-500 animate-pulse"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
