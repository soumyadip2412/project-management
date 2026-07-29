import { useState, useEffect } from "react";
import { apiClient } from "@/lib/http";
import { toast } from "sonner";
import { ShieldCheck, Users, Activity, Loader2, UserCheck, UserX, Shield } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users");
      const list = Array.isArray(res.data) ? res.data : res.data?.data?.users || res.data?.data || [];
      setUsers(list);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get("/admin/audit-log");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAuditLogs(list);
    } catch (err) {
      setAuditLogs([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { systemRole: newRole });
      toast.success(`User system role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, systemRole: newRole } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      await apiClient.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User account status updated`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-sky-400" />
            Super Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage system users, assign enterprise permissions, and view global audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          System Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          Audit Trail Log ({auditLogs.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-400" />
          <p className="mt-2 text-sm">Loading admin data...</p>
        </div>
      ) : activeTab === "users" ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">System Role</th>
                  <th className="px-6 py-3">Account Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-xs">
                          {(u.fullName || u.username || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{u.fullName || u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={u.systemRole || "member"}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="org_admin">Org Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${
                          u.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {u.isActive !== false ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {u.isActive !== false ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(u._id, u.isActive !== false)}
                        disabled={updatingId === u._id}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                      >
                        {u.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-foreground mb-4">Global System Audit Logs</h3>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No audit logs recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id} className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex justify-between">
                <div>
                  <span className="font-semibold text-foreground">{log.action}</span> on{" "}
                  <span className="font-mono text-sky-400">{log.entityType}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(log.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
