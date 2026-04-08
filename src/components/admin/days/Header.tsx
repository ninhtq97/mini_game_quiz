import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface HeaderProps {
  daysCount: number;
  formOpen: boolean;
  onOpenCreate: () => void;
}

export default function Header({
  daysCount,
  formOpen,
  onOpenCreate,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">📅 Quản lý ngày chơi</h1>
        <p className="text-slate-400 mt-1">
          Tạo và quản lý các ngày chơi quiz • {daysCount} ngày
        </p>
      </motion.div>
      {!formOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            variant="primary"
            onPress={onOpenCreate}
            className="font-bold text-base px-6 py-2.5"
          >
            + Tạo ngày mới
          </Button>
        </motion.div>
      )}
    </div>
  );
}
