import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { 
  Folder, 
  CheckCircle2, 
  Clock, 
  Users, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Activity, 
  Loader2,
  TrendingUp
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get("/dashboard/stats");
      setStats(res.data.data);
    } catch (error) {
      if (!isSilent) {
        toast.error(error.response?.data?.message || "Failed to load dashboard metrics");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();

    // Polling interval: refresh stats every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: Folder,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      subtext: "Workspace active projects"
    },
    {
      label: "Active Tasks",
      value: stats?.activeTasks ?? 0,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      subtext: "In progress & to-do items"
    },
    {
      label: "Team Members",
      value: stats?.teamMembers ?? 0,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      subtext: "Across all project teams"
    },
    {
      label: "Completion Rate",
      value: `${stats?.completionRate ?? 0}%`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      subtext: `${stats?.completedTasks ?? 0} of ${stats?.totalTasks ?? 0} tasks finished`
    }
  ];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Real-Time
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Welcome back! Real-time metrics and project updates across your workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing || loading}
            title="Refresh metrics"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
            Refresh
          </button>
          <Link
            to="/app/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      {loading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p className="mt-3 text-sm text-slate-400">Loading live metrics...</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.label}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-200 hover:border-sky-500/30 hover:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {card.label}
                    </span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{card.subtext}</p>
                  </div>

                  {/* Completion Rate Bar */}
                  {card.label === "Completion Rate" && (
                    <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.completionRate ?? 0}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lower Content Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Recent Projects */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Folder className="h-4 w-4 text-sky-400" />
                    Recent Projects
                  </h2>
                  <Link
                    to="/app/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {!stats?.recentProjects || stats.recentProjects.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-400">No projects created yet.</p>
                    <Link
                      to="/app/projects"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create your first project
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.recentProjects.map((project) => (
                      <Link
                        key={project._id}
                        to={`/app/projects/${project._id}`}
                        className="group p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-sky-500/30 hover:bg-slate-950/70 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm group-hover:text-sky-300 transition-colors line-clamp-1">
                              {project.name}
                            </h3>
                            {project.key && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                                {project.key}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{project.members?.length || 1} member(s)</span>
                          <span className="group-hover:text-sky-400 flex items-center gap-1">
                            View <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Live Activity Feed
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {!stats?.recentTasks || stats.recentTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No recent activities recorded yet.
                    </div>
                  ) : (
                    stats.recentTasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-200 line-clamp-1">
                            {task.title || "Task Item"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {task.project?.name || "Project"}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          task.status === "done" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : task.status === "in_progress"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}>
                          {task.status || "todo"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
