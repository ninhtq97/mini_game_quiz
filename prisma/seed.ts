import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@miniquiz.vn" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@miniquiz.vn",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create test players
  const playerPassword = await hash("player123", 12);
  const players = [];
  const playerNames = [
    "Nguyễn Văn A",
    "Trần Thị B",
    "Lê Văn C",
    "Phạm Thị D",
    "Hoàng Văn E",
  ];

  for (let i = 0; i < playerNames.length; i++) {
    const player = await prisma.user.upsert({
      where: { email: `player${i + 1}@test.com` },
      update: {},
      create: {
        name: playerNames[i],
        email: `player${i + 1}@test.com`,
        password: playerPassword,
        role: "PLAYER",
      },
    });
    players.push(player);
  }
  console.log(`✅ Created ${players.length} test players`);

  // Create Day 1
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const day1 = await prisma.gameDay.upsert({
    where: { dayNumber: 1 },
    update: {
      isActive: true,
      startTime: startOfDay,
      endTime: endOfDay,
    },
    create: {
      dayNumber: 1,
      title: "Kiến thức tổng hợp",
      description: "Khởi đầu với những câu hỏi kiến thức phổ thông",
      startTime: startOfDay,
      endTime: endOfDay,
      isActive: true,
    },
  });
  console.log(`✅ Day 1: ${day1.title}`);

  // Create questions for Day 1
  const questionsData = [
    {
      questionText: "Thủ đô của Việt Nam là gì?",
      options: [
        { id: "a", text: "Hà Nội", isCorrect: true },
        { id: "b", text: "TP. Hồ Chí Minh", isCorrect: false },
        { id: "c", text: "Đà Nẵng", isCorrect: false },
        { id: "d", text: "Huế", isCorrect: false },
      ],
      correctAnswer: "a",
      order: 1,
    },
    {
      questionText: "Sông nào dài nhất Việt Nam?",
      options: [
        { id: "a", text: "Sông Hồng", isCorrect: false },
        { id: "b", text: "Sông Mekong (Cửu Long)", isCorrect: true },
        { id: "c", text: "Sông Đà", isCorrect: false },
        { id: "d", text: "Sông Thái Bình", isCorrect: false },
      ],
      correctAnswer: "b",
      order: 2,
    },
    {
      questionText: "Năm sinh của Chủ tịch Hồ Chí Minh?",
      options: [
        { id: "a", text: "1888", isCorrect: false },
        { id: "b", text: "1889", isCorrect: false },
        { id: "c", text: "1890", isCorrect: true },
        { id: "d", text: "1891", isCorrect: false },
      ],
      correctAnswer: "c",
      order: 3,
    },
  ];

  for (const q of questionsData) {
    await prisma.question.upsert({
      where: {
        gameDayId_order: {
          gameDayId: day1.id,
          order: q.order,
        },
      },
      update: {
        questionText: q.questionText,
        options: {
          deleteMany: {},
          create: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      create: {
        gameDayId: day1.id,
        questionText: q.questionText,
        questionType: "MULTIPLE_CHOICE",
        order: q.order,
        points: 10,
        timeLimitSeconds: 30,
        options: {
          create: q.options.map((opt, index) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: index,
          })),
        },
      },
    });
  }
  console.log(`✅ Created ${questionsData.length} questions for Day 1`);

  console.log("\n🎉 Seeding completed!");
  console.log("📧 Admin login: admin@miniquiz.vn / admin123");
  console.log("📧 Player login: player1@test.com / player123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
