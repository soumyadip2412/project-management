import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import SocialButtons from "../components/auth/SocialButtons";

export default function Login() {
    const navigate = useNavigate();

    return (
        <AuthLayout>
            <AuthCard
                title="Sign In"
                subtitle="Welcome back! Please sign in to your account."
            >
                <form style={{ display: "flex", flexDirection: "column", gap: "26px" }}>

                    <AuthInput
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        icon={<Mail size={20} />}
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                    />

                    {/* Remember Me + Forgot Password */}
                    <div className="flex items-center justify-between text-sm">

                        <label className="flex items-center gap-2 text-zinc-400">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-amber-500"
                            />
                            Remember me
                        </label>

                        <button
                            type="button"
                            className="cursor-pointer text-amber-400 transition hover:text-amber-300"
                        >
                            Forgot Password?
                        </button>

                    </div>

                    {/* Sign In */}
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
                        style={{ marginTop: "10px" }}
                    >
                        Sign In
                        <motion.span
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                        >
                            →
                        </motion.span>
                    </motion.button>

                </form>

                {/* Divider */}
                <div className="flex items-center">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="px-3 text-sm text-zinc-500">OR</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <SocialButtons />

                {/* Register */}
                <p className="text-center text-sm text-zinc-400">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-amber-400 hover:text-amber-300"
                    >
                        Create Account
                    </Link>
                </p>

                <div
                    className="flex items-center justify-center gap-3 text-center text-sm text-zinc-400"
                    style={{ marginTop: "auto", paddingTop: "32px" }}
                >
                    <ShieldCheck size={22} className="shrink-0" />
                    <span>We never share your data with anyone. Your data is safe with us.</span>
                </div>

            </AuthCard>
        </AuthLayout>
    );
}
