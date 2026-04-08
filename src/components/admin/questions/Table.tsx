import { Button, Chip, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { Question } from "@/types";

interface TableProps {
  questions: Question[];
  loading: boolean;
  editingQuestion: Question | null;
  filterDayId: string;
  onOpenEdit: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenCreate: () => void;
}

export default function AdminQuestionsTable({
  questions,
  loading,
  editingQuestion,
  filterDayId,
  onOpenEdit,
  onDeleteQuestion,
  onOpenCreate,
}: TableProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-64 rounded-2xl border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Chưa có câu hỏi nào
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          {filterDayId
            ? "Không tìm thấy câu hỏi cho ngày đã chọn"
            : "Bắt đầu bằng cách tạo câu hỏi đầu tiên"}
        </p>
        <Button variant="primary" onPress={onOpenCreate}>
          + Tạo câu hỏi đầu tiên
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnimatePresence>
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.04 }}
            className={`group relative flex flex-col rounded-2xl border bg-white/3 backdrop-blur-sm hover:bg-white/6 transition-all duration-300 overflow-hidden cursor-pointer ${
              editingQuestion?.id === q.id
                ? "border-primary-500/50 ring-1 ring-primary-500/30"
                : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => onOpenEdit(q)}
          >
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-primary-400" />
            <div className="flex flex-col p-5 grow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <span className="text-[10px] uppercase font-bold opacity-80 leading-none">
                      Câu
                    </span>
                    <span className="text-xl font-black leading-none mt-0.5">
                      {q.order}
                    </span>
                  </div>
                  <div>
                    <Chip size="sm" variant="soft" className="mb-1 text-[10px]">
                      Ngày {q.gameDay.dayNumber}
                    </Chip>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="flex items-center gap-1 text-slate-300">
                        <span className="text-amber-400">⭐</span> {q.points} pt
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <span className="text-slate-400">⏱</span>{" "}
                        {q.timeLimitSeconds}s
                      </span>
                    </div>
                  </div>
                </div>

                {q._count.answers > 0 && (
                  <div
                    className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-400"
                    title="Số người đã trả lời"
                  >
                    👥 {q._count.answers}
                  </div>
                )}
              </div>

              <p className="font-semibold text-white text-base leading-snug mb-5 grow">
                {q.questionText}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-auto mb-4">
                {q.options.map((opt, optIndex) => {
                  const letter = ["a", "b", "c", "d"][optIndex] || "?";
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center text-[12px] px-2.5 py-2 rounded-lg border ${
                        opt.isCorrect
                          ? "bg-emerald-500/15 text-emerald-100 border-emerald-500/30"
                          : "bg-white/5 text-slate-300 border-white/5"
                      }`}
                    >
                      <span
                        className={`font-black tracking-wider w-5 shrink-0 ${opt.isCorrect ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        {letter.toUpperCase()}.
                      </span>
                      <span
                        className={`truncate w-full block ${opt.isCorrect ? "font-bold" : "font-medium"}`}
                      >
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => onOpenEdit(q)}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  ✏️ Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => onDeleteQuestion(q.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  🗑 Xóa
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
