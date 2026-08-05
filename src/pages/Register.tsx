import { Link, useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import SocialButtons from "../components/auth/SocialButtons";

export default function Register() {
    const navigate = useNavigate();

    return (
        <AuthLayout>
            <AuthCard
                title="Create Account"
                subtitle="Start collaborating with your team today."
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    <AuthInput
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        icon={<User size={20} />}
                    />

                    <AuthInput
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        icon={<Mail size={20} />}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Create a password"
                    // icon={<Lock size={20} />}
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                    // icon={<Lock size={20} />}
                    />
                </div>

                <motion.button
                    whileHover={{
                        y: -2,
                        scale: 1.01,
                    }}
                    whileTap={{
                        scale: 0.98,
                    }}
                    type="button"
                    onClick={() => navigate("/dashboard")}
className="
                    flex
                    h-14
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-gradient-to-r
                    from-amber-400
                    to-orange-500
                    text-lg
                    font-semibold
                    text-black
                    shadow-lg
                    shadow-orange-500/20
                    transition-all
                "
                >
                    Create Account
                    <motion.span
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                    >
                        →
                    </motion.span>
                </motion.button>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-700" />
                    <span className="text-sm uppercase tracking-wider text-zinc-500">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-zinc-700" />
                </div>

                <SocialButtons />

                <p className="text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-amber-400 hover:text-amber-300"
                    >
                        Sign In
                    </Link>
                </p>

            </AuthCard>
        </AuthLayout>
    );
}
