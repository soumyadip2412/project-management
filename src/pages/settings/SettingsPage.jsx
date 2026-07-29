import { useState, useEffect } from "react";
import { apiClient } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Shield,
  Palette,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  Mail,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  List,
  GanttChart,
  Maximize,
  Minimize,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return (
    <div className="page-shell max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, preferences, and workspace settings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                isActive
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && <ProfileTab user={user} setUser={setUser} />}
        {activeTab === "notifications" && <NotificationsTab user={user} setUser={setUser} />}
        {activeTab === "security" && <SecurityTab user={user} />}
        {activeTab === "appearance" && <AppearanceTab user={user} setUser={setUser} />}
      </div>
    </div>
  );
}

/* ─── Profile Tab ───────────────────────────── */
function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    jobTitle: user?.jobTitle || "",
    department: user?.department || "",
    phone: user?.phone || "",
    timezone: user?.timezone || "Asia/Kolkata",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/auth/update-profile", form);
      const updated = res.data?.data || res.data;
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar + Identity */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold text-xl">
            {user?.fullName?.[0] || user?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-foreground">{user?.fullName || user?.username}</h3>
          <p className="text-sm text-muted-foreground">@{user?.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
          {user?.systemRole || "member"}
        </span>
      </div>

      {/* Editable Fields */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldGroup label="Full Name">
            <Input value={form.fullName} onChange={handleChange("fullName")} placeholder="Your full name" />
          </FieldGroup>

          <FieldGroup label="Username">
            <Input value={user?.username || ""} disabled className="opacity-60 cursor-not-allowed" />
          </FieldGroup>

          <FieldGroup label="Email">
            <Input value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
          </FieldGroup>

          <FieldGroup label="Job Title">
            <Input value={form.jobTitle} onChange={handleChange("jobTitle")} placeholder="e.g. Senior Developer" />
          </FieldGroup>

          <FieldGroup label="Department">
            <Input value={form.department} onChange={handleChange("department")} placeholder="e.g. Engineering" />
          </FieldGroup>

          <FieldGroup label="Phone">
            <Input value={form.phone} onChange={handleChange("phone")} placeholder="+91 98765 43210" />
          </FieldGroup>

          <FieldGroup label="Timezone">
            <select
              value={form.timezone}
              onChange={handleChange("timezone")}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </FieldGroup>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Tab ─────────────────────── */
function NotificationsTab({ user, setUser }) {
  const [prefs, setPrefs] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
    push: user?.preferences?.notifications?.push ?? false,
  });
  const [saving, setSaving] = useState(false);

  const togglePref = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/auth/update-profile", {
        preferences: { notifications: prefs },
      });
      const updated = res.data?.data || res.data;
      setUser(updated);
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const NOTIFICATION_OPTIONS = [
    {
      key: "email",
      icon: Mail,
      title: "Email Notifications",
      desc: "Receive task assignments, comments, and sprint updates via email.",
    },
    {
      key: "inApp",
      icon: Bell,
      title: "In-App Notifications",
      desc: "Get real-time notifications inside the application.",
    },
    {
      key: "push",
      icon: Send,
      title: "Push Notifications",
      desc: "Receive browser push notifications even when the app is in the background.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-1">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5">
          Notification Channels
        </h3>

        <div className="space-y-4">
          {NOTIFICATION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.key}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
                <ToggleSwitch checked={prefs[opt.key]} onToggle={() => togglePref(opt.key)} />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Security Tab ──────────────────────────── */
function SecurityTab({ user }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await apiClient.post("/auth/resend-email-verification");
      toast.success("Verification email sent — check your inbox");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Verification Status */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Email Verification
        </h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            {user?.isEmailVerified ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user?.isEmailVerified ? "Email Verified" : "Email Not Verified"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          {!user?.isEmailVerified && (
            <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resending} className="gap-2">
              {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
              Resend
            </Button>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Change Password
        </h3>

        <div className="space-y-4 max-w-md">
          <FieldGroup label="Current Password">
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={form.oldPassword}
                onChange={handleChange("oldPassword")}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldGroup>

          <FieldGroup label="New Password">
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldGroup>

          <FieldGroup label="Confirm New Password">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Re-enter new password"
            />
          </FieldGroup>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleChangePassword}
            disabled={saving || !form.oldPassword || !form.newPassword}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Appearance Tab ────────────────────────── */
function AppearanceTab({ user, setUser }) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setTheme = useUIStore((s) => s.setTheme);

  const [defaultView, setDefaultView] = useState(user?.preferences?.defaultProjectView || "board");
  const [density, setDensity] = useState(user?.preferences?.density || "comfortable");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/auth/update-profile", {
        preferences: {
          theme,
          defaultProjectView: defaultView,
          density,
        },
      });
      const updated = res.data?.data || res.data;
      setUser(updated);
      toast.success("Appearance preferences saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const THEME_OPTIONS = [
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const VIEW_OPTIONS = [
    { value: "board", icon: LayoutDashboard, label: "Board" },
    { value: "list", icon: List, label: "List" },
    { value: "timeline", icon: GanttChart, label: "Timeline" },
  ];

  const DENSITY_OPTIONS = [
    { value: "comfortable", icon: Maximize, label: "Comfortable" },
    { value: "compact", icon: Minimize, label: "Compact" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        {/* Theme */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Theme</h3>
          <div className="flex gap-3">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === "system") {
                      // For system, we'd need more logic. For now toggle.
                      if (theme !== opt.value) setTheme?.(opt.value) || toggleTheme();
                    } else if (theme !== opt.value) {
                      toggleTheme();
                    }
                  }}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 min-w-[100px] transition-all ${
                    isActive
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Project View */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Default Project View
          </h3>
          <div className="flex gap-3">
            {VIEW_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = defaultView === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDefaultView(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 min-w-[100px] transition-all ${
                    isActive
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Density */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Display Density
          </h3>
          <div className="flex gap-3">
            {DENSITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = density === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDensity(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 min-w-[100px] transition-all ${
                    isActive
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Appearance
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─────────────────────── */
function FieldGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-sky-500" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
