import { Button, Card, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";

interface TopRankingProps {
  loading: boolean;
  leaderboard: any[];
  currentUserId?: string;
  onViewAll: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardTopRanking({
  loading,
  leaderboard,
  currentUserId,
  onViewAll,
}: TopRankingProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass border border-white/5">
        <Card.Content className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">🏆 Top 5</h3>
            <Button
              onPress={onViewAll}
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
                      entry.userId === currentUserId
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
  );
}
