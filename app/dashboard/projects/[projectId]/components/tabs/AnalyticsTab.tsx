"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity, GitCommit, FileCode, HardDrive, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

type AnalyticsData = {
  commitVelocity: { date: string; commits: number }[];
  languageDistribution: { name: string; value: number }[];
  topAuthors: { name: string; commits: number }[];
  recentCommits: { sha: string; message: string; author: string; date: string }[];
  totalCommits: number;
  totalFiles: number;
  totalSize: number;
};

// Helper to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const velocityChartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const authorChartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Create a dynamic config for language distribution using nice colors
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AnalyticsTab({ projectId }: { projectId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/analytics`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        
        // Add fill colors to the pie chart data so Shadcn components pick them up
        if (json.languageDistribution) {
          json.languageDistribution = json.languageDistribution.map((item: any, i: number) => ({
            ...item,
            fill: COLORS[i % COLORS.length]
          }));
        }
        
        setData(json);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (!data || (data.commitVelocity.length === 0 && data.languageDistribution.length === 0 && (!data.totalCommits || data.totalCommits === 0))) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No analytics available</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Sync your repository to view activity graphs.
        </p>
      </div>
    );
  }

  const topContributor = data.topAuthors && data.topAuthors.length > 0 ? data.topAuthors[0].name : "N/A";

  // Build dynamic config for languages
  const languageChartConfig = {} as ChartConfig;
  if (data.languageDistribution) {
    data.languageDistribution.forEach((entry, i) => {
      languageChartConfig[entry.name] = {
        label: entry.name,
        color: COLORS[i % COLORS.length]
      };
    });
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCommits || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFiles || 0}</div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Code Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(data.totalSize || 0)}</div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Contributor</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate" title={topContributor}>{topContributor}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COMMIT VELOCITY */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle>Commit Velocity</CardTitle>
            <CardDescription>Commits over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px]">
            <ChartContainer config={velocityChartConfig} className="w-full h-full max-h-[300px]">
              <BarChart data={data.commitVelocity} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(val) => val.split("-").slice(1).join("/")} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="commits" fill="var(--color-commits)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest repository commits</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px] p-0 px-6 pb-6">
            <ScrollArea className="h-full max-h-[300px] pr-4">
              {data.recentCommits && data.recentCommits.length > 0 ? (
                <div className="space-y-4">
                  {data.recentCommits.map((commit, i) => (
                    <div key={i} className="flex flex-col space-y-1.5 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate pr-2" title={commit.message}>
                          {commit.message}
                        </span>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                          {commit.sha}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{commit.author}</span>
                        <span>{new Date(commit.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No recent commits found.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LANGUAGE DISTRIBUTION */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>File languages across the repository</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px] pb-0">
            {data.languageDistribution.length > 0 ? (
              <ChartContainer config={languageChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={data.languageDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  />
                  <ChartLegend content={<ChartLegendContent />} className="flex-wrap" />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No language data found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* TOP CONTRIBUTORS */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Authors with the most commits</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px]">
            {data.topAuthors && data.topAuthors.length > 0 ? (
              <ChartContainer config={authorChartConfig} className="w-full h-full max-h-[300px]">
                <BarChart layout="vertical" data={data.topAuthors} accessibilityLayer margin={{ left: 0 }}>
                  <CartesianGrid horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tickMargin={10} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="commits" fill="var(--color-commits)" radius={4} barSize={24} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No contributor data found.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
      
    </div>
  );
}
