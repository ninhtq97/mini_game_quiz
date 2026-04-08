import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { GameDay, Question } from "@/types";

const questionSchema = z.object({
  gameDayId: z.string().min(1, "Vui lòng chọn ngày phân bổ"),
  questionText: z.string().min(1, "Nội dung câu hỏi không được trống"),
  optionA: z.string().min(1, "Bắt buộc"),
  optionB: z.string().min(1, "Bắt buộc"),
  optionC: z.string().min(1, "Bắt buộc"),
  optionD: z.string().min(1, "Bắt buộc"),
  correctOption: z.string().min(1, "Vui lòng chọn đáp án đúng"),
  order: z.number().min(1, "Phải > 0"),
  points: z.number().min(1, "Phải > 0"),
  timeLimitSeconds: z.number().min(1, "Phải > 0"),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

interface FormProps {
  formOpen: boolean;
  editingQuestion: Question | null;
  saving: boolean;
  days: GameDay[];
  filterDayId: string;
  questionsCount: number;
  onCancel: () => void;
  onSubmit: (data: QuestionFormData) => void;
}

export default function AdminQuestionsForm({
  formOpen,
  editingQuestion,
  saving,
  days,
  filterDayId,
  questionsCount,
  onCancel,
  onSubmit,
}: FormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      gameDayId: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "a",
      order: 1,
      points: 10,
      timeLimitSeconds: 30,
    },
  });

  useEffect(() => {
    if (formOpen) {
      if (editingQuestion) {
        const correctIndex =
          editingQuestion.options?.findIndex(
            (o: { isCorrect: boolean }) => o.isCorrect,
          ) ?? 0;
        const correctOptionLetter = ["a", "b", "c", "d"][
          correctIndex !== -1 ? correctIndex : 0
        ];

        reset({
          gameDayId: editingQuestion.gameDayId,
          questionText: editingQuestion.questionText,
          optionA: editingQuestion.options?.[0]?.text || "",
          optionB: editingQuestion.options?.[1]?.text || "",
          optionC: editingQuestion.options?.[2]?.text || "",
          optionD: editingQuestion.options?.[3]?.text || "",
          correctOption: correctOptionLetter,
          order: editingQuestion.order,
          points: editingQuestion.points,
          timeLimitSeconds: editingQuestion.timeLimitSeconds,
        });
      } else {
        reset({
          gameDayId: filterDayId || (days.length > 0 ? days[0].id : ""),
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "a",
          order: questionsCount + 1,
          points: 10,
          timeLimitSeconds: 30,
        });
      }
    }
  }, [formOpen, editingQuestion, filterDayId, days, questionsCount, reset]);

  return (
    <AnimatePresence>
      {formOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingQuestion ? "✏️ Chỉnh sửa câu hỏi" : "❓ Tạo câu hỏi mới"}
              </h2>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={onCancel}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-wrap gap-6 w-full">
                <div className="flex-4 min-w-62.5 space-y-4">
                  <Controller
                    name="gameDayId"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Ngày phân bổ
                        </Label>
                        <Select
                          aria-label="Chọn ngày"
                          placeholder="Chọn ngày"
                          value={field.value || null}
                          onChange={(key) =>
                            field.onChange(key ? String(key) : "")
                          }
                        >
                          <Select.Trigger
                            className={`border-default hover:border-default-hover rounded-xl border bg-white/5 px-4 py-2.5 w-full transition-colors ${errors.gameDayId ? "border-danger" : ""}`}
                          >
                            <Select.Value className="text-sm font-semibold" />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {days.map((d) => (
                                <ListBoxItem key={d.id} id={d.id}>
                                  Ngày {d.dayNumber}: {d.title}
                                </ListBoxItem>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        {errors.gameDayId && (
                          <span className="text-xs text-danger">
                            {errors.gameDayId.message}
                          </span>
                        )}
                      </div>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="order"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          value={String(field.value)}
                          onChange={(val) => field.onChange(Number(val))}
                          onBlur={field.onBlur}
                          isInvalid={!!errors.order}
                          className="flex flex-col gap-1"
                        >
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Thứ tự
                          </Label>
                          <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2.5 rounded-xl border w-full bg-white/5 outline-none transition-colors text-xl font-black text-center" />
                          <FieldError className="text-xs text-danger">
                            {errors.order?.message}
                          </FieldError>
                        </TextField>
                      )}
                    />

                    <Controller
                      name="timeLimitSeconds"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          value={String(field.value)}
                          onChange={(val) => field.onChange(Number(val))}
                          onBlur={field.onBlur}
                          isInvalid={!!errors.timeLimitSeconds}
                          className="flex flex-col gap-1"
                        >
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Thời gian (giây)
                          </Label>
                          <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2.5 rounded-xl border w-full bg-white/5 outline-none transition-colors text-xl font-black text-center" />
                          <FieldError className="text-xs text-danger">
                            {errors.timeLimitSeconds?.message}
                          </FieldError>
                        </TextField>
                      )}
                    />
                  </div>

                  <Controller
                    name="points"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        type="number"
                        value={String(field.value)}
                        onChange={(val) => field.onChange(Number(val))}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.points}
                        className="flex flex-col gap-1 mt-4"
                      >
                        <Label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Điểm số
                        </Label>
                        <Input className="border-amber-500/30 hover:border-amber-500/50 focus:border-amber-400 px-3 py-2.5 rounded-xl border w-full bg-amber-500/5 outline-none transition-colors text-2xl font-black text-center text-amber-400" />
                        <FieldError className="text-xs text-danger">
                          {errors.points?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />
                </div>

                <div className="flex-5 min-w-80 space-y-4">
                  <Controller
                    name="questionText"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.questionText}
                        className="flex flex-col gap-1"
                      >
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Nội dung câu hỏi
                        </Label>
                        <TextArea className="border-default hover:border-default-hover focus:border-primary px-4 py-3 rounded-xl border w-full bg-white/5 outline-none transition-colors min-h-22.5 resize-y text-base" />
                        <FieldError className="text-xs text-danger">
                          {errors.questionText?.message}
                        </FieldError>
                      </TextField>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { name: "optionA", label: "A" },
                        { name: "optionB", label: "B" },
                        { name: "optionC", label: "C" },
                        { name: "optionD", label: "D" },
                      ] as const
                    ).map((opt) => (
                      <Controller
                        key={opt.name}
                        name={opt.name}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors[opt.name]}
                            className="flex flex-col gap-1"
                          >
                            <Label className="text-[10px] font-bold text-slate-500">
                              Phương án {opt.label}
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg text-slate-500 shrink-0 w-6">
                                {opt.label}.
                              </span>
                              <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2 rounded-xl border w-full bg-white/5 outline-none transition-colors text-sm font-medium" />
                            </div>
                            <FieldError className="text-[10px] text-danger">
                              {errors[opt.name]?.message}
                            </FieldError>
                          </TextField>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-3 min-w-60 flex flex-col gap-4 justify-between">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col justify-center gap-4">
                    <Controller
                      name="correctOption"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">
                            Đáp án đúng
                          </Label>
                          <Select
                            aria-label="Chọn đáp án đúng"
                            value={field.value || null}
                            onChange={(key) =>
                              field.onChange(key ? String(key) : "")
                            }
                          >
                            <Select.Trigger
                              className={`border-emerald-500/30 hover:border-emerald-500/50 rounded-xl border bg-emerald-500/10 px-4 py-3 w-full transition-colors ${errors.correctOption ? "border-danger" : ""}`}
                            >
                              <Select.Value className="text-lg font-black text-emerald-400 text-center" />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBoxItem id="a">Phương án A</ListBoxItem>
                                <ListBoxItem id="b">Phương án B</ListBoxItem>
                                <ListBoxItem id="c">Phương án C</ListBoxItem>
                                <ListBoxItem id="d">Phương án D</ListBoxItem>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          {errors.correctOption && (
                            <FieldError className="text-sm text-red-400 mt-3 text-center font-medium">
                              {errors.correctOption.message}
                            </FieldError>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="ghost"
                      className="flex-1 font-bold text-slate-400"
                      onPress={onCancel}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1 font-bold"
                      isDisabled={saving}
                    >
                      {saving
                        ? "Đang lưu..."
                        : editingQuestion
                          ? "Cập nhật"
                          : "Tạo mới"}
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
