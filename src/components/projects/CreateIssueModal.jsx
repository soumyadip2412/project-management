import { useState } from "react";
import { useTaskStore } from "@/store/task.store";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";

export function CreateIssueModal({ projectId, members = [] }) {
  const { isCreateOpen, createDefaultStatus, closeCreateModal, addTask } = useTaskStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isCreateOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        status: { name: createDefaultStatus, category: createDefaultStatus },
        storyPoints: storyPoints ? Number(storyPoints) : undefined,
        assignees: assigneeId ? [assigneeId] : [],
      };

      const res = await apiClient.post(`/tasks/${projectId}`, payload);
      const createdTask = res.data?.data || res.data;
      addTask(createdTask);
      toast.success("Issue created successfully!");
      setTitle("");
      setDescription("");
      closeCreateModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Create Issue</h3>
          <button
            onClick={closeCreateModal}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth login flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="story">Story</option>
                <option value="epic">Epic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide background, steps to reproduce, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                    {m.user?.fullName || m.user?.username || m.user}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
