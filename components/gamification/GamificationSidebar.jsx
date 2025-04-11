"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const GamificationSidebar = ({ userStats }) => {
  // Calculate next level threshold (simple formula: current level * 100)
  const nextLevelThreshold = userStats.level * 100;
  const progressToNextLevel = Math.min(
    Math.floor((userStats.points / nextLevelThreshold) * 100),
    100
  );

  return (
    <div className="space-y-4">
      {/* User Level Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-indigo-700">
            Level {userStats.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{userStats.points} XP</span>
              <span>{nextLevelThreshold} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2 bg-indigo-100" />
            <p className="text-xs text-indigo-600 mt-1">
              {nextLevelThreshold - userStats.points} XP to Level {userStats.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-amber-700">
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <div className="text-3xl font-bold text-amber-600 flex items-center gap-2">
              {userStats.streak} days
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <p className="text-xs text-amber-600 text-center mt-1">
            {userStats.streak > 0
              ? "Keep going! Don't break your streak!"
              : "Start your learning streak today!"}
          </p>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Recent Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.badges && userStats.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userStats.badges.slice(0, 4).map((badge) => (
                <div key={badge.id} className="flex flex-col items-center group relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    {/* Badge icon/emoji */}
                    <span className="text-2xl">{badge.emoji || "🏆"}</span>
                  </div>
                  <span className="text-xs mt-1 text-center">{badge.name}</span>
                  
                  {/* Simple tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-32 text-center pointer-events-none">
                    {badge.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              Complete activities to earn badges!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.achievements && userStats.achievements.length > 0 ? (
            <div className="space-y-2">
              {userStats.achievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center bg-gray-50 p-2 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <span className="text-lg">{achievement.emoji || "🎯"}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{achievement.name}</h4>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              Complete challenges to unlock achievements!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard Rank */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-emerald-700">
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-2">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              #{userStats.rank || "?"}
            </div>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
              {getRankTitle(userStats.rank)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get a descriptive rank title
function getRankTitle(rank) {
  if (!rank) return "Not Ranked";
  if (rank === 1) return "Champion";
  if (rank <= 3) return "Elite";
  if (rank <= 10) return "Master";
  if (rank <= 25) return "Expert";
  if (rank <= 50) return "Proficient";
  if (rank <= 100) return "Skilled";
  return "Learner";
}

export default GamificationSidebar; 