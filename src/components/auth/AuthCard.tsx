import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthCard({
    title,
    subtitle,
    children,
}: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[720px] rounded-3xl border border-white/10 bg-[#0E1117]/80 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            style={{ minHeight: "835px", padding: "58px 68px", display: "flex", flexDirection: "column" }}
        >
            <h1 className="text-5xl font-bold tracking-tight">
                {title}
            </h1>

            <p className="text-lg text-zinc-400" style={{ marginTop: "16px" }}>
                {subtitle}
            </p>

            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "30px", marginTop: "44px" }}>
                {children}
            </div>
        </motion.div>
    );
}
