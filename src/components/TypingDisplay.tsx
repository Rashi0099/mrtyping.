import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingDisplayProps {
  text: string;
  typed: string;
  currentIndex: number;
  isFinished: boolean;
}

export default function TypingDisplay({ text, typed, currentIndex, isFinished }: TypingDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, height: 0 });
  const [showCursor, setShowCursor] = useState(true);

  const chars = useMemo(() => {
    const visibleText = text.slice(0, 300);
    return visibleText.split("").map((char, i) => {
      let status: "pending" | "correct" | "incorrect" = "pending";
      if (i < typed.length) {
        status = typed[i] === char ? "correct" : "incorrect";
      }
      const isCursor = i === currentIndex && !isFinished;
      return { char, status, isCursor, index: i };
    });
  }, [text, typed, currentIndex, isFinished]);

  // Smooth cursor position tracking
  useEffect(() => {
    if (isFinished) return;
    const el = cursorRef.current;
    if (el) {
      const container = containerRef.current;
      const containerRect = container?.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      if (containerRect) {
        setCursorPos({
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          height: rect.height,
        });
      }
    }
  }, [currentIndex, isFinished, chars]);

  // Cursor blink on idle
  useEffect(() => {
    setShowCursor(true);
    const timeout = setTimeout(() => {
      // Start blinking after 500ms idle
    }, 500);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="relative font-mono text-[1.35rem] sm:text-[1.6rem] leading-[2.2] tracking-wide select-none break-normal whitespace-normal" style={{ wordBreak: 'normal', overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'none' }}>
      {/* Smooth animated cursor */}
      {!isFinished && (
        <motion.span
          className="absolute w-[2.5px] rounded-full bg-[hsl(var(--typing-cursor))] pointer-events-none z-10"
          animate={{
            x: cursorPos.x,
            y: cursorPos.y + 4,
            height: cursorPos.height - 8,
            opacity: showCursor ? [1, 1, 0.3, 1] : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 800, damping: 45, mass: 0.3 },
            y: { type: "spring", stiffness: 800, damping: 45, mass: 0.3 },
            height: { type: "spring", stiffness: 800, damping: 45, mass: 0.3 },
            opacity: {
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{ willChange: "transform" }}
        />
      )}

      {chars.map(({ char, status, isCursor, index }) => (
        <span
          key={index}
          ref={isCursor ? cursorRef : undefined}
          className={`relative inline transition-colors duration-75 ease-out ${
            status === "correct"
              ? "typing-char-correct"
              : status === "incorrect"
              ? "typing-char-incorrect"
              : "typing-char-pending"
          }`}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
