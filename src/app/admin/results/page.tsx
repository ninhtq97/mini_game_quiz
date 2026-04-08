"use client";

import { Button, Card, Skeleton, toast } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GameDay {
  id: string;
  dayNumber: number;
  title: string;
  _count: { questions: number; dailyResults: number };
}

export default function AdminResultsPage() {
  const [days, setDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/days")
      .then((r) => r.json())
      .then((data) => setDays(data.days || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function calculateResults(dayId: string) {
    setCalculating(dayId);
    try {
      const res = await fetch("/api/admin/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameDayId: dayId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Thành công", {
          description: data.message,
        });
        // Reload days to update counts
        const dRes = await fetch("/api/admin/days");
        const dData = await dRes.json();
        setDays(dData.days || []);
      } else {
        toast.danger("Thất bại", {
          description: data.message,
        });
      }
    } catch (e) {
      console.error(e);
      toast.danger("Lỗi", {
        description: "Đã xảy ra lỗi hệ thống khi tính kết quả",
      });
    } finally {
      setCalculating(null);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">🏆 Tính kết quả</h1>
        <p className="text-slate-400 mt-1">
          Tính toán kết quả và xếp hạng cho từng ngày chơi
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : days.length === 0 ? (
        <Card className="glass border border-white/5">
          <Card.Content className="py-16 text-center">
            <p className="text-slate-400">Chưa có ngày chơi nào</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-3">
          {days.map((day, i) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass border border-white/5">
                <Card.Content className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center font-bold text-primary-400 text-lg">
                        {day.dayNumber}
                      </div>
                      <div>
                        <p className="font-semibold">{day.title}</p>
                        <p className="text-xs text-slate-500">
                          {day._count.questions} câu hỏi ·{" "}
                          {day._count.dailyResults} kết quả
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        day._count.dailyResults > 0 ? "secondary" : "primary"
                      }
                      size="sm"
                      isDisabled={calculating === day.id}
                      onPress={() => calculateResults(day.id)}
                    >
                      {calculating === day.id
                        ? "Đang xử lý..."
                        : day._count.dailyResults > 0
                          ? "Tính lại"
                          : "Tính kết quả"}
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
