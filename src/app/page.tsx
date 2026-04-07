"use client";

import { Button, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function CountdownDisplay() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(9, 0, 0, 0);

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "Ngày", value: timeLeft.days },
    { label: "Giờ", value: timeLeft.hours },
    { label: "Phút", value: timeLeft.minutes },
    { label: "Giây", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-5">
      {units.map((unit) => (
        <motion.div
          key={unit.label}
          className="glass rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-center min-w-17.5 sm:min-w-22.5"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-2xl sm:text-4xl font-bold gradient-text">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 mt-1">
            {unit.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: "🎯",
    title: "Câu hỏi hàng ngày",
    desc: "2-3 câu hỏi thú vị mỗi ngày, thử thách kiến thức của bạn",
  },
  {
    icon: "🔮",
    title: "Dự đoán kết quả",
    desc: "Bạn nghĩ bao nhiêu người sẽ trả lời đúng? Hãy dự đoán!",
  },
  {
    icon: "⚡",
    title: "Tốc độ là sức mạnh",
    desc: "Trả lời nhanh hơn để có cơ hội giành thứ hạng cao hơn",
  },
  {
    icon: "🏆",
    title: "Giải thưởng",
    desc: "Giải thưởng hàng ngày & giải chung cuộc sau 20 ngày",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-radial bg-grid relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full bg-primary-500/30 blur-[120px] -top-48 -left-48"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-100 h-100 rounded-full bg-neon-cyan/30 blur-[100px] top-1/2 -right-32"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-75 h-75 rounded-full bg-neon-pink/30 blur-[80px] bottom-20 left-1/3"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-neon-cyan flex items-center justify-center text-white font-bold text-lg">
            Q
          </div>
          <span className="text-xl font-bold">MiniQuiz</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {session ? (
            <Button
              onPress={() => router.push("/dashboard")}
              variant="primary"
              className="font-semibold shadow-lg rounded-full"
            >
              Vào chơi
            </Button>
          ) : (
            <>
              <Button
                onPress={() => router.push("/login")}
                variant="ghost"
                className="text-slate-300 hover:text-white rounded-full"
              >
                Đăng nhập
              </Button>
              <Button
                onPress={() => router.push("/register")}
                variant="primary"
                className="font-semibold shadow-lg rounded-full"
              >
                Tham gia ngay
              </Button>
            </>
          )}
        </motion.div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Chip
            color="default"
            variant="soft"
            className="mb-6 px-4 py-2 text-sm"
          >
            <span className="text-base mr-2">🎉</span>
            Thử thách 20 ngày đã bắt đầu!
          </Chip>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Thử thách kiến thức <span className="gradient-text">20 ngày</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Mỗi ngày 2-3 câu hỏi · Dự đoán kết quả · Giành giải thưởng mỗi ngày và
          giải chung cuộc cực hấp dẫn!
        </motion.p>

        {/* Countdown */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-slate-500 mb-4 uppercase tracking-widest">
            Vòng tiếp theo bắt đầu trong
          </p>
          <CountdownDisplay />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onPress={() => router.push(session ? "/dashboard" : "/register")}
            size="lg"
            variant="primary"
            className="text-lg px-10 py-7 font-bold shadow-lg rounded-full"
          >
            {session ? "Vào chơi ngay" : "Đăng ký tham gia"} 🚀
          </Button>
          <Button
            onPress={() => {
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            size="lg"
            variant="outline"
            className="text-lg px-10 py-7 border-slate-700 text-slate-300 rounded-full"
          >
            Cách chơi ↓
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          id="how-it-works"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 w-full max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 text-left group cursor-default"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="mt-32 w-full max-w-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            Cách chơi <span className="gradient-text">đơn giản</span>
          </h2>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Đăng ký tài khoản",
                desc: "Chỉ cần tên, email và mật khẩu",
              },
              {
                step: "2",
                title: "Trả lời câu hỏi",
                desc: "Mỗi ngày 2-3 câu hỏi, trả lời nhanh và chính xác",
              },
              {
                step: "3",
                title: "Dự đoán kết quả",
                desc: "Dự đoán bao nhiêu người sẽ trả lời đúng",
              },
              {
                step: "4",
                title: "Giành giải thưởng",
                desc: "Ai đúng nhất, dự đoán gần nhất, nhanh nhất sẽ thắng!",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex items-start gap-6 text-left"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-500 to-neon-cyan flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>© 2026 MiniQuiz. Thử thách kiến thức mỗi ngày.</p>
      </footer>
    </div>
  );
}
