import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard, Zap, Music, Trophy, BarChart3, ArrowRight } from "lucide-react";

const features = [
  { icon: Zap, title: "Real-time Feedback", desc: "See your accuracy instantly as you type" },
  { icon: Music, title: "Typing Sounds", desc: "Soft piano tones with every keystroke" },
  { icon: Trophy, title: "Levels & Ranks", desc: "Unlock new challenges as you improve" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Heatmaps and progress tracking" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Keyboard className="h-4 w-4" />
            Typing reimagined
          </div>
          <h1 className="mb-4 font-mono text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Mr <span className="text-primary">Typing</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Master your typing with rhythm, sound, and flow.
            A premium typing experience that feels as good as it looks.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/test"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:opacity-90 glow-primary"
            >
              Start Typing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/levels"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Browse Levels
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/30 px-4 py-20">
        <div className="container mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-6"
            >
              <feature.icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6 text-center text-sm text-muted-foreground">
        Mr Typing — Practice typing with purpose
      </footer>
    </div>
  );
}
