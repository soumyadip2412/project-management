import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/task.store";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Plus, Play, CheckCircle, Calendar, Layers, Loader2, Sparkles } from "lucide-react";
import { IssueCard } from "./IssueCard";

export function BacklogView({ projectId }) {
  const { tasks, openCreateModal } = useTaskStore();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/sprints/project/${projectId}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSprints(list);
    } catch (err) {
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchSprints();
  }, [projectId]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintName.trim()) return;

    setCreating(true);
    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks default
      const res = await apiClient.post(`/sprints/project/${projectId}`, {
        name: sprintName.trim(),
        goal: sprintGoal.trim(),
        startDate,
        endDate,
      });
      const created = res.data?.data || res.data;
      setSprints((prev) => [created, ...prev]);
      toast.success("Sprint created!");
      setSprintName("");
      setSprintGoal("");
      setIsSprintModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create sprint");
    } finally {
      setCreating(false);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await apiClient.put(`/sprints/project/${projectId}/${sprintId}/start`);
      toast.success("Sprint started!");
      fetchSprints();
    } catch (err) {
      toast.error("Failed to start sprint");
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      await apiClient.put(`/sprints/project/${projectId}/${sprintId}/complete`);
      toast.success("Sprint completed!");
      fetchSprints();
    } catch (err) {
      toast.error("Failed to complete sprint");
    }
  };

  const activeSprint = sprints.find((s) => s.status === "active");
  const plannedSprints = sprints.filter((s) => s.status === "planned");
  const backlogTasks = tasks.filter((t) => !t.sprint);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            Sprint & Backlog Planning
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize work into sprints, assign story points, and track completion velocity.
          </p>
        </div>
        <button
          onClick={() => setIsSprintModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 border border-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Sprint
        </button>
      </div>

      {/* Active Sprint Section */}
      {activeSprint && (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="font-bold text-foreground text-base">{activeSprint.name}</h4>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Active Sprint
                </span>
              </div>
              {activeSprint.goal && (
                <p className="text-xs text-muted-foreground mt-1">Goal: {activeSprint.goal}</p>
              )}
            </div>
            <button
              onClick={() => handleCompleteSprint(activeSprint._id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Complete Sprint
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter((t) => t.sprint === activeSprint._id || t.sprint?._id === activeSprint._id).length === 0 ? (
              <p className="text-xs text-muted-foreground italic col-span-3 py-4 text-center">
                No issues assigned to this active sprint.
              </p>
            ) : (
              tasks
                .filter((t) => t.sprint === activeSprint._id || t.sprint?._id === activeSprint._id)
                .map((t) => <IssueCard key={t._id} task={t} />)
            )}
          </div>
        </div>
      )}

      {/* Planned Sprints */}
      {plannedSprints.map((sprint) => (
        <div key={sprint._id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-bold text-foreground text-base">{sprint.name}</h4>
              {sprint.goal && <p className="text-xs text-muted-foreground mt-0.5">{sprint.goal}</p>}
            </div>
            {!activeSprint && (
              <button
                onClick={() => handleStartSprint(sprint._id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                Start Sprint
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Backlog Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground text-base">Backlog Pool</h4>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-bold text-muted-foreground">
              {backlogTasks.length} issues
            </span>
          </div>
          <button
            onClick={() => openCreateModal("todo")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            <Plus className="h-4 w-4" />
            Add Backlog Issue
          </button>
        </div>

        {backlogTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-xs font-medium">Backlog is empty!</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Create an issue to start planning.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {backlogTasks.map((t) => (
              <IssueCard key={t._id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Create Sprint Modal */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">Create Sprint</h3>
            <form onSubmit={handleCreateSprint} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Sprint Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 1 - Core Auth"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Sprint Goal
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the key objective of this sprint?"
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSprintModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !sprintName.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
