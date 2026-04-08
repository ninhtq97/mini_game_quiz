import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PlayComplete() {
  const router = useRouter();

  return (
    <div className="w-full text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 border border-neon-green/20"
      >
        <div className="text-4xl mb-3">🎊</div>
        <h3 className="text-xl font-bold mb-2">Hoàn thành!</h3>
        <p className="text-slate-400 text-sm mb-4">
          Bạn đã hoàn thành tất cả câu hỏi hôm nay. Kết quả sẽ được tổng hợp khi
          ngày chơi kết thúc.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onPress={() => router.push("/leaderboard")}
            variant="primary"
            className="shadow-lg rounded-full"
          >
            Xem BXH 🏆
          </Button>
          <Button
            onPress={() => router.push("/dashboard")}
            variant="outline"
            className="border-white/10 rounded-full"
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
