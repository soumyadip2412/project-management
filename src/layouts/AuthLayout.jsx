import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(15,23,42,1),_rgba(15,23,42,0.96))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm text-sky-200">
              Enterprise project delivery for modern teams
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white">
              Move from fragmented work to a single execution system.
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Project Camp brings projects, tasks, team collaboration, analytics, and AI-assisted execution into one polished workspace.
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}