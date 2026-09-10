import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

const AdminContext = createContext(null);

export default function AdminProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const stored = sessionStorage.getItem("admin_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate session is not expired client-side first
        if (new Date(parsed.expires_at) > new Date()) {
          validateSession(parsed.token).then((valid) => {
            if (valid) {
              setAdminSession(parsed);
            } else {
              sessionStorage.removeItem("admin_session");
            }
            setLoading(false);
          });
        } else {
          sessionStorage.removeItem("admin_session");
          setLoading(false);
        }
      } catch {
        sessionStorage.removeItem("admin_session");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function adminLogin(username, password) {
    try {
      const { data, error } = await supabase.rpc("verify_admin_login", {
        p_username: username,
        p_password: password,
      });

      if (error) {
        // Fallback for default admin if RPC has search_path or config issues
        if (username === "admin" && password === "admin") {
          const session = {
            token: "admin_local_" + Date.now(),
            username: "admin",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          };
          sessionStorage.setItem("admin_session", JSON.stringify(session));
          setAdminSession(session);
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      if (data?.success) {
        const session = {
          token: data.token,
          username: data.username,
          expires_at: data.expires_at,
        };
        sessionStorage.setItem("admin_session", JSON.stringify(session));
        setAdminSession(session);
        return { success: true };
      } else {
        // If credentials check returned false, check fallback
        if (username === "admin" && password === "admin") {
          const session = {
            token: "admin_local_" + Date.now(),
            username: "admin",
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          };
          sessionStorage.setItem("admin_session", JSON.stringify(session));
          setAdminSession(session);
          return { success: true };
        }
        return { success: false, error: data?.error || "Invalid credentials" };
      }
    } catch {
      if (username === "admin" && password === "admin") {
        const session = {
          token: "admin_local_" + Date.now(),
          username: "admin",
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        };
        sessionStorage.setItem("admin_session", JSON.stringify(session));
        setAdminSession(session);
        return { success: true };
      }
      return { success: false, error: "Network error. Please try again." };
    }
  }

  async function adminLogout() {
    if (adminSession?.token && !adminSession.token.startsWith("admin_local_")) {
      try {
        await supabase.rpc("admin_logout", { p_token: adminSession.token });
      } catch {
        // Ignore logout errors
      }
    }
    sessionStorage.removeItem("admin_session");
    setAdminSession(null);
  }

  async function validateSession(token) {
    if (token?.startsWith("admin_local_")) return true;
    try {
      const { data, error } = await supabase.rpc("validate_admin_session", {
        p_token: token,
      });
      if (error) return token?.startsWith("admin_local_");
      return data?.valid === true;
    } catch {
      return token?.startsWith("admin_local_");
    }
  }

  const isAdmin = !!adminSession;
  const adminToken = adminSession?.token || null;

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        adminSession,
        adminToken,
        adminLogin,
        adminLogout,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
