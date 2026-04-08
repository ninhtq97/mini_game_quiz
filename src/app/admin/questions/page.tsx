"use client";

import {
  Button,
  Chip,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Skeleton,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

/* ───────── Types ───────── */
interface GameDay {
  id: string;
  dayNumber: number;
  title: string;
}

interface Question {
  id: string;
  gameDayId: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
  order: number;
  points: number;
  timeLimitSeconds: number;
  gameDay: { dayNumber: number; title: string };
  _count: { answers: number };
}

/* ───────── Zod schema ───────── */
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

type QuestionFormData = z.infer<typeof questionSchema>;

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [days, setDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterDayId, setFilterDayId] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadData = useCallback(async () => {
    try {
      const [qRes, dRes] = await Promise.all([
        fetch(
          `/api/admin/questions${filterDayId ? `?gameDayId=${filterDayId}` : ""}`,
        ),
        fetch("/api/admin/days"),
      ]);
      const qData = await qRes.json();
      const dData = await dRes.json();
      setQuestions(qData.questions || []);
      setDays(dData.days || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterDayId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingQuestion(null);
    reset({
      gameDayId: filterDayId || (days.length > 0 ? days[0].id : ""),
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "a",
      order: questions.length + 1,
      points: 10,
      timeLimitSeconds: 30,
    });
    setFormOpen(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);

    // Find which option is correct to pre-fill the form correctly
    const correctIndex = q.options?.findIndex((o) => o.isCorrect) ?? 0;
    const correctOptionLetter = ["a", "b", "c", "d"][
      correctIndex !== -1 ? correctIndex : 0
    ];

    reset({
      gameDayId: q.gameDayId,
      questionText: q.questionText,
      optionA: q.options?.[0]?.text || "",
      optionB: q.options?.[1]?.text || "",
      optionC: q.options?.[2]?.text || "",
      optionD: q.options?.[3]?.text || "",
      correctOption: correctOptionLetter,
      order: q.order,
      points: q.points,
      timeLimitSeconds: q.timeLimitSeconds,
    });
    setFormOpen(true);
  }

  function cancelForm() {
    setFormOpen(false);
    setEditingQuestion(null);
  }

  async function onSubmit(data: QuestionFormData) {
    setSaving(true);
    try {
      const options = [
        { id: "a", text: data.optionA, isCorrect: data.correctOption === "a" },
        { id: "b", text: data.optionB, isCorrect: data.correctOption === "b" },
        { id: "c", text: data.optionC, isCorrect: data.correctOption === "c" },
        { id: "d", text: data.optionD, isCorrect: data.correctOption === "d" },
      ];

      const body = {
        ...(editingQuestion ? { id: editingQuestion.id } : {}),
        gameDayId: data.gameDayId,
        questionText: data.questionText,
        questionType: "MULTIPLE_CHOICE",
        options,
        correctAnswer: data.correctOption,
        order: Number(data.order),
        points: Number(data.points),
        timeLimitSeconds: Number(data.timeLimitSeconds),
      };

      const method = editingQuestion ? "PUT" : "POST";
      const res = await fetch("/api/admin/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-80px)]">
      {/* ═══════ HEADER & FILTERS ═══════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">❓ Quản lý câu hỏi</h1>
          <p className="text-slate-400 mt-1">
            Tạo và quản lý câu hỏi cho từng ngày chơi • {questions.length} câu
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-64">
            <Select
              aria-label="Lọc theo ngày"
              placeholder="Tất cả các ngày"
              value={filterDayId || null}
              onChange={(key) => setFilterDayId(key ? String(key) : "")}
            >
              <Select.Trigger className="border-white/10 hover:border-white/20 rounded-xl border bg-white/5 px-4 py-2.5 w-full transition-colors">
                <Select.Value className="text-sm font-medium" />
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
          </div>

          <AnimatePresence>
            {!formOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  onPress={openCreate}
                  className="font-bold text-base px-6 py-2.5 w-full sm:w-auto"
                >
                  + Tạo câu hỏi mới
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ INLINE FORM (top) ═══════ */}
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
              {/* Form title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingQuestion
                    ? "✏️ Chỉnh sửa câu hỏi"
                    : "❓ Tạo câu hỏi mới"}
                </h2>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={cancelForm}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-wrap gap-6 w-full">
                  {/* ─── Left column: basic settings ─── */}
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

                  {/* ─── Middle column: Question text & Options ─── */}
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

                  {/* ─── Right column: Correct answer & Actions ─── */}
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
                              <span className="text-xs text-danger text-center mt-1">
                                {errors.correctOption.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Button
                        variant="ghost"
                        className="flex-1 font-bold text-slate-400"
                        onPress={cancelForm}
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

      {/* ═══════ QUESTION CARDS LIST (bottom) ═══════ */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-64 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm">
              {filterDayId
                ? "Không tìm thấy câu hỏi cho ngày đã chọn"
                : "Bắt đầu bằng cách tạo câu hỏi đầu tiên"}
            </p>
            <Button variant="primary" onPress={openCreate}>
              + Tạo câu hỏi đầu tiên
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group relative flex flex-col rounded-2xl border bg-white/3 backdrop-blur-sm hover:bg-white/6 transition-all duration-300 overflow-hidden cursor-pointer ${
                    editingQuestion?.id === q.id
                      ? "border-primary-500/50 ring-1 ring-primary-500/30"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => openEdit(q)}
                >
                  {/* Decorative top bar */}
                  <div className="h-1 w-full bg-linear-to-r from-blue-500 to-primary-400" />

                  <div className="flex flex-col p-5 grow">
                    {/* Header info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <span className="text-[10px] uppercase font-bold opacity-80 leading-none">
                            Câu
                          </span>
                          <span className="text-xl font-black leading-none mt-0.5">
                            {q.order}
                          </span>
                        </div>
                        <div>
                          <Chip
                            size="sm"
                            variant="soft"
                            className="mb-1 text-[10px]"
                          >
                            Ngày {q.gameDay.dayNumber}
                          </Chip>
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1 text-slate-300">
                              <span className="text-amber-400">⭐</span>{" "}
                              {q.points} pt
                            </span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <span className="text-slate-400">⏱</span>{" "}
                              {q.timeLimitSeconds}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {q._count.answers > 0 && (
                        <div
                          className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-400"
                          title="Số người đã trả lời"
                        >
                          👥 {q._count.answers}
                        </div>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="font-semibold text-white text-base leading-snug mb-5 grow">
                      {q.questionText}
                    </p>

                    {/* Options grid */}
                    <div className="grid grid-cols-2 gap-2 mt-auto mb-4">
                      {q.options.map((opt, optIndex) => {
                        const letter = ["a", "b", "c", "d"][optIndex] || "?";
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center text-[12px] px-2.5 py-2 rounded-lg border ${
                              opt.isCorrect
                                ? "bg-emerald-500/15 text-emerald-100 border-emerald-500/30"
                                : "bg-white/5 text-slate-300 border-white/5"
                            }`}
                          >
                            <span
                              className={`font-black tracking-wider w-5 shrink-0 ${opt.isCorrect ? "text-emerald-400" : "text-slate-500"}`}
                            >
                              {letter.toUpperCase()}.
                            </span>
                            <span
                              className={`truncate w-full block ${opt.isCorrect ? "font-bold" : "font-medium"}`}
                            >
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => openEdit(q)}
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        ✏️ Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => deleteQuestion(q.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        🗑 Xóa
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
