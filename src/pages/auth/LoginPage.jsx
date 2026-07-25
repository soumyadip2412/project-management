import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/constants";
import { publicClient } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await publicClient.post("/auth/login", data);
      const { user, accessToken } = response.data.data;
      setSession({ user, accessToken });
      toast.success("Logged in successfully");
      navigate(ROUTES.dashboard);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-slate-400">Sign in to your account to continue</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end">
          <Link to={ROUTES.forgotPassword} className="text-xs text-sky-400 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to={ROUTES.signup} className="text-sky-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
