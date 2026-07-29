import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/http";
import { Search, Folder, CheckSquare, Users, Sparkles, X, Loader2 } from "lucide-react";

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ projects: [], tasks: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open trigger handled outside
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], tasks: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
        const data = res.data?.data || res.data || {};
        setResults({
          projects: data.projects || [],
          tasks: data.tasks || [],
          users: data.users || [],
        });
      } catch (err) {
        // Fallback quiet handle
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="h-5 w-5 text-sky-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, or users (Cmd + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-sky-400 shrink-0 ml-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto text-sky-400/50 mb-2" />
              <p className="text-sm font-medium">Type to start searching...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Find projects by name, issues by title/key, or teammates by name.
              </p>
            </div>
          )}

          {results.projects?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-sky-400" /> Projects
              </p>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/app/projects/${p._id}`);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{p.key || p._id?.slice(-6)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.tasks?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-sky-400" /> Issues
              </p>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => {
                      navigate(`/app/projects/${t.project}`);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs text-sky-400 font-semibold">{t.issueKey || "TASK"}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {t.status?.name || t.status || "todo"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.users?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-sky-400" /> Users
              </p>
              <div className="space-y-1">
                {results.users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{u.fullName || u.username}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() &&
            !loading &&
            !results.projects?.length &&
            !results.tasks?.length &&
            !results.users?.length && (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No matches found for "{query}"</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
