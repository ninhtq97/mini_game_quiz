import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import type { GameDayData, QuestionData } from "../../types/play";

interface PlayHeaderProps {
  gameDay: GameDayData | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: QuestionData[];
}

export default function PlayHeader({
  gameDay,
  currentQuestionIndex,
  totalQuestions,
  questions,
}: PlayHeaderProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <Chip color="accent" variant="soft" size="sm" className="mb-1">
            Ngày {gameDay?.dayNumber}
          </Chip>
          <h1 className="text-xl sm:text-2xl font-bold">{gameDay?.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Câu hỏi</p>
          <p className="text-2xl font-bold">
            <span className="text-primary-400">{currentQuestionIndex + 1}</span>
            <span className="text-slate-600">/{totalQuestions}</span>
          </p>
        </div>
      </motion.div>

      {/* Question Progress */}
      <div className="flex gap-2 mb-6">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              !q.answered
                ? i === currentQuestionIndex
                  ? "bg-primary-500"
                  : "bg-white/10"
                : q.userAnswer?.isCorrect
                  ? "bg-neon-green"
                  : "bg-red-500"
            }`}
            layoutId={`progress-${q.id}`}
          />
        ))}
      </div>
    </>
  );
}
