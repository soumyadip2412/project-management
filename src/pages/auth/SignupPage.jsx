import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/constants";
import { publicClient } from "@/lib/http";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailState, setEmailState] = useState({ checking: false, available: null });
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: "onChange"
  });

  const emailValue = watch("email");

  useEffect(() => {
    if (!emailValue) {
      setEmailState({ checking: false, available: null });
      return;
    }

    // Basic regex check before hitting API
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    if (!isValidFormat) {
      setEmailState({ checking: false, available: null });
      return;
    }

    const checkEmail = async () => {
      setEmailState({ checking: true, available: null });
      try {
        const res = await publicClient.get(`/auth/check-email?email=${encodeURIComponent(emailValue)}`);
        setEmailState({ checking: false, available: res.data.data.available });
      } catch (error) {
        setEmailState({ checking: false, available: null });
      }
    };

    const timeoutId = setTimeout(checkEmail, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [emailValue]);

  const onSubmit = async (data) => {
    if (emailState.available === false) {
      toast.error("Please use a different email address.");
      return;
    }

    setIsLoading(true);
    try {
      await publicClient.post("/auth/register", data);
      toast.success("Account created successfully. Please log in.");
      navigate(ROUTES.login);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailFormatValid = emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Create an account</h2>
        <p className="text-sm text-slate-400">Get started with Project Camp for free</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            {...register("fullName", { required: "Full name is required" })}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="johndoe"
            {...register("username", { required: "Username is required" })}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address"
              }
            })}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-800/60 ${
              emailState.available === false ? "border-red-500/50" : "border-white/10"
            }`}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          
          {/* Email Checklist */}
          {emailValue && (
            <div className="mt-2 space-y-1 rounded-lg bg-slate-950/50 p-3 text-xs">
              <div className="flex items-center gap-2">
                {isEmailFormatValid ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span className={isEmailFormatValid ? "text-slate-300" : "text-slate-500"}>
                  Valid email format
                </span>
              </div>
              <div className="flex items-center gap-2">
                {emailState.checking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
                ) : emailState.available === true ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : emailState.available === false ? (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />
                )}
                <span className={
                  emailState.checking ? "text-sky-400" :
                  emailState.available === true ? "text-emerald-400" :
                  emailState.available === false ? "text-red-400" :
                  "text-slate-500"
                }>
                  {emailState.checking ? "Checking availability..." :
                   emailState.available === true ? "Email is available" :
                   emailState.available === false ? "Email is already in use" :
                   "Email availability"}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
            className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading || emailState.available === false || emailState.checking}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to={ROUTES.login} className="text-sky-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
