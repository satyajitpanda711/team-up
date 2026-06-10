import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, LayoutDashboard, Lightbulb, AlertTriangle, Briefcase, FileCode2 } from "lucide-react";

export interface ReportData {
  overview: string;
  techStack: string[];
  architectureStyle: string;
  criticalAreas: { name: string; reason: string }[];
  timeline: { phase: string; description: string }[];
  onboardingNotes: string;
  risks: string[];
}

export default function IntelligenceReport({ data }: { data: ReportData }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center p-12 text-muted-foreground">Failed to generate intelligence report.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Overview */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Repository Intelligence
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {data.overview}
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-indigo-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Architecture & Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/50 mb-6">
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">Style: </span>
                <span className="text-indigo-900 dark:text-indigo-200">{data.architectureStyle}</span>
              </div>

              <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">Critical Modules</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.criticalAreas?.map((area, i) => (
                  <div key={i} className="flex gap-3 items-start border p-3 rounded-md bg-background">
                    <FileCode2 className="w-4 h-4 mt-1 text-purple-500 shrink-0" />
                    <div>
                      <h5 className="font-medium text-sm">{area.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{area.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitCommit className="w-5 h-5 text-emerald-500" />
                Development Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {data.timeline?.map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
                      <h4 className="font-semibold text-sm">{event.phase}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutDashboard className="w-5 h-5 text-blue-500" />
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.techStack?.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-500">
                <Lightbulb className="w-5 h-5" />
                Onboarding Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-900 dark:text-amber-200/80 leading-relaxed">
                {data.onboardingNotes}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Potential Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.risks?.map((risk, i) => (
                  <li key={i} className="flex gap-2 text-sm text-red-900 dark:text-red-200/80 items-start">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
