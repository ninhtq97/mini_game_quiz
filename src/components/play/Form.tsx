import { Button, Card } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import type { QuestionData } from "../../types/play";

const answerSchema = z.object({
  answerId: z.string().min(1, "Vui lòng chọn một đáp án"),
});
export type AnswerForm = z.infer<typeof answerSchema>;

interface QuestionCardProps {
  currentQuestion: QuestionData;
  timeLeft: number;
  onSubmitAnswer: (data: AnswerForm) => Promise<void>;
  onShowPrediction: () => void;
  predictionSubmitted: boolean;
}

export default function QuestionCard({
  currentQuestion,
  timeLeft,
  onSubmitAnswer,
  onShowPrediction,
  predictionSubmitted,
}: QuestionCardProps) {
  const isAnswered = currentQuestion.answered;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<AnswerForm>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answerId: "" },
  });

  return (
    <>
      <Card className="glass border border-white/5 mb-6">
        <Card.Content className="p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </Card.Content>
      </Card>

      <form onSubmit={handleSubmit(onSubmitAnswer)} className="w-full">
        <Controller
          name="answerId"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected = isAnswered
                  ? currentQuestion.userAnswer?.selectedOptionId === option.id
                  : field.value === option.id;
                const isCorrectOption =
                  isAnswered &&
                  currentQuestion.userAnswer?.selectedOptionId === option.id &&
                  currentQuestion.userAnswer?.isCorrect;
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
                } else if (isSelected) {
                  optionClass =
                    "border-primary-500 bg-primary-500/10 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)]";
                }

                return (
                  <motion.button
                    type="button"
                    key={option.id}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${optionClass}`}
                    onClick={() => !isAnswered && field.onChange(option.id)}
                    disabled={isAnswered || timeLeft === 0}
                    whileHover={!isAnswered ? { scale: 1.01 } : {}}
                    whileTap={!isAnswered ? { scale: 0.99 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isAnswered && isCorrectOption
                          ? "bg-neon-green/20 text-neon-green"
                          : isAnswered && isSelected && !isCorrectOption
                            ? "bg-red-500/20 text-red-400"
                            : isSelected
                              ? "bg-primary-500 text-white"
                              : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {isAnswered && isCorrectOption
                        ? "✓"
                        : isAnswered && isSelected && !isCorrectOption
                          ? "✗"
                          : letters[i]}
                    </span>
                    <span className={isSelected ? "font-bold" : "font-medium"}>
                      {option.text}
                    </span>
                  </motion.button>
                );
              })}

              {/* Submit Answer Button */}
              {!isAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-4"
                >
                  {errors.answerId && (
                    <div className="text-center mb-3">
                      <span className="text-sm font-semibold text-red-400">
                        {errors.answerId.message}
                      </span>
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isDisabled={isSubmitting || timeLeft === 0}
                    className="font-semibold shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)] py-6 rounded-xl text-lg"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận trả lời"}
                  </Button>
                </motion.div>
              )}

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
                        onPress={onShowPrediction}
                        className="font-semibold shadow-[0_0_15px_rgba(var(--color-primary-500),0.5)] py-6 rounded-xl"
                      >
                        Tiếp tục dự đoán →
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        />
      </form>
    </>
  );
}
