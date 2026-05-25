import { Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur">
      <div className="page-shell flex items-center justify-between">
        <Link to={ROUTES.landing} className="text-lg font-semibold tracking-tight text-white">
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
            <Link to={ROUTES.login}>Sign in</Link>
          </Button>
          <Button asChild className="bg-white text-slate-950 hover:bg-slate-200">
            <Link to={ROUTES.signup}>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}