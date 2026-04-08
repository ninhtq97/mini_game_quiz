import { Button, Chip, Skeleton, Switch } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameDay } from "@/types";

interface TableProps {
  days: GameDay[];
  loading: boolean;
  editingDay: GameDay | null;
  onOpenEdit: (day: GameDay) => void;
  onDeleteDay: (id: string) => void;
  onToggleActive: (day: GameDay) => void;
  onOpenCreate: () => void;
}

export default function Table({
  days,
  loading,
  editingDay,
  onOpenEdit,
  onDeleteDay,
  onToggleActive,
  onOpenCreate,
}: TableProps) {
  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDayStatus(day: GameDay) {
    const n = Date.now();
    const s = new Date(day.startTime).getTime();
    const e = new Date(day.endTime).getTime();
    if (!day.isActive)
      return { label: "Tắt", color: "default" as const, icon: "⚫" };
    if (n < s)
      return { label: "Sắp diễn ra", color: "warning" as const, icon: "🟡" };
    if (n >= s && n <= e)
      return { label: "Đang diễn ra", color: "success" as const, icon: "🟢" };
    return { label: "Đã kết thúc", color: "danger" as const, icon: "🔴" };
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Chưa có ngày chơi nào
        </h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          Bắt đầu bằng cách tạo ngày chơi đầu tiên cho trò chơi quiz
        </p>
        <Button variant="primary" onPress={onOpenCreate}>
          + Tạo ngày đầu tiên
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {days.map((day, idx) => {
          const status = getDayStatus(day);
          return (
            <motion.div
              key={day.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.04 }}
              className={`group relative rounded-2xl border bg-white/3 backdrop-blur-sm hover:bg-white/6 transition-all duration-300 overflow-hidden cursor-pointer ${
                editingDay?.id === day.id
                  ? "border-primary-500/50 ring-1 ring-primary-500/30"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => onOpenEdit(day)}
            >
              <div
                className={`h-1 w-full ${
                  status.color === "success"
                    ? "bg-linear-to-r from-emerald-500 to-green-400"
                    : status.color === "warning"
                      ? "bg-linear-to-r from-amber-500 to-yellow-400"
                      : status.color === "danger"
                        ? "bg-linear-to-r from-red-500 to-rose-400"
                        : "bg-linear-to-r from-slate-600 to-slate-500"
                }`}
              />

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
                      <span className="text-lg font-black text-primary-400">
                        {day.dayNumber}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm leading-tight truncate">
                        {day.title}
                      </h3>
                      <Chip
                        size="sm"
                        color={status.color}
                        variant="soft"
                        className="mt-1 text-[10px]"
                      >
                        {status.icon} {status.label}
                      </Chip>
                    </div>
                  </div>

                  <Switch
                    size="sm"
                    isSelected={day.isActive}
                    onChange={() => onToggleActive(day)}
                    aria-label="Toggle active"
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-white/5 px-2.5 py-2 text-center">
                    <div className="text-base font-bold text-white">
                      {day._count.questions}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Câu hỏi
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 px-2.5 py-2 text-center">
                    <div className="text-base font-bold text-white">
                      {day._count.dailyResults}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Kết quả
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 text-[10px]">▶</span>
                    <span>{formatDateTime(day.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400 text-[10px]">■</span>
                    <span>{formatDateTime(day.endTime)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onOpenEdit(day)}
                    className="flex-1 text-xs text-slate-300 hover:text-white"
                  >
                    ✏️ Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onDeleteDay(day.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    🗑 Xóa
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
