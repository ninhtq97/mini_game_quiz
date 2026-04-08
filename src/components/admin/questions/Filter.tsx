import { Button, ListBox, ListBoxItem, Select } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameDay } from "@/types";

interface FilterProps {
  days: GameDay[];
  filterDayId: string;
  onFilterChange: (id: string) => void;
  formOpen: boolean;
  onOpenCreate: () => void;
}

export default function AdminQuestionsFilter({
  days,
  filterDayId,
  onFilterChange,
  formOpen,
  onOpenCreate,
}: FilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-64">
        <Select
          aria-label="Lọc theo ngày"
          placeholder="Tất cả các ngày"
          value={filterDayId || null}
          onChange={(key) => onFilterChange(key ? String(key) : "")}
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
              onPress={onOpenCreate}
              className="font-bold text-base px-6 py-2.5 w-full sm:w-auto"
            >
              + Tạo câu hỏi mới
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
