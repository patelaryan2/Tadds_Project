import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAdmin();

  // If already logged in, redirect
  if (isAdmin) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await adminLogin(username, password);
    setSubmitting(false);

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Admin Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Restricted Access</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
          {/* Security icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 animate-slide-up">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                placeholder="Enter admin username"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm hover:from-red-500 hover:to-red-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-600/25 mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs text-white/20">Secured with bcrypt • Rate limited • Session-based auth</span>
        </div>
      </div>
    </div>
  );
}
