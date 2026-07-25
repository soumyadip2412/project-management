import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Plus, FolderPlus, Folder, Loader2, X, Users, ArrowRight, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/projects");
      // res.data will be the array of projects
      setProjects(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/projects", {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Project created successfully!");
      setName("");
      setDescription("");
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    setDeletingId(id);
    try {
      await apiClient.delete(`/projects/${id}`);
      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Folder className="h-7 w-7 text-sky-400" />
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage, track, and organize all your workspace projects.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p className="mt-3 text-sm text-slate-400">Loading your projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
            <FolderPlus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No projects yet</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            Get started by creating your first project to organize tasks, sprints, and team members.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-200 hover:border-sky-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-sky-500/5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base group-hover:text-sky-300 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {project._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project._id, e)}
                    disabled={deletingId === project._id}
                    title="Delete project"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deletingId === project._id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="mt-4 text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span>{project.members?.length || 1} member(s)</span>
                </div>
                <Link
                  to={`/app/projects/${project._id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-sky-400" />
                Create New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the scope, goals, or objectives of this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
