import { NavLink, Outlet } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/constants";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/cn";
import { Menu, MoonStar, PanelLeftClose, PanelLeftOpen, Search, Sparkles, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard" },
  { to: ROUTES.projects, label: "Projects" },
  { to: ROUTES.analytics, label: "Analytics" },
  { to: ROUTES.settings, label: "Settings" },
];

export function DashboardLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card/95 px-4 py-5 backdrop-blur transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between pb-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Sparkles className="h-4 w-4 text-sky-400" />
                {APP_NAME}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Project intelligence workspace</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-slate-300 hover:bg-accent hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium text-foreground">AI assistant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Summarize project risk, surface blockers, and draft status updates automatically.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                <Menu className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar}>
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
              <div className="relative hidden flex-1 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-10 rounded-xl pl-10" placeholder="Search projects, tasks, people" />
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback>PC</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 bg-[linear-gradient(180deg,_rgba(2,6,23,0.06),_transparent_12rem)]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}