import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

interface PasswordInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function PasswordInput({
    label,
    className = "",
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label className="block text-sm font-medium text-zinc-300" style={{ marginBottom: "10px" }}>
                {label}
            </label>

            <div className="relative h-14">
                <input
                    {...props}
                    type={showPassword ? "text" : "password"}
                    className={`
            w-full
            h-full
            rounded-lg
            border
            border-zinc-700
            bg-[#0B0F14]
            pl-12
            pr-12
            text-white
            placeholder:text-zinc-500
            outline-none
            transition-all
            duration-200
            focus:border-amber-400
            focus:ring-4
            focus:ring-amber-400/20
            ${className}
          `}
                    style={{ paddingLeft: "48px", paddingRight: "48px" }}
                />

                <LockKeyhole
                    size={20}
                    className="absolute top-1/2 -translate-y-1/2 text-zinc-500"
                    style={{ left: "16px" }}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                    style={{ right: "16px" }}
                >
                    {showPassword ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>
        </div>
    );
}
