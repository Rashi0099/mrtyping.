import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchWithAuth, setTokens, clearTokens } from "@/lib/api";

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
  };
}

export interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (credential: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth('/profile/');
      if (res.ok) {
        const data = await res.json();
        const loggedInUser: User = {
          id: data.id.toString(), // user id
          user_metadata: { display_name: data.display_name }
        };
        setUser(loggedInUser);
        setSession({ user: loggedInUser });
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.split('@')[0], email, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: JSON.stringify(data) };
      
      setTokens(data.access, data.refresh);
      await fetchProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.split('@')[0], password })
      });
      const data = await res.json();
      if (!res.ok) return { error: "Invalid credentials" };
      
      setTokens(data.access, data.refresh);
      await fetchProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signInWithGoogle = async (credential: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: credential })
      });
      const data = await res.json();
      if (!res.ok) return { error: "Google authentication failed" };
      
      setTokens(data.access, data.refresh);
      await fetchProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signOut = async () => {
    clearTokens();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
