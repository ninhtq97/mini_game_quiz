"use client";

import { Button, Card, Chip, ProgressBar, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface DashboardData {
  status: string;
  gameDay?: {
    id: string;
    dayNumber: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  };
  questions?: {
    id: string;
    answered: boolean;
    predicted: boolean;
  }[];
  nextDay?: {
    dayNumber: number;
    title: string;
    startTime: string;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalCorrectAnswers: number;
  totalScore: number;
  daysPlayed: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [quizData, setQuizData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [quizRes, lbRes] = await Promise.all([
          fetch("/api/quiz/today"),
          fetch("/api/leaderboard/overall"),
        ]);
        const qData = await quizRes.json();
        const lbData = await lbRes.json();
        setQuizData(qData);
        setLeaderboard(lbData.leaderboard || []);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const answeredCount =
    quizData?.questions?.filter((q) => q.answered).length || 0;
  const totalQuestions = quizData?.questions?.length || 0;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const myRank = leaderboard.find((e) => e.userId === session?.user?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Xin chào,{" "}
            <span className="gradient-text">
              {session?.user?.name || "bạn"}
            </span>{" "}
            👋
          </h1>
          <p className="text-slate-400 mt-2">
            Sẵn sàng cho thử thách hôm nay chưa?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Hạng hiện tại",
              value: myRank ? `#${myRank.rank}` : "--",
              icon: "🏅",
              color: "from-yellow-500/20 to-orange-500/20",
            },
            {
              label: "Tổng câu đúng",
              value: myRank?.totalCorrectAnswers || 0,
              icon: "✅",
              color: "from-green-500/20 to-emerald-500/20",
            },
            {
              label: "Tổng điểm",
              value: myRank?.totalScore ? Math.round(myRank.totalScore) : 0,
              icon: "⭐",
              color: "from-primary-500/20 to-blue-500/20",
            },
            {
              label: "Ngày đã chơi",
              value: myRank?.daysPlayed || 0,
              icon: "📅",
              color: "from-pink-500/20 to-rose-500/20",
            },
          ].map((stat) => (
            <Card key={stat.label} className="glass border border-white/5">
              <Card.Content className="p-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-3 text-lg`}
                >
                  {stat.icon}
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16 rounded-lg mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-slate-500">{stat.label}</p>
              </Card.Content>
            </Card>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Quiz Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass border border-white/5 overflow-hidden">
              <Card.Content className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : quizData?.status === "active" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Chip
                          color="success"
                          variant="soft"
                          size="sm"
                          className="mb-2"
                        >
                          🟢 Đang diễn ra
                        </Chip>
                        <h2 className="text-xl font-bold">
                          Ngày {quizData.gameDay?.dayNumber}:{" "}
                          {quizData.gameDay?.title}
                        </h2>
                        {quizData.gameDay?.description && (
                          <p className="text-slate-400 text-sm mt-1">
                            {quizData.gameDay.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Tiến độ</span>
                        <span className="text-primary-400 font-medium">
                          {answeredCount}/{totalQuestions} câu hỏi
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color="accent"
                        className="h-2 mb-4"
                        aria-label="Quiz progress"
                      >
                        <ProgressBar.Track>
                          <ProgressBar.Fill />
                        </ProgressBar.Track>
                      </ProgressBar>
                    </div>

                    <Button
                      onPress={() => router.push("/play")}
                      variant="primary"
                      fullWidth
                      className="font-semibold text-base shadow-lg rounded-lg py-6"
                    >
                      {answeredCount === totalQuestions && totalQuestions > 0
                        ? "✅ Xem kết quả"
                        : "🎮 Chơi ngay"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">⏰</div>
                    <h2 className="text-xl font-bold mb-2">
                      Chưa có quiz hôm nay
                    </h2>
                    {quizData?.nextDay ? (
                      <p className="text-slate-400">
                        Ngày {quizData.nextDay.dayNumber} sẽ bắt đầu vào{" "}
                        <span className="text-primary-400">
                          {new Date(quizData.nextDay.startTime).toLocaleString(
                            "vi-VN",
                          )}
                        </span>
                      </p>
                    ) : (
                      <p className="text-slate-400">Vui lòng quay lại sau</p>
                    )}
                  </div>
                )}
              </Card.Content>
            </Card>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div variants={itemVariants}>
            <Card className="glass border border-white/5">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">🏆 Top 5</h3>
                  <Button
                    onPress={() => router.push("/leaderboard")}
                    size="sm"
                    variant="ghost"
                    className="text-primary-400"
                  >
                    Xem tất cả →
                  </Button>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry) => {
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            entry.userId === session?.user?.id
                              ? "bg-primary-500/10 border border-primary-500/20"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <span className="text-lg w-8 text-center">
                            {entry.rank <= 3
                              ? medals[entry.rank - 1]
                              : `#${entry.rank}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {entry.userName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entry.totalCorrectAnswers} câu đúng
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary-400">
                            {Math.round(entry.totalScore)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-6 text-sm">
                    Chưa có dữ liệu
                  </p>
                )}
              </Card.Content>
            </Card>
          </motion.div>
        </div>

        {/* 20-Day Progress */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card className="glass border border-white/5">
            <Card.Content className="p-6">
              <h3 className="font-bold text-lg mb-4">📅 Tiến trình 20 ngày</h3>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 20 }, (_, i) => {
                  const dayNum = i + 1;
                  const currentDay = quizData?.gameDay?.dayNumber || 0;
                  const isToday = dayNum === currentDay;
                  const isPast = dayNum < currentDay;

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
      </motion.div>
    </div>
  );
}
