import { Card, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";

interface OverviewProps {
  userName: string;
  loading: boolean;
  myRank?: {
    rank: number;
    totalCorrectAnswers: number;
    totalScore: number;
    daysPlayed: number;
  };
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardOverview({
  userName,
  loading,
  myRank,
}: OverviewProps) {
  return (
    <>
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Xin chào, <span className="gradient-text">{userName}</span> 👋
        </h1>
        <p className="text-slate-400 mt-2">
          Sẵn sàng cho thử thách hôm nay chưa?
        </p>
      </motion.div>

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
    </>
  );
}
