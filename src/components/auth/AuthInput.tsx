import type { InputHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

export default function AuthInput({
    label,
    icon,
    ...props
}: AuthInputProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className=""
        >
            <label className="block text-sm font-medium text-zinc-300" style={{ marginBottom: "10px" }}>
                {label}
            </label>

            <div
                className="flex h-14 items-center rounded-lg border border-zinc-700 bg-[#0B0F14] transition-all focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20"
                style={{ padding: "0 16px" }}
            >
                {icon && (
                    <div className="shrink-0 text-zinc-500" style={{ marginRight: "12px" }}>
                        {icon}
                    </div>
                )}

                <input
                    {...props}
                    className="h-full w-full bg-transparent text-white placeholder:text-zinc-500 outline-none"
                />
            </div>
        </motion.div>
    );
}
