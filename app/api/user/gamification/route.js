import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      include: {
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
          take: 5,
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
          take: 5,
        },
        quizResults: {
          include: {
            quiz: true,
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate next level threshold (simple formula: current level * 100)
    const nextLevelPoints = user.level * 100;
    
    // Get user rank on leaderboard
    const rankQuery = await db.user.findMany({
      orderBy: {
        points: 'desc',
      },
      select: {
        id: true,
        points: true,
      },
    });

    const userRank = rankQuery.findIndex(u => u.id === user.id) + 1;

    // Format badge data
    const badges = user.badges.map(userBadge => ({
      id: userBadge.badge.id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      imageUrl: userBadge.badge.imageUrl,
      earnedAt: userBadge.earnedAt,
      emoji: getEmojiForBadge(userBadge.badge.name),
    }));

    // Format achievement data
    const achievements = user.achievements.map(userAchievement => ({
      id: userAchievement.achievement.id,
      name: userAchievement.achievement.name,
      description: userAchievement.achievement.description,
      imageUrl: userAchievement.achievement.imageUrl,
      earnedAt: userAchievement.earnedAt,
      emoji: getEmojiForAchievement(userAchievement.achievement.name),
    }));

    // Get active challenges
    const activeChallengesData = await getActiveChallenges(user.id);

    return NextResponse.json({
      success: true,
      gamification: {
        points: user.points,
        level: user.level,
        nextLevelPoints,
        streak: user.streak,
        lastActive: user.lastActive,
        badges,
        achievements,
        rank: userRank,
        challenges: activeChallengesData,
      },
    });
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    );
  }
}

// Helper function to get emoji for badge
function getEmojiForBadge(badgeName) {
  const emojiMap = {
    "First Video": "🎬",
    "Engagement Star": "⭐",
    "Quiz Master": "🧠",
    "Content Creator": "🏆",
    "Polyglot": "🌎",
    "Early Bird": "🌅",
    "Night Owl": "🦉",
    "Perfect Score": "💯",
    "Fast Learner": "⚡",
    "Team Player": "👥",
  };
  
  return emojiMap[badgeName] || "🏅";
}

// Helper function to get emoji for achievement
function getEmojiForAchievement(achievementName) {
  const emojiMap = {
    "Video Pioneer": "🚀",
    "Knowledge Explorer": "🔍",
    "Quiz Champion": "🏅",
    "Dedication Award": "📅",
    "Language Master": "🗣️",
    "Content Guru": "🧘",
    "Community Leader": "👑",
    "Top Contributor": "🌟",
  };
  
  return emojiMap[achievementName] || "🎯";
}

// Helper function to get active challenges
async function getActiveChallenges(userId) {
  // In a real implementation, this would fetch from a challenges table
  // For now, returning mock data
  return [
    {
      id: 1,
      title: "Create 3 Videos",
      description: "Create 3 educational videos this week",
      progress: 1,
      total: 3,
      points: 30,
      daysLeft: 5,
      category: "creation",
      difficulty: "medium"
    },
    {
      id: 2,
      title: "Language Explorer",
      description: "Create videos in 2 different languages",
      progress: 1,
      total: 2,
      points: 25,
      daysLeft: 3,
      category: "exploration",
      difficulty: "easy"
    },
    {
      id: 3,
      title: "Physics Quiz",
      description: "Complete the physics quiz with at least 80% score",
      progress: 0,
      total: 1,
      points: 100,
      daysLeft: 7,
      category: "quiz",
      difficulty: "hard",
      quizId: 123
    }
  ];
} 