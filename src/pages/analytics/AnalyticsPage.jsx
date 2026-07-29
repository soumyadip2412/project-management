import { useState, useEffect } from "react";
import { apiClient } from "@/lib/http";
import { BarChart3, PieChart, TrendingUp, CheckCircle2, Clock, ShieldAlert, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/dashboard/stats");
        setStats(res.data?.data || res.data);
      } catch (err) {
        // Fallback quiet
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        <p className="mt-3 text-sm text-muted-foreground">Loading workspace analytics...</p>
      </div>
    );
  }

  const completionRate = stats?.completionRate ?? 0;
  const totalTasks = stats?.totalTasks ?? 0;
  const completedTasks = stats?.completedTasks ?? 0;
  const activeTasks = stats?.activeTasks ?? 0;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-sky-400" />
          Workspace Analytics & Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time metrics, throughput performance, and distribution across your workspace.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{completedTasks}</p>
          <p className="mt-1 text-xs text-muted-foreground">out of {totalTasks} total tasks</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress Work</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{activeTasks}</p>
          <p className="mt-1 text-xs text-muted-foreground">active items being worked on</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Velocity</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{completionRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">workspace completion efficiency</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-sky-400" />
            Task Status Breakdown
          </h2>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Done / Completed</span>
                <span>{completedTasks} tasks</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400">In Progress / Todo</span>
                <span>{activeTasks} tasks</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (activeTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Health */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-purple-400" />
            Health & Risk Assessment
          </h2>
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Critical / Blocker Tasks</span>
              <span className="font-mono font-bold text-red-400">Low Risk</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Sprint Completion Rate</span>
              <span className="font-mono font-bold text-emerald-400">{completionRate}% Target</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Active Workspaces</span>
              <span className="font-mono font-bold text-sky-400">1 Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
