import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Timer, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useTypingTest } from "@/hooks/useTypingTest";
import { useAuth } from "@/hooks/useAuth";
import TypingDisplay from "@/components/TypingDisplay";
import TestResults from "@/components/TestResults";
import type { Difficulty } from "@/lib/words";

const durations = [15, 30, 60];
const difficulties: {label: string;value: Difficulty;}[] = [
{ label: "Easy", value: "beginner" },
{ label: "Medium", value: "intermediate" },
{ label: "Hard", value: "advanced" }];


export default function TypingTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const initialDifficulty = searchParams.get("difficulty") as Difficulty || "beginner";
  const levelNumber = searchParams.get("level") ? parseInt(searchParams.get("level")!) : null;
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Require login for typing tests
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const test = useTypingTest(duration, difficulty, soundEnabled, user?.id, levelNumber);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>);

  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10 mx-[55px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-6xl mx-0 px-[60px] py-0 my-0">
        
        {!test.isFinished ?
        <>
            {/* Controls */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {durations.map((d) =>
              <button
                key={d}
                onClick={() => setDuration(d)}
                disabled={test.isRunning}
                className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                duration === d ?
                "bg-primary text-primary-foreground" :
                "text-muted-foreground hover:text-foreground"}`
                }>
                
                    {d}s
                  </button>
              )}
              </div>

              <div className="mx-0 my-0 py-0 px-0 items-center justify-start gap-[10px] flex flex-row pr-[43px] pb-0 mr-[85px] pt-0 pl-[24px]">
                {difficulties.map((d) =>
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                disabled={test.isRunning}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                difficulty === d.value ?
                "bg-primary text-primary-foreground" :
                "text-muted-foreground hover:text-foreground"}`
                }>
                
                    {d.label}
                  </button>
              )}
              </div>

              <div className="flex items-center gap-2">
                <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
                
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                onClick={test.reset}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground">
                
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Timer & Stats */}
            <div className="mb-6 flex items-center justify-between">
              


            
              {test.isRunning &&
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>WPM: <span className="font-mono text-foreground">{test.wpm}</span></span>
                  <span>Acc: <span className="font-mono text-foreground">{test.accuracy}%</span></span>
                </div>
            }
            </div>

            {/* Typing Area */}
            <div className="glass-card glow-primary p-8 overflow-hidden mx-0 my-0 pr-[32px] pt-0 pl-[32px] pb-0">
              <TypingDisplay
              text={test.text}
              typed={test.typed}
              currentIndex={test.currentIndex}
              isFinished={test.isFinished} />
            
            </div>

            {!test.isRunning &&
          <p className="mt-4 text-center text-sm text-muted-foreground animate-fade-in">
                Start typing to begin the test
              </p>
          }
          </> :

        test.result &&
        <TestResults
          result={test.result}
          onRestart={test.reset}
          levelNumber={levelNumber}
          requiredWpm={levelNumber ? Math.max(20, Math.round(20 + (levelNumber - 1) * 1.3)) : undefined} />


        }
      </motion.div>
    </div>);

}