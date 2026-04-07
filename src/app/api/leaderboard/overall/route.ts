import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    // Aggregate all daily results per user
    const aggregated = await prisma.dailyResult.groupBy({
      by: ["userId"],
      _sum: {
        correctAnswers: true,
        dailyScore: true,
      },
      _count: {
        gameDayId: true,
      },
    });

    // Get win count per user
    const winCounts = await prisma.dailyResult.groupBy({
      by: ["userId"],
      where: { isWinner: true },
      _count: { id: true },
    });

    const winMap = new Map(winCounts.map((w) => [w.userId, w._count.id]));

    // Get user info
    const userIds = aggregated.map((a) => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build leaderboard
    const leaderboard = aggregated
      .map((a) => ({
        userId: a.userId,
        userName: userMap.get(a.userId)?.name || "Unknown",
        avatarUrl: userMap.get(a.userId)?.avatarUrl || null,
        totalCorrectAnswers: a._sum.correctAnswers || 0,
        totalScore: a._sum.dailyScore || 0,
        daysPlayed: a._count.gameDayId,
        dailyWins: winMap.get(a.userId) || 0,
      }))
      .sort((a, b) => {
        if (a.totalCorrectAnswers !== b.totalCorrectAnswers) {
          return b.totalCorrectAnswers - a.totalCorrectAnswers;
        }
        return b.totalScore - a.totalScore;
      })
      .map((entry, i) => ({
        ...entry,
        rank: i + 1,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Overall leaderboard error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
