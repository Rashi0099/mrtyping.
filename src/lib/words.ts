const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "around", "each", "next", "under", "open", "seem",
  "together", "children", "begin", "while", "last", "never", "small",
  "end", "along", "might", "close", "something", "thought", "head", "hand",
  "enough", "place", "such", "here", "start", "through", "every", "where",
  "much", "before", "line", "right", "too", "mean", "same", "tell", "boy",
  "did", "three", "air", "house", "page", "letter", "mother", "answer",
  "found", "study", "still", "learn", "should", "world", "high", "school",
  "point", "home", "kind", "off", "play", "spell", "add", "try", "ask",
  "men", "went", "read", "long", "change", "went", "light", "many", "move",
  "thing", "help", "must", "big", "old", "different", "keep", "turn",
  "real", "leave", "city", "more", "another", "write", "always", "away",
  "animal", "life", "earth", "eye", "far", "left", "few", "while",
  "number", "always", "show", "part", "below", "story", "young", "example",
  "list", "river", "car", "night", "hard", "main", "name", "power", "run"
];

const intermediateWords = [
  "algorithm", "keyboard", "function", "variable", "database", "network",
  "protocol", "software", "hardware", "interface", "abstract", "construct",
  "framework", "terminal", "compiler", "debugger", "sequence", "parameter",
  "structure", "instance", "platform", "optimize", "generate", "validate",
  "navigate", "encoding", "pipeline", "workflow", "template", "component",
  "analysis", "synthesis", "evaluate", "simulate", "automate", "integrate",
  "synchron", "parallel", "sequence", "manifest", "diagonal", "vertical",
  "gradient", "spectrum", "velocity", "momentum", "friction", "equilib",
  "catalyst", "compound", "electron", "molecule", "particle", "reaction",
  "solution", "equation", "triangle", "cylinder", "diameter", "symmetry",
  "multiple", "fraction", "negative", "positive", "absolute", "relative"
];

const advancedWords = [
  "asynchronous", "authentication", "concatenation", "configuration",
  "decomposition", "encapsulation", "fragmentation", "implementation",
  "juxtaposition", "lexicography", "manifestation", "normalization",
  "orchestration", "parallelogram", "quintessential", "representation",
  "serialization", "transformation", "universality", "visualization",
  "disambiguation", "extrapolation", "heterogeneous", "infrastructure",
  "jurisprudence", "kaleidoscope", "metamorphosis", "onomatopoeia",
  "perpendicular", "quintessence", "reconnaissance", "sophisticated",
  "thermodynamics", "unprecedented", "vulnerability", "xylophone",
  "acknowledgment", "bibliographic", "circumstances", "developmental",
  "electromagnetic", "functionality", "geographically", "hypothetical",
  "interconnected", "jurisdictional", "knowledgeable", "manufacturing"
];

export type Difficulty = "beginner" | "intermediate" | "advanced";

export function generateWords(count: number, difficulty: Difficulty = "beginner"): string[] {
  let wordPool: string[];
  switch (difficulty) {
    case "intermediate":
      wordPool = [...commonWords, ...intermediateWords];
      break;
    case "advanced":
      wordPool = [...intermediateWords, ...advancedWords];
      break;
    default:
      wordPool = commonWords;
  }
  
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
  }
  return words;
}

export function generateText(wordCount: number, difficulty: Difficulty = "beginner"): string {
  return generateWords(wordCount, difficulty).join(" ");
}
