import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const now = DateTime.now().toJSDate();

    // Find active game day
    const activeDay = await prisma.gameDay.findFirst({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: true,
          },
        },
      },
    });

    if (!activeDay) {
      // Find next upcoming day
      const nextDay = await prisma.gameDay.findFirst({
        where: {
          startTime: { gt: now },
        },
        orderBy: { startTime: "asc" },
      });

      return NextResponse.json({
        status: "no_active_quiz",
        nextDay: nextDay
          ? {
              dayNumber: nextDay.dayNumber,
              title: nextDay.title,
              startTime: nextDay.startTime.toISOString(),
            }
          : null,
      });
    }

    // Get user's existing answers for this day
    const existingAnswers = await prisma.answer.findMany({
      where: {
        userId: session.user.id,
        question: {
          gameDayId: activeDay.id,
        },
      },
      select: {
        questionId: true,
        selectedOptionId: true,
        selectedOption: {
          select: {
            isCorrect: true,
            text: true,
          },
        },
      },
    });

    // Get user's existing predictions
    const existingPredictions = await prisma.prediction.findMany({
      where: {
        userId: session.user.id,
        question: {
          gameDayId: activeDay.id,
        },
      },
      select: {
        questionId: true,
        predictedCorrectCount: true,
      },
    });

    const answeredQuestionIds = new Set(
      existingAnswers.map((a) => a.questionId),
    );
    const predictedQuestionIds = new Set(
      existingPredictions.map((p) => p.questionId),
    );

    // Strip correct answers from questions not yet answered
    const questionsForPlayer = activeDay.questions.map((q) => {
      const answered = answeredQuestionIds.has(q.id);
      const predicted = predictedQuestionIds.has(q.id);

      const userAnswerData = existingAnswers.find((a) => a.questionId === q.id);

      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options
          .map((o) => ({
            id: o.id,
            text: o.text,
          }))
          .sort(() => Math.random() - 0.5),
        order: q.order,
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds,
        imageUrl: q.imageUrl,
        answered,
        predicted,
        userAnswer:
          answered && userAnswerData
            ? {
                selectedOptionId: userAnswerData.selectedOptionId,
                isCorrect: userAnswerData.selectedOption.isCorrect,
              }
            : null,
        userPrediction: predicted
          ? existingPredictions.find((p) => p.questionId === q.id)
          : null,
      };
    });

    return NextResponse.json({
      status: "active",
      gameDay: {
        id: activeDay.id,
        dayNumber: activeDay.dayNumber,
        title: activeDay.title,
        description: activeDay.description,
        startTime: activeDay.startTime.toISOString(),
        endTime: activeDay.endTime.toISOString(),
      },
      questions: questionsForPlayer,
    });
  } catch (error) {
    console.error("Get today quiz error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
