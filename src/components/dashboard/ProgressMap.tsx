import { Card } from "@heroui/react";
import { motion } from "framer-motion";

interface ProgressMapProps {
  currentDayNumber: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardProgressMap({
  currentDayNumber,
}: ProgressMapProps) {
  return (
    <motion.div variants={itemVariants} className="mt-6">
      <Card className="glass border border-white/5">
        <Card.Content className="p-6">
          <h3 className="font-bold text-lg mb-4">📅 Tiến trình 20 ngày</h3>
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 20 }, (_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === currentDayNumber;
              const isPast = dayNum < currentDayNumber;

              return (
                <motion.div
                  key={`day-${dayNum}`}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold cursor-default transition-all ${
                    isToday
                      ? "bg-linear-to-br from-primary-500 to-neon-cyan text-white neon-glow"
                      : isPast
                        ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                        : "bg-white/5 text-slate-600 border border-white/5"
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {dayNum}
                </motion.div>
              );
            })}
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
