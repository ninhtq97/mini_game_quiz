import { Button, Card, Chip, ProgressBar, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";

interface ActionSectionProps {
  loading: boolean;
  quizData: any; // Type comes from useQuiz context but any is fine for this UI component for now
  onPlay: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardActionSection({
  loading,
  quizData,
  onPlay,
}: ActionSectionProps) {
  const answeredCount =
    quizData?.questions?.filter((q: any) => q.answered).length || 0;
  const totalQuestions = quizData?.questions?.length || 0;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
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
                onPress={onPlay}
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
              <h2 className="text-xl font-bold mb-2">Chưa có quiz hôm nay</h2>
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
  );
}
