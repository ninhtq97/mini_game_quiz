import { motion } from "framer-motion";

interface HeaderProps {
  questionsCount: number;
}

export default function AdminQuestionsHeader({ questionsCount }: HeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold">❓ Quản lý câu hỏi</h1>
      <p className="text-slate-400 mt-1">
        Tạo và quản lý câu hỏi cho từng ngày chơi • {questionsCount} câu
      </p>
    </motion.div>
  );
}
