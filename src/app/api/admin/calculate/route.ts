import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDailyScore, compareDailyResults } from "@/lib/scoring";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function POST(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { gameDayId } = body;

    if (!gameDayId) {
      return NextResponse.json({ message: "Thiếu gameDayId" }, { status: 400 });
    }

    const gameDay = await prisma.gameDay.findUnique({
      where: { id: gameDayId },
      include: {
        questions: true,
      },
    });

    if (!gameDay) {
      return NextResponse.json(
        { message: "Ngày chơi không tồn tại" },
        { status: 404 },
      );
    }

    // Step 1: Calculate actual correct count for each question
    for (const question of gameDay.questions) {
      const correctCount = await prisma.answer.count({
        where: {
          questionId: question.id,
          selectedOption: { isCorrect: true },
        },
      });

      // Update actual count in Question table instead of Prediction table
      await prisma.question.update({
        where: { id: question.id },
        data: {
          actualCorrectCount: correctCount,
        },
      });
    }

    // Step 2: Get all users who participated
    const allAnswers = await prisma.answer.findMany({
      where: {
        question: { gameDayId },
      },
      select: { userId: true },
    });

    const uniqueUserIds = [...new Set(allAnswers.map((a) => a.userId))];

    // Step 3: Calculate daily result for each user
    const results: {
      userId: string;
      correctAnswers: number;
      totalDeviation: number;
      totalTimeMs: number;
      dailyScore: number;
    }[] = [];

    for (const userId of uniqueUserIds) {
      const userAnswers = await prisma.answer.findMany({
        where: {
          userId,
          question: { gameDayId },
        },
        include: { selectedOption: true },
      });

      const userPredictions = await prisma.prediction.findMany({
        where: {
          userId,
          question: { gameDayId },
        },
        include: { question: true },
      });

      const correctAnswers = userAnswers.filter(
        (a) => a.selectedOption.isCorrect,
      ).length;
      const totalTimeMs = userAnswers.reduce(
        (sum, a) => sum + a.timeSpentMs,
        0,
      );
      const totalDeviation = userPredictions.reduce(
        (sum, p) =>
          sum +
          Math.abs(
            p.predictedCorrectCount - (p.question.actualCorrectCount ?? 0),
          ),
        0,
      );

      const dailyScore = calculateDailyScore(
        correctAnswers,
        totalDeviation,
        totalTimeMs,
      );

      results.push({
        userId,
        correctAnswers,
        totalDeviation,
        totalTimeMs,
        dailyScore,
      });
    }

    // Step 4: Sort and assign ranks
    results.sort((a, b) => compareDailyResults(a, b));

    // Step 5: Upsert daily results
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      await prisma.dailyResult.upsert({
        where: {
          userId_gameDayId: {
            userId: r.userId,
            gameDayId,
          },
        },
        update: {
          correctAnswers: r.correctAnswers,
          totalDeviation: r.totalDeviation,
          totalTimeMs: r.totalTimeMs,
          dailyScore: r.dailyScore,
          rank: i + 1,
          isWinner: i === 0,
        },
        create: {
          userId: r.userId,
          gameDayId,
          correctAnswers: r.correctAnswers,
          totalDeviation: r.totalDeviation,
          totalTimeMs: r.totalTimeMs,
          dailyScore: r.dailyScore,
          rank: i + 1,
          isWinner: i === 0,
        },
      });
    }

    return NextResponse.json({
      message: `Đã tính kết quả cho ${results.length} người chơi`,
      totalPlayers: results.length,
      winner: results.length > 0 ? results[0] : null,
    });
  } catch (error) {
    console.error("Calculate results error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
