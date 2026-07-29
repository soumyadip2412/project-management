import { useTaskStore } from "@/store/task.store";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Bookmark,
  Bug,
  CheckSquare,
  Layers,
  Sparkles,
  User,
} from "lucide-react";

const issueTypeIcons = {
  bug: { icon: Bug, color: "text-red-400" },
  story: { icon: Bookmark, color: "text-emerald-400" },
  task: { icon: CheckSquare, color: "text-sky-400" },
  epic: { icon: Layers, color: "text-purple-400" },
};

const priorityColors = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  none: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function IssueCard({ task }) {
  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);

  const issueType = task.issueType?.toLowerCase() || "task";
  const TypeConfig = issueTypeIcons[issueType] || issueTypeIcons.task;
  const TypeIcon = TypeConfig.icon;

  const priority = task.priority?.toLowerCase() || "medium";
  const priorityStyle = priorityColors[priority] || priorityColors.medium;

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className="group relative cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-sky-500/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-sky-400">
          <TypeIcon className={`h-3.5 w-3.5 ${TypeConfig.color}`} />
          <span>{task.issueKey || `TASK-${task._id?.slice(-4)}`}</span>
        </div>
        <span
          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityStyle}`}
        >
          {priority}
        </span>
      </div>

      <h4 className="mt-2 text-sm font-semibold text-foreground group-hover:text-sky-400 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {task.labels?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((l, i) => (
            <span
              key={i}
              className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.storyPoints !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-mono font-bold text-[10px] text-foreground">
              {task.storyPoints}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees?.length > 0 ? (
            task.assignees.slice(0, 3).map((a, idx) => (
              <div
                key={idx}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px] ring-2 ring-card"
                title={a.fullName || a.username || "Assignee"}
              >
                {(a.fullName || a.username || "A")[0].toUpperCase()}
              </div>
            ))
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] ring-2 ring-card">
              <User className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
