/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect, useRef } from "react";
import { generateText, type Difficulty } from "@/lib/words";
import { playKeySound, playErrorSound } from "@/lib/sound";
import { saveResult, type TestResult } from "@/lib/storage";
import { saveResultToDb, saveLevelCompletion } from "@/lib/db";

export interface TypingState {
  text: string;
  typed: string;
  currentIndex: number;
  isRunning: boolean;
  isFinished: boolean;
  timeLeft: number;
  duration: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  mistakes: Record<string, number>;
  result: TestResult | null;
}

function createInitialState(duration: number, difficulty: Difficulty): TypingState {
  return {
    text: generateText(100, difficulty),
    typed: "",
    currentIndex: 0,
    isRunning: false,
    isFinished: false,
    timeLeft: duration,
    duration,
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    mistakes: {},
    result: null,
  };
}

export function useTypingTest(
  duration: number = 30,
  difficulty: Difficulty = "beginner",
  soundEnabled: boolean = true,
  userId?: string | null,
  levelNumber?: number | null
) {
  const [state, setState] = useState<TypingState>(() => createInitialState(duration, difficulty));

  const timerRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const difficultyRef = useRef(difficulty);
  const durationRef = useRef(duration);
  const userIdRef = useRef(userId);
  const levelNumberRef = useRef(levelNumber);

  // Keep refs in sync
  soundEnabledRef.current = soundEnabled;
  difficultyRef.current = difficulty;
  durationRef.current = duration;
  userIdRef.current = userId;
  levelNumberRef.current = levelNumber;

  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState(prev => {
      if (prev.isFinished) return prev;
      const dur = durationRef.current;
      const diff = difficultyRef.current;
      const elapsed = dur - prev.timeLeft || dur;
      const wordsTyped = prev.correctChars / 5;
      const wpm = Math.round((wordsTyped / elapsed) * 60);
      const totalChars = prev.correctChars + prev.incorrectChars;
      const accuracy = totalChars > 0 ? Math.round((prev.correctChars / totalChars) * 100) : 100;

      const result: TestResult = {
        wpm,
        accuracy,
        duration: elapsed,
        difficulty: diff,
        timestamp: Date.now(),
        mistakes: prev.mistakes,
      };
      saveResult(result);

      if (userIdRef.current) {
        saveResultToDb(userIdRef.current, {
          wpm,
          accuracy,
          duration: elapsed,
          difficulty: diff,
          mistakes: prev.mistakes,
        });

        // Save level completion only if user meets the required WPM
        if (levelNumberRef.current) {
          const requiredWpm = Math.max(20, Math.round(20 + (levelNumberRef.current - 1) * 1.3));
          if (wpm >= requiredWpm && accuracy >= 50) {
            saveLevelCompletion(
              userIdRef.current,
              levelNumberRef.current,
              diff,
              wpm,
              accuracy
            );
          }
        }
      }

      return { ...prev, isRunning: false, isFinished: true, wpm, accuracy, result };
    });
  }, []);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0 };
          }
          const elapsed = durationRef.current - prev.timeLeft + 1;
          const wordsTyped = prev.correctChars / 5;
          const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
          return { ...prev, timeLeft: prev.timeLeft - 1, wpm };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning]);

  useEffect(() => {
    if (state.isRunning && state.timeLeft === 0) {
      finishTest();
    }
  }, [state.timeLeft, state.isRunning, finishTest]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(createInitialState(durationRef.current, difficultyRef.current));
  }, []);

  // Single stable keydown handler using refs and functional setState
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setState(createInitialState(durationRef.current, difficultyRef.current));
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length > 1 && e.key !== "Backspace") return;

      setState(prev => {
        if (prev.isFinished) return prev;

        const newState = { ...prev };

        if (!prev.isRunning && e.key.length === 1) {
          newState.isRunning = true;
        }

        if (e.key === "Backspace") {
          if (prev.currentIndex > 0) {
            newState.currentIndex = prev.currentIndex - 1;
            newState.typed = prev.typed.slice(0, -1);
          }
          return newState;
        }

        if (e.key.length === 1) {
          const expectedChar = prev.text[prev.currentIndex];
          const isCorrect = e.key === expectedChar;

          if (isCorrect) {
            newState.correctChars = prev.correctChars + 1;
            if (soundEnabledRef.current) playKeySound();
          } else {
            newState.incorrectChars = prev.incorrectChars + 1;
            const mistakeKey = expectedChar || e.key;
            newState.mistakes = { ...prev.mistakes, [mistakeKey]: (prev.mistakes[mistakeKey] || 0) + 1 };
            if (soundEnabledRef.current) playErrorSound();
          }

          newState.typed = prev.typed + e.key;
          newState.currentIndex = prev.currentIndex + 1;

          const total = newState.correctChars + newState.incorrectChars;
          newState.accuracy = total > 0 ? Math.round((newState.correctChars / total) * 100) : 100;

          if (newState.currentIndex >= prev.text.length) {
            newState.text = prev.text + " " + generateText(50, difficultyRef.current);
          }
        }

        return newState;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty deps — stable listener, no missed keystrokes

  // Reset when duration or difficulty changes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState(createInitialState(duration, difficulty));
  }, [duration, difficulty]);

  return { ...state, reset };
}
