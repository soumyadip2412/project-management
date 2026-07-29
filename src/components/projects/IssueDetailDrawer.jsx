import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/task.store";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import {
  X,
  Send,
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  Sparkles,
} from "lucide-react";

export function IssueDetailDrawer({ projectId }) {
  const { selectedTask, isDetailOpen, closeDetail, updateTaskInStore, removeTaskFromStore } =
    useTaskStore();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!selectedTask || !projectId) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await apiClient.get(
          `/comments/project/${projectId}/task/${selectedTask._id}`
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setComments(list);
      } catch (err) {
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [selectedTask, projectId]);

  if (!isDetailOpen || !selectedTask) return null;

  const currentStatus =
    typeof selectedTask.status === "object"
      ? selectedTask.status.name || selectedTask.status.category
      : selectedTask.status || "todo";

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await apiClient.put(
        `/tasks/project/${projectId}/task/${selectedTask._id}`,
        {
          status: { name: newStatus, category: newStatus },
        }
      );
      const updated = res.data?.data || res.data;
      updateTaskInStore(updated);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setUpdating(true);
    try {
      const res = await apiClient.put(
        `/tasks/project/${projectId}/task/${selectedTask._id}`,
        { priority: newPriority }
      );
      const updated = res.data?.data || res.data;
      updateTaskInStore(updated);
      toast.success(`Priority set to ${newPriority}`);
    } catch (err) {
      toast.error("Failed to update priority");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const res = await apiClient.post(
        `/comments/project/${projectId}/task/${selectedTask._id}`,
        { body: newComment.trim() }
      );
      const created = res.data?.data || res.data;
      setComments((prev) => [...prev, created]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setDeleting(true);
    try {
      await apiClient.delete(
        `/tasks/project/${projectId}/task/${selectedTask._id}`
      );
      toast.success("Issue deleted");
      removeTaskFromStore(selectedTask._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete issue");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-sky-400">
                {selectedTask.issueKey || `TASK-${selectedTask._id?.slice(-4)}`}
              </span>
              <span className="text-xs uppercase font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">
                {selectedTask.issueType || "task"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteTask}
                disabled={deleting}
                className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Issue"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
              <button
                onClick={closeDetail}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedTask.title}</h2>
            </div>

            {/* Quick Controls Grid */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/40 p-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Priority
                </label>
                <select
                  value={selectedTask.priority || "medium"}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={updating}
                  className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Description
              </h4>
              <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || "No description provided."}
              </div>
            </div>

            {/* Meta Attributes */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Due Date:</span>
                <span className="font-medium text-foreground">
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Story Points:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedTask.storyPoints ?? "N/A"}
                </span>
              </div>
            </div>

            {/* Comments Thread Section */}
            <div className="pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-sky-400" />
                Comments ({comments.length})
              </h4>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={commenting || !newComment.trim()}
                    className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors"
                  >
                    {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              {loadingComments ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-sky-400" />
                  <p className="mt-1 text-xs">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No comments yet. Start the discussion!</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c._id} className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {c.author?.fullName || c.author?.username || "Teammate"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
