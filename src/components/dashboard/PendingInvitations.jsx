import { useState, useEffect } from "react";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Check, X, Loader2, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function PendingInvitations({ onActionCompleted }) {
  const { user } = useAuthStore();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/projects/invitations/me");
      setInvitations(res.data?.invitations || []);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInvitations();
  }, [user]);

  const handleAction = async (projectId, action) => {
    setProcessingId(projectId);
    try {
      await apiClient.post(`/projects/${projectId}/invitations/${action}`);
      toast.success(`Invitation ${action}ed`);
      setInvitations((prev) => prev.filter((i) => i.projectId !== projectId));
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} invitation`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sky-400">
        <Mail className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Pending Invitations ({invitations.length})</h3>
      </div>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.projectId}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {inv.projectName} <span className="text-xs text-muted-foreground font-mono ml-1">{inv.projectKey}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invited as <span className="font-semibold text-foreground">{inv.role}</span> by{" "}
                {inv.invitedBy?.fullName || inv.invitedBy?.username || "an Admin"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction(inv.projectId, "accept")}
                disabled={processingId === inv.projectId}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
              >
                {processingId === inv.projectId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Accept
              </button>
              <button
                onClick={() => handleAction(inv.projectId, "reject")}
                disabled={processingId === inv.projectId}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
