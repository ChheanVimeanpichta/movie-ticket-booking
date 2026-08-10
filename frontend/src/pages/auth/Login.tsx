import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const ok = await login(emailOrUsername, password);
      if (ok) {
        navigate("/");
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
    <div className="min-h-screen flex flex-col bg-cine-bg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-cine-border">
        <Link to="/" className="text-2xl font-black text-cine-red tracking-wide">
          CineStar
        </Link>
        <Link
          to="/signup"
          className="rounded-lg border border-cine-border px-4 py-2 text-sm font-medium text-cine-white hover:bg-cine-card-hover transition-colors"
        >
          Sign Up
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-cine-border bg-cine-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-cine-white">Welcome Back</h2>
            <p className="text-sm text-cine-text mt-1">Your cinematic journey continues.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text mb-2">
                Email or Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cine-text" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-cine-border bg-cine-bg pl-10 pr-4 py-3 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cine-text">
                  Password
                </label>
                <Link to="/forgot-password" className="text-cine-red text-xs font-medium hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cine-text" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-cine-border bg-cine-bg pl-10 pr-10 py-3 text-sm text-cine-white placeholder:text-cine-text outline-none transition-colors focus:border-cine-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cine-text hover:text-cine-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-cine-red text-sm text-center -mt-1">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-cine-red py-3 text-sm font-bold text-white transition-colors hover:bg-cine-red/80 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-cine-text mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cine-red font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

