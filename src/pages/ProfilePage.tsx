import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getUserResults, getUserProfile, updateProfile } from "@/lib/db";
import { getStats } from "@/lib/storage";
import KeyboardHeatmap from "@/components/KeyboardHeatmap";
import { User, Award, Clock, Target, TrendingUp, Edit2, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string; bio: string | null } | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const localStats = getStats();

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then(p => {
        setProfile(p);
        setEditName(p?.display_name || "");
        setEditBio(p?.bio || "");
      });
      getUserResults(user.id).then(setResults);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfile(user.id, { display_name: editName, bio: editBio });
    setProfile(prev => prev ? { ...prev, display_name: editName, bio: editBio } : prev);
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-14">
        <User className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 font-mono text-xl font-bold">Sign in to view your profile</h2>
        <p className="mb-4 text-sm text-muted-foreground">Your typing stats and progress will be saved</p>
        <Link to="/login" className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground">Log In</Link>
      </div>
    );
  }

  const bestWpm = results.length > 0 ? Math.max(...results.map(r => r.wpm)) : localStats.bestWpm;
  const avgWpm = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length) : localStats.avgWpm;
  const totalTests = results.length || localStats.totalTests;

  return (
    <div className="min-h-screen px-4 pt-24 pb-10">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-1.5 text-lg font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Add a bio..."
                    className="w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 text-sm text-primary">
                    <Check className="h-3 w-3" /> Save
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="font-mono text-2xl font-bold">{profile?.display_name || "Typist"}</h1>
                    <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  {profile?.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <StatBox icon={Award} label="Best WPM" value={bestWpm} />
          <StatBox icon={TrendingUp} label="Avg WPM" value={avgWpm} />
          <StatBox icon={Target} label="Tests" value={totalTests} />
          <StatBox icon={Clock} label="Total Time" value={`${Math.round((results.reduce((s, r) => s + r.duration, 0) || localStats.totalTime) / 60)}m`} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="mb-4 font-mono text-lg font-semibold">Recent Tests</h2>
          {results.length === 0 ? (
            <div className="glass-card p-6 text-center text-muted-foreground">No tests yet. Start typing!</div>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 10).map((result, i) => (
                <div key={i} className="glass-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-2xl font-bold text-primary">{result.wpm}</span>
                    <span className="text-sm text-muted-foreground">WPM</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{result.accuracy}% acc</span>
                    <span className="text-muted-foreground">{result.duration}s</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize">{result.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <KeyboardHeatmap />
        </motion.div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="glass-card flex flex-col items-center gap-1 p-5">
      <Icon className="h-5 w-5 text-primary mb-1" />
      <span className="font-mono text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
