import { useTaskStore } from "@/store/task.store";
import { IssueCard } from "./IssueCard";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

const COLUMNS = [
  { key: "todo", title: "To Do", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { key: "in_progress", title: "In Progress", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  { key: "done", title: "Done", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
];

export function KanbanBoard({ projectId }) {
  const { tasks, filters, setFilter, openCreateModal } = useTaskStore();

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (
      filters.search &&
      !task.title?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.issueKey?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    // Priority filter
    if (filters.priority !== "all" && task.priority?.toLowerCase() !== filters.priority) {
      return false;
    }
    // IssueType filter
    if (filters.issueType !== "all" && task.issueType?.toLowerCase() !== filters.issueType) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by keyword or key..."
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <select
            value={filters.priority}
            onChange={(e) => setFilter("priority", e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.issueType}
            onChange={(e) => setFilter("issueType", e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="story">Story</option>
            <option value="epic">Epic</option>
          </select>
        </div>

        <button
          onClick={() => openCreateModal("todo")}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Issue
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => {
            const taskStatus =
              typeof t.status === "object"
                ? t.status.name || t.status.category
                : t.status || "todo";
            return taskStatus?.toLowerCase() === col.key;
          });

          return (
            <div
              key={col.key}
              className="flex flex-col rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color.split(" ")[0]}`} />
                  <h3 className="font-semibold text-sm text-foreground">{col.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-bold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateModal(col.key)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={`Add to ${col.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Task Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-center p-4">
                    <p className="text-xs text-muted-foreground font-medium">No tasks in {col.title}</p>
                  </div>
                ) : (
                  colTasks.map((t) => <IssueCard key={t._id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
