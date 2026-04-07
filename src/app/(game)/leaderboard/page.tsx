"use client";

import { Avatar, Card, Chip, Skeleton, Tabs } from "@heroui/react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface DailyEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  correctAnswers: number;
  totalDeviation: number;
  totalTimeMs: number;
  dailyScore: number;
  isWinner: boolean;
}

interface OverallEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  totalCorrectAnswers: number;
  totalScore: number;
  daysPlayed: number;
  dailyWins: number;
}

function formatMs(ms: number) {
  const sec = (ms / 1000).toFixed(1);
  return `${sec}s`;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [dailyData, setDailyData] = useState<{
    leaderboard: DailyEntry[];
    dayNumber: number | null;
    dayTitle?: string;
  }>({ leaderboard: [], dayNumber: null });
  const [overallData, setOverallData] = useState<OverallEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dRes, oRes] = await Promise.all([
          fetch("/api/leaderboard/daily"),
          fetch("/api/leaderboard/overall"),
        ]);
        const dData = await dRes.json();
        const oData = await oRes.json();
        setDailyData(dData);
        setOverallData(oData.leaderboard || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const podiumColors = [
    "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    "from-slate-300/20 to-slate-400/20 border-slate-400/30",
    "from-orange-600/20 to-orange-700/20 border-orange-600/30",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          🏆 <span className="gradient-text">Bảng xếp hạng</span>
        </h1>
        <p className="text-slate-400 mb-8">
          Ai sẽ là người giỏi nhất sau 20 ngày?
        </p>
      </motion.div>

      <Tabs aria-label="Leaderboard tabs" variant="primary">
        <Tabs.List>
          <Tabs.Tab id="daily">📅 Hôm nay</Tabs.Tab>
          <Tabs.Tab id="overall">🏅 Tổng 20 ngày</Tabs.Tab>
        </Tabs.List>

        {/* Daily Tab */}
        <Tabs.Panel id="daily">
          <div className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : dailyData.leaderboard.length === 0 ? (
              <Card className="glass border border-white/5">
                <Card.Content className="py-16 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-slate-400">Chưa có kết quả cho hôm nay</p>
                </Card.Content>
              </Card>
            ) : (
              <>
                {dailyData.dayNumber && (
                  <Chip color="accent" variant="soft" className="mb-4">
                    Ngày {dailyData.dayNumber}
                    {dailyData.dayTitle ? `: ${dailyData.dayTitle}` : ""}
                  </Chip>
                )}

                {/* Podium for top 3 */}
                {dailyData.leaderboard.length >= 3 && (
                  <div className="flex items-end justify-center gap-4 mb-8">
                    {[1, 0, 2].map((podiumIndex) => {
                      const entry = dailyData.leaderboard[podiumIndex];
                      if (!entry) return null;
                      const heights = ["h-32", "h-24", "h-20"];
                      return (
                        <motion.div
                          key={entry.userId}
                          className="flex flex-col items-center"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: podiumIndex * 0.2 }}
                        >
                          <Avatar
                            size={podiumIndex === 0 ? "lg" : "md"}
                            className="mb-2 ring-2 ring-primary-500/30"
                          >
                            <Avatar.Image
                              src={entry.avatarUrl || undefined}
                              alt={entry.userName}
                            />
                            <Avatar.Fallback>
                              {entry.userName.slice(0, 2)}
                            </Avatar.Fallback>
                          </Avatar>
                          <p className="text-sm font-semibold truncate max-w-20">
                            {entry.userName}
                          </p>
                          <p className="text-xs text-primary-400">
                            {Math.round(entry.dailyScore)}
                          </p>
                          <div
                            className={`${heights[podiumIndex]} w-20 ${podiumColors[podiumIndex]} bg-linear-to-t border rounded-t-xl mt-2 flex items-start justify-center pt-2`}
                          >
                            <span className="text-2xl">
                              {medals[podiumIndex]}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Full list */}
                <div className="space-y-2">
                  {dailyData.leaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        entry.userId === session?.user?.id
                          ? "bg-primary-500/10 border border-primary-500/20"
                          : "glass-light"
                      }`}
                    >
                      <span className="text-lg w-8 text-center font-bold">
                        {entry.rank <= 3
                          ? medals[entry.rank - 1]
                          : `#${entry.rank}`}
                      </span>
                      <Avatar size="sm">
                        <Avatar.Image
                          src={entry.avatarUrl || undefined}
                          alt={entry.userName}
                        />
                        <Avatar.Fallback>
                          {entry.userName.slice(0, 2)}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.userName}</p>
                        <div className="flex gap-3 text-xs text-slate-500">
                          <span>✅ {entry.correctAnswers} đúng</span>
                          <span>🎯 ±{entry.totalDeviation}</span>
                          <span>⚡ {formatMs(entry.totalTimeMs)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-400">
                          {Math.round(entry.dailyScore)}
                        </p>
                        {entry.isWinner && (
                          <Chip size="sm" color="warning" variant="soft">
                            Winner
                          </Chip>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Tabs.Panel>

        {/* Overall Tab */}
        <Tabs.Panel id="overall">
          <div className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : overallData.length === 0 ? (
              <Card className="glass border border-white/5">
                <Card.Content className="py-16 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-slate-400">Chưa có dữ liệu xếp hạng</p>
                </Card.Content>
              </Card>
            ) : (
              <div className="space-y-2">
                {overallData.map((entry, i) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      entry.userId === session?.user?.id
                        ? "bg-primary-500/10 border border-primary-500/20"
                        : "glass-light"
                    }`}
                  >
                    <span className="text-lg w-8 text-center font-bold">
                      {entry.rank <= 3
                        ? medals[entry.rank - 1]
                        : `#${entry.rank}`}
                    </span>
                    <Avatar size="sm">
                      <Avatar.Image
                        src={entry.avatarUrl || undefined}
                        alt={entry.userName}
                      />
                      <Avatar.Fallback>
                        {entry.userName.slice(0, 2)}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.userName}</p>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>📅 {entry.daysPlayed} ngày</span>
                        <span>✅ {entry.totalCorrectAnswers} đúng</span>
                        <span>🏆 {entry.dailyWins} win</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-400">
                        {Math.round(entry.totalScore)}
                      </p>
                      <p className="text-xs text-slate-500">điểm</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
