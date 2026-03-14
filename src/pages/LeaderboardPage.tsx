import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { getLeaderboard } from "@/lib/db";

const rankColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<{ name: string; wpm: number; accuracy: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(20).then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen px-4 pt-24 pb-10">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-mono text-3xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground">Top typists by best WPM</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No results yet. Be the first to type!
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const rank = i + 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card flex items-center gap-4 p-4 ${rank <= 3 ? "border-primary/20" : ""}`}
                >
                  <span className={`font-mono text-xl font-bold w-8 text-center ${rankColors[rank] || "text-muted-foreground"}`}>
                    {rank <= 3 ? <Medal className={`h-6 w-6 ${rankColors[rank]}`} /> : rank}
                  </span>
                  <span className="flex-1 font-medium">{entry.name}</span>
                  <span className="font-mono text-lg font-bold text-primary">{entry.wpm}</span>
                  <span className="text-sm text-muted-foreground">WPM</span>
                  <span className="text-sm text-muted-foreground">{entry.accuracy}%</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
