"use client";

import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Input,
  Label,
  Skeleton,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DateValue } from "@internationalized/date";
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

/* ───────── Types ───────── */
interface GameDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
  _count: { questions: number; dailyResults: number };
}

/* ───────── Zod schema ───────── */
const daySchema = z.object({
  dayNumber: z.number().min(1, "Ngày phải lớn hơn 0"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  isActive: z.boolean(),
});
type DayFormData = z.infer<typeof daySchema>;

/* ───────── Date helpers ───────── */
function isoToDateValue(isoString: string): DateValue | null {
  try {
    return parseAbsoluteToLocal(new Date(isoString).toISOString());
  } catch {
    return null;
  }
}
function dateValueToISO(val: DateValue | null): string {
  if (!val) return "";
  try {
    return val.toDate(getLocalTimeZone()).toISOString();
  } catch {
    return "";
  }
}

/* ───────── Reusable DatePicker field ───────── */
function DatePickerField({
  label,
  labelColor,
  icon,
  calendarLabel,
  value,
  onChange,
  isInvalid,
  errorMessage,
}: {
  label: string;
  labelColor: string;
  icon: string;
  calendarLabel: string;
  value: DateValue | null;
  onChange: (val: DateValue | null) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}) {
  return (
    <DatePicker
      granularity="minute"
      hourCycle={24}
      hideTimeZone
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
    >
      <Label
        className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}
      >
        {icon} {label}
      </Label>
      <DateField.Group
        className="rounded-xl border border-white/10 bg-white/5 w-full"
        fullWidth
      >
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={calendarLabel}>
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
      {errorMessage && (
        <FieldError className="text-xs text-danger">{errorMessage}</FieldError>
      )}
    </DatePicker>
  );
}

