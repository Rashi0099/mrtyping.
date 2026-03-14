import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, Mail, Lock, User, ArrowRight } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/hooks/useAuth";


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, displayName);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Keyboard className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="font-mono text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join Mr Typing and track your progress</p>
        </div>

        {success ? (
          <div className="glass-card p-6 text-center">
            <p className="mb-2 font-medium text-success">Account created!</p>
            <p className="text-sm text-muted-foreground">Check your email to confirm your account, then log in.</p>
            <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:underline">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex w-full items-center justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setLoading(true);
                    const { error: googleErr } = await useAuth().signInWithGoogle?.(credentialResponse.credential) || { error: null };
                    setLoading(false);
                    if (googleErr) setError(googleErr);
                    else navigate("/test");
                  }
                }}
                onError={() => {
                  setError("Google Login Failed");
                }}
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Log in</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
