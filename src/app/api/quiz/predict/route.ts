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
    const { questionId, predictedCorrectCount } = body;

    if (!questionId || predictedCorrectCount === undefined) {
      return NextResponse.json(
        { message: "Thiếu thông tin dự đoán" },
        { status: 400 },
      );
    }

    if (predictedCorrectCount < 0) {
      return NextResponse.json(
        { message: "Số dự đoán không hợp lệ" },
        { status: 400 },
      );
    }

    // Check if already predicted
    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
    });

    if (existingPrediction) {
      return NextResponse.json(
        { message: "Bạn đã dự đoán cho câu hỏi này rồi" },
        { status: 400 },
      );
    }

    // Check question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { gameDay: true },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Câu hỏi không tồn tại" },
        { status: 404 },
      );
    }

    const prediction = await prisma.prediction.create({
      data: {
        userId: session.user.id,
        questionId,
        predictedCorrectCount,
      },
    });

    return NextResponse.json({
      predictionId: prediction.id,
      predictedCorrectCount: prediction.predictedCorrectCount,
    });
  } catch (error) {
    console.error("Submit prediction error:", error);
    return NextResponse.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}
