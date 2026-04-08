"use client";

import { Button, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuiz } from "@/app/quiz-provider";
import Complete from "@/components/play/Complete";
import Form, { type AnswerForm } from "@/components/play/Form";
import Header from "@/components/play/Header";
import Prediction, { type PredictionForm } from "@/components/play/Prediction";
import Timer from "@/components/play/Timer";
import type { QuestionData } from "@/types/play";

export default function PlayPage() {
  const router = useRouter();
  const { quizData, loading, setQuizData } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize current question
  useEffect(() => {
    if (
      !loading &&
      quizData?.status === "active" &&
      quizData.questions &&
      !initialized
    ) {
      const firstUnanswered = quizData.questions.findIndex(
        (q: QuestionData) => !q.answered || !q.predicted,
      );
      if (firstUnanswered >= 0) {
        setCurrentQuestionIndex(firstUnanswered);
      } else {
        setCurrentQuestionIndex(quizData.questions.length - 1);
      }
      setInitialized(true);
    }
  }, [loading, quizData, initialized]);

  const questions = quizData?.questions || [];
  const status = loading ? "loading" : quizData?.status || "error";
  const gameDay = quizData?.gameDay || null;

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
  const onSubmitAnswer = async (formData: AnswerForm) => {
    if (currentQuestion.answered || !currentQuestion) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentMs = Date.now() - startTimeRef.current;

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId: formData.answerId,
          timeSpentMs,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi nộp bài");
      }

      setQuizData((prev) => {
        if (!prev || !prev.questions) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === currentQuestion.id
              ? {
                  ...q,
                  answered: true,
                  userAnswer: {
                    isCorrect: data.isCorrect,
                    selectedOptionId: formData.answerId,
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
        };
      });

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
    }
  };

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
      setQuizData((prev) => {
        if (!prev || !prev.questions) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
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
        };
      });

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

  const allDone = questions.every((q) => q.answered && q.predicted);

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

      <Header
        gameDay={gameDay}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        questions={questions}
      />

      {/* Timer */}
      {!currentQuestion.answered && (
        <Timer
          timeLeft={timeLeft}
          timeLimitSeconds={currentQuestion.timeLimitSeconds}
        />
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
          {/* Answer Options Form */}
          {!showPrediction ? (
            <Form
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              onSubmitAnswer={onSubmitAnswer}
              onShowPrediction={() => setShowPrediction(true)}
              predictionSubmitted={predictionSubmitted}
            />
          ) : (
            /* Prediction Form */
            <Prediction
              currentQuestion={currentQuestion}
              predictionSubmitted={predictionSubmitted}
              onSubmitPrediction={onSubmitPrediction}
            />
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
                  <Complete />
                ) : null}
              </motion.div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
