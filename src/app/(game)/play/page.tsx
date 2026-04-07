"use client";

import {
  Button,
  Card,
  Chip,
  FieldError,
  Input,
  ProgressBar,
  Skeleton,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const predictionSchema = z.object({
  predictedCorrectCount: z
    .string()
    .min(1, "Vui lòng nhập số")
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number.isInteger(Number(val)),
      "Vui lòng nhập số nguyên",
    )
    .refine((val) => Number(val) >= 0, "Dự đoán phải từ 0 trở lên"),
});
type PredictionForm = z.infer<typeof predictionSchema>;

interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string; isCorrect?: boolean }[];
  order: number;
  points: number;
  timeLimitSeconds: number;
  answered: boolean;
  predicted: boolean;
  userAnswer?: { isCorrect: boolean; selectedOptionId: string } | null;
  userPrediction?: { predictedCorrectCount: number } | null;
}

interface GameDayData {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}

export default function PlayPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("loading");
  const [gameDay, setGameDay] = useState<GameDayData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<PredictionForm>({
    resolver: zodResolver(predictionSchema),
    defaultValues: { predictedCorrectCount: "" },
  });

  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load quiz data
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch("/api/quiz/today");
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "active") {
          setGameDay(data.gameDay);
          setQuestions(data.questions);
          // Find first unanswered or unpredicted question
          const firstUnanswered = data.questions.findIndex(
            (q: QuestionData) => !q.answered || !q.predicted,
          );
          if (firstUnanswered >= 0) {
            setCurrentQuestionIndex(firstUnanswered);
          } else {
            setCurrentQuestionIndex(data.questions.length - 1);
          }
        }
      } catch {
        setStatus("error");
      }
    }
    loadQuiz();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer
  useEffect(() => {
    if (!currentQuestion || currentQuestion.answered) return;

    setTimeLeft(currentQuestion.timeLimitSeconds);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion]);

  // Submit answer
  const handleSubmitAnswer = useCallback(
    async (answerId: string) => {
      if (submitting || currentQuestion.answered || !currentQuestion) return;

      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpentMs = Date.now() - startTimeRef.current;

      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            selectedOptionId: answerId,
            timeSpentMs,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Lỗi nộp bài");
        }

        setQuestions((prev) =>
          prev.map((q) =>
            q.id === currentQuestion.id
              ? {
                  ...q,
                  answered: true,
                  userAnswer: {
                    isCorrect: data.isCorrect,
                    selectedOptionId: answerId,
                  },
                  options: q.options.map((opt) => ({
                    ...opt,
                    isCorrect: data.options.find(
                      (d: { id: string; isCorrect: boolean }) =>
                        d.id === opt.id,
                    )?.isCorrect,
                  })),
                }
              : q,
          ),
        );

        if (data.isCorrect) {
          setScoreAnimation(currentQuestion.points);
          setTimeout(() => setScoreAnimation(null), 2000);
        }

        // Show prediction after a delay
        setTimeout(() => {
          if (!currentQuestion.predicted) {
            setShowPrediction(true);
          }
        }, 1500);
      } catch {
        console.error("Failed to submit answer");
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, currentQuestion],
  );

  // Submit prediction
  const onSubmitPrediction = async (data: PredictionForm) => {
    if (!currentQuestion || predictionSubmitted) return;

    try {
      await fetch("/api/quiz/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          predictedCorrectCount: Number(data.predictedCorrectCount),
        }),
      });

      setPredictionSubmitted(true);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id
            ? {
                ...q,
                predicted: true,
                userPrediction: {
                  predictedCorrectCount: Number(data.predictedCorrectCount),
                },
              }
            : q,
        ),
      );

      // Move to next question after delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          goToNext();
        }
      }, 1000);
    } catch {
      console.error("Failed to submit prediction");
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setShowPrediction(false);
    setPredictionSubmitted(false);
    reset({ predictedCorrectCount: "" });
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 rounded-lg mb-6" />
        <Skeleton className="h-100 w-full rounded-2xl" />
      </div>
    );
  }

  // No active quiz
  if (status !== "active" || !currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-2xl font-bold mb-3">Chưa có quiz hôm nay</h1>
          <p className="text-slate-400 mb-6">Hãy quay lại sau nhé!</p>
          <Button
            onPress={() => router.push("/dashboard")}
            variant="primary"
            className="shadow-lg rounded-full"
          >
            Về Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const timerProgress = (timeLeft / currentQuestion.timeLimitSeconds) * 100;
  const allDone = questions.every((q) => q.answered && q.predicted);
  const isAnswered = currentQuestion.answered;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 relative">
      {/* Score Animation */}
      <AnimatePresence>
        {scoreAnimation !== null && (
          <motion.div
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 text-5xl font-black text-neon-green"
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -50 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
          >
            +{scoreAnimation} 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <Chip color="accent" variant="soft" size="sm" className="mb-1">
            Ngày {gameDay?.dayNumber}
          </Chip>
          <h1 className="text-xl sm:text-2xl font-bold">{gameDay?.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Câu hỏi</p>
          <p className="text-2xl font-bold">
            <span className="text-primary-400">{currentQuestionIndex + 1}</span>
            <span className="text-slate-600">/{questions.length}</span>
          </p>
        </div>
      </motion.div>

      {/* Question Progress */}
      <div className="flex gap-2 mb-6">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              !q.answered
                ? i === currentQuestionIndex
                  ? "bg-primary-500"
                  : "bg-white/10"
                : q.userAnswer?.isCorrect
                  ? "bg-neon-green"
                  : "bg-red-500"
            }`}
            layoutId={`progress-${q.id}`}
          />
        ))}
      </div>

      {/* Timer */}
      {!currentQuestion.answered && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Thời gian</span>
            <span
              className={`font-bold ${
                timeLeft <= 5
                  ? "text-red-400 animate-pulse"
                  : timeLeft <= 10
                    ? "text-yellow-400"
                    : "text-neon-green"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <ProgressBar
            value={timerProgress}
            color={
              timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warning" : "success"
            }
            className="h-1.5 mb-2"
            aria-label="Timer"
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </motion.div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass border border-white/5 mb-6">
            <Card.Content className="p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </Card.Content>
          </Card>

          {/* Answer Options */}
          {!showPrediction ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected =
                  currentQuestion.userAnswer?.selectedOptionId === option.id;
                const isCorrectOption =
                  isSelected && currentQuestion.userAnswer?.isCorrect;
                const letters = ["A", "B", "C", "D"];

                let optionClass = "glass border border-white/10 option-hover";
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionClass = "option-correct";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "option-incorrect";
                  } else {
                    optionClass = "glass border border-white/5 opacity-50";
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${optionClass}`}
                    onClick={() => !isAnswered && handleSubmitAnswer(option.id)}
                    disabled={isAnswered || submitting || timeLeft === 0}
                    whileHover={!isAnswered ? { scale: 1.01 } : {}}
                    whileTap={!isAnswered ? { scale: 0.99 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        isAnswered && isCorrectOption
                          ? "bg-neon-green/20 text-neon-green"
                          : isAnswered && isSelected && !isCorrectOption
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {isAnswered && isCorrectOption
                        ? "✓"
                        : isAnswered && isSelected && !isCorrectOption
                          ? "✗"
                          : letters[i]}
                    </span>
                    <span className="font-medium">{option.text}</span>
                  </motion.button>
                );
              })}

              {/* After answer: show result message */}
              {isAnswered && (
                <div className="space-y-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-center font-semibold ${
                      currentQuestion.userAnswer?.isCorrect
                        ? "bg-neon-green/10 border border-neon-green/20 text-neon-green"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {currentQuestion.userAnswer?.isCorrect
                      ? "🎉 Chính xác!"
                      : "😔 Sai rồi!"}
                  </motion.div>

                  {!currentQuestion.predicted && !predictionSubmitted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="primary"
                        fullWidth
                        onPress={() => setShowPrediction(true)}
                        className="font-semibold shadow-[0_0_15px_rgba(var(--color-primary-500),0.5)] py-6 rounded-xl"
                      >
                        Tiếp tục dự đoán →
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Prediction Form */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border border-white/5">
                <Card.Content className="p-6 sm:p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🔮</div>
                    <h3 className="text-lg font-bold">Dự đoán kết quả</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Bạn nghĩ có bao nhiêu người sẽ trả lời đúng câu này?
                    </p>
                  </div>

                  {!predictionSubmitted ? (
                    <form
                      onSubmit={handleSubmit(onSubmitPrediction)}
                      className="w-full"
                    >
                      <div className="mb-6 mt-4">
                        <Controller
                          name="predictedCorrectCount"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              isInvalid={!!errors.predictedCorrectCount}
                              aria-label="Nhập số người dự đoán"
                              className="relative bg-white/5 border border-white/10 rounded-2xl flex flex-col px-6 py-5 h-auto justify-center"
                            >
                              <div className="relative flex items-center justify-center w-full h-14">
                                <Input
                                  {...field}
                                  type="number"
                                  min={0}
                                  placeholder="Nhập số..."
                                  className="bg-transparent w-full text-center text-4xl font-black outline-none text-white placeholder:text-slate-600 appearance-none"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium pointer-events-none">
                                  người
                                </div>
                              </div>
                              <FieldError className="text-sm text-red-400 mt-3 text-center font-medium">
                                {errors.predictedCorrectCount?.message}
                              </FieldError>
                            </TextField>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="secondary"
                        fullWidth
                        isDisabled={isFormSubmitting}
                        className="font-semibold shadow-lg rounded-lg py-6"
                      >
                        {isFormSubmitting
                          ? "Đang xử lý..."
                          : "Xác nhận dự đoán 🎯"}
                      </Button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-semibold text-neon-green">
                        Đã ghi nhận dự đoán:{" "}
                        {currentQuestion.userPrediction
                          ?.predictedCorrectCount ?? 0}{" "}
                        người
                      </p>
                    </motion.div>
                  )}
                </Card.Content>
              </Card>
            </motion.div>
          )}

          {/* Navigation after done */}
          {currentQuestion.answered &&
            (currentQuestion.predicted || predictionSubmitted) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex gap-3"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={goToNext}
                    className="font-semibold shadow-lg rounded-lg py-6"
                  >
                    Câu tiếp theo →
                  </Button>
                ) : allDone ? (
                  <div className="w-full text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl p-6 border border-neon-green/20"
                    >
                      <div className="text-4xl mb-3">🎊</div>
                      <h3 className="text-xl font-bold mb-2">Hoàn thành!</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Bạn đã hoàn thành tất cả câu hỏi hôm nay. Kết quả sẽ
                        được tổng hợp khi ngày chơi kết thúc.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onPress={() => router.push("/leaderboard")}
                          variant="primary"
                          className="shadow-lg rounded-full"
                        >
                          Xem BXH 🏆
                        </Button>
                        <Button
                          onPress={() => router.push("/dashboard")}
                          variant="outline"
                          className="border-white/10 rounded-full"
                        >
                          Dashboard
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                ) : null}
              </motion.div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
