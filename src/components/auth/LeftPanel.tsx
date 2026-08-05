import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { CloudUpload, ListTodo, ShieldCheck, Users } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "Secure & Reliable",
        text: "JWT authentication, email verification, and role-based access control.",
    },
    {
        icon: Users,
        title: "Built for Teams",
        text: "Invite members, assign roles, and collaborate seamlessly.",
    },
    {
        icon: ListTodo,
        title: "Organized Workflows",
        text: "Manage tasks, subtasks, notes, and attachments with ease.",
    },
    {
        icon: CloudUpload,
        title: "File Attachments",
        text: "Upload and manage files securely across your projects.",
    },
];

export default function LeftPanel() {
    const { pathname } = useLocation();
    const isRegisterPage = pathname === "/register";

    return (
        <div
            className="relative h-full w-full overflow-hidden"
            style={{ padding: "38px 48px 40px 78px" }}
        >
            <div className="absolute -left-44 top-[-160px] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[170px]" />
            <div className="absolute -bottom-36 -left-24 h-80 w-[440px] rounded-full bg-orange-500/30 blur-[100px]" />

            <div className="relative z-10" style={{ maxWidth: "610px" }}>
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className="flex w-fit items-center gap-2.5 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="black" aria-hidden="true">
                                <polygon points="13,2 4,14 12,14 11,22 20,10 12,10" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Project Camp</h1>
                    </Link>
                </motion.div>

                <div
                    className="inline-flex items-center gap-3 rounded-full border border-amber-400/70 px-4 py-2 text-sm font-medium text-amber-400"
                    style={{ marginTop: "40px", padding: "7px 18px" }}
                >
                    <span>PROJECT MANAGEMENT</span>
                    <span className="text-[10px]">&bull;</span>
                    <span>v1.0.0</span>
                </div>

                <h2
                    className="text-[46px] leading-[1.34] font-bold tracking-tight xl:text-[48px]"
                    style={{ marginTop: "34px" }}
                >
                    {isRegisterPage ? "Welcome to" : "Welcome back to"}
                    <br />
                    <span className="text-amber-400">Project Camp</span>
                </h2>

                <p
                    className="text-lg leading-8 text-zinc-300"
                    style={{ marginTop: "28px", maxWidth: "560px" }}
                >
                    Sign in to continue managing your projects, collaborating with your team,
                    and tracking progress seamlessly.
                </p>

                <div style={{ marginTop: "38px", maxWidth: "560px" }}>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ x: 6 }}
                                className="flex items-start gap-5 border-b border-white/10 last:border-none"
                                style={{ padding: index === 0 ? "0 0 16px" : "16px 0" }}
                            >
                                <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                                    <Icon className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                                    <p
                                        className="mt-1 text-base leading-6 text-zinc-300"
                                        style={{ maxWidth: "390px" }}
                                    >
                                        {feature.text}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