/* ───────── Page ───────── */
export default function AdminDaysPage() {
  const [days, setDays] = useState<GameDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<GameDay | null>(null);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DayFormData>({
    resolver: zodResolver(daySchema),
    defaultValues: {
      dayNumber: 1,
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      isActive: false,
    },
  });
  const formIsActive = watch("isActive");

  /* ── Data ── */
  const loadDays = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/days");
      const data = await res.json();
      setDays(data.days || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  /* ── Form actions ── */
  function openCreate() {
    setEditingDay(null);
    reset({
      dayNumber: days.length + 1,
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      isActive: false,
    });
    setFormOpen(true);
  }

  function openEdit(day: GameDay) {
    setEditingDay(day);
    reset({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description || "",
      startTime: day.startTime,
      endTime: day.endTime,
      isActive: day.isActive,
    });
    setFormOpen(true);
  }

  function cancelForm() {
    setFormOpen(false);
    setEditingDay(null);
  }

  async function onSubmit(data: DayFormData) {
    setSaving(true);
    try {
      const method = editingDay ? "PUT" : "POST";
      const body = editingDay ? { id: editingDay.id, ...data } : data;
      const res = await fetch("/api/admin/days", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFormOpen(false);
        setEditingDay(null);
        loadDays();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDay(id: string) {
    if (!confirm("Bạn có chắc muốn xóa ngày chơi này?")) return;
    try {
      await fetch(`/api/admin/days?id=${id}`, { method: "DELETE" });
      loadDays();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleActive(day: GameDay) {
    try {
      await fetch("/api/admin/days", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: day.id, isActive: !day.isActive }),
      });
      loadDays();
    } catch (e) {
      console.error(e);
    }
  }

  /* ── Helpers ── */
  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDayStatus(day: GameDay) {
    const n = Date.now();
    const s = new Date(day.startTime).getTime();
    const e = new Date(day.endTime).getTime();
    if (!day.isActive)
      return { label: "Tắt", color: "default" as const, icon: "⚫" };
    if (n < s)
      return { label: "Sắp diễn ra", color: "warning" as const, icon: "🟡" };
    if (n >= s && n <= e)
      return { label: "Đang diễn ra", color: "success" as const, icon: "🟢" };
    return { label: "Đã kết thúc", color: "danger" as const, icon: "🔴" };
  }

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-80px)]">
      {/* ═══════ HEADER ═══════ */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">📅 Quản lý ngày chơi</h1>
          <p className="text-slate-400 mt-1">
            Tạo và quản lý các ngày chơi quiz • {days.length} ngày
          </p>
        </motion.div>
        {!formOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="primary"
              onPress={openCreate}
              className="font-bold text-base px-6 py-2.5"
            >
              + Tạo ngày mới
            </Button>
          </motion.div>
        )}
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
                  {editingDay
                    ? "✏️ Chỉnh sửa ngày chơi"
                    : "📅 Tạo ngày chơi mới"}
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
                  {/* ─── Left column: basic info ─── */}
                  <div className="flex-5 min-w-75 space-y-4">
                    {/* Day number + Title */}
                    <div className="grid grid-cols-3 gap-3">
                      <Controller
                        name="dayNumber"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            type="number"
                            value={String(field.value)}
                            onChange={(val) => field.onChange(Number(val))}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.dayNumber}
                            className="flex flex-col gap-1"
                          >
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Ngày số
                            </Label>
                            <Input className="border-default hover:border-default-hover focus:border-primary px-3 py-2.5 rounded-xl border w-full bg-white/5 outline-none transition-colors text-lg font-black text-center" />
                            <FieldError className="text-xs text-danger">
                              {errors.dayNumber?.message}
                            </FieldError>
                          </TextField>
                        )}
                      />
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            isInvalid={!!errors.title}
                            className="flex flex-col gap-1 col-span-2"
                          >
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Tiêu đề
                            </Label>
                            <Input
                              placeholder="VD: Kiến thức tổng hợp"
                              className="border-default hover:border-default-hover focus:border-primary px-4 py-2.5 rounded-xl border w-full bg-white/5 outline-none transition-colors text-lg font-semibold"
                            />
                            <FieldError className="text-xs text-danger">
                              {errors.title?.message}
                            </FieldError>
                          </TextField>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          isInvalid={!!errors.description}
                          className="flex flex-col gap-1"
                        >
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Mô tả (tùy chọn)
                          </Label>
                          <TextArea
                            placeholder="Mô tả nội dung ngày chơi..."
                            className="border-default hover:border-default-hover focus:border-primary px-4 py-2.5 rounded-xl border w-full bg-white/5 outline-none transition-colors min-h-20 resize-y text-sm"
                          />
                          <FieldError className="text-xs text-danger">
                            {errors.description?.message}
                          </FieldError>
                        </TextField>
                      )}
                    />
                  </div>

                  {/* ─── Middle column: date pickers ─── */}
                  <div className="flex-4 min-w-70">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 h-full flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        🕐 Thời gian diễn ra
                      </h3>

                      <Controller
                        name="startTime"
                        control={control}
                        render={({ field }) => (
                          <DatePickerField
                            label="Bắt đầu"
                            labelColor="text-emerald-400"
                            icon="▶"
                            calendarLabel="Chọn ngày bắt đầu"
                            value={
                              field.value ? isoToDateValue(field.value) : null
                            }
                            onChange={(val) =>
                              field.onChange(dateValueToISO(val))
                            }
                            isInvalid={!!errors.startTime}
                            errorMessage={errors.startTime?.message}
                          />
                        )}
                      />

                      <Controller
                        name="endTime"
                        control={control}
                        render={({ field }) => (
                          <DatePickerField
                            label="Kết thúc"
                            labelColor="text-red-400"
                            icon="■"
                            calendarLabel="Chọn ngày kết thúc"
                            value={
                              field.value ? isoToDateValue(field.value) : null
                            }
                            onChange={(val) =>
                              field.onChange(dateValueToISO(val))
                            }
                            isInvalid={!!errors.endTime}
                            errorMessage={errors.endTime?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* ─── Right column: toggle + actions ─── */}
                  <div className="flex-3 min-w-60 flex flex-col gap-4 justify-between">
                    {/* Active toggle card */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col justify-center">
                      <div className="flex items-center gap-4">
                        <Switch
                          isSelected={formIsActive}
                          onChange={(checked) =>
                            setValue("isActive", Boolean(checked))
                          }
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Switch.Content>
                            <Label className="text-sm">Kích hoạt</Label>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formIsActive
                                ? "Người chơi sẽ thấy ngày này"
                                : "Ngày này đang bị ẩn"}
                            </p>
                          </Switch.Content>
                        </Switch>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
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
                          : editingDay
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

      {/* ═══════ DAY CARDS LIST (bottom) ═══════ */}
      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : days.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Chưa có ngày chơi nào
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm">
              Bắt đầu bằng cách tạo ngày chơi đầu tiên cho trò chơi quiz
            </p>
            <Button variant="primary" onPress={openCreate}>
              + Tạo ngày đầu tiên
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {days.map((day, idx) => {
                const status = getDayStatus(day);
                return (
                  <motion.div
                    key={day.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`group relative rounded-2xl border bg-white/3 backdrop-blur-sm hover:bg-white/6 transition-all duration-300 overflow-hidden cursor-pointer ${
                      editingDay?.id === day.id
                        ? "border-primary-500/50 ring-1 ring-primary-500/30"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => openEdit(day)}
                  >
                    {/* Accent bar */}
                    <div
                      className={`h-1 w-full ${
                        status.color === "success"
                          ? "bg-linear-to-r from-emerald-500 to-green-400"
                          : status.color === "warning"
                            ? "bg-linear-to-r from-amber-500 to-yellow-400"
                            : status.color === "danger"
                              ? "bg-linear-to-r from-red-500 to-rose-400"
                              : "bg-linear-to-r from-slate-600 to-slate-500"
                      }`}
                    />

                    <div className="p-4">
                      {/* Top: Day # + title + toggle */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
                            <span className="text-lg font-black text-primary-400">
                              {day.dayNumber}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm leading-tight truncate">
                              {day.title}
                            </h3>
                            <Chip
                              size="sm"
                              color={status.color}
                              variant="soft"
                              className="mt-1 text-[10px]"
                            >
                              {status.icon} {status.label}
                            </Chip>
                          </div>
                        </div>

                        <Switch
                          size="sm"
                          isSelected={day.isActive}
                          onChange={() => {
                            toggleActive(day);
                          }}
                          aria-label="Toggle active"
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-lg bg-white/5 px-2.5 py-2 text-center">
                          <div className="text-base font-bold text-white">
                            {day._count.questions}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Câu hỏi
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/5 px-2.5 py-2 text-center">
                          <div className="text-base font-bold text-white">
                            {day._count.dailyResults}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Kết quả
                          </div>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 text-[10px]">
                            ▶
                          </span>
                          <span>{formatDateTime(day.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-400 text-[10px]">■</span>
                          <span>{formatDateTime(day.endTime)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => openEdit(day)}
                          className="flex-1 text-xs text-slate-300 hover:text-white"
                        >
                          ✏️ Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => {
                            deleteDay(day.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          🗑 Xóa
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
