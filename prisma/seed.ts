import { config } from "dotenv";

config({ override: true });

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

  // Create 20 Days
  const now = new Date();

  for (let dayIndex = 1; dayIndex <= 20; dayIndex++) {
    const startOfDay = new Date(now);
    // Add (dayIndex - 1) days to today
    startOfDay.setDate(startOfDay.getDate() + (dayIndex - 1));
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const gameDay = await prisma.gameDay.upsert({
      where: { dayNumber: dayIndex },
      update: {
        isActive: true,
        startTime: startOfDay,
        endTime: endOfDay,
        title: `Thử thách Ngày ${dayIndex}`,
      },
      create: {
        dayNumber: dayIndex,
        title: `Thử thách Ngày ${dayIndex}`,
        description: `Bộ câu hỏi ngẫu nhiên cho ngày thi đấu thứ ${dayIndex}`,
        startTime: startOfDay,
        endTime: endOfDay,
        isActive: true,
      },
    });

    console.log(
      `✅ Day ${dayIndex} created: ${startOfDay.toLocaleDateString()}`,
    );

    // Create 3 questions for this day
    const questionsData = [
      {
        questionText: `Câu hỏi 1 của Ngày ${dayIndex}: Bạn đã sẵn sàng chưa?`,
        options: [
          { id: "a", text: "Chưa", isCorrect: false },
          { id: "b", text: "Sẵn sàng", isCorrect: true },
          { id: "c", text: "Để mai tính", isCorrect: false },
          { id: "d", text: "Không biết", isCorrect: false },
        ],
        order: 1,
      },
      {
        questionText: `Câu hỏi 2 của Ngày ${dayIndex}: Trong các môn thể thao sau, môn nào chơi bằng tay?`,
        options: [
          { id: "a", text: "Bóng đá", isCorrect: false },
          { id: "b", text: "Đua xe đạp", isCorrect: false },
          { id: "c", text: "Bóng rổ", isCorrect: true },
          { id: "d", text: "Điền kinh", isCorrect: false },
        ],
        order: 2,
      },
      {
        questionText: `Câu hỏi 3 của Ngày ${dayIndex}: Đâu là thủ đô của một quốc gia?`,
        options: [
          { id: "a", text: "New York", isCorrect: false },
          { id: "b", text: "Paris", isCorrect: true },
          { id: "c", text: "Sydney", isCorrect: false },
          { id: "d", text: "Toronto", isCorrect: false },
        ],
        order: 3,
      },
    ];

    for (const q of questionsData) {
      await prisma.question.upsert({
        where: {
          gameDayId_order: {
            gameDayId: gameDay.id,
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
          gameDayId: gameDay.id,
          questionText: q.questionText,
          questionType: "MULTIPLE_CHOICE",
          order: q.order,
          points: 10,
          timeLimitSeconds: 30,
          options: {
            create: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        },
      });
    }
  }

  console.log("\n🎉 Seeding 20 days completed!");
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
