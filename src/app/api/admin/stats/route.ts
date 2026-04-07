import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const [
      totalPlayers,
      totalDays,
      totalQuestions,
      activeDay,
      totalAnswersToday,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PLAYER" } }),
      prisma.gameDay.count(),
      prisma.question.count(),
      prisma.gameDay.findFirst({
        where: { isActive: true },
        select: { dayNumber: true, id: true },
      }),
      prisma.answer.count({
        where: {
          question: {
            gameDay: {
              isActive: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalPlayers,
      totalDays,
      totalQuestions,
      activeDayNumber: activeDay?.dayNumber || null,
      totalAnswersToday,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
