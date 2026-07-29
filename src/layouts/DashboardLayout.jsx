import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/constants";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/cn";
import {
  Menu,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  SunMedium,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkspaceSwitcher } from "@/components/common/WorkspaceSwitcher";
import { NotificationCenter } from "@/components/common/NotificationCenter";
import { CommandPalette } from "@/components/common/CommandPalette";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.projects, label: "Projects", icon: FolderKanban },
  { to: ROUTES.analytics, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const user = useAuthStore((state) => state.user);
  const isRoleAllowed = useAuthStore((state) => state.isRoleAllowed);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const isSuperAdmin = isRoleAllowed(["super_admin", "org_admin"]);

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.login);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r border-border bg-card/95 px-4 py-5 backdrop-blur transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Header & Brand */}
          <div className="flex items-center justify-between pb-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Sparkles className="h-4 w-4 text-sky-400" />
                {APP_NAME}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Enterprise Project Workspace</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}

            {isSuperAdmin && (
              <NavLink
                to="/app/admin"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-sky-400 hover:bg-sky-500/10"
                  )
                }
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* User & Logout section */}
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold text-xs">
                  {user?.fullName?.[0] || user?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.fullName || user?.username}
                </p>
                <p className="truncate text-[10px] text-muted-foreground uppercase font-mono">
                  {user?.systemRole || "member"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header Bar */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                <Menu className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar}>
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>

              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="relative hidden flex-1 md:flex items-center justify-between rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-sky-400" />
                  <span>Search projects, tasks, or users...</span>
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span>⌘</span>K
                </kbd>
              </button>

              <div className="flex items-center gap-1.5 ml-auto">
                <NotificationCenter />
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[linear-gradient(180deg,_rgba(2,6,23,0.06),_transparent_12rem)]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}