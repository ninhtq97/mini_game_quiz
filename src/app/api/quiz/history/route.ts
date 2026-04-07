import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    // First get all distinct game days where user has answered questions
    const userAnswers = await prisma.answer.findMany({
      where: { userId: session.user.id },
      select: {
        question: {
          select: {
            gameDay: {
              select: { id: true, dayNumber: true, title: true },
            },
          },
        },
      },
    });

    // Extract unique game days and sort descending by dayNumber
    const uniqueDaysMap = new Map();
    userAnswers.forEach((a) => {
      if (a.question?.gameDay) {
        uniqueDaysMap.set(a.question.gameDay.id, a.question.gameDay);
      }
    });

    const playedGameDays = Array.from(uniqueDaysMap.values()).sort(
      (a, b) => b.dayNumber - a.dayNumber,
    );

    const history = await Promise.all(
      playedGameDays.map(async (dayData) => {
        // Fetch DailyResult if it exists, otherwise it will be null (meaning pending calculation)
        const dailyResult = await prisma.dailyResult.findUnique({
          where: {
            userId_gameDayId: {
              userId: session.user.id,
              gameDayId: dayData.id,
            },
          },
        });

        const answers = await prisma.answer.findMany({
          where: {
            userId: session.user.id,
            question: { gameDayId: dayData.id },
          },
          include: {
            question: {
              select: { questionText: true, actualCorrectCount: true },
            },
            selectedOption: {
              select: { text: true, isCorrect: true },
            },
          },
          orderBy: {
            question: { order: "asc" },
          },
        });

        const predictions = await prisma.prediction.findMany({
          where: {
            userId: session.user.id,
            question: { gameDayId: dayData.id },
          },
        });

        const predMap = new Map(predictions.map((p) => [p.questionId, p]));

        const currentCorrect = answers.filter(a => a.selectedOption.isCorrect).length;
        const currentTime = answers.reduce((sum, a) => sum + a.timeSpentMs, 0);

        return {
          gameDayId: dayData.id,
          dayNumber: dayData.dayNumber,
          dayTitle: dayData.title,
          correctAnswers: dailyResult?.correctAnswers ?? currentCorrect,
          totalDeviation: dailyResult?.totalDeviation ?? 0,
          totalTimeMs: dailyResult?.totalTimeMs ?? currentTime,
          dailyScore: dailyResult?.dailyScore ?? 0,
          rank: dailyResult?.rank ?? 0,
          isWinner: dailyResult?.isWinner ?? false,
          questions: answers.map((a) => {
            const pred = predMap.get(a.questionId);
            const actualCount = a.question.actualCorrectCount ?? null;
            let deviation = null;
            if (
              pred?.predictedCorrectCount !== undefined &&
              actualCount !== null
            ) {
              deviation = Math.abs(pred.predictedCorrectCount - actualCount);
            }

            return {
              questionText: a.question.questionText,
              selectedAnswer: a.selectedOption.text,
              isCorrect: a.selectedOption.isCorrect,
              timeSpentMs: a.timeSpentMs,
              predictedCount: pred?.predictedCorrectCount ?? null,
              actualCount: actualCount,
              deviation: deviation,
            };
          }),
        };
      }),
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
