"use client";

import { Card, Chip, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface HistoryDay {
  gameDayId: string;
  dayNumber: number;
  dayTitle: string;
  correctAnswers: number;
  totalDeviation: number;
  totalTimeMs: number;
  dailyScore: number;
  rank: number | null;
  isWinner: boolean;
  questions: {
    questionText: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpentMs: number;
    predictedCount: number | null;
    actualCount: number | null;
    deviation: number | null;
  }[];
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/quiz/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          📋 <span className="gradient-text">Lịch sử chơi</span>
        </h1>
        <p className="text-slate-400 mb-8">Xem lại kết quả các ngày đã chơi</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="glass border border-white/5">
          <Card.Content className="py-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold mb-2">Chưa có lịch sử</h2>
            <p className="text-slate-400">
              Hãy bắt đầu chơi quiz để có lịch sử tại đây!
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((day, i) => (
            <motion.div
              key={day.gameDayId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                type="button"
                className="w-full text-left outline-none"
                onClick={() =>
                  setExpandedDay(
                    expandedDay === day.gameDayId ? null : day.gameDayId,
                  )
                }
              >
                <Card className="glass border border-white/5 hover:border-primary-500/20 transition-colors">
                  <Card.Content className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500/20 to-neon-cyan/20 flex items-center justify-center font-bold text-primary-400">
                          {day.dayNumber}
                        </div>
                        <div>
                          <p className="font-semibold">{day.dayTitle}</p>
                          <div className="flex gap-2 mt-1">
                            <Chip
                              size="sm"
                              variant="soft"
                              color={
                                day.correctAnswers > 0 ? "success" : "default"
                              }
                            >
                              ✅ {day.correctAnswers} đúng
                            </Chip>
                            {day.rank ? (
                              <Chip size="sm" variant="soft" color="accent">
                                #{day.rank}
                              </Chip>
                            ) : null}
                            {day.isWinner ? (
                              <Chip size="sm" variant="soft" color="warning">
                                🏆 Winner
                              </Chip>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-400">
                          {Math.round(day.dailyScore)}
                        </p>
                        <p className="text-xs text-slate-500">điểm</p>
                      </div>
                    </div>

                    {expandedDay === day.gameDayId && day.questions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-white/5 space-y-3"
                      >
                        {day.questions.map((q) => (
                          <div
                            key={q.questionText}
                            className={`p-3 rounded-lg ${
                              q.isCorrect
                                ? "bg-neon-green/5 border border-neon-green/10"
                                : "bg-red-500/5 border border-red-500/10"
                            }`}
                          >
                            <p className="text-sm font-medium mb-2">
                              {q.questionText}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                              <span>{q.isCorrect ? "✅ Đúng" : "❌ Sai"}</span>
                              <span>
                                ⏱ {(q.timeSpentMs / 1000).toFixed(1)}s
                              </span>
                              {q.predictedCount !== null && (
                                <span>
                                  🔮 Dự đoán: {q.predictedCount}
                                  {q.actualCount !== null &&
                                    ` (thực tế: ${q.actualCount})`}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </Card.Content>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
