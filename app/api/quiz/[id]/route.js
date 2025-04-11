import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// GET /api/quiz/[id]
export async function GET(request, { params }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const quizId = parseInt(params.id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    // Get the quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz", details: error.message },
      { status: 500 }
    );
  }
} 