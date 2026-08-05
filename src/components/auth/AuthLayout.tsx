import type { ReactNode } from "react";
import LeftPanel from "./LeftPanel";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#08090B] text-white overflow-hidden">
            {/* Ambient Glow */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute left-[-150px] top-[-100px] h-[550px] w-[550px] rounded-full bg-amber-500/10 blur-[180px]" />
                <div className="absolute right-[-200px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[180px]" />
            </div>

            <div className="mx-auto flex min-h-screen max-w-[1700px]">
                {/* LEFT */}
                <aside className="hidden w-[44%] lg:flex">
                    <LeftPanel />
                </aside>

                {/* RIGHT */}
                <main className="flex w-[56%] items-center justify-center px-16">
                    {children}
                </main>
            </div>
        </div>
    );
}
