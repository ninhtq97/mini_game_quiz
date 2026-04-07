"use client";

import { Card, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Stats {
  totalPlayers: number;
  totalDays: number;
  totalQuestions: number;
  activeDayNumber: number | null;
  totalAnswersToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Người chơi",
      value: stats?.totalPlayers || 0,
      icon: "👥",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      label: "Ngày chơi",
      value: stats?.totalDays || 0,
      icon: "📅",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      label: "Câu hỏi",
      value: stats?.totalQuestions || 0,
      icon: "❓",
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      label: "Ngày đang active",
      value: stats?.activeDayNumber ?? "N/A",
      icon: "🟢",
      color: "from-yellow-500/20 to-orange-500/20",
    },
    {
      label: "Lượt trả lời hôm nay",
      value: stats?.totalAnswersToday || 0,
      icon: "📝",
      color: "from-rose-500/20 to-red-500/20",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">📊 Admin Dashboard</h1>
        <p className="text-slate-400 mb-8">Tổng quan hệ thống Mini Game Quiz</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass border border-white/5">
              <Card.Content className="p-5 text-center">
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 text-xl`}
                >
                  {stat.icon}
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-12 rounded-lg mx-auto mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-slate-500">{stat.label}</p>
              </Card.Content>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
