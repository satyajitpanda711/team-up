"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, History, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import TerminalAnimation from "./components/TerminalAnimation";
import IntelligenceReport, { ReportData } from "./components/IntelligenceReport";

interface IntelligenceReportDB {
  _id: string;
  createdAt: string;
  reportData: ReportData;
}

export default function IntelligencePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  
  const [reports, setReports] = useState<IntelligenceReportDB[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  const [isGenerating, setIsGenerating] = useState(true); // true initially to fetch GET
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [animationComplete, setAnimationComplete] = useState(false);
  const [postComplete, setPostComplete] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/projects/${projectId}/intelligence`);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        
        if (data.length > 0) {
          // Has history, show it instantly
          setReports(data);
          setIsGenerating(false);
          setIsInitialLoad(false);
        } else {
          // No history, trigger a new generation
          generateNewReport();
        }
      } catch (err: any) {
        setError(err.message);
        setIsGenerating(false);
        setIsInitialLoad(false);
      }
    }
    fetchHistory();
  }, [projectId]);

  const generateNewReport = async () => {
    setIsGenerating(true);
    setAnimationComplete(false);
    setPostComplete(false);
    setError(null);
    setIsInitialLoad(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/intelligence`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const newReport = await res.json();
      
      setReports(prev => [newReport, ...prev]);
      setSelectedIndex(0);
      setPostComplete(true);
    } catch (err: any) {
      setError(err.message);
      setPostComplete(true); // to exit loading state if animation is done
    }
  };

  // Sync completion
  useEffect(() => {
    if (isGenerating && !isInitialLoad && animationComplete && postComplete) {
      setIsGenerating(false);
    }
  }, [isGenerating, isInitialLoad, animationComplete, postComplete]);


  const currentReport = reports[selectedIndex]?.reportData;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <div className="border-b backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button variant="ghost" size="icon" className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Intelligence Report
              </h1>
              <p className="text-xs text-muted-foreground">AI-Generated Analysis</p>
            </div>
          </div>

          {/* Right Controls */}
          {!isGenerating && !isInitialLoad && !error && reports.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-md p-1 border">
                <History className="w-4 h-4 text-muted-foreground ml-2" />
                <select 
                  className="bg-transparent border-none text-sm outline-none cursor-pointer py-1 pr-2"
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(Number(e.target.value))}
                >
                  {reports.map((r, i) => (
                    <option key={r._id} value={i}>
                      {new Date(r.createdAt).toLocaleString()} {i === 0 ? "(Latest)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                variant="default" 
                size="sm"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={generateNewReport}
              >
                <RefreshCcw className="w-4 h-4" />
                Regenerate Analysis
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {error && !isGenerating ? (
          <div className="text-center p-12 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              !
            </div>
            <h2 className="text-xl font-semibold">Error Generating Report</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setError(null)}>Dismiss</Button>
          </div>
        ) : isInitialLoad || isGenerating ? (
          <TerminalAnimation onComplete={() => setAnimationComplete(true)} />
        ) : (
          currentReport && <IntelligenceReport data={currentReport} />
        )}
      </div>
    </main>
  );
}
