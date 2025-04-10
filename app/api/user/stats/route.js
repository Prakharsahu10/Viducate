import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Function to estimate video duration based on content length
const estimateVideoDuration = (content) => {
  // Average reading speed is around 150 words per minute
  const wordCount = content.split(/\s+/).length;
  const durationInMinutes = Math.max(1, Math.ceil(wordCount / 150));
  return durationInMinutes;
};

// GET /api/user/stats - Get user's video statistics
export async function GET(request) {
  try {
    // For now, we'll skip authentication and just get all videos
    // In a production environment, you would authenticate the user

    // Get all users with their videos
    const users = await db.user.findMany({
      include: {
        videos: true,
      },
    });

    // If no users, return empty stats
    if (users.length === 0) {
      return NextResponse.json({
        stats: {
          videosByStatus: {
            total: 0,
            completed: 0,
            pending: 0,
            processing: 0,
            failed: 0,
          },
          totalDuration: 0,
          dailyActivity: [],
          languageBreakdown: [],
        },
      });
    }

    // For demo purposes, use the first user
    const dbUser = users[0];
    const videos = dbUser.videos;

    // Calculate total videos by status
    const videosByStatus = {
      completed: videos.filter((v) => v.status === "completed").length,
      pending: videos.filter((v) => v.status === "pending").length,
      processing: videos.filter((v) => v.status === "processing").length,
      failed: videos.filter((v) => v.status === "failed").length,
      total: videos.length,
    };

    // Calculate total video duration in minutes (estimated)
    const totalDuration = videos.reduce((total, video) => {
      return total + estimateVideoDuration(video.content);
    }, 0);

    // Calculate daily usage over the last week
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    // Create a map of dates in the last week
    const daysMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      daysMap[formatDate(date)] = 0;
    }

    // Count videos created per day
    videos.forEach((video) => {
      const videoDate = formatDate(new Date(video.createdAt));
      if (videoDate in daysMap) {
        daysMap[videoDate] += 1;
      }
    });

    // Prepare daily data for chart
    const dailyActivity = Object.keys(daysMap)
      .sort()
      .map((date) => ({
        date,
        count: daysMap[date],
        duration: videos
          .filter((v) => formatDate(new Date(v.createdAt)) === date)
          .reduce(
            (total, video) => total + estimateVideoDuration(video.content),
            0
          ),
      }));

    // Group videos by language
    const languageMap = {};
    videos.forEach((video) => {
      const language = video.language || "unknown";
      if (!languageMap[language]) {
        languageMap[language] = 0;
      }
      languageMap[language] += 1;
    });

    // Format language data for chart
    const languageBreakdown = Object.entries(languageMap).map(
      ([language, count]) => ({
        language,
        count,
        percentage:
          videos.length > 0 ? Math.round((count / videos.length) * 100) : 0,
      })
    );

    return NextResponse.json({
      stats: {
        videosByStatus,
        totalDuration,
        dailyActivity,
        languageBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics", details: error.message },
      { status: 500 }
    );
  }
}
