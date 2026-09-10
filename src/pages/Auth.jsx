import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signUp, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    setError(null);
    setSubmitting(true);

    let result;
    if (mode === "signup") {
      result = await signUp(data.email, data.password);
    } else {
      result = await login(data.email, data.password);
    }

    setSubmitting(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-brand-950 to-surface-950 flex items-center justify-center px-4 py-12">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent mb-2">
              ShopHub
            </h1>
            <p className="text-white/40 text-sm">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "login"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === "signup"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 animate-slide-up">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                className={`w-full h-11 px-4 rounded-lg bg-white/5 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500/50" : "border-white/10"
                }`}
                type="email"
                id="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  maxLength: {
                    value: 12,
                    message: "Password must be less than 12 characters",
                  },
                })}
                className={`w-full h-11 px-4 rounded-lg bg-white/5 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                  errors.password ? "border-red-500/50" : "border-white/10"
                }`}
                type="password"
                id="password"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm hover:from-brand-500 hover:to-brand-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-600/25"
            >
              {submitting
                ? "Please wait..."
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social buttons (visual only) */}
          <div className="flex gap-3">
            <button className="flex-1 h-10 rounded-lg border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex-1 h-10 rounded-lg border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-white/30 text-xs mt-6">
          By continuing, you agree to ShopHub's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
