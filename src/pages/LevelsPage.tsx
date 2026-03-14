import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Unlock, Keyboard, Music, Zap, Skull, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getLevelCompletions } from "@/lib/db";

const levels = [
  {
    id: "beginner",
    title: "Beginner",
    desc: "Common words, easy pace",
    icon: Keyboard,
    unlockReq: "Always unlocked",
    difficulty: "beginner" as const,
    color: "text-success",
    music: "Calm Piano - Yiruma",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    desc: "Technical words, moderate challenge",
    icon: Zap,
    unlockReq: "Reach 30 WPM",
    difficulty: "intermediate" as const,
    color: "text-primary",
    music: "Energetic Beat - Alan Walker",
  },
  {
    id: "advanced",
    title: "Advanced",
    desc: "Complex vocabulary, high speed required",
    icon: Skull,
    unlockReq: "Reach 60 WPM",
    difficulty: "advanced" as const,
    color: "text-destructive",
    music: "Fast Tempo - The Chainsmokers",
  },
  {
    id: "music",
    title: "Music Rhythm",
    desc: "Type in sync with the beat",
    icon: Music,
    unlockReq: "40 WPM + 90% accuracy",
    difficulty: "beginner" as const,
    color: "text-accent",
    music: "Upbeat Pop - Marshmello",
  },
];

const hundredLevelTrack = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const requiredWpm = Math.max(20, Math.round(20 + (number - 1) * 1.3));
  const difficulty = number <= 34 ? "beginner" : number <= 67 ? "intermediate" : "advanced";
  
  // Assign popular songs to levels
  const musicTracks = [
    "Shape of You - Ed Sheeran",
    "Blinding Lights - The Weeknd",
    "Levitating - Dua Lipa",
    "Watermelon Sugar - Harry Styles",
    "Don't Start Now - Dua Lipa",
    "Someone You Loved - Lewis Capaldi",
    "Dance Monkey - Tones and I",
    "Circles - Post Malone",
    "Memories - Maroon 5",
    "Señorita - Shawn Mendes",
  ];

  return {
    id: `level-${number}`,
    number,
    requiredWpm,
    difficulty: difficulty as "beginner" | "intermediate" | "advanced",
    music: musicTracks[number % musicTracks.length],
  };
});

export default function LevelsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(true);

  useEffect(() => {
    // Require login
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      getLevelCompletions(user.id).then((data) => {
        setCompletedLevels(data.map((c) => c.level_number));
        setLoadingCompletions(false);
      });
    }
  }, [user]);

  if (loading || loadingCompletions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-10">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-mono text-3xl font-bold">Levels</h1>
          <p className="mb-8 text-muted-foreground">Progress through difficulty tiers and unlock all 100 typing levels</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="font-mono text-2xl font-bold">100 Level Typing Track</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            🎵 Each level has its own famous music track! Complete levels to unlock the next one.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hundredLevelTrack.map((level) => {
              // Level 1 is always unlocked, others require previous level completion
              const unlocked = level.number === 1 || completedLevels.includes(level.number - 1);
              const completed = completedLevels.includes(level.number);

              return unlocked ? (
                <Link
                  key={level.id}
                  to={`/test?difficulty=${level.difficulty}&level=${level.number}`}
                  className={`glass-card flex flex-col justify-between p-4 transition-all hover:border-primary/30 ${
                    completed ? "border-success/50" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">Level {level.number}</p>
                      {completed ? (
                        <span className="text-xs text-success">✓ Completed</span>
                      ) : (
                        <Unlock className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">🎵 {level.music}</p>
                    <p className="text-xs text-muted-foreground">Goal: {level.requiredWpm} WPM</p>
                  </div>
                </Link>
              ) : (
                <div key={level.id} className="glass-card flex flex-col justify-between p-4 opacity-50">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">Level {level.number}</p>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">🎵 {level.music}</p>
                    <p className="text-xs text-muted-foreground">
                      🔒 Complete Level {level.number - 1}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
