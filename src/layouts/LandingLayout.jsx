import { Outlet } from "react-router-dom";
import { LandingHeader } from "@/components/common/LandingHeader";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(15,23,42,0.92))]">
      <LandingHeader />
      <Outlet />
    </div>
  );
}