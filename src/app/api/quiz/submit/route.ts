import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, selectedOptionId, timeSpentMs } = body;

    if (!questionId || !selectedOptionId || timeSpentMs === undefined) {
      return NextResponse.json(
        { message: "Thiếu thông tin câu trả lời" },
        { status: 400 },
      );
    }

    // Check if already answered
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { message: "Bạn đã trả lời câu hỏi này rồi" },
        { status: 400 },
      );
    }

    // Get question to verify
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        gameDay: true,
        options: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Câu hỏi không tồn tại" },
        { status: 404 },
      );
    }

    // Check if game day is still active
    const now = new Date();
    if (now < question.gameDay.startTime || now > question.gameDay.endTime) {
      return NextResponse.json(
        { message: "Thời gian trả lời đã kết thúc" },
        { status: 400 },
      );
    }

    // Find the selected option
    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) {
      return NextResponse.json(
        { message: "Đáp án không hợp lệ" },
        { status: 400 },
      );
    }

    const isCorrect = option.isCorrect;

    const answer = await prisma.answer.create({
      data: {
        userId: session.user.id,
        questionId,
        selectedOptionId,
        timeSpentMs: Math.max(0, timeSpentMs),
      },
    });

    const correctOption = question.options.find((o) => o.isCorrect);

    return NextResponse.json({
      answerId: answer.id,
      isCorrect,
      correctOptionId: correctOption?.id || "",
      correctAnswerText: correctOption?.text || "",
      options: question.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
