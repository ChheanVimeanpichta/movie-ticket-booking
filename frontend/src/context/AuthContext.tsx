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
}

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "cinestar_users";
const CURRENT_USER_KEY = "cinestar_current_user";

function getStoredUsers(): Record<string, { name: string; email: string; password: string; phone: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"login" | "signup">("login");
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const isAuthenticated = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem("cinestar_active_user_email", user.email);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem("cinestar_active_user_email");
    }
    window.dispatchEvent(new Event("cinestar_auth_changed"));
  }, [user]);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    const matchedEntry = Object.values(users).find(
      (u) => (u.email === emailOrUsername || u.name === emailOrUsername) && u.password === password
    );

    if (matchedEntry) {
      const loggedInUser: User = {
        id: crypto.randomUUID(),
        name: matchedEntry.name,
        email: matchedEntry.email,
        phone: matchedEntry.phone || "",
        avatar: "",
      };
      setUser(loggedInUser);
      return true;
    }

    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    if (users[email]) {
      return false;
    }

    users[email] = { name, email, password, phone };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

        const googleUser: User = {
          id: crypto.randomUUID(),
          name: info.name,
          email: info.email,
          phone: "",
          avatar: info.picture,
        };
        setUser(googleUser);

        const users = getStoredUsers();
        users[googleUser.email] = { name: googleUser.name, email: googleUser.email, password: "google-oauth", phone: "" };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        googleResolveRef.current?.(true);
      } catch {
        googleResolveRef.current?.(false);
      }
    },
    onError: () => {
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
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

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
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
