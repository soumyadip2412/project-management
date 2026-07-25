import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20 text-2xl">
          ✉️
        </div>
        <h2 className="text-2xl font-semibold text-white">Verify your email</h2>
        <p className="text-sm text-slate-400">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>
      </div>
      <Link
        to={ROUTES.login}
        className="inline-block w-full rounded-xl bg-white py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  );
}
