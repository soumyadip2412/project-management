import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function LandingPage() {
  return (
    <main className="page-shell py-24 text-center">
      <div className="mx-auto max-w-3xl space-y-6">
        <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm text-sky-200">
          Manage everything in one place
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-white">
          Project management built for modern teams
        </h1>
        <p className="text-lg leading-8 text-slate-300">
          Project Camp brings projects, tasks, team collaboration, analytics, and
          AI‑assisted execution into one polished workspace.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to={ROUTES.signup}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
          >
            Get started free
          </Link>
          <Link
            to={ROUTES.login}
            className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
