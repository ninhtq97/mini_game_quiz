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

    const days = await prisma.gameDay.findMany({
      orderBy: { dayNumber: "asc" },
      include: {
        _count: {
          select: { questions: true, dailyResults: true },
        },
      },
    });

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Admin days GET error:", error);
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
    const { dayNumber, title, description, startTime, endTime, isActive } =
      body;

    if (!dayNumber || !title || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Thiếu thông tin bắt buộc" },
        { status: 400 },
      );
    }

    // If setting active, deactivate all others
    if (isActive) {
      await prisma.gameDay.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const day = await prisma.gameDay.create({
      data: {
        dayNumber,
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: isActive || false,
      },
    });

    return NextResponse.json({ day }, { status: 201 });
  } catch (error) {
    console.error("Admin days POST error:", error);
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
    const { id, dayNumber, title, description, startTime, endTime, isActive } =
      body;

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });
    }

    // If setting active, deactivate all others
    if (isActive) {
      await prisma.gameDay.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    const day = await prisma.gameDay.update({
      where: { id },
      data: {
        ...(dayNumber !== undefined && { dayNumber }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ day });
  } catch (error) {
    console.error("Admin days PUT error:", error);
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

    await prisma.gameDay.delete({ where: { id } });

    return NextResponse.json({ message: "Đã xóa" });
  } catch (error) {
    console.error("Admin days DELETE error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
