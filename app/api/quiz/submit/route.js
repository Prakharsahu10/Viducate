import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// POST /api/quiz/submit
export async function POST(request) {
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

    const { quizId, score, maxScore } = await request.json();

    if (!quizId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: "Quiz ID, score, and maxScore are required" },
        { status: 400 }
      );
    }

    // Get the quiz to verify it exists
    const quiz = await db.quiz.findUnique({
      where: { id: parseInt(quizId) },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if user already completed this quiz
    const existingResult = await db.quizResult.findUnique({
      where: {
        userId_quizId: {
          userId: dbUser.id,
          quizId: parseInt(quizId),
        },
      },
    });

    // Calculate points to award based on score
    const pointsToAward = Math.round((score / 100) * quiz.points);

    if (existingResult) {
      // Update existing result if the new score is higher
      if (score > existingResult.score) {
        await db.quizResult.update({
          where: {
            id: existingResult.id,
          },
          data: {
            score,
            maxScore,
            completedAt: new Date(),
          },
        });

        // Award additional points if score improved
        const pointsDifference = Math.round((score - existingResult.score) / 100 * quiz.points);
        if (pointsDifference > 0) {
          await db.user.update({
            where: { id: dbUser.id },
            data: {
              points: { increment: pointsDifference },
            },
          });
        }
      }
    } else {
      // Create new quiz result
      await db.quizResult.create({
        data: {
          userId: dbUser.id,
          quizId: parseInt(quizId),
          score,
          maxScore,
        },
      });

      // Award points to the user
      await db.user.update({
        where: { id: dbUser.id },
        data: {
          points: { increment: pointsToAward },
        },
      });
    }

    // Check for achievements
    // 1. First Quiz Achievement
    const quizCount = await db.quizResult.count({
      where: {
        userId: dbUser.id,
      },
    });

    if (quizCount === 1) {
      const firstQuizAchievement = await db.achievement.findFirst({
        where: {
          name: "Quiz Taker",
        },
      });

      if (firstQuizAchievement) {
        // Check if user already has this achievement
        const hasAchievement = await db.userAchievement.findFirst({
          where: {
            userId: dbUser.id,
            achievementId: firstQuizAchievement.id,
          },
        });

        if (!hasAchievement) {
          // Award the achievement
          await db.userAchievement.create({
            data: {
              userId: dbUser.id,
              achievementId: firstQuizAchievement.id,
            },
          });

          // Award points for the achievement
          await db.user.update({
            where: { id: dbUser.id },
            data: {
              points: { increment: firstQuizAchievement.points },
            },
          });
        }
      }
    }

    // 2. Perfect Score Achievement
    if (score === 100) {
      const perfectScoreAchievement = await db.achievement.findFirst({
        where: {
          name: "Perfect Score",
        },
      });

      if (perfectScoreAchievement) {
        // Check if user already has this achievement
        const hasAchievement = await db.userAchievement.findFirst({
          where: {
            userId: dbUser.id,
            achievementId: perfectScoreAchievement.id,
          },
        });

        if (!hasAchievement) {
          // Award the achievement
          await db.userAchievement.create({
            data: {
              userId: dbUser.id,
              achievementId: perfectScoreAchievement.id,
            },
          });

          // Award points for the achievement
          await db.user.update({
            where: { id: dbUser.id },
            data: {
              points: { increment: perfectScoreAchievement.points },
            },
          });
        }
      }
    }

    // 3. Quiz Master Achievement (complete 5 quizzes)
    if (quizCount === 5) {
      const quizMasterAchievement = await db.achievement.findFirst({
        where: {
          name: "Quiz Master",
        },
      });

      if (quizMasterAchievement) {
        // Check if user already has this achievement
        const hasAchievement = await db.userAchievement.findFirst({
          where: {
            userId: dbUser.id,
            achievementId: quizMasterAchievement.id,
          },
        });

        if (!hasAchievement) {
          // Award the achievement
          await db.userAchievement.create({
            data: {
              userId: dbUser.id,
              achievementId: quizMasterAchievement.id,
            },
          });

          // Award points for the achievement
          await db.user.update({
            where: { id: dbUser.id },
            data: {
              points: { increment: quizMasterAchievement.points },
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      points: pointsToAward,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz", details: error.message },
      { status: 500 }
    );
  }
} 