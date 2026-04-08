"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useQuiz } from "@/app/quiz-provider";
import ActionSection from "@/components/dashboard/ActionSection";
import Overview from "@/components/dashboard/Overview";
import ProgressMap from "@/components/dashboard/ProgressMap";
import TopRanking from "@/components/dashboard/TopRanking";

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { quizData, loading: quizLoading } = useQuiz();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const lbRes = await fetch("/api/leaderboard/overall");
        const lbData = await lbRes.json();
        setLeaderboard(lbData.leaderboard || []);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLeaderboardLoading(false);
      }
    }
    loadData();
  }, []);

  const loading = quizLoading || leaderboardLoading;
  const myRank = leaderboard.find((e) => e.userId === session?.user?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Overview
          userName={session?.user?.name || "bạn"}
          loading={loading}
          myRank={myRank}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <ActionSection
            loading={loading}
            quizData={quizData}
            onPlay={() => router.push("/play")}
          />

          <TopRanking
            loading={loading}
            leaderboard={leaderboard}
            currentUserId={session?.user?.id}
            onViewAll={() => router.push("/leaderboard")}
          />
        </div>

        <ProgressMap currentDayNumber={quizData?.gameDay?.dayNumber || 0} />
      </motion.div>
    </div>
  );
}
