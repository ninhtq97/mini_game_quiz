import { ProgressBar } from "@heroui/react";
import { motion } from "framer-motion";

interface PlayTimerProps {
  timeLeft: number;
  timeLimitSeconds: number;
}

export default function PlayTimer({
  timeLeft,
  timeLimitSeconds,
}: PlayTimerProps) {
  const timerProgress = (timeLeft / timeLimitSeconds) * 100;

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">Thời gian</span>
        <span
          className={`font-bold ${
            timeLeft <= 5
              ? "text-red-400 animate-pulse"
              : timeLeft <= 10
                ? "text-yellow-400"
                : "text-neon-green"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <ProgressBar
        value={timerProgress}
        color={
          timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warning" : "success"
        }
        className="h-1.5 mb-2"
        aria-label="Timer"
      >
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </motion.div>
  );
}
