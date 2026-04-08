import { Button, Card, FieldError, Input, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import type { QuestionData } from "../../types/play";

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
export type PredictionForm = z.infer<typeof predictionSchema>;

interface PredictionCardProps {
  currentQuestion: QuestionData;
  predictionSubmitted: boolean;
  onSubmitPrediction: (data: PredictionForm) => Promise<void>;
}

export default function PredictionCard({
  currentQuestion,
  predictionSubmitted,
  onSubmitPrediction,
}: PredictionCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<PredictionForm>({
    resolver: zodResolver(predictionSchema),
    defaultValues: { predictedCorrectCount: "" },
  });

  // Reset form when question changes
  useEffect(() => {
    reset({ predictedCorrectCount: "" });
  }, [currentQuestion.id, reset]);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
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
                {isFormSubmitting ? "Đang xử lý..." : "Xác nhận dự đoán 🎯"}
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
                {currentQuestion.userPrediction?.predictedCorrectCount ?? 0}{" "}
                người
              </p>
            </motion.div>
          )}
        </Card.Content>
      </Card>
    </motion.div>
  );
}
