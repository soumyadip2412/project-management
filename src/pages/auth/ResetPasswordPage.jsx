import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Reset password</h2>
        <p className="text-sm text-slate-400">Enter your new password below.</p>
      </div>
      <form className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
        >
          Reset password
        </button>
      </form>
      <p className="text-center text-sm text-slate-400">
        <Link to={ROUTES.login} className="text-sky-400 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
