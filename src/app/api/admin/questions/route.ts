import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const gameDayId = request.nextUrl.searchParams.get("gameDayId");

    const questions = await prisma.question.findMany({
      where: gameDayId ? { gameDayId } : {},
      orderBy: [{ gameDayId: "asc" }, { order: "asc" }],
      include: {
        gameDay: {
          select: { dayNumber: true, title: true },
        },
        _count: {
          select: { answers: true },
        },
        options: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Admin questions GET error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      gameDayId,
      questionText,
      questionType,
      options,
      order,
      points,
      timeLimitSeconds,
      imageUrl,
    } = body;

    if (!gameDayId || !questionText || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc" },
        { status: 400 },
      );
    }

    const question = await prisma.question.create({
      data: {
        gameDayId,
        questionText,
        questionType: questionType || "MULTIPLE_CHOICE",
        order: order || 1,
        points: points || 10,
        timeLimitSeconds: timeLimitSeconds || 30,
        imageUrl: imageUrl || null,
        options: {
          create: options.map(
            (opt: { text: string; isCorrect: boolean }) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            }),
          ),
        },
      },
      include: { options: true },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Admin questions POST error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, options, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...data };

    if (options && Array.isArray(options)) {
      updateData.options = {
        deleteMany: {},
        create: options.map(
          (opt: { text: string; isCorrect: boolean }) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          }),
        ),
      };
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
      include: { options: true },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Admin questions PUT error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ message: "Đã xóa" });
  } catch (error) {
    console.error("Admin questions DELETE error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
