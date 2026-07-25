import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center px-4">
      <p className="text-8xl font-bold text-white/10">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to={ROUTES.landing}
        className="mt-8 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
