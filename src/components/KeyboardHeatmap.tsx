import { useMemo } from "react";
import { getStats } from "@/lib/storage";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export default function KeyboardHeatmap() {
  const stats = getStats();
  const maxMistakes = useMemo(() => {
    return Math.max(1, ...Object.values(stats.keyMistakes));
  }, [stats.keyMistakes]);

  if (Object.keys(stats.keyMistakes).length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Complete some typing tests to see your heatmap</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Mistake Heatmap</h3>
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5" style={{ paddingLeft: rowIndex * 16 }}>
            {row.map(key => {
              const mistakes = stats.keyMistakes[key] || 0;
              const intensity = mistakes / maxMistakes;
              const bg = mistakes > 0
                ? `hsl(0, ${Math.round(50 + intensity * 30)}%, ${Math.round(55 - intensity * 20)}%, ${0.2 + intensity * 0.6})`
                : "hsl(var(--secondary))";

              return (
                <div
                  key={key}
                  className="flex h-10 w-10 items-center justify-center rounded-md font-mono text-sm font-medium transition-colors"
                  style={{ backgroundColor: bg, color: mistakes > 0 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
                  title={`${key}: ${mistakes} mistakes`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-secondary" /> No errors
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-destructive/40" /> Some errors
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-destructive/80" /> Many errors
          </span>
        </div>
      </div>
    </div>
  );
}
