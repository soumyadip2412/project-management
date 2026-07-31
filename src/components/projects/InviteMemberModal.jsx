import { useState } from "react";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2, UserPlus, Mail, Shield } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "project_manager", label: "Project Manager", desc: "Full project admin access" },
  { value: "developer", label: "Developer", desc: "Can view and work on tasks" },
  { value: "viewer", label: "Viewer", desc: "Can only view tasks" },
];

export function InviteMemberModal({ isOpen, onClose, projectId, onMemberAdded }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/projects/${projectId}/members`, { email: email.trim(), role });
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("developer");
      onMemberAdded?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-bold text-foreground">Invite Member</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleInvite} className="p-6 space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              The user must already have an account on the platform.
            </p>
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Project Role
            </label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    role === opt.value
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs opacity-70">{opt.desc}</p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 transition-colors ${
                      role === opt.value
                        ? "border-sky-500 bg-sky-500"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {role === opt.value && (
                      <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Send Invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
