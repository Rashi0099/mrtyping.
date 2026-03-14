export interface TestResult {
  wpm: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  timestamp: number;
  mistakes: Record<string, number>;
}

export interface UserStats {
  bestWpm: number;
  avgWpm: number;
  totalTests: number;
  totalTime: number;
  history: TestResult[];
  keyMistakes: Record<string, number>;
  unlockedLevels: string[];
}

const STORAGE_KEY = "typeflow_stats";

export function getStats(): UserStats {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return {
    bestWpm: 0,
    avgWpm: 0,
    totalTests: 0,
    totalTime: 0,
    history: [],
    keyMistakes: {},
    unlockedLevels: ["beginner"],
  };
}

export function saveResult(result: TestResult) {
  const stats = getStats();
  stats.history.unshift(result);
  if (stats.history.length > 100) stats.history = stats.history.slice(0, 100);
  
  stats.totalTests += 1;
  stats.totalTime += result.duration;
  stats.bestWpm = Math.max(stats.bestWpm, result.wpm);
  
  const totalWpm = stats.history.reduce((s, r) => s + r.wpm, 0);
  stats.avgWpm = Math.round(totalWpm / stats.history.length);
  
  // Merge mistakes
  for (const [key, count] of Object.entries(result.mistakes)) {
    stats.keyMistakes[key] = (stats.keyMistakes[key] || 0) + count;
  }
  
  // Unlock levels
  if (result.wpm >= 30 && !stats.unlockedLevels.includes("intermediate")) {
    stats.unlockedLevels.push("intermediate");
  }
  if (result.wpm >= 60 && !stats.unlockedLevels.includes("advanced")) {
    stats.unlockedLevels.push("advanced");
  }
  if (result.wpm >= 40 && result.accuracy >= 90 && !stats.unlockedLevels.includes("music")) {
    stats.unlockedLevels.push("music");
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}
