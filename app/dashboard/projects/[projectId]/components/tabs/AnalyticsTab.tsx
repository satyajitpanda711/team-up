"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#a4de6c', '#d0ed57', '#8dd1e1', '#83a6ed'];

type AnalyticsData = {
  commitVelocity: { date: string; commits: number }[];
  languageDistribution: { name: string; value: number }[];
};

export default function AnalyticsTab({ projectId }: { projectId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/analytics`);
        if (!res.ok) throw new Error();
        const json = await res.json();
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

  if (!data || (data.commitVelocity.length === 0 && data.languageDistribution.length === 0)) {
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

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMMIT VELOCITY */}
        <Card className="p-5 border flex flex-col min-h-[350px]">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Commit Velocity</h3>
            <p className="text-sm text-muted-foreground">Commits over the last 14 days</p>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.commitVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.split("-").slice(1).join("/")} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="commits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* LANGUAGE DISTRIBUTION */}
        <Card className="p-5 border flex flex-col min-h-[350px]">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Language Distribution</h3>
            <p className="text-sm text-muted-foreground">File languages across the repository</p>
          </div>
          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
            {data.languageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.languageDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.languageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No language data found.</p>
            )}
          </div>
          
          {/* Custom Legend */}
          {data.languageDistribution.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {data.languageDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="capitalize">{entry.name}</span>
                  <span className="text-muted-foreground">({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
      
    </div>
  );
}
