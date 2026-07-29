import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Building2, ChevronDown, Plus, Check, Loader2 } from "lucide-react";

export function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, setCurrentWorkspace, setWorkspaces, addWorkspace } =
    useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await apiClient.get("/workspaces");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setWorkspaces(list);
      } catch (err) {
        // Soft fail if no workspaces or endpoint unavailable
      }
    };
    fetchWorkspaces();
  }, [setWorkspaces]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.post("/workspaces", { name: name.trim() });
      const newWs = res.data?.data || res.data;
      addWorkspace(newWs);
      toast.success("Workspace created!");
      setName("");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-2.5 text-left transition-colors hover:bg-muted/70"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {currentWorkspace?.name || "Personal Workspace"}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-2xl border border-border bg-card p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws._id || ws.slug}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <span className="truncate">{ws.name}</span>
                  {currentWorkspace?._id === ws._id && (
                    <Check className="h-4 w-4 text-sky-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-sky-400 hover:bg-sky-500/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">Create Workspace</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Workspaces organize all your team's projects, tasks, and members.
            </p>
            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
