import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Input,
  Label,
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
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { GameDay } from "@/types";

const daySchema = z.object({
  dayNumber: z.number().min(1, "Ngày phải lớn hơn 0"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  isActive: z.boolean(),
});
export type DayFormData = z.infer<typeof daySchema>;

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
      shouldForceLeadingZeros
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

interface FormProps {
  formOpen: boolean;
  editingDay: GameDay | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (data: DayFormData) => void;
  daysCount: number;
}

export default function AdminDaysForm({
  formOpen,
  editingDay,
  saving,
  onCancel,
  onSubmit,
  daysCount,
}: FormProps) {
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

  useEffect(() => {
    if (formOpen) {
      if (editingDay) {
        reset({
          dayNumber: editingDay.dayNumber,
          title: editingDay.title,
          description: editingDay.description || "",
          startTime: editingDay.startTime,
          endTime: editingDay.endTime,
          isActive: editingDay.isActive,
        });
      } else {
        reset({
          dayNumber: daysCount + 1,
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          isActive: false,
        });
      }
    }
  }, [formOpen, editingDay, daysCount, reset]);

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
                {editingDay ? "✏️ Chỉnh sửa ngày chơi" : "📅 Tạo ngày chơi mới"}
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
                <div className="flex-5 min-w-75 space-y-4">
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

                <div className="flex-3 min-w-60 flex flex-col gap-4 justify-between">
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

                  <div className="flex gap-3">
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
  );
}
