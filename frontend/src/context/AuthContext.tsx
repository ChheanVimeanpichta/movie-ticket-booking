import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role?: "Admin" | "Staff" | "Customer";
}

import AccountDisabledModal from "../components/shared/AccountDisabledModal";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  googleSignIn: () => Promise<boolean>;
  logout: () => void;
  isLoginPopupOpen: boolean;
  popupMode: "login" | "signup";
  openLoginPopup: (onSuccess?: () => void) => void;
  closeLoginPopup: () => void;
  switchToSignup: () => void;
  switchToLogin: () => void;
  accountDisabledNotice: {
    isOpen: boolean;
    email?: string;
    message?: string;
  } | null;
  showAccountDisabledNotice: (email?: string, message?: string) => void;
  closeAccountDisabledNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "cinestar_users";
const CURRENT_USER_KEY = "cinestar_current_user";

function getStoredUsers(): Record<string, { name: string; email: string; password: string; phone: string; avatar?: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Clear any legacy persistent user from localStorage so default run is not signed in
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem("cinestar_active_user_email");
      localStorage.removeItem("cinestar_profile");
    } catch {}

    try {
      const saved = sessionStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"login" | "signup">("login");
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const [accountDisabledNotice, setAccountDisabledNotice] = useState<{
    isOpen: boolean;
    email?: string;
    message?: string;
  } | null>(null);

  const showAccountDisabledNotice = useCallback((email?: string, message?: string) => {
    setIsLoginPopupOpen(false);
    setAccountDisabledNotice({
      isOpen: true,
      email,
      message:
        message ||
        "Your account has been disabled by an administrator. Access to booking, active sessions, and reservations has been suspended.",
    });
  }, []);

  const closeAccountDisabledNotice = useCallback(() => {
    setAccountDisabledNotice(null);
  }, []);

  const handleDisabledUser = useCallback(
    (userEmail: string, customMessage?: string) => {
      setUser(null);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem("cinestar_active_user_email");
      sessionStorage.removeItem("cinestar_profile");
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem("cinestar_active_user_email");
      localStorage.removeItem("cinestar_profile");
      const users = getStoredUsers();
      delete users[userEmail.toLowerCase()];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      window.dispatchEvent(new Event("cinestar_auth_changed"));
      showAccountDisabledNotice(userEmail, customMessage);
    },
    [showAccountDisabledNotice]
  );

  const isAuthenticated = user !== null;

  useEffect(() => {
    if (!user?.email) {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem("cinestar_active_user_email");
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem("cinestar_active_user_email");
      window.dispatchEvent(new Event("cinestar_auth_changed"));
      return;
    }

    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    sessionStorage.setItem("cinestar_active_user_email", user.email);

    const verifyStatus = () => {
      fetch(`http://localhost:5000/api/customers/status/${encodeURIComponent(user.email)}`)
        .then((res) => {
          if (res.status === 403) {
            return { isSuspended: true };
          }
          return res.json();
        })
        .then((data) => {
          if (data && (data.isSuspended || data.status === "Suspended")) {
            handleDisabledUser(user.email);
          } else if (data && data.role) {
            setUser((prev) => {
              if (!prev) return null;
              if (prev.role === data.role) return prev;
              return { ...prev, role: data.role };
            });
          }
        })
        .catch(() => {});
    };

    verifyStatus();
    const interval = setInterval(verifyStatus, 10000);
    const onFocus = () => verifyStatus();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [user?.email, handleDisabledUser]);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<boolean> => {
    let networkFailed = false;

    // 1. Try real-time authentication against CineStar Admin Backend
    try {
      const res = await fetch("http://localhost:5000/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.message ||
          "Your account has been disabled by an administrator. Please contact support.";
        // Account disabled by admin: purge local and session storage so user cannot login
        const users = getStoredUsers();
        delete users[emailOrUsername.toLowerCase()];
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        sessionStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem("cinestar_active_user_email");
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem("cinestar_active_user_email");
        showAccountDisabledNotice(emailOrUsername, msg);
        throw new Error(msg);
      }

      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          if (data.customer.status === "Suspended") {
            const users = getStoredUsers();
            delete users[emailOrUsername.toLowerCase()];
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            sessionStorage.removeItem(CURRENT_USER_KEY);
            sessionStorage.removeItem("cinestar_active_user_email");
            localStorage.removeItem(CURRENT_USER_KEY);
            localStorage.removeItem("cinestar_active_user_email");
            const msg =
              "Your account has been disabled by an administrator. Please contact support.";
            showAccountDisabledNotice(emailOrUsername, msg);
            throw new Error(msg);
          }

          const loggedInUser: User = {
            id: data.customer.id,
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone || "",
            avatar: data.customer.avatarUrl || "",
            role: data.customer.role || (data.customer.email.toLowerCase() === "admin@gmail.com" ? "Admin" : "Customer"),
          };
          setUser(loggedInUser);

          // Mirror into local storage
          const users = getStoredUsers();
          users[data.customer.email.toLowerCase()] = {
            name: data.customer.name,
            email: data.customer.email.toLowerCase(),
            password,
            phone: data.customer.phone || "",
            avatar: data.customer.avatarUrl || "",
          };
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          return true;
        }
      }

      // Backend responded with 401 or failure: DO NOT use local storage fallback!
      return false;
    } catch (err: any) {
      if (err.message && (err.message.includes("disabled") || err.message.includes("support"))) {
        throw err;
      }
      // Only trigger local storage fallback if the backend server is unreachable
      networkFailed = true;
    }

    // 2. Local storage fallback ONLY when offline
    if (networkFailed) {
      const users = getStoredUsers();
      const query = emailOrUsername.toLowerCase();
      const matchedEntry = Object.values(users).find(
        (u) => (u.email.toLowerCase() === query || u.name.toLowerCase() === query) && u.password === password
      );

      if (matchedEntry) {
        const loggedInUser: User = {
          id: crypto.randomUUID(),
          name: matchedEntry.name,
          email: matchedEntry.email,
          phone: matchedEntry.phone || "",
          avatar: matchedEntry.avatar || "",
        };
        setUser(loggedInUser);
        return true;
      }
    }

    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    let createdCustId = crypto.randomUUID();

    // 1. Real-time synchronization to CineStar Admin Backend
    try {
      const res = await fetch("http://localhost:5000/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(),
          password,
          phone,
          avatarUrl: "",
        }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.message ||
          "This account has been disabled by an administrator. Please contact support.";
        showAccountDisabledNotice(email, msg);
        throw new Error(msg);
      }

      if (res.ok) {
        const data = await res.json();
        if (data.customer?.id) {
          createdCustId = data.customer.id;
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("disabled") || err.message.includes("support"))) {
        throw err;
      }
      // Offline fallback: data is preserved in localStorage
    }

    // 2. Store in local state & auto-authenticate the created customer
    const users = getStoredUsers();
    users[email.toLowerCase()] = { name, email: email.toLowerCase(), password, phone, avatar: "" };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const newUser: User = {
      id: createdCustId,
      name,
      email: email.toLowerCase(),
      phone,
      avatar: "",
      role: email.toLowerCase() === "admin@gmail.com" ? "Admin" : "Customer",
    };
    setUser(newUser);

    window.dispatchEvent(new Event("cinestar_auth_changed"));
    return true;
  }, []);

  const googleResolveRef = useRef<((ok: boolean) => void) | null>(null);

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (credentialResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${credentialResponse.access_token}` },
        });
        const info: GoogleUserInfo = await res.json();
        const normalizedEmail = info.email.toLowerCase();

        // 1. Check if customer account is disabled/suspended in CineStar Admin Suite
        try {
          const statusRes = await fetch(
            `http://localhost:5000/api/customers/status/${encodeURIComponent(normalizedEmail)}`
          );
          if (statusRes.status === 403) {
            handleDisabledUser(normalizedEmail);
            googleResolveRef.current?.(false);
            return;
          }
          const statusData = await statusRes.json().catch(() => ({}));
          if (statusData && (statusData.isSuspended || statusData.status === "Suspended")) {
            handleDisabledUser(normalizedEmail);
            googleResolveRef.current?.(false);
            return;
          }
        } catch {}

        let customerId = crypto.randomUUID();
        let customerRole = normalizedEmail === "admin@gmail.com" ? "Admin" : "Customer";
        let customerPhone = "";

        // 2. Real-time synchronization to CineStar Admin Backend & MySQL Database
        try {
          const regRes = await fetch("http://localhost:5000/api/customers/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: info.name || info.email.split("@")[0],
              email: normalizedEmail,
              password: "google-oauth",
              phone: "",
              avatarUrl: info.picture || "",
              googleId: info.sub,
            }),
          });
          if (regRes.ok) {
            const regJson = await regRes.json();
            if (regJson?.customer) {
              customerId = regJson.customer.id;
              customerRole = regJson.customer.role || customerRole;
              customerPhone = regJson.customer.phone || "";
            }
          }
        } catch {
          // Offline fallback
        }

        const googleUser: User = {
          id: customerId,
          name: info.name || info.email.split("@")[0],
          email: normalizedEmail,
          phone: customerPhone,
          avatar: info.picture || "",
          role: customerRole as any,
        };
        setUser(googleUser);

        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
        sessionStorage.setItem("cinestar_active_user_email", googleUser.email);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
        localStorage.setItem("cinestar_active_user_email", googleUser.email);

        const users = getStoredUsers();
        users[googleUser.email] = {
          name: googleUser.name,
          email: googleUser.email,
          password: "google-oauth",
          phone: customerPhone,
          avatar: googleUser.avatar,
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        window.dispatchEvent(new Event("cinestar_auth_changed"));
        googleResolveRef.current?.(true);
      } catch (err) {
        console.error("Google sign-in error:", err);
        googleResolveRef.current?.(false);
      }
    },
    onError: (err) => {
      console.warn("Google login cancelled or error:", err);
      googleResolveRef.current?.(false);
    },
  });

  const googleSignIn = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      googleResolveRef.current = resolve;
      googleLogin();
    });
  }, [googleLogin]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const users = getStoredUsers();
      if (users[updated.email]) {
        users[updated.email] = {
          ...users[updated.email],
          name: updated.name,
          phone: updated.phone,
          avatar: updated.avatar || "",
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Real-time update to CineStar Admin Backend
        try {
          fetch("http://localhost:5000/api/customers/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: updated.name,
              email: updated.email,
              phone: updated.phone,
              avatarUrl: updated.avatar,
            }),
          }).catch(() => {});
        } catch {}
      }
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    if (user?.email) {
      fetch("http://localhost:5000/api/customers/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.name }),
      }).catch(() => {});
    }
    setUser(null);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem("cinestar_active_user_email");
    sessionStorage.removeItem("cinestar_profile");
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("cinestar_active_user_email");
    localStorage.removeItem("cinestar_profile");
    window.dispatchEvent(new Event("cinestar_auth_changed"));
  }, [user]);

  const openLoginPopup = useCallback((onSuccess?: () => void) => {
    setPopupMode("login");
    setIsLoginPopupOpen(true);
    if (onSuccess) {
      setPendingCallback(() => onSuccess);
    }
  }, []);

  const closeLoginPopup = useCallback(() => {
    setIsLoginPopupOpen(false);
    setPendingCallback(null);
  }, []);

  const switchToSignup = useCallback(() => setPopupMode("signup"), []);
  const switchToLogin = useCallback(() => setPopupMode("login"), []);

  const handleLoginSuccess = useCallback(
    (callback: (() => void) | null) => {
      closeLoginPopup();
      if (callback) {
        setTimeout(callback, 100);
      }
    },
    [closeLoginPopup]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        updateUser,
        login,
        signup,
        googleSignIn,
        logout,
        isLoginPopupOpen,
        popupMode,
        openLoginPopup,
        closeLoginPopup,
        switchToSignup,
        switchToLogin,
        accountDisabledNotice,
        showAccountDisabledNotice,
        closeAccountDisabledNotice,
      }}
    >
      {children}
      {isLoginPopupOpen && (
        <LoginPopupWrapper
          mode={popupMode}
          onClose={closeLoginPopup}
          onSwitchToSignup={switchToSignup}
          onSwitchToLogin={switchToLogin}
          onSuccess={() => handleLoginSuccess(pendingCallback)}
        />
      )}
      {accountDisabledNotice?.isOpen && (
        <AccountDisabledModal
          isOpen={accountDisabledNotice.isOpen}
          email={accountDisabledNotice.email}
          message={accountDisabledNotice.message}
          onClose={closeAccountDisabledNotice}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { X, User, Lock, Eye, EyeOff, Mail, Phone } from "lucide-react";

function LoginPopupWrapper({
  mode,
  onClose,
  onSwitchToSignup,
  onSwitchToLogin,
  onSuccess,
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}) {
  if (mode === "login") {
    return (
      <LoginPopupContent
        onClose={onClose}
        onSwitchToSignup={onSwitchToSignup}
        onSuccess={onSuccess}
      />
    );
  }
  return (
    <SignupPopupContent
      onClose={onClose}
      onSwitchToLogin={onSwitchToLogin}
      onSuccess={onSuccess}
    />
  );
}

function LoginPopupContent({
  onClose,
  onSwitchToSignup,
  onSuccess,
}: {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSuccess: () => void;
}) {
  const { login, googleSignIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const ok = await login(emailOrUsername, password);
      if (ok) {
        onSuccess();
      } else {
        setError("Invalid email/username or password.");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const ok = await googleSignIn();
      if (ok) {
        onSuccess();
      } else {
        setError("Google sign-in was cancelled or failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-cine-text transition-colors hover:text-cine-white"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-cine-red">CineStar</h3>
          <h4 className="text-lg font-bold text-cine-white mt-3">Welcome Back</h4>
          <p className="text-xs text-cine-text mt-1">Sign in to continue booking</p>
        </div>

        {/* Google One-Click Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-cine-border bg-cine-bg/80 py-2.5 px-4 text-sm font-semibold text-cine-white transition-all hover:bg-white/5 hover:border-white/30 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isGoogleSubmitting ? "Connecting to Google..." : "Sign in with Google"}
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cine-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-cine-card px-2 text-cine-text font-medium text-[11px]">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-3 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-9 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cine-text hover:text-cine-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <p className="text-cine-red text-xs text-center -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full rounded-lg bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/80 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-cine-text mt-5">
          Don't have an account?{" "}
          <button onClick={onSwitchToSignup} className="text-cine-red font-medium hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

function SignupPopupContent({
  onClose,
  onSwitchToLogin,
  onSuccess,
}: {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}) {
  const { signup, googleSignIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const ok = await signup(name, email, password, phone);
      if (ok) {
        onSwitchToLogin();
      } else {
        setError("An account with this email already exists.");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const ok = await googleSignIn();
      if (ok) {
        onSuccess();
      } else {
        setError("Google sign-in was cancelled or failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-cine-border bg-cine-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-cine-text transition-colors hover:text-cine-white"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-cine-red">CineStar</h3>
          <h4 className="text-lg font-bold text-cine-white mt-3">Create Account</h4>
          <p className="text-xs text-cine-text mt-1">Join CineStar and book your seats</p>
        </div>

        {/* Google One-Click Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-cine-border bg-cine-bg/80 py-2.5 px-4 text-sm font-semibold text-cine-white transition-all hover:bg-white/5 hover:border-white/30 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isGoogleSubmitting ? "Connecting to Google..." : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cine-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-cine-card px-2 text-cine-text font-medium text-[11px]">
              Or create with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-3 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-3 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-3 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cine-text" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-lg border border-cine-border bg-cine-bg pl-9 pr-9 py-2.5 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cine-text hover:text-cine-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && <p className="text-cine-red text-xs text-center -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full rounded-lg bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/80 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-cine-text mt-5">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-cine-red font-medium hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
