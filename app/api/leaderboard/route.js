import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "weekly";

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For a real implementation, we would adjust the query based on timeframe
    // For example, we might calculate points earned in the last day, week, or all time
    
    // Get top users based on points
    const users = await db.user.findMany({
      orderBy: {
        points: "desc",
      },
      take: 20,
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        imageUrl: true,
        points: true,
        level: true,
      },
    });

    // In a real implementation, we would calculate rank
    // For now, we'll assign ranks based on order
    const leaderboardData = users.map((user, index) => ({
      id: user.id,
      name: user.name || "Anonymous User",
      imageUrl: user.imageUrl,
      points: user.points,
      level: user.level,
      rank: index + 1,
      isCurrentUser: user.clerkUserId === userId,
    }));

    // If no real users yet, supplement with sample data
    const sampleLeaderboardData = generateSampleLeaderboardData(timeframe);

    return NextResponse.json({
      success: true,
      timeframe,
      leaderboard: leaderboardData.length > 0 ? leaderboardData : sampleLeaderboardData,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}

// Helper function to generate sample leaderboard data
function generateSampleLeaderboardData(timeframe) {
  // Points will be higher for "all time" and lower for "daily"
  const pointsMultiplier = timeframe === "alltime" ? 5 : timeframe === "weekly" ? 2 : 1;
  
  return [
    { 
      id: 1, 
      name: "Alex Johnson", 
      imageUrl: "https://i.pravatar.cc/100?img=1", 
      points: 1250 * pointsMultiplier, 
      level: 12, 
      rank: 1,
      isCurrentUser: false
    },
    { 
      id: 2, 
      name: "Maya Patel", 
      imageUrl: "https://i.pravatar.cc/100?img=2", 
      points: 980 * pointsMultiplier, 
      level: 10, 
      rank: 2,
      isCurrentUser: false
    },
    { 
      id: 3, 
      name: "Sam Wilson", 
      imageUrl: "https://i.pravatar.cc/100?img=3", 
      points: 850 * pointsMultiplier, 
      level: 9, 
      rank: 3,
      isCurrentUser: false
    },
    { 
      id: 4, 
      name: "Taylor Swift", 
      imageUrl: "https://i.pravatar.cc/100?img=4", 
      points: 720 * pointsMultiplier, 
      level: 8, 
      rank: 4,
      isCurrentUser: false
    },
    { 
      id: 5, 
      name: "Jamie Lee", 
      imageUrl: "https://i.pravatar.cc/100?img=5", 
      points: 690 * pointsMultiplier, 
      level: 7, 
      rank: 5,
      isCurrentUser: false
    },
    { 
      id: 6, 
      name: "Chris Evans", 
      imageUrl: "https://i.pravatar.cc/100?img=6", 
      points: 590 * pointsMultiplier, 
      level: 6, 
      rank: 6,
      isCurrentUser: false
    },
    { 
      id: 7, 
      name: "Morgan Freeman", 
      imageUrl: "https://i.pravatar.cc/100?img=7", 
      points: 530 * pointsMultiplier, 
      level: 6, 
      rank: 7,
      isCurrentUser: false
    },
    { 
      id: 8, 
      name: "Emma Stone", 
      imageUrl: "https://i.pravatar.cc/100?img=8", 
      points: 490 * pointsMultiplier, 
      level: 5, 
      rank: 8,
      isCurrentUser: false
    },
    { 
      id: 9, 
      name: "Robert Downey", 
      imageUrl: "https://i.pravatar.cc/100?img=9", 
      points: 450 * pointsMultiplier, 
      level: 5, 
      rank: 9,
      isCurrentUser: false
    },
    { 
      id: 10, 
      name: "Zoe Saldana", 
      imageUrl: "https://i.pravatar.cc/100?img=10", 
      points: 420 * pointsMultiplier, 
      level: 5, 
      rank: 10,
      isCurrentUser: true
    },
  ];
} 