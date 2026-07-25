import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Folder, ArrowLeft, Loader2, Users, Shield, Trash2, Key } from "lucide-react";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/projects/${projectId}`);
        setProject(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/projects/${projectId}`);
      toast.success("Project deleted successfully");
      navigate("/app/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        <p className="mt-3 text-sm text-slate-400">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 py-12 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-white">Project Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">The project you are looking for does not exist or you do not have access.</p>
        <Link
          to="/app/projects"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top back navigation */}
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.key && (
                <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  <Key className="h-3 w-3 text-sky-400" />
                  {project.key}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{project.description || "No description provided."}</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete Project
            </>
          )}
        </button>
      </div>

      {/* Layout Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Tasks & Activity</h2>
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
              <p className="text-sm text-slate-400">No tasks created yet for this project.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-sky-400" />
              Project Members ({project.members?.length || 0})
            </h2>

            <div className="space-y-3">
              {project.members?.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-xs">
                      {m.role?.[0]?.toUpperCase() || "M"}
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      User {m.user?.slice(-6) || m.user}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    {m.role || "member"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
