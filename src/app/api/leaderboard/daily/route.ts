import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dayNumber = searchParams.get("day");

    let gameDay;

    if (dayNumber) {
      gameDay = await prisma.gameDay.findUnique({
        where: { dayNumber: Number.parseInt(dayNumber) },
      });
    } else {
      // Get most recent completed or active day
      gameDay = await prisma.gameDay.findFirst({
        where: {
          dailyResults: {
            some: {},
          },
        },
        orderBy: { dayNumber: "desc" },
      });
    }

    if (!gameDay) {
      return NextResponse.json({
        leaderboard: [],
        dayNumber: null,
      });
    }

    const results = await prisma.dailyResult.findMany({
      where: { gameDayId: gameDay.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { correctAnswers: "desc" },
        { totalDeviation: "asc" },
        { totalTimeMs: "asc" },
      ],
    });

    const leaderboard = results.map((r, i) => ({
      rank: r.rank || i + 1,
      userId: r.userId,
      userName: r.user.name,
      avatarUrl: r.user.avatarUrl,
      correctAnswers: r.correctAnswers,
      totalDeviation: r.totalDeviation,
      totalTimeMs: r.totalTimeMs,
      dailyScore: r.dailyScore,
      isWinner: r.isWinner,
    }));

    return NextResponse.json({
      leaderboard,
      dayNumber: gameDay.dayNumber,
      dayTitle: gameDay.title,
    });
  } catch (error) {
    console.error("Daily leaderboard error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
