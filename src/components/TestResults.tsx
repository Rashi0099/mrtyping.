import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { TestResult } from "@/lib/storage";
import { RotateCcw, Star, ArrowRight } from "lucide-react";

interface TestResultsProps {
  result: TestResult;
  onRestart: () => void;
  levelNumber?: number | null;
  requiredWpm?: number;
}

function calculateStars(wpm: number, accuracy: number, requiredWpm: number): number {
  if (wpm < requiredWpm || accuracy < 50) return 0;
  
  const wpmRatio = wpm / requiredWpm;
  let stars = 1; // Base star for meeting the requirement
  
  if (wpmRatio >= 1.2 && accuracy >= 70) stars = 2;
  if (wpmRatio >= 1.5 && accuracy >= 80) stars = 3;
  if (wpmRatio >= 1.8 && accuracy >= 90) stars = 4;
  if (wpmRatio >= 2.0 && accuracy >= 95) stars = 5;
  
  return stars;
}

function StarRating({ stars, total = 5 }: { stars: number; total?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
        >
          <Star
            className={`h-8 w-8 ${
              i < stars
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

function getStarMessage(stars: number): string {
  switch (stars) {
    case 0: return "Keep practicing! Try again to pass this level.";
    case 1: return "Level passed! But you can do better.";
    case 2: return "Good job! Nice typing skills.";
    case 3: return "Great work! You're getting fast.";
    case 4: return "Excellent! Almost perfect performance.";
    case 5: return "Perfect! You're a typing master! ⭐";
    default: return "";
  }
}

export default function TestResults({ result, onRestart, levelNumber, requiredWpm }: TestResultsProps) {
  const navigate = useNavigate();
  const isLevelMode = levelNumber !== null && levelNumber !== undefined;
  const stars = isLevelMode ? calculateStars(result.wpm, result.accuracy, requiredWpm || 10) : null;
  const passed = stars !== null && stars > 0;

  const handleNextLevel = () => {
    const nextLevel = (levelNumber || 0) + 1;
    if (nextLevel > 100) {
      navigate("/levels");
      return;
    }
    const difficulty = nextLevel <= 34 ? "beginner" : nextLevel <= 67 ? "intermediate" : "advanced";
    navigate(`/test?difficulty=${difficulty}&level=${nextLevel}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Star Rating for Level Mode */}
      {isLevelMode && stars !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <h2 className="font-mono text-xl font-bold text-foreground">
            Level {levelNumber} {passed ? "Complete!" : "Failed"}
          </h2>
          <StarRating stars={stars} />
          <p className="text-sm text-muted-foreground">{getStarMessage(stars)}</p>
          {requiredWpm && (
            <p className="text-xs text-muted-foreground">
              Required: {requiredWpm} WPM · Your: {result.wpm} WPM
            </p>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        <StatCard label="WPM" value={result.wpm} large />
        <StatCard label="Accuracy" value={`${result.accuracy}%`} large />
        <StatCard label="Time" value={`${result.duration}s`} />
        <StatCard label="Difficulty" value={result.difficulty} />
      </div>

      {Object.keys(result.mistakes).length > 0 && (
        <div className="glass-card p-4 w-full max-w-md">
          <p className="text-sm text-muted-foreground mb-2">Frequent mistakes</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.mistakes)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([key, count]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 font-mono text-sm text-destructive"
                >
                  {key === " " ? "space" : key}
                  <span className="text-xs text-muted-foreground">×{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onRestart}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all hover:opacity-90 ${
            isLevelMode && !passed
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          {isLevelMode && !passed ? "Retry Level" : "Try Again"}
        </button>

        {isLevelMode && passed && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleNextLevel}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Next Level
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        )}

        {isLevelMode && (
          <button
            onClick={() => navigate("/levels")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Levels
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        or press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Tab</kbd> to restart
      </p>
    </motion.div>
  );
}

function StatCard({ label, value, large }: { label: string; value: string | number; large?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-mono font-bold text-primary ${large ? "text-5xl" : "text-2xl"}`}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
